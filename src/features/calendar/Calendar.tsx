import { Cake, ChevronLeft, ChevronRight, Moon, Plus, Receipt, Stethoscope, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addDays, addMonths, daysInRange, endOfMonth, fmtLong, fmtMonthYear, fromISO, hmToMin, isoWeek,
  startOfMonth, startOfWeek, WEEKDAYS_SHORT,
} from '../../core/dates';
import { db } from '../../core/db';
import { useToday } from '../../core/hooks';
import { NO_REPEAT } from '../../core/recurrence';
import type { CalEvent, EventKind, ISODate, Task } from '../../core/types';
import { Empty, Field, RecurrencePicker, Segmented, Sheet, TopBar, useUi } from '../../ui/components';
import { fmtMoney } from '../finance/logic';
import { TaskEditor, toggleTask } from '../tasks/Tasks';
import { itemColor, useAgenda, type AgendaItem } from './agenda';

export function blankEvent(date: ISODate, kind: EventKind = 'appointment'): CalEvent {
  return { title: '', kind, date, recurrence: NO_REPEAT, remindMin: 30 };
}

const KIND_LABEL: Record<EventKind, string> = { appointment: 'Termin', birthday: 'Geburtstag', doctor: 'Arzttermin' };

export function EventEditor({ event, onClose }: { event: CalEvent | null; onClose: () => void }) {
  const [e, setE] = useState<CalEvent | null>(event);
  const { confirm } = useUi();
  useEffect(() => setE(event), [event]);
  if (!e) return null;
  const set = (p: Partial<CalEvent>) => setE({ ...e, ...p });
  const save = async () => {
    if (!e.title.trim()) return;
    if (e.id) await db.events.put(e);
    else await db.events.add(e);
    onClose();
  };
  const remove = async () => {
    if (e.id && (await confirm(`${KIND_LABEL[e.kind]} löschen?`, { ok: 'Löschen', danger: true }))) {
      await db.events.delete(e.id);
      onClose();
    }
  };
  const isBday = e.kind === 'birthday';
  return (
    <Sheet open onClose={onClose} title={e.id ? `${KIND_LABEL[e.kind]} bearbeiten` : `Neuer ${KIND_LABEL[e.kind]}`} actions={<>
      {e.id && <button className="btn danger" onClick={remove} aria-label="Löschen"><Trash2 size={18} /></button>}
      <button className="btn" onClick={save} disabled={!e.title.trim()}>Speichern</button>
    </>}>
      <div className="form">
        <Segmented value={e.kind} onChange={(kind) => set({ kind })} options={[{ value: 'appointment', label: 'Termin' }, { value: 'doctor', label: 'Arzt' }, { value: 'birthday', label: 'Geburtstag' }]} />
        <Field label={isBday ? 'Name' : 'Titel'}><input className="input" autoFocus value={e.title} onChange={(ev) => set({ title: ev.target.value })} placeholder={isBday ? 'z. B. Oma Ilse' : 'z. B. Zahnarzt'} /></Field>
        <Field label={isBday ? 'Geburtstag' : 'Datum'}><input className="input" type="date" value={e.date} onChange={(ev) => set({ date: ev.target.value })} /></Field>
        {!isBday && (
          <>
            <div className="grid2">
              <Field label="Beginn"><input className="input" type="time" value={e.time ?? ''} onChange={(ev) => set({ time: ev.target.value || undefined })} /></Field>
              <Field label="Ende"><input className="input" type="time" value={e.endTime ?? ''} onChange={(ev) => set({ endTime: ev.target.value || undefined })} /></Field>
            </div>
            <Field label="Ort"><input className="input" value={e.location ?? ''} onChange={(ev) => set({ location: ev.target.value })} /></Field>
            <Field label="Wiederholung"><RecurrencePicker value={e.recurrence} onChange={(recurrence) => set({ recurrence })} /></Field>
            <Field label="Erinnerung">
              <select className="select" value={e.remindMin ?? 30} onChange={(ev) => set({ remindMin: Number(ev.target.value) })}>
                {[0, 10, 30, 60, 120, 1440].map((m) => <option key={m} value={m}>{m === 0 ? 'Zum Termin' : m < 60 ? `${m} Minuten vorher` : m === 1440 ? '1 Tag vorher' : `${m / 60} Stunde(n) vorher`}</option>)}
              </select>
            </Field>
          </>
        )}
        <Field label="Notizen"><textarea className="textarea" value={e.note ?? ''} onChange={(ev) => set({ note: ev.target.value })} /></Field>
      </div>
    </Sheet>
  );
}

