# Offline spectral report for HUD buffers exported by tests/hud.mjs (new) and the 3.6.3 UI/HUD sounds (old)
import json, sys, numpy as np
def stats(x, sr):
    x = np.asarray(x, dtype=np.float64)
    pk = np.max(np.abs(x)) + 1e-12; rms = np.sqrt(np.mean(x**2)) + 1e-12
    X = np.abs(np.fft.rfft(x * np.hanning(len(x)), n=1 << int(np.ceil(np.log2(len(x))))))**2
    f = np.fft.rfftfreq(1 << int(np.ceil(np.log2(len(x)))), 1 / sr)
    tot = X.sum() + 1e-20
    return {'dur_s': round(len(x) / sr, 3), 'peak_dbfs': round(20 * np.log10(pk), 1), 'rms_dbfs': round(20 * np.log10(rms), 1),
            'centroid_hz': int((f * X).sum() / tot), 'pct_above_4k': round(100 * X[f > 4000].sum() / tot, 2), 'pct_above_6k': round(100 * X[f > 6000].sum() / tot, 2),
            'pct_300_2500': round(100 * X[(f >= 300) & (f <= 2500)].sum() / tot, 1), 'end_abs': round(float(np.max(np.abs(x[-8:]))), 5), 'start_abs': round(float(abs(x[0])), 5)}
out = {}
for name, path in [('new', 'work/hud/hud_buffers.json'), ('old_3_6_3', 'work/hud/old_buffers.json')]:
    d = json.load(open(path)); out[name] = {k: stats(v['x'], v['sr']) for k, v in d.items()}
json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else 'work/hud/hud_spectrum.json', 'w'), indent=1)
fails = []
for g in out:
    print('==', g)
    for k, v in out[g].items():
        print('%-11s' % k, {a: float(b) if hasattr(b, 'item') else b for a, b in v.items()})
        if g == 'new':
            if v['pct_above_6k'] >= 5: fails.append((k, 'too much energy above 6 kHz'))
            if v['pct_300_2500'] < 45: fails.append((k, 'less than 45% of energy in the 300-2500 Hz phone-speaker band'))
            if v['peak_dbfs'] > -1: fails.append((k, 'peak above -1 dBFS'))
            if v['end_abs'] > 0.001 or v['start_abs'] > 0.001: fails.append((k, 'click at buffer edge'))
print('SPECTRUM CHECKS', 'PASS' if not fails else 'FAIL', fails)
sys.exit(1 if fails else 0)
