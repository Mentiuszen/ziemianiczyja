"""Exercise the real Node static server on localhost (not a browser storage test)."""
from pathlib import Path
import hashlib,json,re,subprocess,urllib.request,urllib.error
P=Path(__file__).resolve().parents[1]
manifest=json.loads((P/'dist/build-manifest.json').read_text())
report={'version':manifest['version'],'checks':[],'browserStorageVerified':False}
for mode,prefix in [('source',''),('dist',''),('dist','test-repo')]:
    args=['node','tools/serve.mjs','--'+mode,'--port','0']
    if prefix:args.append('--base='+prefix)
    server=subprocess.Popen(args,cwd=P,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    try:
        line=server.stdout.readline().strip();m=re.search(r'http://localhost:\d+/\S*',line)
        if not m:raise RuntimeError('Server did not start: '+line)
        base=m[0];root=P/'dist' if mode=='dist' else P
        paths=['index.html','src/app.js','src/ui/style.css','src/render/quality.js','public/assets/models/lewis.glb','public/assets/models/field-gun-77.glb','public/assets/models/dh5.glb','public/assets/models/dfw.glb','public/assets/textures/briefing-map.jpg','src/performance/frame-limiter.js']
        paths += [f['path'] for f in manifest['files'] if f['path'].startswith(('public/assets/models/textures/','vendor/'))][:12]
        checks=[]
        for path in paths:
            with urllib.request.urlopen(base+path,timeout=10) as response:
                data=response.read();expected=(root/path).read_bytes()
                assert data==expected,path
                checks.append({'path':path,'status':response.status,'mime':response.headers.get('Content-Type'),'sha256':hashlib.sha256(data).hexdigest()})
        try:
            urllib.request.urlopen(base+'intentional-missing-asset.glb',timeout=10)
            raise AssertionError('Missing resource was not rejected')
        except urllib.error.HTTPError as e:assert e.code==404
        report['checks'].append({'mode':mode,'prefix':prefix or '/', 'files':checks,'intentional404':True})
    finally:
        server.terminate()
        try:server.wait(timeout=5)
        except subprocess.TimeoutExpired:server.kill();server.wait()
report['passed']=True
out=P/'docs/v0.4-tests/http-smoke.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2));print('PASS',len(report['checks']),'static-server configurations')
