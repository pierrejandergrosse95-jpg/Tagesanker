import { lang, t } from '../i18n';
import type { HM, ISODate } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

export function toISO(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISO(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today(): ISODate {
  return toISO(new Date());
}

export function addDays(s: ISODate, n: number): ISODate {
  const d = fromISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Addiert Monate und klemmt den Tag ans Monatsende (31.01. + 1 → 28./29.02.). */
export function addMonths(s: ISODate, n: number, anchorDay?: number): ISODate {
  const d = fromISO(s);
  const day = anchorDay ?? d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, last));
  return toISO(target);
}

export function diffDays(a: ISODate, b: ISODate): number {
  const ms = fromISO(b).getTime() - fromISO(a).getTime();
  return Math.round(ms / 86400000);
}

export function weekday(s: ISODate): number {
  return fromISO(s).getDay();
}

/** Montag der Woche (ISO-Woche beginnt am Montag). */
export function startOfWeek(s: ISODate): ISODate {
  const wd = (weekday(s) + 6) % 7;
  return addDays(s, -wd);
}

export function startOfMonth(s: ISODate): ISODate {
  return s.slice(0, 8) + '01';
}

export function endOfMonth(s: ISODate): ISODate {
  const d = fromISO(s);
  return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function daysInRange(from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

/** ISO-8601-Kalenderwoche. */
export function isoWeek(s: ISODate): number {
  const d = fromISO(s);
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function hmToMin(t: HM): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minToHM(min: number): HM {
  const m = ((min % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/** Dauer in Minuten als "7:30 h" bzw. "−1:15 h". */
export function fmtDuration(min: number): string {
  const sign = min < 0 ? '−' : '';
  const a = Math.abs(Math.round(min));
  return `${sign}${Math.floor(a / 60)}:${pad(a % 60)} h`;
}

export function atTime(date: ISODate, time: HM): Date {
  const d = fromISO(date);
  const [h, m] = time.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

const WD_SHORT = { de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] };
const WD_LONG = {
  de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
const MON = {
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const MON_SHORT = {
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export const weekdaysShort = () => WD_SHORT[lang()];
export const weekdaysLong = () => WD_LONG[lang()];
export const monthNames = () => MON[lang()];
export const monthNamesShort = () => MON_SHORT[lang()];

export function fmtLong(s: ISODate): string {
  const d = fromISO(s);
  if (lang() === 'en') return `${weekdaysLong()[d.getDay()]}, ${d.getDate()} ${monthNames()[d.getMonth()]} ${d.getFullYear()}`;
  return `${weekdaysLong()[d.getDay()]}, ${d.getDate()}. ${monthNames()[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtShort(s: ISODate): string {
  const d = fromISO(s);
  if (lang() === 'en') return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function fmtDayMonth(s: ISODate): string {
  const d = fromISO(s);
  return lang() === 'en' ? `${d.getDate()} ${monthNames()[d.getMonth()]}` : `${d.getDate()}. ${monthNames()[d.getMonth()]}`;
}

export function fmtMonthYear(s: ISODate): string {
  const d = fromISO(s);
  return `${monthNames()[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Heute", "Morgen", "in 3 Tagen", "vor 2 Tagen" */
export function relDay(s: ISODate, ref: ISODate = today()): string {
  const n = diffDays(ref, s);
  if (n === 0) return t('Heute');
  if (n === 1) return t('Morgen');
  if (n === -1) return t('Gestern');
  if (n > 1) return t('in {n} Tagen', { n });
  return t('vor {n} Tagen', { n: -n });
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return t('Gute Nacht');
  if (h < 11) return t('Guten Morgen');
  if (h < 17) return t('Guten Tag');
  if (h < 22) return t('Guten Abend');
  return t('Gute Nacht');
}

export function nowHM(): HM {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
