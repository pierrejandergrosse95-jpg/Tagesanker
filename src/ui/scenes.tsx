/**
 * Eigene Illustrationen im Stil einer Zauberschule (SVG): gotisches Schloss, schwebende Kerzen,
 * Eulen, Sternenhimmel, See und Tier-Silhouetten.
 * Alles vektorbasiert: offline, gestochen scharf in jeder Größe, kaum Speicherbedarf.
 */
import { useId, type CSSProperties, type ReactNode } from 'react';

export type SceneVariant = 'sunset' | 'night' | 'dawn' | 'forest' | 'lanterns' | 'meadow';
export type SceneAnimal = 'fox' | 'deer' | 'owl' | 'hen' | 'cat' | 'none';

interface Palette {
  sky: [string, string, string, string];
  glow: string;
  orb: string;
  far: string;
  mid: string;
  near: string;
  castle: string;
  water?: string;
  windows: string;
}

const PALETTES: Record<SceneVariant, Palette> = {
  // Dämmerung über dem Schloss
  sunset: { sky: ['#1a1430', '#47284d', '#8a3a46', '#d8874e'], glow: '#ffc27a', orb: '#ffe2b0', far: '#3b2a47', mid: '#251b33', near: '#0e0b15', castle: '#1d1628', water: '#5b3048', windows: '#ffc864' },
  // Sternennacht
  night: { sky: ['#05061a', '#11143a', '#20265a', '#363d72'], glow: '#c8d2ff', orb: '#f6efd6', far: '#1a1f45', mid: '#10142f', near: '#05060f', castle: '#0c0f26', water: '#1c2552', windows: '#ffcf6a' },
  // Nebliger Morgen
  dawn: { sky: ['#b9b8c6', '#d3cbc4', '#cdb6a2', '#e7dccb'], glow: '#fff1d6', orb: '#fff8ea', far: '#9e97a6', mid: '#77707f', near: '#2d3027', castle: '#5f5869', water: '#c8bcb0', windows: '#ffd99a' },
  // Dunkler Zauberwald
  forest: { sky: ['#07120f', '#13261e', '#22392c', '#3a5440'], glow: '#d8f2b4', orb: '#eef7dc', far: '#1e3326', mid: '#14251b', near: '#050c08', castle: '#1a2a20', windows: '#e8f5a0' },
  // Schwebende Kerzen
  lanterns: { sky: ['#0b0814', '#1d1530', '#33223c', '#5a3438'], glow: '#ffbf6a', orb: '#ffdca0', far: '#2a1f38', mid: '#1a1326', near: '#08060e', castle: '#160f22', water: '#3a2436', windows: '#ffc864' },
  // Trüber Tag auf den Schlossgründen
  meadow: { sky: ['#8f9fb0', '#b7bdbd', '#d2cab4', '#e6dcc3'], glow: '#fff3d0', orb: '#fffaea', far: '#7f8a86', mid: '#56614f', near: '#26301f', castle: '#55505f', windows: '#ffd890' },
};

