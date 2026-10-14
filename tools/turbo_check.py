# Objective checks for the turbo layers: loudness vs original, harmonic fit per beat, 145 BPM grid alignment, loop seam.
import wave, struct, numpy as np, json, sys
NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
BPM=145; BEAT=60/BPM; S16=BEAT/4; BAR=BEAT*4; LOOP=BAR*16; SR=48000; NL=int(round(LOOP*SR))
def load(p):
    w=wave.open(p) if not p.endswith('_new.wav') else None
    if w:
        n=w.getnframes(); x=np.frombuffer(w.readframes(n),dtype=np.int16).astype(np.float64)/32768; return x.reshape(-1,w.getnchannels())
    raw=open(p,'rb').read(); n=(len(raw)-44)//8; x=np.frombuffer(raw[44:44+n*8],dtype=np.float32).astype(np.float64); return x.reshape(-1,2)
def loopify(x):  # same as stemLoopify (no pad): loop = head + tail summed at the start
    N=NL; L=x[:N].copy(); tail=x[N:]; L[:len(tail)]+=tail; return L
def chroma(seg,lo=60,hi=2200):
    X=np.abs(np.fft.rfft(seg*np.hanning(len(seg)),n=1<<15))**2; f=np.fft.rfftfreq(1<<15,1/SR); m=(f>lo)&(f<hi)
    c=np.zeros(12); np.add.at(c,(np.round(69+12*np.log2(f[m]/440)).astype(int))%12,X[m]); return c/(c.sum()+1e-12)
def fit(tur,ref):
    sc=[]
    for b in range(64):
        a=int(b*BEAT*SR); e=int((b+1)*BEAT*SR); r=chroma(ref[a:e]); t=chroma(tur[a:e])
        allowed=r>=0.06  # pitch classes clearly present in Chords+Bass on this beat
        if np.sqrt(np.mean(tur[a:e]**2))<1e-3: continue
        sc.append(float(t[allowed].sum()))
    return float(np.mean(sc)), float(np.percentile(sc,10))
def grid(x):
    mono=x.mean(1); hop=256; fr=len(mono)//hop; E=np.array([np.sum(mono[i*hop:(i+1)*hop]**2) for i in range(fr)]); flux=np.maximum(0,np.diff(np.log(E+1e-9)))
    t=(np.arange(len(flux))+1)*hop/SR; ph=(t%S16)/S16; w=flux
    # circular mean of onset phase, weighted by flux (0 = exactly on the 16th grid)
    ang=np.angle(np.sum(w*np.exp(2j*np.pi*ph))); conc=np.abs(np.sum(w*np.exp(2j*np.pi*ph)))/np.sum(w)
    return float(ang/(2*np.pi)*S16*1000), float(conc)
def seam(L):
    m=L.mean(1); d=np.abs(np.diff(m)); jump=abs(m[-1]-m[0]); return float(jump), float(np.percentile(d,99.9))
rep={}
for w,bank in [('sony','STEMB64'),('vader','VADERSTEMB64')]:
    new=load('work/turbo/%s_turbo_new.wav'%w); old=load('work/stems/%s_tur.wav'%bank)
    ref=(load('work/stems/%s_chd.wav'%bank)[:NL]+load('work/stems/%s_bas.wav'%bank)[:NL]).mean(1)
    on=old[:NL]; nn=new[:NL]
    rms_old=np.sqrt(np.mean(on**2)); rms_new=np.sqrt(np.mean(nn**2)); gain=rms_old/rms_new
    newg=new*gain; pk=np.max(np.abs(newg))
    if pk>0.89: newg*=0.89/pk  # keep at least 1 dB of headroom before the codec
    np.save('work/turbo/%s_gain.npy'%w,np.array([gain if pk<=0.89 else gain*0.89/pk]))
    Lp=loopify(newg)
    f_new=fit(Lp[:NL].mean(1),ref); f_old=fit(loopify(old)[:NL].mean(1),ref)
    g_new=grid(newg[:NL]); g_old=grid(old[:NL])
    rep[w]={'loop_frames_48k':NL,'frames_with_tail':len(new),'rms_old_db':round(20*np.log10(rms_old),2),'rms_new_db_after_match':round(20*np.log10(np.sqrt(np.mean(newg[:NL]**2))),2),
            'peak_new_db':round(20*np.log10(np.max(np.abs(newg))),2),'harmonic_fit_new_mean_p10':[round(v,3) for v in f_new],'harmonic_fit_old_mean_p10':[round(v,3) for v in f_old],
            'grid_offset_ms_new':round(g_new[0],2),'grid_concentration_new':round(g_new[1],3),'grid_offset_ms_old':round(g_old[0],2),'grid_concentration_old':round(g_old[1],3),
            'loop_seam_jump':round(seam(Lp)[0],5),'p999_sample_step':round(seam(Lp)[1],5)}
    # write the level-matched stereo WAV (16-bit PCM for the encoder)
    pcm=(np.clip(newg,-1,1)*32767).astype(np.int16)
    o=wave.open('work/turbo/%s_turbo_final.wav'%w,'wb'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes(pcm.tobytes()); o.close()
json.dump(rep,open(sys.argv[1] if len(sys.argv)>1 else 'work/turbo/check.json','w'),indent=1)
for k,v in rep.items(): print(k,v)
