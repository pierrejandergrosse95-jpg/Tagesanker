/**
 * Gezeichnete Embleme (SVG) für Kacheln und Kopfbilder – Gold, Glas, Pergament, Holz.
 * Eigene Motive, offline und in jeder Größe scharf.
 */
import { useId, type ReactNode } from 'react';

export type EmblemName =
  | 'hourglass' | 'potion' | 'coins' | 'scroll' | 'book' | 'sprout' | 'crystal' | 'gear' | 'quill'
  | 'letter' | 'scales' | 'candle' | 'moon' | 'cards' | 'owl' | 'lotus' | 'calendar' | 'star' | 'chest' | 'heart';

const GOLD = '#d9b45e';
const GOLD_D = '#8a6a2c';
const INK = '#2a1c0e';

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6dc94" />
        <stop offset="0.5" stopColor={GOLD} />
        <stop offset="1" stopColor={GOLD_D} />
      </linearGradient>
      <linearGradient id={`p${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fbf0d2" />
        <stop offset="1" stopColor="#dcc28a" />
      </linearGradient>
      <radialGradient id={`glow${id}`}>
        <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.9" />
        <stop offset="1" stopColor="#ffb54a" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`glass${id}`} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#e9f7f1" stopOpacity="0.95" />
        <stop offset="0.6" stopColor="#8fb9a8" stopOpacity="0.75" />
        <stop offset="1" stopColor="#3f6b5c" stopOpacity="0.9" />
      </radialGradient>
      <radialGradient id={`orb${id}`} cx="0.4" cy="0.35" r="0.75">
        <stop offset="0" stopColor="#f3e6ff" />
        <stop offset="0.45" stopColor="#a37be0" />
        <stop offset="1" stopColor="#3a1f6b" />
      </radialGradient>
      <linearGradient id={`wood${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8a5a2e" />
        <stop offset="1" stopColor="#4a2c14" />
      </linearGradient>
    </defs>
  );
}

