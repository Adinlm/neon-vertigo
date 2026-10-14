# Compares two race-simulation result files (tests/baseline.mjs): times, wins, wrecks, causes
import json, sys
a = json.load(open(sys.argv[1])); b = json.load(open(sys.argv[2])); out = {}
def agg(runs):
    pt = [r['racers'][0]['time'] for r in runs]; ft = [x['time'] for r in runs for x in r['racers'] if x['time']]
    wins = sum(1 for r in runs if r['racers'][0]['place'] == 1); wr = sum(x['wrecks'] for r in runs for x in r['racers'])
    unf = sum(1 for r in runs for x in r['racers'] if not x['finished'])
    causes = {}
    for r in runs:
        for k, v in r.get('wc', {}).items():
            c = k.split(':')[1]; causes[c] = causes.get(c, 0) + v
    return {'player_avg': round(sum(pt) / len(pt), 2), 'field_avg': round(sum(ft) / len(ft), 2), 'player_wins': wins, 'runs': len(runs), 'wrecks': wr, 'unfinished': unf, 'causes': causes}
print('%-5s %22s %22s %14s %16s' % ('track', 'player avg (old>new)', 'field avg (old>new)', 'wins old>new', 'wrecks old>new'))
for k in a:
    A, B = agg(a[k]), agg(b[k]); out[k] = {'old': A, 'new': B}
    print('%-5s %10.1f > %-10.1f %10.1f > %-10.1f %6d > %-6d %6d > %-6d' % (k, A['player_avg'], B['player_avg'], A['field_avg'], B['field_avg'], A['player_wins'], B['player_wins'], A['wrecks'], B['wrecks']), 'causes', A['causes'], '>', B['causes'])
if len(sys.argv) > 3: json.dump(out, open(sys.argv[3], 'w'), indent=1)
