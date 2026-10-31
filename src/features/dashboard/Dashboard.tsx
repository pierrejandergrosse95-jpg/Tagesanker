import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarDays, CheckSquare, ChevronRight, CircleCheck, Coins, Euro, Flower2, Heart, Layers, Pill, Search, Settings, Sun } from 'lucide-react';
import { Scene, type SceneVariant } from '../../ui/scenes';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, fmtDayMonth, fmtLong, fromISO, greeting, isoWeek, nowHM, relDay, WEEKDAYS_SHORT } from '../../core/dates';
import { db } from '../../core/db';
import { useSettings, useToday } from '../../core/hooks';
import { occurrencesBetween } from '../../core/recurrence';
import type { DashboardWidget } from '../../core/types';
import { MoonGlyph, ProgressBar } from '../../ui/components';
import { itemColor, useAgenda } from '../calendar/agenda';
import { fmtMoney } from '../finance/logic';
import { overallProgress } from '../habits/logic';
import { DoseRow, useTodayDoses } from '../health/Health';
import { contrastText, resolveShift } from '../shifts/logic';
import { HabitRow } from '../habits/Habits';
import { TaskRow } from '../tasks/Tasks';
import { toggleLike, useDailySpirit } from '../spirit/useSpirit';
import { MOON_MEANINGS } from '../../content/moon';
import { payBill } from '../finance/Finance';

function Section({ title, to, children }: { title: string; to?: string; children: ReactNode }) {
  const nav = useNavigate();
  return (
    <section>
      <div className="section-title"><h2>{title}</h2>{to && <button onClick={() => nav(to)}>Alle</button>}</div>
      {children}
    </section>
  );
}

function ShiftCard({ day }: { day: string }) {
  const nav = useNavigate();
  const data = useLiveQuery(async () => {
    const [s, types, tomorrow] = await Promise.all([db.shifts.where('date').equals(day).first(), db.shiftTypes.toArray(), db.shifts.where('date').equals(addDays(day, 1)).first()]);
    return { today: s ? resolveShift(s, types) : null, tomorrow: tomorrow ? resolveShift(tomorrow, types) : null };
  }, [day]);
  const r = data?.today;
  return (
    <button className="card tap row" onClick={() => nav('/shifts')}>
      <div className="grow">
        <div className="card-label">Heute</div>
        {r ? (
          <div className="row" style={{ gap: 8, marginTop: 2 }}>
            <span className="swatch" style={{ background: r.type.color, width: 12, height: 12 }} />
            <div>
              <div className="bold">{r.type.name}</div>
              {r.type.kind === 'work' && <div className="small muted">{r.start} – {r.end} Uhr</div>}
            </div>
          </div>
        ) : <div className="bold" style={{ marginTop: 2 }}>Keine Schicht eingetragen</div>}
        {data?.tomorrow && <div className="tiny faint" style={{ marginTop: 4 }}>Morgen: {data.tomorrow.type.name}{data.tomorrow.type.kind === 'work' ? ` · ${data.tomorrow.start}` : ''}</div>}
      </div>
      <ChevronRight size={18} className="faint" />
    </button>
  );
}

