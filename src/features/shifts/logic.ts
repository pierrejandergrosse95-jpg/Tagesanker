import { addDays, daysInRange, hmToMin } from '../../core/dates';
import type { ISODate, Settings, Shift, ShiftPattern, ShiftType } from '../../core/types';

export interface ResolvedShift {
  shift: Shift;
  type: ShiftType;
  start: string;
  end: string;
  breakMin: number;
}

export function resolveShift(shift: Shift, types: Map<number, ShiftType> | ShiftType[]): ResolvedShift | null {
  const type = Array.isArray(types) ? types.find((t) => t.id === shift.typeId) : types.get(shift.typeId);
  if (!type) return null;
  return {
    shift, type,
    start: shift.start ?? type.start,
    end: shift.end ?? type.end,
    breakMin: shift.breakMin ?? type.breakMin,
  };
}

/** Netto-Arbeitszeit in Minuten (über Mitternacht korrekt, abzüglich Pause). */
export function workMinutes(start: string, end: string, breakMin: number): number {
  let dur = hmToMin(end) - hmToMin(start);
  if (dur <= 0) dur += 1440;
  return Math.max(0, dur - breakMin);
}

export function shiftMinutes(r: ResolvedShift): number {
  return r.type.kind === 'work' ? workMinutes(r.start, r.end, r.breakMin) : 0;
}

export function dailyTargetMin(s: Pick<Settings, 'weeklyHours' | 'workDaysPerWeek'>): number {
  return (s.weeklyHours * 60) / Math.max(1, s.workDaysPerWeek);
}

export interface WorkStats {
  workedMin: number;
  creditedMin: number; // Urlaub/Krank gutgeschrieben
  targetMin: number;
  balanceMin: number;
  workDays: number;
  vacationDays: number;
  sickDays: number;
  offDays: number;
}

/**
 * Arbeitszeitkonto für [from, to].
 * Soll = Wochenstunden × Tage / 7; Urlaub und Krankheit werden mit dem Tagessoll gutgeschrieben.
 */
export function workStats(
  from: ISODate, to: ISODate, shifts: Shift[], types: ShiftType[],
  s: Pick<Settings, 'weeklyHours' | 'workDaysPerWeek'>,
  /** Ab wann das Konto geführt wird (z. B. erster Eintrag) – davor zählt kein Soll. */
  trackingStart?: ISODate,
): WorkStats {
  const map = new Map(types.map((t) => [t.id!, t]));
  const stats: WorkStats = { workedMin: 0, creditedMin: 0, targetMin: 0, balanceMin: 0, workDays: 0, vacationDays: 0, sickDays: 0, offDays: 0 };
  if (to < from) return stats;
  const daily = dailyTargetMin(s);
  for (const sh of shifts) {
    if (sh.date < from || sh.date > to) continue;
    const r = resolveShift(sh, map);
    if (!r) continue;
    switch (r.type.kind) {
      case 'work': stats.workedMin += shiftMinutes(r); stats.workDays++; break;
      case 'vacation': stats.creditedMin += daily; stats.vacationDays++; break;
      case 'sick': stats.creditedMin += daily; stats.sickDays++; break;
      case 'off': stats.offDays++; break;
    }
  }
  const targetFrom = trackingStart && trackingStart > from ? trackingStart : from;
  const days = targetFrom <= to ? daysInRange(targetFrom, to).length : 0;
  stats.targetMin = Math.round((s.weeklyHours * 60 * days) / 7);
  stats.balanceMin = Math.round(stats.workedMin + stats.creditedMin - stats.targetMin);
  return stats;
}

/** Rollt ein Schichtmuster ab `start` für `days` Tage aus. 0 in der Sequenz = Tag überspringen. */
export function expandPattern(pattern: ShiftPattern, start: ISODate, days: number): Shift[] {
  const out: Shift[] = [];
  if (!pattern.sequence.length) return out;
  for (let i = 0; i < days; i++) {
    const typeId = pattern.sequence[i % pattern.sequence.length];
    if (typeId) out.push({ date: addDays(start, i), typeId });
  }
  return out;
}

/** Textfarbe (hell/dunkel) passend zu einer Hintergrundfarbe. */
export function contrastText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1F2A22' : '#FFFFFF';
}
