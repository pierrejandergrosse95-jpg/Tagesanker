import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { addDays, atTime, today } from './dates';
import { t as tr } from '../i18n';
import { db } from './db';
import { occurrencesBetween } from './recurrence';
import type { NotifyCategory, Settings } from './types';
import { hashString } from './astro/guidance';

export interface Reminder {
  key: string;
  category: NotifyCategory;
  title: string;
  body: string;
  at: Date;
  route: string;
}

const WINDOW_DAYS = 14;
const MAX_SCHEDULED = 60; // Android begrenzt die Anzahl geplanter Alarme pro App
export const isNative = () => Capacitor.isNativePlatform();

export const CATEGORY_LABELS: Record<NotifyCategory, string> = {
  shifts: 'Arbeitsschichten', meds: 'Medikamente', bills: 'Zahlungen', tasks: 'Aufgaben',
  events: 'Termine', birthdays: 'Geburtstage', meditation: 'Meditation', habits: 'Gewohnheiten',
  impulse: 'Spiritueller Tagesimpuls',
};

export async function permissionState(): Promise<'granted' | 'denied' | 'prompt'> {
  if (isNative()) {
    const p = await LocalNotifications.checkPermissions();
    return p.display === 'granted' ? 'granted' : p.display === 'denied' ? 'denied' : 'prompt';
  }
  if (typeof Notification === 'undefined') return 'denied';
  return Notification.permission === 'default' ? 'prompt' : Notification.permission;
}

export async function requestPermission(): Promise<boolean> {
  if (isNative()) {
    const p = await LocalNotifications.requestPermissions();
    return p.display === 'granted';
  }
  if (typeof Notification === 'undefined') return false;
  return (await Notification.requestPermission()) === 'granted';
}

/** Sammelt alle Erinnerungen der nächsten Tage aus allen Bereichen. */
export async function collectReminders(settings: Settings, from = new Date()): Promise<Reminder[]> {
  const n = settings.notify;
  const start = today();
  const end = addDays(start, WINDOW_DAYS);
  const out: Reminder[] = [];

  if (n.shifts) {
    const [shifts, types] = await Promise.all([db.shifts.where('date').between(start, end, true, true).toArray(), db.shiftTypes.toArray()]);
    for (const s of shifts) {
      const t = types.find((x) => x.id === s.typeId);
      if (!t || t.kind !== 'work') continue;
      const begin = s.start ?? t.start;
      const at = new Date(atTime(s.date, begin).getTime() - settings.notifyTimes.shiftLeadMin * 60000);
      out.push({ key: `shift-${s.id}`, category: 'shifts', title: tr('{s} um {h} Uhr', { s: tr(t.name), h: begin }), body: tr('Deine Schicht beginnt in {n} Minuten.', { n: settings.notifyTimes.shiftLeadMin }), at, route: '/shifts' });
    }
  }

  if (n.meds) {
    const meds = await db.meds.where('active').equals(1).toArray();
    for (const m of meds) {
      for (const d of occurrencesBetween(m.startDate, m.recurrence, start, end)) {
        for (const t of m.times) {
          out.push({ key: `med-${m.id}-${d}-${t}`, category: 'meds', title: tr('{m} einnehmen', { m: m.name }), body: [m.dose, m.instructions].filter(Boolean).join(' · '), at: atTime(d, t), route: '/health' });
        }
      }
    }
  }

  if (n.bills) {
    const bills = await db.bills.filter((b) => !b.paidAt).toArray();
    for (const b of bills) {
      const day = addDays(b.due, -b.remindDays);
      out.push({ key: `bill-${b.id}`, category: 'bills', title: tr('Zahlung fällig: {b}', { b: b.title }), body: b.remindDays ? tr('Fällig in {n} Tagen ({d}).', { n: b.remindDays, d: b.due.split('-').reverse().join('.') }) : tr('Heute fällig.'), at: atTime(day, '09:00'), route: '/finance' });
    }
  }

  if (n.tasks) {
    const tasks = await db.tasks.filter((t) => !t.done && t.remind && !!t.due).toArray();
    for (const t of tasks) {
      out.push({ key: `task-${t.id}`, category: 'tasks', title: t.title, body: tr('Aufgabe fällig'), at: atTime(t.due!, t.time ?? settings.notifyTimes.taskTime), route: '/tasks' });
    }
  }

  if (n.events || n.birthdays) {
    const events = await db.events.toArray();
    for (const e of events) {
      const isBirthday = e.kind === 'birthday';
      if (isBirthday ? !n.birthdays : !n.events) continue;
      for (const d of occurrencesBetween(e.date, isBirthday ? { freq: 'yearly' } : e.recurrence, start, end)) {
        if (isBirthday) {
          out.push({ key: `bday-${e.id}-${d}`, category: 'birthdays', title: tr('🎂 {n} hat Geburtstag', { n: e.title }), body: tr('Denk an einen lieben Gruß.'), at: atTime(d, '08:00'), route: '/calendar' });
        } else if (e.time) {
          const lead = e.remindMin ?? 30;
          out.push({ key: `event-${e.id}-${d}`, category: 'events', title: e.title, body: `${e.time} ${tr('Uhr')}${e.location ? ' · ' + e.location : ''}`, at: new Date(atTime(d, e.time).getTime() - lead * 60000), route: '/calendar' });
        } else {
          out.push({ key: `event-${e.id}-${d}`, category: 'events', title: e.title, body: tr('Heute'), at: atTime(d, '08:00'), route: '/calendar' });
        }
      }
    }
  }

  if (n.habits) {
    const habits = await db.habits.filter((h) => !h.archived && !!h.remindTime).toArray();
    for (const h of habits) for (let i = 0; i <= WINDOW_DAYS; i++) {
      const d = addDays(start, i);
      out.push({ key: `habit-${h.id}-${d}`, category: 'habits', title: tr(h.name), body: tr('Ziel heute: {n} {u}', { n: h.target, u: tr(h.unit) }), at: atTime(d, h.remindTime!), route: '/habits' });
    }
  }

  for (let i = 0; i <= WINDOW_DAYS; i++) {
    const d = addDays(start, i);
    if (n.impulse) out.push({ key: `impulse-${d}`, category: 'impulse', title: tr('Dein Tagesimpuls ✨'), body: tr('Ein neuer Gedanke für deinen Tag wartet auf dich.'), at: atTime(d, settings.notifyTimes.impulse), route: '/spirit' });
    if (n.meditation) out.push({ key: `meditation-${d}`, category: 'meditation', title: tr('Zeit für einen Moment Ruhe'), body: tr('Ein paar Minuten Meditation tun dir gut.'), at: atTime(d, settings.notifyTimes.meditation), route: '/spirit/meditation' });
  }

  return out.filter((r) => r.at > from).sort((a, b) => a.at.getTime() - b.at.getTime());
}

