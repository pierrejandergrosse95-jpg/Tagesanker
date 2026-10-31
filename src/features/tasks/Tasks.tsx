import { useLiveQuery } from 'dexie-react-hooks';
import { Check, ListChecks, Plus, Repeat, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { addDays, endOfMonth, relDay, startOfWeek, today } from '../../core/dates';
import { db } from '../../core/db';
import { useToday } from '../../core/hooks';
import { describeRecurrence, nextOccurrence, NO_REPEAT } from '../../core/recurrence';
import { withoutId } from '../../core/util';
import type { Priority, Task, TaskScope } from '../../core/types';
import { SceneCard } from '../../ui/scenes';
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
    <Sheet open onClose={onClose} title={t.id ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'} actions={<>
      {t.id && <button className="btn danger" onClick={remove} aria-label="Löschen"><Trash2 size={18} /></button>}
      <button className="btn" onClick={save} disabled={!t.title.trim()}>Speichern</button>
    </>}>
      <div className="form">
        <Field label="Titel"><input className="input" autoFocus value={t.title} onChange={(e) => set({ title: e.target.value })} placeholder="z. B. Rechnung Strom überweisen" /></Field>
        <Segmented value={t.scope} onChange={(scope) => set({ scope, due: scopeDefaultDue(scope, t.due ?? today()) })} options={[{ value: 'day', label: 'Tag' }, { value: 'week', label: 'Woche' }, { value: 'month', label: 'Monat' }]} />
        <div className="grid2">
          <Field label="Fällig am"><input className="input" type="date" value={t.due ?? ''} onChange={(e) => set({ due: e.target.value || undefined })} /></Field>
          <Field label="Uhrzeit (optional)"><input className="input" type="time" value={t.time ?? ''} onChange={(e) => set({ time: e.target.value || undefined })} /></Field>
        </div>
        <div className="grid2">
          <Field label="Priorität">
            <select className="select" value={t.priority} onChange={(e) => set({ priority: Number(e.target.value) as Priority })}>
              {([1, 2, 3] as Priority[]).map((p) => <option key={p} value={p}>{PRIO_LABEL[p]}</option>)}
            </select>
          </Field>
          <Field label="Kategorie">
            <select className="select" value={t.category ?? ''} onChange={(e) => set({ category: e.target.value || undefined })}>
              <option value="">–</option>
              {TASK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Wiederholung"><RecurrencePicker value={t.recurrence} onChange={(recurrence) => set({ recurrence })} /></Field>
        <div className="row between"><span>Erinnerung</span><Toggle checked={t.remind} onChange={(remind) => set({ remind })} label="Erinnerung" /></div>
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
      <button className={`check ${t.done ? 'on' : ''}`} aria-label={t.done ? 'Als offen markieren' : 'Erledigt'} onClick={() => void toggleTask(t)}>
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

type View = 'day' | 'week' | 'month' | 'all' | 'done';

export default function TasksScreen() {
  const day = useToday();
  const [view, setView] = useState<View>('day');
  const [cat, setCat] = useState<string>('');
  const [editing, setEditing] = useState<Task | null>(null);
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) ?? [];

  const filtered = useMemo(() => {
    const wEnd = addDays(startOfWeek(day), 6);
    const mEnd = endOfMonth(day);
    let list = tasks.filter((t) => (view === 'done' ? t.done : !t.done));
    if (view === 'day') list = list.filter((t) => t.scope === 'day' ? !t.due || t.due <= day : t.due ? t.due <= day : false);
    if (view === 'week') list = list.filter((t) => (t.scope === 'week' || t.scope === 'day') && (!t.due || t.due <= wEnd));
    if (view === 'month') list = list.filter((t) => !t.due || t.due <= mEnd);
    if (cat) list = list.filter((t) => t.category === cat);
    return list.sort((a, b) => view === 'done' ? (b.doneAt ?? 0) - (a.doneAt ?? 0) : a.priority - b.priority || (a.due ?? '9').localeCompare(b.due ?? '9') || a.order - b.order);
  }, [tasks, view, cat, day]);

  const scopeForNew: TaskScope = view === 'week' ? 'week' : view === 'month' ? 'month' : 'day';

  return (
    <div className="screen">
      <TopBar title="Aufgaben" back sub={`${tasks.filter((t) => !t.done).length} offen`} actions={
        <button className="icon-btn filled" aria-label="Neue Aufgabe" onClick={() => setEditing(blankTask(scopeForNew, scopeDefaultDue(scopeForNew, day)))}><Plus size={22} /></button>
      } />
      <Segmented value={view} onChange={setView} options={[{ value: 'day', label: 'Heute' }, { value: 'week', label: 'Woche' }, { value: 'month', label: 'Monat' }, { value: 'all', label: 'Alle' }, { value: 'done', label: 'Erledigt' }]} />
      <div className="hscroll mb">
        <button className={`chip ${!cat ? 'active' : ''}`} onClick={() => setCat('')}>Alle</button>
        {TASK_CATEGORIES.map((c) => <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c === cat ? '' : c)}>{c}</button>)}
      </div>
      {filtered.length ? (
        <div className="list">{filtered.map((t) => <TaskRow key={t.id} t={t} onEdit={setEditing} />)}</div>
      ) : (
        <div className="card"><Empty icon={<ListChecks size={30} />} text={view === 'done' ? 'Noch nichts erledigt.' : 'Keine offenen Aufgaben – schön!'} /></div>
      )}
      <SceneCard scene={{ variant: 'meadow', animal: 'hen', castle: false, animalX: 300, seed: 3 }} height={150} style={{ marginTop: 16 }}>
        <span className="serif" style={{ fontSize: 18, fontStyle: 'italic', textShadow: '0 1px 6px rgb(0 0 0 / .5)' }}>„Manchmal sind es die kleinen Dinge, die den Tag groß machen.“</span>
      </SceneCard>
      <TaskEditor task={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
