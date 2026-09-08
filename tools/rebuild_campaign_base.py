#!/usr/bin/env python3
"""Rebuild the map SVG from the distributed editable geographic subset, without GIS packages."""
from pathlib import Path
import json

def main():
    root=Path(__file__).resolve().parents[1]
    data=json.loads((root/'authoring/ui/geography/western-front-geography.json').read_text())
    def xy(lon,lat):return round((lon+1.9)/11*1000,3),round((52.1-lat)/5.2*720,3)
    def path(ps,close=False):return 'M'+'L'.join(f'{x},{y}' for x,y in [xy(*p) for p in ps])+('Z' if close else '')
    svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 720"><rect width="1000" height="720" fill="#17272c"/>'
    for p in data['coastPolygons']:
        fill='#343a32' if p['level']%2 else '#17272c'
        svg+=f'<path d="{path(p["coordinates"],True)}" fill="{fill}" stroke="#b3a67c" stroke-opacity=".50" stroke-width=".55"/>'
    svg+='<g fill="none" stroke="#64868d" stroke-width=".65" opacity=".70">'+''.join(f'<path d="{path(c)}"/>' for c in data['rivers'])+'</g></svg>'
    (root/'authoring/ui/campaign-base.svg').write_text(svg,encoding='utf-8')
    print('Rebuilt geographic master. Run python tools/prepare_ui_assets.py to export.')
if __name__=='__main__':main()