function OverviewTiles({ day }: { day: string }) {
  const nav = useNavigate();
  const doses = useTodayDoses(day) ?? [];
  const info = useLiveQuery(async () => {
    const [tasks, bills, events] = await Promise.all([
      db.tasks.filter((t) => !t.done && (!t.due || t.due <= day)).toArray(),
      db.bills.filter((b) => !b.paidAt && b.due <= addDays(day, 7)).toArray(),
      db.events.toArray(),
    ]);
    const upcoming = events
      .flatMap((e) => occurrencesBetween(e.date, e.kind === 'birthday' ? { freq: 'yearly' } : e.recurrence, day, addDays(day, 30)).slice(0, 1).map((d) => ({ e, d })))
      .filter(({ e, d }) => d > day || !e.time || e.time >= nowHM())
      .sort((a, b) => a.d.localeCompare(b.d) || (a.e.time ?? '').localeCompare(b.e.time ?? ''));
    return { tasks, bills: bills.sort((a, b) => a.due.localeCompare(b.due)), todayEvents: upcoming.filter((u) => u.d === day).length, next: upcoming[0] };
  }, [day]);
  const open = doses.filter((d) => !d.intake);
  const nextDose = open[0];
  const Tile = ({ icon, title, value, sub, to }: { icon: ReactNode; title: string; value: string; sub?: string; to: string }) => (
    <button className="card tap tile" onClick={() => nav(to)}>
      <span className="icon-wrap">{icon}</span>
      <div className="bold">{title}</div>
      <div className="small">{value}</div>
      {sub && <div className="tiny faint ellipsis">{sub}</div>}
    </button>
  );
  return (
    <div className="grid2">
      <Tile icon={<Pill size={18} />} title="Medikamente" to="/health" value={open.length ? `${open.length} offene Einnahme${open.length > 1 ? 'n' : ''}` : doses.length ? 'Alles genommen ✓' : 'Heute keine'} sub={nextDose ? `Nächste: ${nextDose.med.name} · ${nextDose.time}` : undefined} />
      <Tile icon={<Euro size={18} />} title="Zahlungen" to="/finance?tab=bills" value={info?.bills.length ? `${info.bills.length} fällig` : 'Nichts fällig'} sub={info?.bills[0] ? `${info.bills[0].title} · ${relDay(info.bills[0].due, day)}` : undefined} />
      <Tile icon={<CheckSquare size={18} />} title="Aufgaben" to="/tasks" value={`${info?.tasks.length ?? 0} offen`} sub={info?.tasks[0]?.title} />
      <Tile icon={<CalendarDays size={18} />} title="Termine" to="/calendar" value={info?.todayEvents ? `Heute ${info.todayEvents} Termin${info.todayEvents > 1 ? 'e' : ''}` : 'Heute keine'} sub={info?.next ? `${info.next.e.title} · ${relDay(info.next.d, day)}${info.next.e.time ? ', ' + info.next.e.time : ''}` : undefined} />
    </div>
  );
}

function MedsWidget({ day }: { day: string }) {
  const doses = useTodayDoses(day) ?? [];
  if (!doses.length) return null;
  return <Section title="Einnahmen heute" to="/health"><div className="list">{doses.slice(0, 4).map((d) => <DoseRow key={`${d.med.id}-${d.time}`} d={d} />)}</div></Section>;
}

function TasksWidget({ day }: { day: string }) {
  const nav = useNavigate();
  const tasks = useLiveQuery(() => db.tasks.filter((t) => !t.done && (!t.due || t.due <= day)).toArray(), [day]) ?? [];
  const sorted = tasks.sort((a, b) => a.priority - b.priority || (a.due ?? '').localeCompare(b.due ?? '')).slice(0, 5);
  return (
    <Section title="Offene Aufgaben" to="/tasks">
      {sorted.length ? <div className="list">{sorted.map((t) => <TaskRow key={t.id} t={t} onEdit={() => nav('/tasks')} />)}</div> : <div className="card small muted">Keine offenen Aufgaben für heute 🌿</div>}
    </Section>
  );
}

