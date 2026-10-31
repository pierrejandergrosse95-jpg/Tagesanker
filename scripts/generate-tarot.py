"""Schneidet die 22 Großen Arkana aus assets/tarot-original.png aus (nur das Motiv,
ohne aufgedruckte Nummer/Beschriftung – die setzt die App selbst).

Aufruf: python3 scripts/generate-tarot.py   (benötigt Pillow)
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
src = Image.open(ROOT / 'assets' / 'tarot-original.png').convert('RGB')
out = ROOT / 'public' / 'tarot'
out.mkdir(parents=True, exist_ok=True)

# Kartenränder (x von, x bis) je Reihe, Motivbereich (y von, y bis)
ROW1 = [(12, 146), (152, 287), (292, 425), (430, 561), (567, 696), (703, 832), (838, 969), (974, 1106), (1111, 1245), (1251, 1385), (1390, 1525)]
ROW2 = [(12, 141), (146, 265), (271, 396), (402, 525), (531, 655), (660, 781), (787, 913), (917, 1034), (1040, 1162), (1280, 1395), (1400, 1525)]
Y1 = (78, 403)
Y2 = (558, 883)
INSET = 9
W, H = 240, 660  # einheitliche Ausgabegröße (2x)

cards = [(x, Y1) for x in ROW1] + [(x, Y2) for x in ROW2]
for n, ((a, b), (y0, y1)) in enumerate(cards):
    art = src.crop((a + INSET, y0, b - INSET, y1)).resize((W, H), Image.LANCZOS)
    art.save(out / f'{n:02d}.jpg', quality=88, optimize=True)
print(f'{len(cards)} Karten erzeugt.')
