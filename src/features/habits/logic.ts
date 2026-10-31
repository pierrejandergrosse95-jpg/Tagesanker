import { addDays, daysInRange, startOfWeek } from '../../core/dates';
import type { Habit, HabitLog, ISODate } from '../../core/types';

export function valueOn(logs: HabitLog[], habitId: number, day: ISODate): number {
  return logs.find((l) => l.habitId === habitId && l.date === day)?.value ?? 0;
}

export const isDone = (h: Habit, value: number) => value >= h.target;

/** Tagesfortschritt 0–1. */
export function dayProgress(h: Habit, logs: HabitLog[], day: ISODate): number {
  return Math.min(1, valueOn(logs, h.id!, day) / Math.max(1e-9, h.target));
}

/** Für wöchentliche Gewohnheiten: Tage mit erreichtem Ziel in der Woche von `day`. */
export function weekCount(h: Habit, logs: HabitLog[], day: ISODate): number {
  const from = startOfWeek(day);
  return daysInRange(from, addDays(from, 6)).filter((d) => isDone(h, valueOn(logs, h.id!, d))).length;
}

/** Aktuelle Serie (aufeinanderfolgende erledigte Tage bis heute; heute zählt nur, wenn erledigt). */
export function streak(h: Habit, logs: HabitLog[], today: ISODate): number {
  let n = 0;
  let d = today;
  if (!isDone(h, valueOn(logs, h.id!, d))) d = addDays(d, -1);
  while (isDone(h, valueOn(logs, h.id!, d)) && n < 3650) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/** Erfüllungsquote in [from, to] (Anteil Tage mit erreichtem Ziel). */
export function completionRate(h: Habit, logs: HabitLog[], from: ISODate, to: ISODate): number {
  const days = daysInRange(from, to);
  if (!days.length) return 0;
  const done = days.filter((d) => isDone(h, valueOn(logs, h.id!, d))).length;
  if (h.freq === 'weekly') return Math.min(1, done / ((days.length / 7) * h.timesPerWeek));
  return done / days.length;
}

/** Gesamtfortschritt aller Gewohnheiten an einem Tag (0–1). */
export function overallProgress(habits: Habit[], logs: HabitLog[], day: ISODate): number {
  const active = habits.filter((h) => !h.archived);
  if (!active.length) return 0;
  return active.reduce((s, h) => s + dayProgress(h, logs, day), 0) / active.length;
}