/** Deterministischer Pseudozufall, damit Sterne/Laternen stabil bleiben. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Castle({ x, y, s, color, windows }: { x: number; y: number; s: number; color: string; windows: string }) {
  // Gotisches Schloss: [x, Breite, Höhe, Spitzenhöhe]
  const towers: [number, number, number, number][] = [
    [-52, 7, 30, 16], [-43, 9, 46, 26], [-31, 6, 34, 18], [-22, 11, 58, 30], [-8, 8, 40, 20], [2, 14, 74, 38],
    [19, 8, 50, 26], [30, 10, 62, 32], [43, 6, 36, 18], [52, 8, 28, 15],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      {/* Felsen */}
      <path d="M-70 8 C-60 -4 -50 -10 -40 -12 L60 -12 C70 -8 78 0 84 8 Z" />
      {/* Hauptbau mit Zinnen */}
      <rect x={-56} y={-20} width={116} height={14} />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-56 + i * 8.6} y={-23} width={4.5} height={3.5} />)}
      {towers.map(([tx, w, h, sp], i) => (
        <g key={i}>
          <rect x={tx} y={-h} width={w} height={h} />
          <path d={`M${tx - 1.2} ${-h} L${tx + w / 2} ${-h - sp} L${tx + w + 1.2} ${-h} Z`} />
          {Array.from({ length: Math.floor(h / 13) }, (_, j) => (
            <path key={j} d={`M${tx + w / 2 - 1} ${-h + 6 + j * 12} v3 a1 1 0 0 0 2 0 v-3 a1 1 0 0 0 -2 0z`} fill={windows} opacity={(i + j) % 3 === 0 ? 0.35 : 0.9} />
          ))}
        </g>
      ))}
      {/* Fensterreihe im Hauptbau */}
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-48 + i * 12} y={-16} width={2} height={4} rx={1} fill={windows} opacity={i % 2 ? 0.5 : 0.9} />)}
    </g>
  );
}

