"""Rebuild procedural assets, preserving the imported Blender infantry pack.
Requires Python 3, numpy, scipy and Pillow. Does not download or modify the runtime.
"""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
for name in ['generate_assets.py', 'generate_atmosphere.py', 'generate_sky.py', 'generate_weapons_v03.py', 'generate_tank_v03.py', 'generate_materials_v03.py', 'generate_support_v04.py']:
    print(f'Generating {name}', flush=True)
    args = ['--keep-infantry'] if name == 'generate_assets.py' else []
    subprocess.run([sys.executable, str(ROOT / 'tools' / name), *args], cwd=ROOT, check=True)
print('Procedural assets rebuilt; imported infantry unchanged. Run npm test, npm run check and npm run build.')