let webTimers: number[] = [];

/** Plant alle Erinnerungen neu. Auf Android systemweit, im Browser solange die App geöffnet ist. */
export async function rescheduleAll(): Promise<number> {
  const settings = await db.settings.get('main');
  if (!settings?.onboarded) return 0;
  const reminders = (await collectReminders(settings)).slice(0, MAX_SCHEDULED);

  if (isNative()) {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') return 0;
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications.map((p) => ({ id: p.id })) });
    if (!reminders.length) return 0;
    await LocalNotifications.schedule({
      notifications: reminders.map((r) => ({
        id: hashString(r.key) & 0x7fffffff,
        title: r.title,
        body: r.body || ' ',
        schedule: { at: r.at, allowWhileIdle: true },
        extra: { route: r.route },
        channelId: 'tagesanker',
      })),
    });
    return reminders.length;
  }

  webTimers.forEach((t) => clearTimeout(t));
  webTimers = [];
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return 0;
  const horizon = Date.now() + 24 * 3600000;
  for (const r of reminders) {
    if (r.at.getTime() > horizon) break;
    webTimers.push(window.setTimeout(() => new Notification(r.title, { body: r.body, icon: './icon-192.png', tag: r.key }), r.at.getTime() - Date.now()));
  }
  return reminders.length;
}

/** Einmalige Einrichtung: Kanal anlegen, Tipp auf Benachrichtigung → Navigation. */
export async function initNotifications(navigate: (route: string) => void): Promise<void> {
  if (!isNative()) return;
  try {
    await LocalNotifications.createChannel({ id: 'tagesanker', name: tr('Erinnerungen'), description: tr('Erinnerungen von Tagesanker'), importance: 4, visibility: 0 });
  } catch {
    /* ältere Android-Versionen ohne Kanäle */
  }
  await LocalNotifications.addListener('localNotificationActionPerformed', (e) => {
    const route = (e.notification.extra as { route?: string } | undefined)?.route;
    if (route) navigate(route);
  });
}

export async function cancelAllNotifications(): Promise<void> {
  if (isNative()) {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications.map((p) => ({ id: p.id })) });
  }
  webTimers.forEach((t) => clearTimeout(t));
  webTimers = [];
}

let debounce: number | undefined;
/** Nach Datenänderungen aufrufen – bündelt mehrere Änderungen. */
export function scheduleSoon(): void {
  clearTimeout(debounce);
  debounce = window.setTimeout(() => void rescheduleAll().catch(console.error), 800);
}

