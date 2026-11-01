import { useLiveQuery } from 'dexie-react-hooks';
import { Bell, CalendarDays, CalendarRange, Check, Clock, Gift, ListChecks, Plus, Repeat, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { t, t as tr } from '../../i18n';
import { HubHero, ScrollMenu } from '../../ui/hub';
import { blankEvent, EventEditor } from '../calendar/Calendar';
import { useEffect, useMemo, useState } from 'react';
import { addDays, endOfMonth, fmtShort, relDay, startOfWeek, today } from '../../core/dates';
import { db } from '../../core/db';
import { useToday } from '../../core/hooks';
import { describeRecurrence, nextOccurrence, NO_REPEAT, occurrencesBetween } from '../../core/recurrence';
import { withoutId } from '../../core/util';
import type { CalEvent, Priority, Task, TaskScope } from '../../core/types';
import { Empty, Field, RecurrencePicker, Segmented, Sheet, Toggle, TopBar, useUi } from '../../ui/components';

export const TASK_CATEGORIES = ['Haushalt', 'Arbeit', 'Einkauf', 'Finanzen', 'Gesundheit', 'Persönlich', 'Hof & Garten', 'Sonstiges'];
const PRIO_LABEL: Record<Priority, string> = { 1: 'Hoch', 2: 'Mittel', 3: 'Niedrig' };
const PRIO_COLOR: Record<Priority, string> = { 1: 'var(--danger)', 2: 'var(--gold)', 3: 'var(--sage)' };

/** Abhaken – bei wiederkehrenden Aufgaben wird die nächste Instanz angelegt. */
export async function toggleTask(t: Task): Promise<void> {
  if (t.done) {
    await db.tasks.update(t.id!, { done: 0, doneAt: undefined });
    return;
  }
  await db.transaction('rw', db.tasks, async () => {
    await db.tasks.update(t.id!, { done: 1, doneAt: Date.now() });
    if (t.recurrence.freq !== 'none' && t.due) {
      const next = nextOccurrence(t.due, t.recurrence, t.due);
      if (next) {
        await db.tasks.add({ ...withoutId(t), due: next, done: 0, doneAt: undefined, createdAt: Date.now() });
      }
    }
  });
}

function scopeDefaultDue(scope: TaskScope, day: string): string {
  if (scope === 'week') return addDays(startOfWeek(day), 6);
  if (scope === 'month') return endOfMonth(day);
  return day;
}

export function blankTask(scope: TaskScope = 'day', due?: string): Task {
  return { title: '', scope, due: due ?? today(), priority: 2, recurrence: NO_REPEAT, remind: false, done: 0, order: Date.now(), createdAt: Date.now() };
}

export function TaskEditor({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const [t, setT] = useState<Task | null>(task);
  const { confirm } = useUi();
  useEffect(() => setT(task), [task]);
  if (!t) return null;
  const set = (p: Partial<Task>) => setT({ ...t, ...p });
  const save = async () => {
    if (!t.title.trim()) return;
    if (t.id) await db.tasks.put(t);
    else await db.tasks.add(t);
    onClose();
  };
  const remove = async () => {
    if (t.id && (await confirm('Aufgabe löschen?', { ok: 'Löschen', danger: true }))) {
      await db.tasks.delete(t.id);
      onClose();
    }
  };
  return (
    <Sheet open onClose={onClose} title={t.id ? tr('Aufgabe bearbeiten') : tr('Neue Aufgabe')} actions={<>
      {t.id && <button className="btn danger" onClick={remove} aria-label={tr('Löschen')}><Trash2 size={18} /></button>}
      <button className="btn" onClick={save} disabled={!t.title.trim()}>{tr('Speichern')}</button>
    </>}>
      <div className="form">
        <Field label="Titel"><input className="input" autoFocus value={t.title} onChange={(e) => set({ title: e.target.value })} placeholder={tr('z. B. Rechnung Strom überweisen')} /></Field>
        <Segmented value={t.scope} onChange={(scope) => set({ scope, due: scopeDefaultDue(scope, t.due ?? today()) })} options={[{ value: 'day', label: 'Tag' }, { value: 'week', label: 'Woche' }, { value: 'month', label: 'Monat' }]} />
        <div className="grid2">
          <Field label="Fällig am"><input className="input" type="date" value={t.due ?? ''} onChange={(e) => set({ due: e.target.value || undefined })} /></Field>
          <Field label="Uhrzeit (optional)"><input className="input" type="time" value={t.time ?? ''} onChange={(e) => set({ time: e.target.value || undefined })} /></Field>
        </div>
        <div className="grid2">
          <Field label="Priorität">
            <select className="select" value={t.priority} onChange={(e) => set({ priority: Number(e.target.value) as Priority })}>
              {([1, 2, 3] as Priority[]).map((p) => <option key={p} value={p}>{tr(PRIO_LABEL[p])}</option>)}
            </select>
          </Field>
          <Field label="Kategorie">
            <select className="select" value={t.category ?? ''} onChange={(e) => set({ category: e.target.value || undefined })}>
              <option value="">–</option>
              {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{tr(c)}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Wiederholung"><RecurrencePicker value={t.recurrence} onChange={(recurrence) => set({ recurrence })} /></Field>
        <div className="row between"><span>{tr('Erinnerung')}</span><Toggle checked={t.remind} onChange={(remind) => set({ remind })} label="Erinnerung" /></div>
        <Field label="Notiz"><textarea className="textarea" value={t.note ?? ''} onChange={(e) => set({ note: e.target.value })} /></Field>
      </div>
    </Sheet>
  );
}

export function TaskRow({ t, onEdit }: { t: Task; onEdit: (t: Task) => void }) {
  const day = useToday();
  const overdue = !t.done && t.due && t.due < day;
  return (
    <div className={`list-item ${t.done ? 'done' : ''}`}>
      <button className={`check ${t.done ? 'on' : ''}`} aria-label={t.done ? tr('Als offen markieren') : tr('Erledigt')} onClick={() => void toggleTask(t)}>
        {t.done ? <Check size={16} /> : null}
      </button>
      <button className="grow" style={{ background: 'none', border: 0, textAlign: 'left', padding: 0 }} onClick={() => onEdit(t)}>
        <div className="title">{t.title}</div>
        <div className="meta row" style={{ gap: 6 }}>
          <span className="swatch" style={{ background: PRIO_COLOR[t.priority], width: 7, height: 7 }} />
          {t.due && <span style={{ color: overdue ? 'var(--danger)' : undefined }}>{relDay(t.due, day)}{t.time ? `, ${t.time}` : ''}</span>}
          {t.category && <span>· {t.category}</span>}
          {t.recurrence.freq !== 'none' && <span className="row" style={{ gap: 2 }}>· <Repeat size={11} /> {describeRecurrence(t.recurrence)}</span>}
        </div>
      </button>
    </div>
  );
}

type View = 'day' | 'week' | 'month' | 'all' | 'done' | 'events' | 'birthdays';
const TITLES: Record<View, string> = {
  day: 'Tagesaufgaben', week: 'Wochenaufgaben', month: 'Monatsaufgaben', all: 'Alle Aufgaben', done: tr('Erledigt'), events: 'Termine', birthdays: 'Geburtstage',
};

function filterTasks(tasks: Task[], view: View, day: string): Task[] {
  const wEnd = addDays(startOfWeek(day), 6);
  const mEnd = endOfMonth(day);
  let list = tasks.filter((x) => (view === 'done' ? x.done : !x.done));
  if (view === 'day') list = list.filter((x) => (x.scope === 'day' ? !x.due || x.due <= day : x.due ? x.due <= day : false));
  if (view === 'week') list = list.filter((x) => (x.scope === 'week' || x.scope === 'day') && (!x.due || x.due <= wEnd));
  if (view === 'month') list = list.filter((x) => !x.due || x.due <= mEnd);
  return list.sort((a, b) => view === 'done' ? (b.doneAt ?? 0) - (a.doneAt ?? 0) : a.priority - b.priority || (a.due ?? '9').localeCompare(b.due ?? '9') || a.order - b.order);
}

export default function TasksScreen() {
  const day = useToday();
  const nav = useNavigate();
  const { section } = useParams();
  const view = (section as View | undefined) ?? null;
  const [cat, setCat] = useState<string>('');
  const [editing, setEditing] = useState<Task | null>(null);
  const [editEvent, setEditEvent] = useState<CalEvent | null>(null);
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) ?? [];
  const events = useLiveQuery(() => db.events.toArray(), []) ?? [];

  const filtered = useMemo(() => (view && view !== 'events' && view !== 'birthdays' ? filterTasks(tasks, view, day).filter((x) => !cat || x.category === cat) : []), [tasks, view, cat, day]);
  const upcoming = useMemo(() => events
    .filter((e) => (view === 'birthdays' ? e.kind === 'birthday' : e.kind !== 'birthday'))
    .flatMap((e) => occurrencesBetween(e.date, e.kind === 'birthday' ? { freq: 'yearly' } : e.recurrence, day, addDays(day, view === 'birthdays' ? 366 : 90)).slice(0, 1).map((d) => ({ e, d })))
    .sort((a, b) => a.d.localeCompare(b.d) || (a.e.time ?? '').localeCompare(b.e.time ?? '')), [events, view, day]);

  const scopeForNew: TaskScope = view === 'week' ? 'week' : view === 'month' ? 'month' : 'day';
  const editors = (
    <>
      <TaskEditor task={editing} onClose={() => setEditing(null)} />
      <EventEditor event={editEvent} onClose={() => setEditEvent(null)} />
    </>
  );

  if (!view) {
    const count = (v: View) => filterTasks(tasks, v, day).length;
    const todayEvents = events.filter((e) => e.kind !== 'birthday' && occurrencesBetween(e.date, e.recurrence, day, day).length).length;
    return (
      <div className="screen">
        <HubHero title={t('Aufgaben & Termine')} image="tasks"
          actions={<button className="icon-btn" aria-label={t('Neue Aufgabe')} onClick={() => setEditing(blankTask())}><Plus size={24} /></button>} />
        <ScrollMenu items={[
          { key: 'day', label: t('Tagesaufgaben'), icon: <ListChecks size={20} />, badge: `(${count('day')})`, to: '/tasks/day' },
          { key: 'week', label: t('Wochenaufgaben'), icon: <CalendarRange size={20} />, badge: count('week') || undefined, to: '/tasks/week' },
          { key: 'month', label: t('Monatsaufgaben'), icon: <CalendarDays size={20} />, badge: count('month') || undefined, to: '/tasks/month' },
          { key: 'events', label: t('Termine'), icon: <Clock size={20} />, badge: todayEvents ? t('{n} heute', { n: todayEvents }) : undefined, to: '/tasks/events' },
          { key: 'birthdays', label: t('Geburtstage'), icon: <Gift size={20} />, to: '/tasks/birthdays' },
          { key: 'reminders', label: t('Erinnerungen'), icon: <Bell size={20} />, to: '/settings#notify' },
          { key: 'done', label: t('Erledigt'), icon: <Check size={20} />, to: '/tasks/done' },
          { key: 'calendar', label: t('Kalender öffnen'), icon: <CalendarDays size={20} />, onClick: () => nav('/calendar') },
        ]} />
        {editors}
      </div>
    );
  }

  const isEvents = view === 'events' || view === 'birthdays';
  return (
    <div className="screen">
      <TopBar title={TITLES[view]} back="/tasks" sub={isEvents ? undefined : t('{n} offen', { n: tasks.filter((x) => !x.done).length })} actions={
        <button className="icon-btn filled" aria-label={t('Neu')} onClick={() => (isEvents ? setEditEvent(blankEvent(day, view === 'birthdays' ? 'birthday' : 'appointment')) : setEditing(blankTask(scopeForNew, scopeDefaultDue(scopeForNew, day))))}><Plus size={22} /></button>
      } />
      {isEvents ? (
        upcoming.length ? (
          <div className="list">
            {upcoming.map(({ e, d }) => (
              <button key={e.id} className="list-item" onClick={() => setEditEvent(e)}>
                {e.kind === 'birthday' ? <Gift size={18} className="gold-text" /> : <Clock size={18} className="muted" />}
                <div className="grow">
                  <div className="title">{e.title}</div>
                  <div className="meta">{relDay(d, day)} · {fmtShort(d)}{e.time ? `, ${e.time} ${t('Uhr')}` : ''}{e.kind === 'birthday' && e.date.slice(0, 4) > '1900' ? ` · ${t('wird {n}', { n: Number(d.slice(0, 4)) - Number(e.date.slice(0, 4)) })}` : ''}</div>
                </div>
              </button>
            ))}
          </div>
        ) : <div className="card"><Empty text={view === 'birthdays' ? tr('Noch keine Geburtstage eingetragen.') : tr('Keine anstehenden Termine.')} /></div>
      ) : (
        <>
          <div className="hscroll mb">
            <button className={`chip ${!cat ? 'active' : ''}`} onClick={() => setCat('')}>{t('Alle')}</button>
            {TASK_CATEGORIES.map((c) => <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c === cat ? '' : c)}>{t(c)}</button>)}
          </div>
          {filtered.length ? (
            <div className="list">{filtered.map((x) => <TaskRow key={x.id} t={x} onEdit={setEditing} />)}</div>
          ) : (
            <div className="card"><Empty icon={<ListChecks size={30} />} text={view === 'done' ? tr('Noch nichts erledigt.') : tr('Keine offenen Aufgaben – schön!')} /></div>
          )}
        </>
      )}
      {editors}
    </div>
  );
}