function ItemRow({ it, onEvent, onTask }: { it: AgendaItem; onEvent: (e: CalEvent) => void; onTask: (t: Task) => void }) {
  const nav = useNavigate();
  const color = itemColor(it);
  switch (it.kind) {
    case 'event': {
      const e = it.event;
      const Icon = e.kind === 'birthday' ? Cake : e.kind === 'doctor' ? Stethoscope : null;
      return (
        <button className="list-item" onClick={() => onEvent(e)}>
          <span className="bar-accent" style={{ background: color }} />
          <div className="grow">
            <div className="title row" style={{ gap: 6 }}>{Icon && <Icon size={15} />}{e.kind === 'birthday' ? `${e.title} – Geburtstag` : e.title}</div>
            <div className="meta">{e.time ? `${e.time}${e.endTime ? ` – ${e.endTime}` : ''} Uhr` : 'Ganztägig'}{e.location ? ` · ${e.location}` : ''}</div>
          </div>
        </button>
      );
    }
    case 'shift':
      return (
        <button className="list-item" onClick={() => nav('/shifts')}>
          <span className="bar-accent" style={{ background: color }} />
          <div className="grow">
            <div className="title">{it.type.name}</div>
            <div className="meta">{it.type.kind === 'work' ? `${it.shift.start ?? it.type.start} – ${it.shift.end ?? it.type.end} Uhr` : 'Ganztägig'}</div>
          </div>
        </button>
      );
    case 'task':
      return (
        <div className={`list-item ${it.task.done ? 'done' : ''}`}>
          <button className={`check ${it.task.done ? 'on' : ''}`} aria-label="Erledigt" onClick={() => void toggleTask(it.task)} style={{ width: 22, height: 22 }} />
          <button className="grow" style={{ background: 'none', border: 0, textAlign: 'left', padding: 0 }} onClick={() => onTask(it.task)}>
            <div className="title">{it.task.title}</div>
            <div className="meta">Aufgabe{it.task.time ? ` · ${it.task.time} Uhr` : ''}</div>
          </button>
        </div>
      );
    case 'bill':
      return (
        <button className="list-item" onClick={() => nav('/finance?tab=bills')}>
          <Receipt size={18} color={color} />
          <div className="grow">
            <div className="title">{it.bill.title}</div>
            <div className="meta">{it.bill.paidAt ? 'Bezahlt' : 'Zahlung fällig'} · {fmtMoney(it.bill.amount)}</div>
          </div>
        </button>
      );
    case 'moon':
      return (
        <button className="list-item" onClick={() => nav('/spirit/moon')}>
          <Moon size={18} color={color} />
          <div className="grow"><div className="title">{it.label}</div></div>
        </button>
      );
  }
}

function DayList({ items, onEvent, onTask }: { items: AgendaItem[]; onEvent: (e: CalEvent) => void; onTask: (t: Task) => void }) {
  if (!items.length) return <div className="card"><Empty text="Keine Einträge an diesem Tag." /></div>;
  return <div className="list">{items.map((it, i) => <ItemRow key={i} it={it} onEvent={onEvent} onTask={onTask} />)}</div>;
}

