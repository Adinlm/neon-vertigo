# Measures, per beat, the pitch classes sounding in the shipped Chords+Bass stems (plus the bass root) -> tools/turbo_harmony.json
import wave, numpy as np, json
NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
BEAT=60/145; SR=48000
def load(p):
    w=wave.open(p); n=w.getnframes(); return np.frombuffer(w.readframes(n),dtype=np.int16).astype(np.float64).reshape(-1,w.getnchannels()).mean(1)/32768
def chroma(seg,lo,hi):
    X=np.abs(np.fft.rfft(seg*np.hanning(len(seg)),n=1<<15))**2; f=np.fft.rfftfreq(1<<15,1/SR); m=(f>lo)&(f<hi)
    c=np.zeros(12); np.add.at(c,(np.round(69+12*np.log2(f[m]/440)).astype(int))%12,X[m]); return c/(c.sum()+1e-12)
out={}
for w,bank in [('sony','STEMB64'),('vader','VADERSTEMB64')]:
    chd=load('work/stems/%s_chd.wav'%bank); bas=load('work/stems/%s_bas.wav'%bank); rows=[]
    for b in range(64):
        a=int(b*BEAT*SR); e=int((b+1)*BEAT*SR)
        root=int(np.argmax(chroma(bas[a:e],30,260))); c=chroma(chd[a:e],80,1400)*0.75+chroma(bas[a:e],30,700)*0.25
        order=[int(i) for i in np.argsort(c)[::-1] if c[i]>=0.09][:4]
        if root not in order: order=[root]+order[:3]
        rows.append({'root':root,'pcs':order,'w':[round(float(c[i]),3) for i in order]})
    out[w]=rows
    for i,r in enumerate(rows): print(w,'beat %2d bar %2d'%(i,i//4+1),'root',NOTES[r['root']],'pcs',' '.join(NOTES[p] for p in r['pcs']),r['w'])
json.dump(out,open('tools/turbo_harmony.json','w'))
