"""Transfer reviewed local Git commits exactly; never push main or rewrite history."""
from pathlib import Path
import os,json,subprocess,hashlib,base64,zlib
payload=json.loads(Path('.delivery/manifest.json').read_text(encoding='utf-8'))
assert os.environ.get('GITHUB_REPOSITORY')=='Adinlm/neon-vertigo'
assert os.environ.get('GITHUB_REF')=='refs/heads/delivery-3.6.3'
assert payload['repository']=='Adinlm/neon-vertigo'
assert payload['base']=='18f33a4409df956ecf11d4d5248533be4a25390d'
assert payload['target_branch']=='update-3.6.3-international-edition'
allowed={'index.html','README.md','docs/UPDATE_3.6.3.md','docs/verification-3.6.3.json'}
def git(*args,input=None):return subprocess.check_output(['git',*args],input=input)
git('checkout','--detach',payload['base'])
current=payload['base']
for step in payload['steps']:
 assert step['parent']==current and set(step['paths'])<=allowed
 patch=zlib.decompress(base64.b64decode(step['patch_zlib_b64']));assert hashlib.sha256(patch).hexdigest()==step['patch_sha256']
 git('apply','--index','--whitespace=error','-',input=patch)
 assert set(git('diff','--cached','--name-only',current).decode().splitlines())==set(step['paths'])
 assert git('write-tree').decode().strip()==step['tree']
 raw=base64.b64decode(step['commit_payload_b64']);assert raw.startswith(('tree '+step['tree']+'\nparent '+current+'\n').encode())
 assert git('hash-object','-t','commit','-w','--stdin',input=raw).decode().strip()==step['commit']
 git('update-ref','HEAD',step['commit'],current);current=step['commit']
assert current==payload['target']
assert hashlib.sha256(Path('index.html').read_bytes()).hexdigest()==payload['index_sha256']
# Normal push enforces fast-forward if the destination already exists. No --force.
git('push','origin',current+':refs/heads/'+payload['target_branch'])
print('Verified commit transferred:',current)
print('Verified HTML SHA-256:',payload['index_sha256'])