function BillsWidget({ day }: { day: string }) {
  const bills = useLiveQuery(() => db.bills.filter((b) => !b.paidAt && b.due <= addDays(day, 14)).toArray(), [day]) ?? [];
  if (!bills.length) return null;
  return (
    <Section title="Anstehende Zahlungen" to="/finance?tab=bills">
      <div className="list">
        {bills.sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4).map((b) => (
          <div key={b.id} className="list-item">
            <button className="check" aria-label="Als bezahlt markieren" onClick={() => void payBill(b, day)} />
            <div className="grow"><div className="title">{b.title}</div><div className="meta" style={{ color: b.due < day ? 'var(--danger)' : undefined }}>Fällig {relDay(b.due, day).toLowerCase()}</div></div>
            <div className="bold">{fmtMoney(b.amount)}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function EventsWidget({ day }: { day: string }) {
  const nav = useNavigate();
  const agenda = useAgenda(day, addDays(day, 7));
  const items = [...(agenda?.entries() ?? [])].flatMap(([d, its]) => its.filter((i) => i.kind === 'event').map((i) => ({ d, i }))).sort((a, b) => a.d.localeCompare(b.d)).slice(0, 4);
  if (!items.length) return null;
  return (
    <Section title="Nächste Termine" to="/calendar">
      <div className="list">
        {items.map(({ d, i }, k) => i.kind === 'event' && (
          <button key={k} className="list-item" onClick={() => nav('/calendar')}>
            <span className="bar-accent" style={{ background: itemColor(i) }} />
            <div className="grow"><div className="title">{i.event.title}</div><div className="meta">{relDay(d, day)}{i.event.time ? ` · ${i.event.time} Uhr` : ''}</div></div>
          </button>
        ))}
      </div>
    </Section>
  );
}

function HabitsWidget({ day }: { day: string }) {
  const habits = useLiveQuery(() => db.habits.orderBy('order').filter((h) => !h.archived).toArray(), []) ?? [];
  const logs = useLiveQuery(() => db.habitLogs.where('date').equals(day).toArray(), [day]) ?? [];
  if (!habits.length) return null;
  const p = overallProgress(habits, logs, day);
  return (
    <Section title="Gewohnheiten" to="/habits">
      <div className="card mb" style={{ padding: '10px 14px' }}>
        <div className="row between small"><span className="muted">Tagesfortschritt</span><b>{Math.round(p * 100)} %</b></div>
        <div style={{ marginTop: 6 }}><ProgressBar value={p} /></div>
      </div>
      <div className="list">{habits.slice(0, 3).map((h) => <HabitRow key={h.id} h={h} logs={logs} day={day} />)}</div>
    </Section>
  );
}

function MoonWidget({ day }: { day: string }) {
  const nav = useNavigate();
  const spirit = useDailySpirit(day);
  if (!spirit) return null;
  const m = spirit.moon;
  return (
    <button className="card tap row" style={{ background: 'linear-gradient(135deg, var(--card-2), var(--gold-soft))' }} onClick={() => nav('/spirit/moon')}>
      <MoonGlyph illumination={m.illumination} waxing={m.waxing} size={64} />
      <div className="grow">
        <div className="bold">{m.name}</div>
        <div className="small muted">{Math.round(m.illumination * 100)} %</div>
        <div className="small" style={{ marginTop: 2 }}>{MOON_MEANINGS[m.key].energy}</div>
      </div>
      <ChevronRight size={18} className="faint" />
    </button>
  );
}

function ImpulseWidget({ day }: { day: string }) {
  const nav = useNavigate();
  const spirit = useDailySpirit(day);
  if (!spirit) return null;
  return (
    <div className="card cosmic" role="button" tabIndex={0} onClick={() => nav('/spirit')}>
      <div className="row between">
        <span className="small muted">Impuls des Tages{spirit.sign ? ` · ${spirit.sign.symbol} ${spirit.sign.name}` : ''}</span>
        <button className="icon-btn" style={{ width: 32, height: 32 }} aria-label="Merken" onClick={(e) => { e.stopPropagation(); void toggleLike(day); }}><Heart size={18} color="#c9a55c" fill={spirit.liked ? '#c9a55c' : 'none'} /></button>
      </div>
      <p className="serif" style={{ fontSize: 17, lineHeight: 1.45, marginTop: 4 }}>„{spirit.impulse.text}“</p>
    </div>
  );
}

function PreviewWidget({ day }: { day: string }) {
  const nav = useNavigate();
  const from = addDays(day, 1);
  const to = addDays(day, 5);
  const agenda = useAgenda(from, to);
  const days = Array.from({ length: 5 }, (_, i) => addDays(from, i));
  return (
    <Section title="Die nächsten Tage" to="/calendar">
      <div className="list">
        {days.map((d) => {
          const items = agenda?.get(d) ?? [];
          const shift = items.find((i) => i.kind === 'shift');
          const rest = items.filter((i) => i.kind !== 'shift' && i.kind !== 'moon');
          const moon = items.find((i) => i.kind === 'moon');
          const first = rest[0];
          const label = first ? (first.kind === 'event' ? first.event.title : first.kind === 'task' ? first.task.title : first.kind === 'bill' ? `${first.bill.title} (${fmtMoney(first.bill.amount)})` : '') : '';
          return (
            <button key={d} className="list-item" onClick={() => nav('/calendar')}>
              <div style={{ width: 38 }} className="center">
                <div className="tiny muted">{WEEKDAYS_SHORT[fromISO(d).getDay()]}</div>
                <div className="bold">{fromISO(d).getDate()}.</div>
              </div>
              {shift && shift.kind === 'shift' ? <span className="shift-pill" style={{ background: shift.type.color, color: contrastText(shift.type.color), fontSize: 11, padding: '2px 6px' }}>{shift.type.short}</span> : <span style={{ width: 22 }} />}
              <div className="grow small ellipsis">{label || <span className="faint">{moon && moon.kind === 'moon' ? moon.label : 'Frei von Terminen'}</span>}{rest.length > 1 && <span className="faint"> +{rest.length - 1}</span>}</div>
              <span className="cal-dots">{rest.slice(0, 3).map((it, i) => <i key={i} style={{ background: itemColor(it) }} />)}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

const WIDGETS: Record<DashboardWidget, (p: { day: string }) => ReactNode> = {
  shift: ShiftCard, today: OverviewTiles, meds: MedsWidget, tasks: TasksWidget, bills: BillsWidget, events: EventsWidget,
  habits: HabitsWidget, moon: MoonWidget, impulse: ImpulseWidget, preview: PreviewWidget,
};

function TodayCard({ day }: { day: string }) {
  const nav = useNavigate();
  const data = useLiveQuery(async () => {
    const tasks = await db.tasks.filter((t) => (t.due ? t.due === day : false) || (!t.done && (!t.due || t.due < day))).toArray();
    return { total: tasks.length, done: tasks.filter((t) => t.done).length };
  }, [day]);
  const total = data?.total ?? 0;
  const done = data?.done ?? 0;
  return (
    <button className="card tap row" onClick={() => nav('/tasks')}>
      <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'radial-gradient(circle, #ffe7a8, #e9a66b)', display: 'grid', placeItems: 'center', flex: 'none', boxShadow: '0 0 0 6px var(--gold-soft)' }}><Sun size={26} color="#8a5a1f" /></span>
      <div className="grow">
        <div className="serif bold" style={{ fontSize: 19 }}>Heute</div>
        <div className="small muted">{total ? `${total - done} von ${total} Aufgaben offen` : 'Keine Aufgaben – genieße den Tag'}</div>
        <div style={{ marginTop: 6 }}><ProgressBar value={total ? done / total : 1} /></div>
      </div>
    </button>
  );
}

const FEATURES = [
  { to: '/calendar', label: 'Kalender', icon: CalendarDays },
  { to: '/tasks', label: 'Aufgaben', icon: CircleCheck },
  { to: '/health', label: 'Gesundheit', icon: Heart },
  { to: '/finance', label: 'Finanzen', icon: Coins },
  { to: '/spirit/meditation', label: 'Meditation', icon: Flower2 },
  { to: '/spirit/tarot', label: 'Tarot', icon: Layers },
];

function sceneForNow(): SceneVariant {
  const h = new Date().getHours();
  if (h < 5 || h >= 21) return 'night';
  if (h < 10) return 'dawn';
  if (h < 17) return 'meadow';
  return 'sunset';
}

function QuoteCard({ day }: { day: string }) {
  const spirit = useDailySpirit(day);
  const nav = useNavigate();
  if (!spirit) return <div className="quote-card" style={{ minHeight: 70 }} />;
  return (
    <div className="quote-card" role="button" tabIndex={0} onClick={() => nav('/spirit')}>
      <p>„{spirit.impulse.text}“</p>
      <button className="icon-btn" style={{ width: 34, height: 34 }} aria-label="Merken" onClick={(e) => { e.stopPropagation(); void toggleLike(day); }}><Heart size={20} color="var(--rose)" fill={spirit.liked ? 'var(--rose)' : 'none'} /></button>
    </div>
  );
}

export default function Dashboard() {
  const day = useToday();
  const settings = useSettings();
  const nav = useNavigate();
  return (
    <div className="screen">
      <section className="hero">
        <Scene variant={sceneForNow()} animal={settings.avatar} foliage castle seed={5} />
        <div className="hero-content">
          <div className="grow">
            <h1>{greeting()}{settings.name ? <><br />{settings.name}</> : ''} <span style={{ color: '#ffe7a8' }}>✦</span></h1>
            <div className="small" style={{ marginTop: 4, opacity: 0.9, textShadow: '0 1px 6px rgb(0 0 0 / .4)' }}>{fmtLong(day)} · KW {isoWeek(day)}</div>
          </div>
          <button className="icon-btn" aria-label="Suche" onClick={() => nav('/search')}><Search size={21} /></button>
          <button className="icon-btn" aria-label="Einstellungen" onClick={() => nav('/settings')}><Settings size={21} /></button>
        </div>
      </section>
      <QuoteCard day={day} />
      <div className="stack mt">
        <TodayCard day={day} />
        <div className="grid2">
          {FEATURES.map(({ to, label, icon: Icon }) => (
            <button key={to} className="card tap feature-tile" onClick={() => nav(to)}>
              <Icon size={22} strokeWidth={1.6} />
              <span className="bold">{label}</span>
            </button>
          ))}
        </div>
        {settings.widgets.filter((w) => w.visible && w.id !== 'impulse').map((w) => {
          const W = WIDGETS[w.id];
          return <W key={w.id} day={day} />;
        })}
      </div>
      <p className="tiny faint center" style={{ marginTop: 24 }}>Dashboard anpassen unter Profil → Design & Dashboard · {fmtDayMonth(day)}</p>
    </div>
  );
}
