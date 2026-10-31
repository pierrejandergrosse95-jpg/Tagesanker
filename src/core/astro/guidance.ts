import { IMPULSES, WEEKLY_IMPULSES, type Impulse } from '../../content/impulses';
import { fromISO, isoWeek } from '../dates';
import type { ISODate } from '../types';
import type { MoonPhaseKey } from './moon';
import { signFromLongitude, SIGNS, type Element, type SignInfo } from './zodiac';
import { sunLongitude, toJD } from './ephemeris';

/** Kleiner deterministischer Hash → Pseudozufall pro Tag. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Wählt den Tagesimpuls: gewichtet nach Element des Sternzeichens und Mondphase,
 * ohne die zuletzt gezeigten Impulse (`recent`) zu wiederholen.
 */
export function selectImpulse(date: ISODate, element: Element | null, moon: MoonPhaseKey, recent: string[], pool: Impulse[] = IMPULSES): Impulse {
  const excluded = new Set(recent);
  let candidates = pool.filter((i) => !excluded.has(i.id));
  if (candidates.length === 0) candidates = pool;
  const weights = candidates.map((i) => {
    let w = 1;
    if (element && i.elements?.includes(element)) w += 2;
    if (i.moon?.includes(moon)) w += 2;
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  const rnd = mulberry32(hashString(`${date}|${element ?? ''}`))() * total;
  let acc = 0;
  for (let i = 0; i < candidates.length; i++) {
    acc += weights[i];
    if (rnd < acc) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export function weeklyImpulse(date: ISODate, element: Element): string {
  const list = WEEKLY_IMPULSES[element];
  return list[(isoWeek(date) + fromISO(date).getFullYear()) % list.length];
}

const SOLAR_THEMES: { theme: string; text: string }[] = [
  { theme: 'Du selbst & Neubeginn', text: 'Die Sonne wandert durch dein eigenes Zeichen – traditionell eine Zeit, in der du dich selbst neu ausrichtest. Was möchtest du im neuen persönlichen Jahr ausprobieren?' },
  { theme: 'Werte & Sicherheit', text: 'Im Fokus stehen Selbstwert, Finanzen und das, was dir Sicherheit gibt. Ein guter Monat, um Budget und Prioritäten liebevoll zu ordnen.' },
  { theme: 'Austausch & Lernen', text: 'Gespräche, Nachrichten und kleine Wege rücken in den Vordergrund. Neugier und Lernen fallen leichter – sprich aus, was dir wichtig ist.' },
  { theme: 'Zuhause & Wurzeln', text: 'Dein Zuhause, deine Familie und deine Herkunft werden wichtig. Schaffe dir einen Rückzugsort, an dem du auftanken kannst.' },
  { theme: 'Freude & Kreativität', text: 'Spiel, Kreativität und Herzensdinge möchten gelebt werden. Erlaube dir Dinge, die einfach nur Freude machen.' },
  { theme: 'Alltag & Gesundheit', text: 'Routinen, Gesundheit und Ordnung im Alltag stehen im Mittelpunkt. Kleine, beständige Gewohnheiten wirken jetzt besonders.' },
  { theme: 'Begegnung & Beziehung', text: 'Partnerschaften und Begegnungen spiegeln dir, wer du bist. Achte auf Ausgleich zwischen Geben und Nehmen.' },
  { theme: 'Tiefe & Wandlung', text: 'Ein Monat für Tiefgang, Ehrlichkeit und Loslassen. Was darf sich verwandeln, damit du freier wirst?' },
  { theme: 'Sinn & Weite', text: 'Fernweh, Sinnfragen und neue Horizonte rufen. Lies, lerne, reise – innerlich oder äußerlich.' },
  { theme: 'Ziele & Berufung', text: 'Beruf, Verantwortung und langfristige Ziele rücken ins Licht. Ein guter Monat, um den nächsten Schritt auf deinem Weg zu planen.' },
  { theme: 'Freundschaft & Zukunft', text: 'Gemeinschaft, Freundschaften und Zukunftsvisionen werden wichtig. Mit wem möchtest du deine Träume teilen?' },
  { theme: 'Rückzug & Abschluss', text: 'Vor deinem Geburtstagsmonat lädt diese Zeit zu Rückzug, Ruhe und Rückschau ein. Schließe ab, was abgeschlossen werden möchte.' },
];

export interface MonthlyGuidance {
  sunSign: SignInfo;
  theme: string;
  text: string;
}

/** Monatsimpuls nach dem traditionellen Prinzip der Sonnenhäuser: Stand der Sonne relativ zum eigenen Zeichen. */
export function monthlyGuidance(date: ISODate, sign: SignInfo): MonthlyGuidance {
  const noon = new Date(fromISO(date).getTime() + 12 * 3600000);
  const sunSign = signFromLongitude(sunLongitude(toJD(noon)));
  const offset = (sunSign.index - sign.index + 12) % 12;
  return { sunSign, ...SOLAR_THEMES[offset] };
}

export { SIGNS };
