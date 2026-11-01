import { addDays, addMonths, diffDays, fromISO, weekday } from './dates';
import type { ISODate, Recurrence } from './types';
import { t } from '../i18n';
import { weekdaysShort } from './dates';

export const NO_REPEAT: Recurrence = { freq: 'none' };

/** Prüft, ob eine Regel mit Startdatum `start` am Tag `day` greift. */
export function occursOn(start: ISODate, rule: Recurrence, day: ISODate): boolean {
  if (day < start) return false;
  const s = fromISO(start);
  const d = fromISO(day);
  switch (rule.freq) {
    case 'none':
      return day === start;
    case 'daily':
      return true;
    case 'weekly':
      return weekday(day) === weekday(start);
    case 'weekdays':
      return (rule.weekdays ?? []).includes(weekday(day));
    case 'interval': {
      const n = Math.max(1, rule.every ?? 1);
      return diffDays(start, day) % n === 0;
    }
    case 'monthly': {
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      return d.getDate() === Math.min(s.getDate(), last);
    }
    case 'yearly': {
      if (d.getMonth() !== s.getMonth()) return false;
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      return d.getDate() === Math.min(s.getDate(), last);
    }
  }
}

/** Nächstes Vorkommen strikt nach `after` (oder null bei 'none'). */
export function nextOccurrence(start: ISODate, rule: Recurrence, after: ISODate): ISODate | null {
  if (rule.freq === 'none') return start > after ? start : null;
  if (rule.freq === 'monthly') {
    const anchor = fromISO(start).getDate();
    let cand = start;
    let i = 0;
    while (cand <= after) cand = addMonths(start, ++i, anchor);
    return cand;
  }
  if (rule.freq === 'yearly') {
    let i = 0;
    let cand = start;
    while (cand <= after) cand = addMonths(start, 12 * ++i, fromISO(start).getDate());
    return cand;
  }
  let d = after < start ? start : addDays(after, 1);
  for (let i = 0; i < 400; i++, d = addDays(d, 1)) {
    if (occursOn(start, rule, d)) return d;
  }
  return null;
}

/** Alle Vorkommen im Zeitraum [from, to]. */
export function occurrencesBetween(start: ISODate, rule: Recurrence, from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = [];
  if (rule.freq === 'none') {
    if (start >= from && start <= to) out.push(start);
    return out;
  }
  let d: ISODate | null = from <= start ? start : nextOccurrence(start, rule, addDays(from, -1));
  if (d && !occursOn(start, rule, d)) d = nextOccurrence(start, rule, d);
  while (d && d <= to) {
    out.push(d);
    d = nextOccurrence(start, rule, d);
  }
  return out;
}

export function describeRecurrence(rule: Recurrence): string {
  const names = weekdaysShort();
  switch (rule.freq) {
    case 'none': return t('Einmalig');
    case 'daily': return t('Täglich');
    case 'weekly': return t('Wöchentlich');
    case 'monthly': return t('Monatlich');
    case 'yearly': return t('Jährlich');
    case 'interval': return t('Alle {n} Tage', { n: rule.every ?? 1 });
    case 'weekdays': {
      const w = [...(rule.weekdays ?? [])].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
      return w.length ? w.map((i) => names[i]).join(', ') : t('Keine Tage');
    }
  }
}