/** Fliegende Eule/Vogel als einfache Flügel-Silhouette. */
function Flyer({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M-10 0 C-7 -4 -3 -4 0 0 C3 -4 7 -4 10 0 C7 -2 3 -1 0 2 C-3 -1 -7 -2 -10 0 Z" fill={color} />;
}

/** Tier-Silhouetten (Blick nach rechts), Fußpunkt bei (0,0). */
function Animal({ kind, x, y, s, color }: { kind: SceneAnimal; x: number; y: number; s: number; color: string }) {
  if (kind === 'none') return null;
  const paths: Record<Exclude<SceneAnimal, 'none'>, ReactNode> = {
    fox: (
      <>
        {/* Schwanz */}
        <path d="M-6 -2 C-22 -2 -30 -10 -26 -20 C-24 -14 -16 -10 -8 -12 Z" />
        {/* Körper sitzend */}
        <path d="M-10 0 C-14 -10 -10 -24 0 -30 C4 -32 8 -32 10 -30 L12 -22 C12 -14 10 -6 8 0 Z" />
        {/* Kopf mit Ohren und Schnauze */}
        <path d="M2 -30 L1 -42 L6 -36 L10 -42 L11 -34 C14 -33 18 -31 21 -30 C18 -28 14 -27 11 -26 L6 -25 Z" />
        {/* Vorderbeine */}
        <path d="M4 0 L5 -14 L8 -14 L8 0 Z M8 0 L9 -12 L11 -12 L11 0 Z" />
      </>
    ),
    deer: (
      <>
        <path d="M-18 -26 C-18 -32 -8 -34 4 -32 L8 -40 L14 -40 L16 -34 C18 -32 22 -32 24 -31 L20 -28 L14 -28 L10 -22 C6 -20 -4 -20 -14 -22 Z" />
        <path d="M-16 -23 L-18 0 L-15.5 0 L-13 -18 Z M-10 -22 L-11 0 L-8.5 0 L-7 -20 Z M2 -22 L1 0 L3.5 0 L5 -21 Z M8 -24 L9 0 L11.5 0 L11 -22 Z" />
        <path d="M-18 -26 L-22 -30 L-19 -25 Z" />
        <path d="M11 -40 L8 -50 M8 -46 L4 -50 M15 -40 L18 -50 M18 -46 L22 -49" stroke={color} strokeWidth={1.3} strokeLinecap="round" fill="none" />
        <path d="M14 -38 L16 -44 L17 -38 Z" />
      </>
    ),
    owl: (
      <>
        <path d="M-10 0 C-14 -10 -13 -26 -8 -32 L-10 -40 L-4 -35 C-1 -36 1 -36 4 -35 L10 -40 L8 -32 C13 -26 14 -10 10 0 Z" />
        <circle cx={-4} cy={-28} r={2.6} fill="#fff4cf" opacity={0.85} />
        <circle cx={4} cy={-28} r={2.6} fill="#fff4cf" opacity={0.85} />
        <path d="M-22 1 H22 V3 H-22 Z" />
      </>
    ),
    hen: (
      <>
        <path d="M-16 -18 C-24 -26 -22 -36 -16 -38 C-14 -30 -10 -26 -6 -24 C-2 -30 4 -32 8 -30 C8 -36 12 -40 16 -38 L17 -35 L22 -33 L17 -31 C18 -26 16 -20 12 -14 C8 -6 -8 -6 -14 -12 Z" />
        <path d="M13 -40 C13 -44 16 -44 16 -41 C17 -44 20 -43 18 -39 Z" />
        <path d="M-2 -9 L-3 0 L0 0 Z M4 -9 L4 0 L7 0 Z" />
      </>
    ),
    cat: (
      <>
        <path d="M-4 0 C-14 -2 -18 -10 -20 -18 C-16 -12 -10 -8 -6 -8 Z" />
        <path d="M-8 0 C-12 -10 -8 -24 0 -26 L-2 -36 L4 -30 L8 -30 L12 -36 L11 -26 C15 -22 14 -10 10 0 Z" />
      </>
    ),
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      {paths[kind]}
    </g>
  );
}

function Tree({ x, y, s, color, kind = 'pine' }: { x: number; y: number; s: number; color: string; kind?: 'pine' | 'round' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      {kind === 'pine' ? (
        <path d="M0 -60 L10 -40 L6 -40 L14 -24 L8 -24 L18 -6 L2 -6 L2 0 L-2 0 L-2 -6 L-18 -6 L-8 -24 L-14 -24 L-6 -40 L-10 -40 Z" />
      ) : (
        <>
          <circle cx={0} cy={-34} r={16} />
          <circle cx={-12} cy={-24} r={12} />
          <circle cx={12} cy={-22} r={13} />
          <rect x={-2} y={-14} width={4} height={14} />
        </>
      )}
    </g>
  );
}

/** Blattranke für den Bildrand (wie im Entwurf). */
function Foliage({ side, color, light }: { side: 'left' | 'right'; color: string; light: string }) {
  const flip = side === 'right' ? 'translate(400 0) scale(-1 1)' : undefined;
  const leaves = [
    [10, 40, -30], [26, 70, -10], [8, 100, -50], [30, 130, 10], [12, 165, -35], [34, 195, 20], [6, 230, -60], [28, 255, 15],
  ];
  return (
    <g transform={flip}>
      <path d="M-4 20 C30 80 4 160 30 300" stroke={color} strokeWidth={2.5} fill="none" opacity={0.9} />
      {leaves.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0 0 C10 -6 26 -4 34 4 C24 10 10 10 0 0 Z" fill={i % 2 ? color : light} opacity={0.95} />
          <path d="M2 1 L30 4" stroke={light} strokeWidth={0.6} opacity={0.5} />
        </g>
      ))}
    </g>
  );
}

export interface SceneProps {
  variant?: SceneVariant;
  animal?: SceneAnimal;
  castle?: boolean;
  foliage?: boolean;
  lanterns?: number;
  seed?: number;
  /** Position/Größe des Tiers (Standard: links auf dem Felsen) */
  animalX?: number;
  animalScale?: number;
  /** Zusätzlicher Himmel oberhalb (für hohe Formate wie den Startbildschirm) */
  extraSky?: number;
  style?: CSSProperties;
  className?: string;
}

