#!/usr/bin/env python3
"""Export editable 0.4.4 revision-3 UI masters (backgrounds still use the preserved R2 sources). No networking or font files needed."""
from pathlib import Path
import hashlib,json,shutil

def main():
    from PIL import Image
    root=Path(__file__).resolve().parents[1]
    source=root/'authoring/ui';target=root/'public/assets/ui'
    exports=[]
    for item in sorted(source.rglob('*.svg')):
        out=target/item.relative_to(source);out.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(item,out);exports.append(out)
    for item in sorted((source/'licenses').glob('*.txt')):
        out=target/'licenses'/item.name;out.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(item,out);exports.append(out)
    for name,quality in [('main-art',92),('language-art',92),('options-art',92),('campaign-relief',89)]:
        out=target/(name+'.webp')
        with Image.open(source/(name+'-r2.png')) as image:
            image.convert('RGB').save(out,'WEBP',quality=quality,method=6)
        exports.append(out)
    for name in ['western-front-geography.json','SOURCE.txt']:
        out=target/'maps'/name;out.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(source/'geography'/name,out);exports.append(out)
    manifest={
        'version':'0.4.4','revision':3,
        'map':{'space':'Equirectangular geographic coordinates: lon [-1.9,9.1], lat [46.9,52.1] mapped to 1000x720',
               'geography':'GSHHG 2.3.6 intermediate via basemap-data 2.0.0; LGPL-3.0-or-later; source coordinates included',
               'relief':'basemap-data shadedrelief region, MIT; processed crop included',
               'fronts':'Five original date-specific generalizations, not a digitized trench survey',
               'dates':['1916-07-01','1916-09-15','1917-10','1917-11-20','1918-08-08']},
        'art':json.loads((source/'revision2-art.json').read_text(encoding='utf-8')),
        'files':[{'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,
                  'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(set(exports))]
    }
    (source/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(f'Exported {len(exports)} UI files for 0.4.4 revision 3. No gameplay assets changed.')
if __name__=='__main__':main()