function Timeline({ items, onEvent }: { items: AgendaItem[]; onEvent: (e: CalEvent) => void }) {
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);
  const H = 44;
  const blocks = items.flatMap((it) => {
    let start: string | undefined, end: string | undefined, title = '';
    if (it.kind === 'event' && it.event.time) { start = it.event.time; end = it.event.endTime; title = it.event.title; }
    if (it.kind === 'shift' && it.type.kind === 'work') { start = it.shift.start ?? it.type.start; end = it.shift.end ?? it.type.end; title = it.type.name; }
    if (it.kind === 'task' && it.task.time) { start = it.task.time; title = it.task.title; }
    if (!start) return [];
    const s = hmToMin(start);
    let e = end ? hmToMin(end) : s + 45;
    if (e <= s) e = 24 * 60;
    return [{ it, s, e, title, label: `${start}${end ? ' – ' + end : ''}` }];
  });
  const allDay = items.filter((it) => !blocks.some((b) => b.it === it));
  return (
    <>
      {allDay.length > 0 && <div className="list mb">{allDay.map((it, i) => <ItemRow key={i} it={it} onEvent={onEvent} onTask={() => {}} />)}</div>}
      <div className="card timeline" style={{ padding: '8px 10px' }}>
        {hours.map((h) => <div key={h} className="tl-hour" style={{ height: H }}><span>{String(h).padStart(2, '0')}:00</span></div>)}
        {blocks.map((b, i) => {
          const top = 8 + ((Math.max(b.s, 360) - 360) / 60) * H;
          const height = Math.max(26, ((Math.min(b.e, 1440) - Math.max(b.s, 360)) / 60) * H - 2);
          const c = itemColor(b.it);
          return (
            <button key={i} className="tl-event" style={{ top, height, background: `color-mix(in srgb, ${c} 22%, var(--card))`, borderColor: c, textAlign: 'left', borderTop: 0, borderRight: 0, borderBottom: 0 }} onClick={() => b.it.kind === 'event' && onEvent(b.it.event)}>
              <div className="bold">{b.title}</div>
              <div className="tiny muted">{b.label}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}

type View = 'month' | 'week' | 'day';

export default function CalendarScreen() {
  const day = useToday();
  const [view, setView] = useState<View>('month');
  const [selected, setSelected] = useState(day);
  const [cursor, setCursor] = useState(startOfMonth(day));
  const [editEvent, setEditEvent] = useState<CalEvent | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const gridStart = startOfWeek(startOfMonth(cursor));
  const gridEnd = addDays(startOfWeek(endOfMonth(cursor)), 6);
  const weekStart = startOfWeek(selected);
  const from = view === 'month' ? gridStart : weekStart;
  const to = view === 'month' ? gridEnd : addDays(weekStart, 6);
  const agenda = useAgenda(from < weekStart ? from : weekStart, to > addDays(weekStart, 6) ? to : addDays(weekStart, 6));
  const days = useMemo(() => daysInRange(gridStart, gridEnd), [gridStart, gridEnd]);

  const shiftBy = (dir: number) => {
    if (view === 'month') setCursor(addMonths(cursor, dir, 1));
    else {
      const next = addDays(selected, dir * (view === 'week' ? 7 : 1));
      setSelected(next);
      setCursor(startOfMonth(next));
    }
  };

  const title = view === 'month' ? fmtMonthYear(cursor) : view === 'week' ? `KW ${isoWeek(selected)} · ${fmtMonthYear(selected)}` : fmtLong(selected);

  return (
    <div className="screen">
      <TopBar title="Kalender" actions={<button className="icon-btn filled" aria-label="Neuer Termin" onClick={() => setEditEvent(blankEvent(selected))}><Plus size={22} /></button>} />
      <Segmented value={view} onChange={setView} options={[{ value: 'month', label: 'Monat' }, { value: 'week', label: 'Woche' }, { value: 'day', label: 'Tag' }]} />
      <div className="row between mb">
        <button className="icon-btn" aria-label="Zurück" onClick={() => shiftBy(-1)}><ChevronLeft /></button>
        <button className="serif" style={{ background: 'none', border: 0, fontSize: 18 }} onClick={() => { setSelected(day); setCursor(startOfMonth(day)); }}>{title}</button>
        <button className="icon-btn" aria-label="Weiter" onClick={() => shiftBy(1)}><ChevronRight /></button>
      </div>

      {view === 'month' && (
        <>
          <div className="card" style={{ padding: 10 }}>
            <div className="cal-grid">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => <div key={d} className="cal-head">{WEEKDAYS_SHORT[d]}</div>)}
              {days.map((d) => {
                const items = agenda?.get(d) ?? [];
                const shift = items.find((i) => i.kind === 'shift');
                const dots = items.filter((i) => i.kind !== 'shift').slice(0, 4);
                return (
                  <button key={d} className={`cal-cell ${d.slice(0, 7) !== cursor.slice(0, 7) ? 'other' : ''} ${d === day ? 'today' : ''} ${d === selected ? 'selected' : ''}`} onClick={() => setSelected(d)} aria-label={fmtLong(d)}>
                    <span className="num">{fromISO(d).getDate()}</span>
                    {shift && shift.kind === 'shift' && <span className="shift-pill" style={{ background: shift.type.color, color: '#fff' }}>{shift.type.short}</span>}
                    <span className="cal-dots">{dots.map((it, i) => <i key={i} style={{ background: itemColor(it) }} />)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="section-title"><h2>{fmtLong(selected)}</h2></div>
          <DayList items={agenda?.get(selected) ?? []} onEvent={setEditEvent} onTask={setEditTask} />
        </>
      )}

      {view === 'week' && (
        <div className="stack">
          {daysInRange(weekStart, addDays(weekStart, 6)).map((d) => (
            <div key={d}>
              <div className={`small bold mb ${d === day ? 'gold-text' : 'muted'}`} style={{ margin: '6px 4px' }}>{fmtLong(d)}</div>
              <DayList items={agenda?.get(d) ?? []} onEvent={setEditEvent} onTask={setEditTask} />
            </div>
          ))}
        </div>
      )}

      {view === 'day' && (
        <>
          <div className="week-strip">
            {daysInRange(weekStart, addDays(weekStart, 6)).map((d) => (
              <button key={d} className={`${d === selected ? 'active' : ''} ${d === day ? 'today' : ''}`} onClick={() => setSelected(d)}>
                {WEEKDAYS_SHORT[fromISO(d).getDay()]}
                <span className="n">{fromISO(d).getDate()}</span>
              </button>
            ))}
          </div>
          <Timeline items={agenda?.get(selected) ?? []} onEvent={setEditEvent} />
        </>
      )}

      <EventEditor event={editEvent} onClose={() => setEditEvent(null)} />
      <TaskEditor task={editTask} onClose={() => setEditTask(null)} />
    </div>
  );
}