const shapes = (id: string): Record<EmblemName, ReactNode> => {
  const g = `url(#g${id})`, p = `url(#p${id})`, glow = `url(#glow${id})`, glass = `url(#glass${id})`, orb = `url(#orb${id})`, wood = `url(#wood${id})`;
  return {
    hourglass: (
      <>
        <rect x="22" y="12" width="56" height="8" rx="3" fill={wood} />
        <rect x="22" y="80" width="56" height="8" rx="3" fill={wood} />
        <rect x="25" y="20" width="4" height="60" fill={g} /><rect x="71" y="20" width="4" height="60" fill={g} />
        <path d="M33 20 h34 c0 16 -12 22 -15 30 c3 8 15 14 15 30 h-34 c0 -16 12 -22 15 -30 c-3 -8 -15 -14 -15 -30z" fill={glass} stroke={GOLD_D} strokeWidth="1.5" />
        <path d="M38 74 c4 -8 9 -10 12 -10 c3 0 8 2 12 10z" fill="#e8c77a" />
        <path d="M42 30 h16 c-2 6 -6 9 -8 12 c-2 -3 -6 -6 -8 -12z" fill="#e8c77a" />
        <path d="M50 46 v20" stroke="#e8c77a" strokeWidth="1.2" />
      </>
    ),
    potion: (
      <>
        <circle cx="50" cy="60" r="34" fill={glow} />
        <rect x="42" y="12" width="16" height="9" rx="2" fill={wood} />
        <path d="M43 21 h14 v12 c12 5 20 15 20 28 c0 16 -12 27 -27 27 s-27 -11 -27 -27 c0 -13 8 -23 20 -28z" fill={glass} stroke={GOLD_D} strokeWidth="1.5" />
        <path d="M26 62 c8 -4 16 4 24 0 s16 -4 24 0 c0 14 -11 24 -24 24 s-24 -10 -24 -24z" fill="#c9883a" opacity="0.85" />
        <path d="M44 56 h12 M50 50 v12" stroke="#fff4d0" strokeWidth="4" strokeLinecap="round" />
        <path d="M35 40 c-4 6 -5 12 -4 18" stroke="#fff" strokeWidth="2" opacity="0.6" fill="none" strokeLinecap="round" />
        <rect x="40" y="31" width="20" height="4" rx="1.5" fill={g} />
      </>
    ),
    coins: (
      <>
        {[0, 1, 2, 3].map((i) => <ellipse key={`a${i}`} cx="36" cy={76 - i * 7} rx="20" ry="7" fill={g} stroke={GOLD_D} strokeWidth="1" />)}
        {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={`b${i}`} cx="64" cy={80 - i * 7} rx="20" ry="7" fill={g} stroke={GOLD_D} strokeWidth="1" />)}
        <ellipse cx="64" cy="45" rx="13" ry="4" fill="none" stroke="#fff3c4" strokeWidth="1.2" opacity="0.8" />
        <circle cx="30" cy="30" r="12" fill={g} stroke={GOLD_D} strokeWidth="1.2" />
        <text x="30" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill={GOLD_D} fontFamily="serif">€</text>
      </>
    ),
    scroll: (
      <>
        <path d="M24 18 h48 c6 0 8 4 8 8 v52 c0 6 -4 8 -8 8 h-46 c-6 0 -8 -4 -8 -8 v-52 c0 -5 2 -8 6 -8z" fill={p} stroke={GOLD_D} strokeWidth="1.5" />
        <rect x="16" y="14" width="68" height="9" rx="4.5" fill={wood} />
        <rect x="16" y="80" width="68" height="9" rx="4.5" fill={wood} />
        {[34, 46, 58, 70].map((y, i) => (
          <g key={y}>
            <path d={`M28 ${y} l3 3 l5 -6`} stroke={i < 2 ? '#3f6b3c' : GOLD_D} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d={`M42 ${y} h28`} stroke={INK} strokeWidth="1.6" opacity="0.6" strokeLinecap="round" />
          </g>
        ))}
      </>
    ),
    book: (
      <>
        <path d="M18 24 c10 -4 22 -4 32 2 v58 c-10 -6 -22 -6 -32 -2z" fill="#7a2a2a" stroke={GOLD_D} strokeWidth="1.5" />
        <path d="M82 24 c-10 -4 -22 -4 -32 2 v58 c10 -6 22 -6 32 -2z" fill="#6a2222" stroke={GOLD_D} strokeWidth="1.5" />
        <path d="M22 28 c8 -3 18 -3 26 1 v50 c-8 -4 -18 -4 -26 -1z" fill={p} />
        <path d="M78 28 c-8 -3 -18 -3 -26 1 v50 c8 -4 18 -4 26 -1z" fill={p} />
        {[38, 46, 54, 62].map((y) => <path key={y} d={`M27 ${y} q10 -2 18 0 M55 ${y} q8 -2 18 0`} stroke={INK} strokeWidth="1" opacity="0.4" fill="none" />)}
        <path d="M70 22 v18 l3 -3 l3 3 v-18z" fill="#8a2c38" />
        <circle cx="50" cy="16" r="6" fill={glow} />
      </>
    ),
    sprout: (
      <>
        <path d="M28 70 h44 l-5 20 h-34z" fill="#9a5a34" stroke="#5a3218" strokeWidth="1.5" />
        <rect x="25" y="64" width="50" height="9" rx="3" fill="#b06a3c" stroke="#5a3218" strokeWidth="1.2" />
        <path d="M50 64 v-26" stroke="#3f6b2c" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M50 44 c-6 -14 -22 -16 -30 -12 c4 12 18 18 30 12z" fill="#5f9a46" stroke="#2f5a22" strokeWidth="1.2" />
        <path d="M50 38 c6 -16 22 -20 32 -14 c-4 14 -20 20 -32 14z" fill="#73b055" stroke="#2f5a22" strokeWidth="1.2" />
        <path d="M24 34 c10 2 18 6 26 10 M80 26 c-10 2 -20 8 -30 12" stroke="#2f5a22" strokeWidth="0.9" fill="none" />
      </>
    ),
    crystal: (
      <>
        <circle cx="50" cy="44" r="36" fill={glow} opacity="0.6" />
        <circle cx="50" cy="44" r="27" fill={orb} stroke="#c9a4ff" strokeWidth="1" />
        <path d="M38 34 c4 -6 10 -8 16 -7" stroke="#fff" strokeWidth="3" opacity="0.7" fill="none" strokeLinecap="round" />
        <path d="M42 50 c4 4 12 4 16 -2 c-6 0 -10 -2 -12 -6" fill="#e6d4ff" opacity="0.55" />
        <path d="M30 72 h40 l6 14 h-52z" fill={g} stroke={GOLD_D} strokeWidth="1.2" />
        <rect x="26" y="84" width="48" height="6" rx="2" fill={wood} />
      </>
    ),
    gear: (
      <>
        <g transform="translate(50 50)">
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x="-6" y="-40" width="12" height="14" rx="2" fill={g} stroke={GOLD_D} strokeWidth="1" transform={`rotate(${i * 36})`} />)}
          <circle r="29" fill={g} stroke={GOLD_D} strokeWidth="1.5" />
          <circle r="11" fill="#2a2116" stroke={GOLD_D} strokeWidth="2" />
          <circle r="21" fill="none" stroke="#fff3c4" strokeWidth="1" opacity="0.5" />
        </g>
      </>
    ),
    quill: (
      <>
        <path d="M70 12 c-24 8 -38 30 -42 58 l6 2 c6 -24 18 -42 36 -60z" fill={p} stroke={GOLD_D} strokeWidth="1.2" />
        <path d="M70 12 c-8 16 -20 34 -36 60" stroke={GOLD_D} strokeWidth="1.4" fill="none" />
        {[20, 28, 36, 44, 52].map((y, i) => <path key={y} d={`M${62 - i * 5} ${y} l-10 4`} stroke={GOLD_D} strokeWidth="0.8" opacity="0.6" />)}
        <path d="M28 70 l-4 12" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M18 78 h28 l-3 12 h-22z" fill="#1d1d2a" stroke={GOLD_D} strokeWidth="1.2" />
        <rect x="16" y="75" width="32" height="5" rx="2" fill={g} />
      </>
    ),
    letter: (
      <>
        <rect x="14" y="28" width="72" height="48" rx="3" fill={p} stroke={GOLD_D} strokeWidth="1.5" />
        <path d="M14 30 l36 26 l36 -26" fill="none" stroke={GOLD_D} strokeWidth="1.5" />
        <circle cx="50" cy="56" r="11" fill="#8a2c38" stroke="#5a1520" strokeWidth="1.5" />
        <path d="M45 56 l5 -6 l5 6 l-5 6z" fill="#c45a64" />
      </>
    ),
    scales: (
      <>
        <rect x="48" y="18" width="4" height="62" fill={g} />
        <path d="M18 28 h64" stroke={g} strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="16" r="5" fill={g} />
        <path d="M24 28 l-10 26 M24 28 l10 26 M76 28 l-10 26 M76 28 l10 26" stroke={GOLD_D} strokeWidth="1" />
        <path d="M10 54 h28 c0 7 -6 11 -14 11 s-14 -4 -14 -11z" fill={g} stroke={GOLD_D} strokeWidth="1" />
        <path d="M62 54 h28 c0 7 -6 11 -14 11 s-14 -4 -14 -11z" fill={g} stroke={GOLD_D} strokeWidth="1" />
        <path d="M34 86 h32 l-4 -8 h-24z" fill={wood} />
      </>
    ),
    candle: (
      <>
        <circle cx="50" cy="26" r="24" fill={glow} />
        <path d="M50 10 c6 8 6 14 0 20 c-6 -6 -6 -12 0 -20z" fill="#ffd27a" />
        <path d="M50 16 c3 4 3 8 0 11 c-3 -3 -3 -7 0 -11z" fill="#fff4d0" />
        <rect x="40" y="32" width="20" height="46" rx="3" fill="#f3e8cf" stroke="#c9b48a" strokeWidth="1" />
        <path d="M44 34 c0 8 -2 10 -2 14" stroke="#e2d2ae" strokeWidth="2" fill="none" />
        <path d="M24 82 h52 c0 6 -10 8 -26 8 s-26 -2 -26 -8z" fill={g} stroke={GOLD_D} strokeWidth="1" />
        <rect x="36" y="76" width="28" height="7" rx="2" fill={g} />
      </>
    ),
    moon: (
      <>
        <circle cx="50" cy="50" r="40" fill={glow} opacity="0.5" />
        <circle cx="50" cy="50" r="28" fill="#f3ead2" />
        <circle cx="42" cy="44" r="5" fill="#d9ccaa" /><circle cx="58" cy="58" r="7" fill="#d9ccaa" /><circle cx="60" cy="38" r="3" fill="#d9ccaa" />
        {[[12, 50, 7, 1], [26, 50, 9, 1], [74, 50, 9, -1], [88, 50, 7, -1]].map(([cx, cy, r, dir], i) => (
          <path key={i} d={`M${cx} ${cy - r} A${r} ${r} 0 1 ${dir > 0 ? 0 : 1} ${cx} ${cy + r} A${r * 0.55} ${r} 0 1 ${dir > 0 ? 1 : 0} ${cx} ${cy - r}Z`} fill="#f3ead2" opacity="0.9" />
        ))}
      </>
    ),
    cards: (
      <>
        {[-20, -7, 7, 20].map((r, i) => (
          <g key={i} transform={`rotate(${r} 50 88)`}>
            <rect x="33" y="22" width="34" height="56" rx="4" fill="#1f2a4a" stroke={g} strokeWidth="2" />
            <rect x="37" y="26" width="26" height="48" rx="2" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.7" />
            <path d="M50 40 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill={GOLD} />
          </g>
        ))}
      </>
    ),
    owl: (
      <>
        <path d="M30 86 c-8 -16 -6 -42 6 -54 l-4 -14 l12 9 c4 -1 8 -1 12 0 l12 -9 l-4 14 c12 12 14 38 6 54z" fill="#e9e0cf" stroke="#9c8f78" strokeWidth="1.5" />
        <circle cx="41" cy="40" r="9" fill="#fff8e6" stroke="#9c8f78" /><circle cx="59" cy="40" r="9" fill="#fff8e6" stroke="#9c8f78" />
        <circle cx="41" cy="40" r="5" fill="#d9a53a" /><circle cx="59" cy="40" r="5" fill="#d9a53a" />
        <circle cx="41" cy="40" r="2.6" fill="#1b130a" /><circle cx="59" cy="40" r="2.6" fill="#1b130a" />
        <path d="M47 48 l3 6 l3 -6z" fill="#b08a3a" />
        {[58, 66, 74].map((y) => <path key={y} d={`M38 ${y} q4 3 8 0 q4 3 8 0 q4 3 8 0`} stroke="#b3a68c" fill="none" strokeWidth="1.2" />)}
        <path d="M24 88 h52" stroke={wood} strokeWidth="5" strokeLinecap="round" />
      </>
    ),
    lotus: (
      <>
        <circle cx="50" cy="38" r="30" fill={glow} opacity="0.7" />
        <circle cx="50" cy="26" r="7" fill="#2a1c0e" />
        <path d="M50 34 c-10 0 -14 10 -14 22 l-12 10 c6 4 14 2 20 -2 h12 c6 4 14 6 20 2 l-12 -10 c0 -12 -4 -22 -14 -22z" fill="#2a1c0e" />
        <path d="M18 80 c10 -10 22 -10 32 -2 c10 -8 22 -8 32 2 c-12 6 -52 6 -64 0z" fill={g} />
      </>
    ),
    calendar: (
      <>
        <rect x="16" y="20" width="68" height="64" rx="6" fill={p} stroke={GOLD_D} strokeWidth="1.5" />
        <rect x="16" y="20" width="68" height="16" rx="6" fill="#7a2a2a" />
        <rect x="30" y="14" width="5" height="12" rx="2" fill={g} /><rect x="65" y="14" width="5" height="12" rx="2" fill={g} />
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => <rect key={`${r}${c}`} x={23 + c * 11.5} y={42 + r * 10} width="8" height="6" rx="1" fill={r === 2 && c === 3 ? '#3f6b3c' : GOLD_D} opacity={r === 2 && c === 3 ? 1 : 0.35} />))}
      </>
    ),
    star: (
      <>
        <circle cx="50" cy="50" r="36" fill={glow} opacity="0.7" />
        <path d="M50 12 l9 27 l28 2 l-22 17 l8 27 l-23 -16 l-23 16 l8 -27 l-22 -17 l28 -2z" fill={g} stroke={GOLD_D} strokeWidth="1.2" />
      </>
    ),
    chest: (
      <>
        <path d="M16 46 c0 -18 14 -26 34 -26 s34 8 34 26z" fill={wood} stroke="#2e1a0a" strokeWidth="1.5" />
        <rect x="16" y="46" width="68" height="36" rx="3" fill={wood} stroke="#2e1a0a" strokeWidth="1.5" />
        <path d="M16 46 h68 M30 22 v60 M70 22 v60" stroke={g} strokeWidth="4" />
        <rect x="44" y="50" width="12" height="14" rx="2" fill={g} />
        <circle cx="50" cy="56" r="2" fill="#2e1a0a" />
        <ellipse cx="50" cy="46" rx="22" ry="4" fill="#f3d27a" opacity="0.6" />
      </>
    ),
    heart: (
      <>
        <circle cx="50" cy="50" r="36" fill={glow} opacity="0.6" />
        <path d="M50 82 c-22 -14 -34 -28 -34 -42 c0 -10 8 -18 18 -18 c7 0 12 4 16 10 c4 -6 9 -10 16 -10 c10 0 18 8 18 18 c0 14 -12 28 -34 42z" fill="#9e2b35" stroke={GOLD_D} strokeWidth="2" />
        <path d="M30 36 c2 -6 8 -8 12 -6" stroke="#fff" strokeWidth="2.5" opacity="0.5" fill="none" strokeLinecap="round" />
      </>
    ),
  };
};

export function Emblem({ name, size, className, style }: { name: EmblemName; size?: number; className?: string; style?: React.CSSProperties }) {
  const id = useId().replace(/[:]/g, '');
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} style={style} aria-hidden>
      <Defs id={id} />
      {shapes(id)[name]}
    </svg>
  );
}
