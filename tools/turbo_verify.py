# Sample-level verification of the stem player renders produced by tests/turbo.mjs (int16 stereo, 44.1 kHz, scale 16384 = 0 dBFS/2)
import numpy as np, json, sys, os
D = sys.argv[1]; OUTF = sys.argv[2]
EV = json.load(open(os.path.join(D, 'events.json'))); SR = 44100; T0 = 0.5; TURBO_OUT = 1.4; LOOP = 16 * 4 * 60 / 145
def load(n):
    x = np.fromfile(os.path.join(D, n + '.pcm'), dtype='<i2').astype(np.float64).reshape(-1, 2) / 16384.0; return x
res = []; ok_all = True
LSB = 1 / 16384.0
def R(name, ok, info):
    global ok_all; ok_all &= bool(ok); res.append({'name': name, 'status': 'PASS' if ok else 'FAIL', 'info': info}); print('PASS' if ok else 'FAIL', name, json.dumps(info))
def turbo_mask(evs, n):
    """samples where the turbo gain is non-zero in either version (on intervals + fade-out tail)"""
    m = np.zeros(n, bool); on = None
    for e in evs:
        if e['k'] != 'turbo': continue
        if e['on'] and on is None: on = e['t']
        elif not e['on'] and on is not None:
            a = int(on * SR) - 64; b = int((e['t'] + TURBO_OUT + 0.02) * SR); m[max(0, a):min(n, b)] = True; on = None
    return m
def rms_env(x, win=0.05):
    w = int(win * SR); n = len(x) // w; y = x[:n * w].reshape(n, w, 2); return 10 * np.log10(np.mean(y ** 2, axis=(1, 2)) + 1e-12)
# 0) control: two renders of the same 3.6.3 file in separate browser sessions -> render jitter of the platform (decoder/resampler)
jit = []
for n in ['sony_none', 'cooper_turbo']:
    a, b = load('old_' + n), load('ctl_' + n); d = float(np.max(np.abs(a - b))); jit.append(d)
    R('control (%s): 3.6.3 vs 3.6.3 differ at most by 1 LSB of 16-bit (platform render jitter)' % n, d <= LSB * 1.01, {'max_abs_diff': d, 'lsb': LSB, 'samples_differing': int(np.sum(np.abs(a - b).max(1) > 0))})
# 1) same music when the turbo never fires (Sony, Vader): other stems untouched (equal within the measured jitter)
for bank in ['sony', 'vader']:
    a, b = load('old_%s_none' % bank), load('new_%s_none' % bank)
    d = np.max(np.abs(a - b)); R('%s: without turbo, 3.7 equals 3.6.3 (melody/chords/bass/drums, lap progression) within 1 LSB jitter' % bank, d <= LSB * 1.01, {'max_abs_diff': float(d), 'samples': len(a), 'samples_differing': int(np.sum(np.abs(a - b).max(1) > 0))})
# 2) Cooper and THE CROWN: identical with the same turbo events (banks untouched)
for bank in ['cooper', 'crown']:
    a, b = load('old_%s_turbo' % bank), load('new_%s_turbo' % bank)
    d = np.max(np.abs(a - b)); R('%s: equals 3.6.3 including turbo activations (within 1 LSB jitter)' % bank, d <= LSB * 1.01, {'max_abs_diff': float(d)})
# 3) Sony/Vader with turbo events: differences only where the turbo layer is audible; new layer present; no glitches
for bank in ['sony', 'vader']:
    a, b = load('old_%s_turbo' % bank), load('new_%s_turbo' % bank); n = min(len(a), len(b))
    m = turbo_mask(EV['EVS']['turbo'], n); d = np.abs(a[:n] - b[:n]).max(1)
    outside = float(d[~m].max()); inside = float(d[m].max())
    R('%s: outside turbo windows (incl. 1.4 s fade-out) the mix equals 3.6.3 (within 1 LSB jitter)' % bank, outside <= LSB * 1.01, {'max_abs_diff_outside': outside})
    R('%s: inside turbo windows the new motif is audible (mix differs from 3.6.3)' % bank, inside > 0.05, {'max_abs_diff_inside': round(inside, 4)})
    base = load('new_%s_none' % bank)[:n]; tur = b[:n]
    # no dropouts: short-term level with turbo never falls more than 0.5 dB below the same instant without turbo
    e_base, e_tur = rms_env(base), rms_env(tur); valid = e_base > -60; drop = float(np.min((e_tur - e_base)[valid]))
    ob = load('old_%s_none' % bank)[:n]; ot = a[:n]; e_ob, e_ot = rms_env(ob), rms_env(ot); drop_old = float(np.min((e_ot - e_ob)[e_ob > -60]))
    R('%s: no silences when entering/leaving the turbo (50 ms level never >1 dB below the same instant without turbo)' % bank, drop > -1.0, {'min_level_delta_db': round(drop, 2), 'same_metric_3_6_3_turbo': round(drop_old, 2)})
    # clicks: isolate the turbo contribution (render with turbo - render without, same laps) and look for high-frequency
    # spikes in +-40 ms around every on/off event compared with the steady turbo-on frames
    def hf_spikes(iso):
        h = np.diff(iso, axis=0); fr = int(0.005 * SR); k = len(h) // fr; E = np.sqrt(np.mean(h[:k * fr].reshape(k, fr, 2) ** 2, axis=(1, 2)))
        ev = [e['t'] for e in EV['EVS']['turbo'] if e['k'] == 'turbo']; near = np.zeros(k, bool)
        for t in ev: near[max(0, int((t - 0.04) / 0.005)):int((t + 0.04) / 0.005)] = True
        mk = m[:k * fr:fr][:k]; steady = E[mk & ~near]; return float(np.max(E[near & mk]) / (np.percentile(steady, 99) + 1e-12)) if np.any(near & mk) else 0.0
    iso_new = tur - base; iso_old = ot - ob; r_new = hf_spikes(iso_new); r_old = hf_spikes(iso_old)
    R('%s: no clicks at turbo transitions (HF energy at on/off vs steady p99 of the layer; not worse than 3.6.3 under the same events)' % bank, r_new <= max(1.0, r_old), {'spike_ratio_new': round(r_new, 3), 'spike_ratio_3_6_3': round(r_old, 3)})
    pk = 20 * np.log10(np.max(np.abs(tur)) * 0.5 + 1e-12)
    R('%s: render peak with turbo stays below 0 dBFS' % bank, pk < 0, {'peak_dbfs': round(float(pk), 2)})
    # loop seam: the burst 25.3-30.4 s crosses t0+LOOP; compare the jump at the seam to the local step distribution
    s = int((T0 + LOOP) * SR); seam = float(np.max(np.abs(np.diff(tur[s - 32:s + 32], axis=0)))); loc = float(np.percentile(np.abs(np.diff(tur[s - SR:s + SR], axis=0)), 99.9))
    R('%s: seamless 16-bar loop while the turbo is audible' % bank, seam <= max(loc * 1.5, 0.02), {'seam_step': round(seam, 4), 'local_p999': round(loc, 4)})
json.dump(res, open(OUTF, 'w'), indent=1)
print('ALL', 'PASS' if ok_all else 'FAIL')
sys.exit(0 if ok_all else 1)