export function Scene({ variant = 'sunset', animal = 'none', castle = true, foliage = false, lanterns, seed = 7, animalX = 95, animalScale = 1.25, extraSky = 0, style, className }: SceneProps) {
  const p = PALETTES[variant];
  const id = useId().replace(/[:]/g, '');
  const r = rng(seed);
  const isNight = variant === 'night' || variant === 'lanterns';
  const stars = isNight ? Array.from({ length: 46 + Math.round(extraSky / 6) }, () => ({ x: r() * 400, y: -extraSky + r() * (150 + extraSky), s: 0.3 + r() * 1.1, o: 0.4 + r() * 0.6 })) : [];
  const lanternCount = lanterns ?? (variant === 'lanterns' ? 22 : 0);
  const lams = Array.from({ length: lanternCount }, () => ({ x: 20 + r() * 360, y: 20 + r() * 150, s: 0.5 + r() * 0.9 }));
  const orbX = variant === 'night' ? 300 : 165;
  const orbY = variant === 'night' ? 70 : 160;
  const horizon = 196;

  return (
    <svg className={className} style={{ display: 'block', width: '100%', height: '100%', ...style }} viewBox={`0 ${-extraSky} 400 ${300 + extraSky}`} preserveAspectRatio={extraSky ? 'xMidYMax slice' : 'xMidYMid slice'} aria-hidden>
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="0.45" stopColor={p.sky[1]} />
          <stop offset="0.72" stopColor={p.sky[2]} />
          <stop offset="1" stopColor={p.sky[3]} />
        </linearGradient>
        <radialGradient id={`glow${id}`}>
          <stop offset="0" stopColor={p.glow} stopOpacity="0.95" />
          <stop offset="0.35" stopColor={p.glow} stopOpacity="0.35" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`lamp${id}`}>
          <stop offset="0" stopColor="#ffe2a0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff9a4a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`water${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.water ?? p.mid} stopOpacity="0.95" />
          <stop offset="1" stopColor={p.mid} />
        </linearGradient>
        <linearGradient id={`fog${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[3]} stopOpacity="0" />
          <stop offset="1" stopColor={p.sky[3]} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <rect y={-extraSky} width="400" height={300 + extraSky} fill={`url(#sky${id})`} />
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff8e1" opacity={s.o} />)}
      {isNight && <path d="M326 34 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#ffe9b0" opacity={0.9} />}

      {/* Sonne / Mond */}
      <circle cx={orbX} cy={orbY} r={variant === 'night' ? 70 : 120} fill={`url(#glow${id})`} />
      {variant === 'night' ? (
        <g>
          <circle cx={orbX} cy={orbY} r={17} fill={p.orb} />
          <circle cx={orbX + 8} cy={orbY - 5} r={15} fill={p.sky[1]} />
        </g>
      ) : (
        <circle cx={orbX} cy={orbY} r={variant === 'lanterns' ? 18 : 26} fill={p.orb} opacity={variant === 'lanterns' ? 0.75 : 0.95} />
      )}

      {(variant === 'night' || variant === 'sunset' || variant === 'lanterns') && (
        <g>
          <Flyer x={120} y={70} s={1.1} color={p.near} />
          <Flyer x={150} y={52} s={0.7} color={p.near} />
          <Flyer x={92} y={92} s={0.55} color={p.near} />
        </g>
      )}

      {/* Ferne Berge */}
      <path d={`M0 ${horizon - 40} C40 ${horizon - 70} 70 ${horizon - 60} 100 ${horizon - 48} C130 ${horizon - 80} 170 ${horizon - 76} 200 ${horizon - 50} C240 ${horizon - 72} 290 ${horizon - 86} 330 ${horizon - 52} C360 ${horizon - 66} 385 ${horizon - 60} 400 ${horizon - 50} V${horizon} H0 Z`} fill={p.far} />
      <rect y={horizon - 50} width="400" height="50" fill={`url(#fog${id})`} />

      {castle && (
        <g>
          <path d={`M210 ${horizon - 30} C240 ${horizon - 46} 300 ${horizon - 46} 330 ${horizon - 26} V${horizon} H200 Z`} fill={p.mid} opacity={0.9} />
          <Castle x={276} y={horizon - 34} s={0.95} color={p.castle} windows={p.windows} />
        </g>
      )}

      {/* Mittlere Hügel */}
      <path d={`M0 ${horizon - 14} C60 ${horizon - 34} 120 ${horizon - 20} 170 ${horizon - 8} C220 ${horizon + 4} 260 ${horizon - 2} 300 ${horizon - 10} C340 ${horizon - 18} 380 ${horizon - 12} 400 ${horizon - 16} V${horizon + 10} H0 Z`} fill={p.mid} />

      {/* See mit Spiegelung */}
      {p.water && (
        <g>
          <rect y={horizon + 4} width="400" height="60" fill={`url(#water${id})`} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={orbX - 34 + i * 3} y={horizon + 10 + i * 7} width={68 - i * 8} height={1.6} rx={0.8} fill={p.glow} opacity={0.55 - i * 0.07} />
          ))}
        </g>
      )}

      {/* Vordergrund: Felsen/Wiese */}
      <path d={`M0 ${horizon + 36} C40 ${horizon + 20} 90 ${horizon + 24} 130 ${horizon + 40} C170 ${horizon + 56} 230 ${horizon + 50} 280 ${horizon + 40} C330 ${horizon + 30} 370 ${horizon + 36} 400 ${horizon + 30} V300 H0 Z`} fill={p.near} />
      <path d={`M40 ${horizon + 34} C60 ${horizon + 10} 110 ${horizon + 6} 140 ${horizon + 30} L150 ${horizon + 44} H34 Z`} fill={p.near} />

      <Tree x={18} y={horizon + 30} s={1.1} color={p.near} />
      <Tree x={372} y={horizon + 34} s={1.3} color={p.near} />
      <Tree x={350} y={horizon + 38} s={0.9} color={p.near} kind="round" />
      {variant === 'forest' && <>
        <Tree x={52} y={horizon + 28} s={0.9} color={p.near} kind="round" />
        <Tree x={330} y={horizon + 34} s={1} color={p.near} />
      </>}

      {/* Tier auf dem Felsen */}
      {animalScale > 1.8 && <ellipse cx={animalX} cy={horizon + 40} rx={90} ry={30} fill={p.near} />}
      <Animal kind={animal} x={animalX} y={horizon + (animalScale > 1.8 ? 30 : 16)} s={animalScale} color={p.near} />

      {/* Laternen */}
      {lams.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) scale(${l.s})`}>
          <circle cy={-6} r={12} fill={`url(#lamp${id})`} />
          <rect x={-1.8} y={-3} width={3.6} height={12} rx={0.8} fill="#efe6d2" />
          <path d="M0 -10 C2 -7 1.6 -4.5 0 -3.6 C-1.6 -4.5 -2 -7 0 -10 Z" fill="#ffd27a" />
        </g>
      ))}

      {/* Glühwürmchen (Wald/Wiese) */}
      {(variant === 'forest' || variant === 'meadow' || variant === 'dawn') &&
        Array.from({ length: 14 }, (_, i) => <circle key={i} cx={30 + r() * 340} cy={horizon - 10 + r() * 80} r={1.2} fill="#fff1b0" opacity={0.85} />)}

      {foliage && (
        <>
          <Foliage side="left" color="#1c2a22" light="#3d5546" />
          <Foliage side="right" color="#1c2a22" light="#3d5546" />
        </>
      )}
    </svg>
  );
}

/** Kartenbild mit Szene, optionalem Symbol und Verlauf für lesbaren Text. */
export function SceneCard({ scene, children, height = 150, style, onClick, label }: { scene: SceneProps; children?: ReactNode; height?: number; style?: CSSProperties; onClick?: () => void; label?: string }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className="scene-card" style={{ height, ...style }} onClick={onClick} aria-label={label}>
      <Scene {...scene} />
      <div className="scene-card-shade" />
      <div className="scene-card-content">{children}</div>
    </Tag>
  );
}
