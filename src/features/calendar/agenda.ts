import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/db';
import { hmToMin } from '../../core/dates';
import { occurrencesBetween } from '../../core/recurrence';
import type { Bill, CalEvent, ISODate, Shift, ShiftType, Task } from '../../core/types';
import { moonEventsBetween, PHASE_NAMES } from '../../core/astro/moon';
import { toISO } from '../../core/dates';

export type AgendaItem =
  | { kind: 'event'; date: ISODate; event: CalEvent; sort: number }
  | { kind: 'shift'; date: ISODate; shift: Shift; type: ShiftType; sort: number }
  | { kind: 'task'; date: ISODate; task: Task; sort: number }
  | { kind: 'bill'; date: ISODate; bill: Bill; sort: number }
  | { kind: 'moon'; date: ISODate; label: string; phase: number; sort: number };

export const EVENT_COLORS: Record<CalEvent['kind'], string> = { appointment: '#6F8C6E', birthday: '#C9A55C', doctor: '#C27A6B' };

export function useAgenda(from: ISODate, to: ISODate): Map<ISODate, AgendaItem[]> | undefined {
  return useLiveQuery(async () => {
    const [events, shifts, types, tasks, bills] = await Promise.all([
      db.events.toArray(),
      db.shifts.where('date').between(from, to, true, true).toArray(),
      db.shiftTypes.toArray(),
      db.tasks.where('due').between(from, to, true, true).toArray(),
      db.bills.where('due').between(from, to, true, true).toArray(),
    ]);
    const map = new Map<ISODate, AgendaItem[]>();
    const push = (it: AgendaItem) => {
      const arr = map.get(it.date) ?? [];
      arr.push(it);
      map.set(it.date, arr);
    };
    for (const e of events) {
      const rule = e.kind === 'birthday' ? { freq: 'yearly' as const } : e.recurrence;
      for (const d of occurrencesBetween(e.date, rule, from, to)) push({ kind: 'event', date: d, event: e, sort: e.time ? hmToMin(e.time) : -1 });
    }
    for (const s of shifts) {
      const type = types.find((t) => t.id === s.typeId);
      if (type) push({ kind: 'shift', date: s.date, shift: s, type, sort: type.kind === 'work' ? hmToMin(s.start ?? type.start) : -2 });
    }
    for (const t of tasks) push({ kind: 'task', date: t.due!, task: t, sort: t.time ? hmToMin(t.time) : 2000 });
    for (const b of bills) push({ kind: 'bill', date: b.due, bill: b, sort: 2001 });
    for (const m of moonEventsBetween(from, to)) {
      if (m.phase === 0 || m.phase === 2) push({ kind: 'moon', date: toISO(m.date), label: PHASE_NAMES[m.phase], phase: m.phase, sort: -3 });
    }
    for (const arr of map.values()) arr.sort((a, b) => a.sort - b.sort);
    return map;
  }, [from, to]);
}

export function itemColor(it: AgendaItem): string {
  switch (it.kind) {
    case 'event': return EVENT_COLORS[it.event.kind];
    case 'shift': return it.type.color;
    case 'task': return '#4F5D75';
    case 'bill': return '#B5543F';
    case 'moon': return '#C9A55C';
  }
}
