"""Erzeugt alle App-Icons und Splash-Screens aus assets/icon-original.png.

Aufruf: python3 scripts/generate-icons.py   (benötigt Pillow)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'icon-original.png'
RES = ROOT / 'android' / 'app' / 'src' / 'main' / 'res'
PUBLIC = ROOT / 'public'
BG = (240, 224, 202)          # Cremeton der Icon-Kachel
SPLASH_BG = (244, 239, 228)   # App-Hintergrund (#F4EFE4)
CROP = (122, 104, 1132, 1114)  # Innenfläche der Kachel ohne Schatten/Kante


def rounded_mask(size: int, radius: float) -> Image.Image:
    m = Image.new('L', (size * 4, size * 4), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size * 4 - 1, size * 4 - 1), radius=radius * 4, fill=255)
    return m.resize((size, size), Image.LANCZOS)


def circle_mask(size: int) -> Image.Image:
    m = Image.new('L', (size * 4, size * 4), 0)
    ImageDraw.Draw(m).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    return m.resize((size, size), Image.LANCZOS)


src = Image.open(SRC).convert('RGB')
art = src.crop(CROP)
# Kachel: Motiv auf einheitlichem Creme-Grund, Ecken weich ausgeblendet
tile = Image.new('RGB', art.size, BG)
tile.paste(art, (0, 0), rounded_mask(art.size[0], art.size[0] * 0.16).filter(ImageFilter.GaussianBlur(art.size[0] * 0.012)))
MASTER = 1024
tile = tile.resize((MASTER, MASTER), Image.LANCZOS)


def on_canvas(size: int, scale: float, bg=BG, transparent=False) -> Image.Image:
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0) if transparent else bg + (255,))
    inner = max(1, round(size * scale))
    t = tile.resize((inner, inner), Image.LANCZOS)
    off = (size - inner) // 2
    canvas.paste(t, (off, off))
    return canvas


DENSITIES = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for name, f in DENSITIES.items():
    d = RES / f'mipmap-{name}'
    legacy = round(48 * f)
    # Klassisches Icon: abgerundete Kachel
    sq = tile.resize((legacy, legacy), Image.LANCZOS).convert('RGBA')
    sq.putalpha(rounded_mask(legacy, legacy * 0.2))
    sq.save(d / 'ic_launcher.png')
    # Rundes Icon: Motiv verkleinert im Creme-Kreis
    rnd = on_canvas(legacy, 0.84)
    rnd.putalpha(circle_mask(legacy))
    rnd.save(d / 'ic_launcher_round.png')
    # Adaptive-Icon-Vordergrund (108 dp, sichtbarer Bereich ~66–72 dp)
    fg = round(108 * f)
    on_canvas(fg, 0.62).save(d / 'ic_launcher_foreground.png')

# Splash-Screens
for d in RES.glob('drawable*'):
    p = d / 'splash.png'
    if not p.exists():
        continue
    w, h = Image.open(p).size
    s = round(min(w, h) * 0.42)
    canvas = Image.new('RGB', (w, h), SPLASH_BG)
    t = tile.resize((s, s), Image.LANCZOS).convert('RGBA')
    t.putalpha(rounded_mask(s, s * 0.2))
    canvas.paste(t, ((w - s) // 2, (h - s) // 2), t)
    canvas.save(p)

# Web / PWA
for size, name in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png'), (64, 'favicon.png')]:
    t = tile.resize((size, size), Image.LANCZOS).convert('RGBA')
    t.putalpha(rounded_mask(size, size * 0.2))
    t.save(PUBLIC / name)
on_canvas(512, 0.8).convert('RGB').save(PUBLIC / 'icon-maskable-512.png')
print('Icons erzeugt.')
