#!/usr/bin/env python3
"""Build only the English label variant of the existing briefing-map texture.

Python + Pillow, optional authoring tool. Never regenerates models or the Polish JPEG.
Only the label rectangle (24, 696)-(264, 728) changes; all other decoded pixels remain
identical. The source map's blank background/grid repeats every 64 pixels here.
"""
from pathlib import Path
import json
import hashlib
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]

def main():
    source = ROOT / 'public/assets/textures/briefing-map.jpg'
    destination = source.with_name('briefing-map-en.png')
    catalog = (ROOT / 'src/i18n/en.js').read_text(encoding='utf-8')
    text = json.loads(catalog[catalog.index('{',catalog.index('export default')):catalog.rindex('}')+1])['world.mapLegend']
    with Image.open(source) as original:
        original = original.convert('RGB')
        if original.size != (1024, 768):
            raise ValueError('Unexpected source map size; review the label rectangle first.')
        result = original.copy()
        # The repeated blank strip includes the same vertical/horizontal grid lines.
        result.paste(original.crop((24, 632, 264, 664)), (24, 696))
        ImageDraw.Draw(result).text((33, 705), text, fill=(44, 46, 36))
        result.save(destination, optimize=True)
    metadata = {'source': source.name, 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                'catalogueKey': 'world.mapLegend', 'text': text,
                'sha256': hashlib.sha256(destination.read_bytes()).hexdigest(),
                'labelRectangle': [24, 696, 264, 728]}
    destination.with_suffix('.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(destination.relative_to(ROOT))

if __name__ == '__main__':
    main()
