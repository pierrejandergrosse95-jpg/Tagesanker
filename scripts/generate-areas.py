"""Schneidet die 15 Bereichsbilder aus assets/areas-original.png aus.

Je Bild entstehen:
  public/areas/<name>.jpg        – Motiv (oberer Bildteil) für Kopfbilder
  public/areas/<name>-tile.jpg   – quadratischer Ausschnitt für Kacheln
  public/areas/home-full.jpg     – ganzes Bild für den Startbildschirm
Aufruf: python3 scripts/generate-areas.py   (benötigt Pillow)
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
src = Image.open(ROOT / 'assets' / 'areas-original.png').convert('RGB')
out = ROOT / 'public' / 'areas'
out.mkdir(parents=True, exist_ok=True)

COLS = [(0, 239), (246, 476), (484, 715), (721, 954), (961, 1198)]
ROWS = [(0, 431), (440, 870), (878, 1307)]
NAMES = [
    'home', 'calendar', 'shifts', 'health', 'finance',
    'tasks', 'notes', 'habits', 'spirit', 'astro',
    'moon', 'meditation', 'tarot', 'journal', 'settings',
]
INSET = 7            # abgerundete Ecken und weiße Ränder abschneiden
MOTIF = 0.66         # oberer Anteil mit dem Motiv (darunter dunkle Fläche)
TILE_CENTER = 0.40   # vertikale Mitte des Kachel-Ausschnitts
SCALE = 2            # sanft hochskalieren für schärfere Darstellung

for i, name in enumerate(NAMES):
    (x0, x1), (y0, y1) = COLS[i % 5], ROWS[i // 5]
    card = src.crop((x0 + INSET, y0 + INSET, x1 - INSET, y1 - INSET))
    w, h = card.size
    motif = card.crop((0, 0, w, int(h * MOTIF)))
    motif.resize((w * SCALE, int(h * MOTIF) * SCALE), Image.LANCZOS).save(out / f'{name}.jpg', quality=86, optimize=True)
    cy = int(h * TILE_CENTER)
    top = max(0, cy - w // 2)
    tile = card.crop((0, top, w, top + w))
    tile.resize((w * SCALE, w * SCALE), Image.LANCZOS).save(out / f'{name}-tile.jpg', quality=86, optimize=True)
    if name == 'home':
        card.resize((w * SCALE, h * SCALE), Image.LANCZOS).save(out / 'home-full.jpg', quality=86, optimize=True)
print('Bereichsbilder erzeugt.')
