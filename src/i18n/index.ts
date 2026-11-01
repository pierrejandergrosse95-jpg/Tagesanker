/**
 * Zweisprachigkeit (Deutsch/Englisch).
 * Deutsch ist die Quellsprache: `t('Aufgaben')` liefert auf Englisch die Übersetzung aus `en.ts`,
 * fehlt sie, bleibt der deutsche Text stehen. Platzhalter: t('{n} offen', { n: 3 }).
 */
import { EN } from './en';

export type Lang = 'de' | 'en';
let current: Lang = detectLang();

export function detectLang(): Lang {
  try {
    return (navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
  } catch {
    return 'de';
  }
}

export function setLang(l: Lang): void {
  current = l;
  try {
    document.documentElement.lang = l;
  } catch {
    /* außerhalb des Browsers */
  }
}

export const lang = (): Lang => current;
export const locale = (): string => (current === 'en' ? 'en-GB' : 'de-DE');

export function t(de: string, vars?: Record<string, string | number>): string {
  let s = current === 'en' ? (EN[de] ?? de) : de;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

/** Wählt zwischen deutscher und englischer Fassung eines Inhalts. */
export function L<T>(de: T, en?: T): T {
  return current === 'en' && en !== undefined ? en : de;
}

/** Zitat mit sprachüblichen Anführungszeichen. */
export const quote = (s: string): string => (current === 'en' ? `“${s}”` : `„${s}“`);
