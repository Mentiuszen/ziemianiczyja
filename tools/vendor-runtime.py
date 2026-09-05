"""Copy the locally installed Babylon 8.46.2 distribution and actual module imports.
The web app uses neither Gradio nor a CDN. Vite's preload helper is replaced locally.
This extraction script is environment-specific; the result is checked into vendor/.
"""
from pathlib import Path
import re,json,shutil,hashlib
source=Path('/opt/pyvenv/lib/python3.13/site-packages/gradio/templates/frontend/assets')
out=Path(__file__).resolve().parents[1]/'vendor/babylon-runtime/chunks'
if out.exists(): shutil.rmtree(out)
out.mkdir(parents=True)
roots=['index-3iDVoJzw.js','standardMaterial-8n2LZloV.js','assetContainer-Du7rOX-T.js','glTFLoader-C46aNr9U.js','shadowGenerator-CdOm82t1.js']
seen=set(); queue=roots[:]; records=[]
pat=r'(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)["\'](\./[^"\']+\.js)["\']'
while queue:
 name=queue.pop(0)
 if name in seen:continue
 seen.add(name)
 if name=='index-B5Zu_GVg.js':
  content='// Local preload adapter: the loader imports its own dependencies.\nexport const _ = (loader) => loader();\n'
  (out/name).write_text(content)
  records.append({'file':name,'sha256':hashlib.sha256(content.encode()).hexdigest(),'changed':True})
  continue
 f=source/name
 if not f.exists():raise FileNotFoundError(f)
 content=f.read_text()
 # Vite has retained irrelevant Gradio/Svelte side-effect imports in some chunks.
 content=re.sub(r'import["\']\./svelte/[^"\']+["\'];?', '',content)
 if name=='index-3iDVoJzw.js':
  content+='\n// Ziemia Niczyja modification: expose the existing hemispheric light for the game adapter.\nexport { Ss as ZNHemisphericLight };\n'
 (out/name).parent.mkdir(parents=True,exist_ok=True)
 (out/name).write_text(content)
 records.append({'file':name,'sha256':hashlib.sha256(content.encode()).hexdigest(),'changed':content!=f.read_text()})
 for child in re.findall(pat,content):queue.append(str((Path(name).parent/child)))
(out.parent/'MANIFEST.json').write_text(json.dumps({'babylonVersion':'8.46.2','source':'Preinstalled Gradio frontend, Babylon.js viewer ESM distribution','preloadHelperReplaced':True,'files':records},indent=2))
print(len(seen),'JavaScript chunks;',sum(f.stat().st_size for f in out.rglob('*.js'))//1024,'KiB')
