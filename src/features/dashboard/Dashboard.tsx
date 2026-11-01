import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarDays, CheckSquare, Coins, Heart, LayoutGrid, Pill, Plus, Settings, Sprout, Hourglass } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { moonMeaning } from '../../content/moon';
import { addDays, fmtLong, fromISO, greeting, isoWeek, nowHM, relDay, weekdaysShort } from '../../core/dates';
import { db } from '../../core/db';
import { useSettings, useToday } from '../../core/hooks';
import { occurrencesBetween } from '../../core/recurrence';
import { t, quote } from '../../i18n';
import { MoonGlyph } from '../../ui/components';
import { Emblem } from '../../ui/emblems';
import { areaImage } from '../../ui/hub';
import { itemColor, useAgenda } from '../calendar/agenda';
import { fmtMoney } from '../finance/logic';
import { payBill } from '../finance/Finance';
import { HabitRow } from '../habits/Habits';
import { isDone, valueOn } from '../habits/logic';
import { DoseRow, useTodayDoses } from '../health/Health';
import { contrastText, resolveShift } from '../shifts/logic';
import { toggleLike, useDailySpirit } from '../spirit/useSpirit';
import { TaskRow } from '../tasks/Tasks';
import QuickAdd from './QuickAdd';
import { moonName } from '../spirit/moonText';

function Section({ title, to, children }: { title: string; to?: string; children: ReactNode }) {
  const nav = useNavigate();
  return (
    <section>
      <div className="section-title"><h2>{title}</h2>{to && <button onClick={() => nav(to)}>{t('Alle')}</button>}</div>
      {children}
    </section>
  );
}

function Hero({ onPlus }: { onPlus: () => void }) {
  const nav = useNavigate();
  const day = useToday();
  const settings = useSettings();
  return (
    <section className="hero" style={{ height: 'calc(clamp(300px, 80vw, 420px) + var(--safe-top))' }}>
      <img className="hero-img" src={areaImage('home')} alt="" />
      <div className="hero-content" style={{ alignItems: 'center' }}>
        <button className="icon-btn" aria-label={t('Bereiche')} onClick={() => nav('/areas')}><LayoutGrid size={22} /></button>
        <div className="grow center" style={{ fontFamily: 'var(--script)', fontSize: 22, color: '#f0d48e', textShadow: '0 2px 8px rgb(0 0 0 / .6)' }}>{t('Tagesanker')}</div>
        <button className="icon-btn" aria-label={t('Hinzufügen')} onClick={onPlus}><Plus size={22} /></button>
        <button className="icon-btn" aria-label={t('Einstellungen')} onClick={() => nav('/settings')}><Settings size={21} /></button>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, zIndex: 1, textAlign: 'center', color: '#f6e7bf', textShadow: '0 2px 10px rgb(0 0 0 / .8)' }}>
        <h1 style={{ color: '#f6e7bf', fontSize: 'clamp(21px, 6vw, 30px)' }}>{greeting()}{settings.name ? `, ${settings.name}` : ''} <span style={{ color: '#f0d48e' }}>✦</span></h1>
        <div className="serif" style={{ fontSize: 17 }}>{fmtLong(day)}</div>
        <div className="small" style={{ opacity: 0.85 }}>{t('KW')} {isoWeek(day)}</div>
      </div>
    </section>
  );
}

function ImpulseScroll({ day }: { day: string }) {
  const spirit = useDailySpirit(day);
  const nav = useNavigate();
  if (!spirit) return <div className="parchment-card" style={{ minHeight: 110 }} />;
  return (
    <div className="parchment-card row" role="button" tabIndex={0} onClick={() => nav('/spirit/impulse')} style={{ marginTop: -40, position: 'relative', zIndex: 2, alignItems: 'center' }}>
      <Emblem name="candle" size={54} />
      <div className="grow center">
        <div style={{ fontFamily: 'var(--display)', fontSize: 15, letterSpacing: '0.06em' }}>{t('Tagesimpuls')}</div>
        <p className="serif" style={{ fontSize: 18, lineHeight: 1.35, fontStyle: 'italic', marginTop: 4 }}>{quote(spirit.impulse.text)}</p>
      </div>
      <button className="icon-btn" style={{ width: 34, height: 34, color: '#8a2c38' }} aria-label={t('Merken')} onClick={(e) => { e.stopPropagation(); void toggleLike(day); }}>
        <Heart size={20} fill={spirit.liked ? '#8a2c38' : 'none'} />
      </button>
    </div>
  );
}

function OverviewTiles({ day }: { day: string }) {
  const nav = useNavigate();
  const doses = useTodayDoses(day) ?? [];
  const info = useLiveQuery(async () => {
    const [shift, types, tasks, bills, events, habits, logs] = await Promise.all([
      db.shifts.where('date').equals(day).first(),
      db.shiftTypes.toArray(),
      db.tasks.filter((x) => !x.done && (!x.due || x.due <= day)).toArray(),
      db.bills.filter((b) => !b.paidAt && b.due <= addDays(day, 7)).toArray(),
      db.events.toArray(),
      db.habits.filter((h) => !h.archived).toArray(),
      db.habitLogs.where('date').equals(day).toArray(),
    ]);
    const todayEvents = events.filter((e) => occurrencesBetween(e.date, e.kind === 'birthday' ? { freq: 'yearly' } : e.recurrence, day, day).length > 0);
    return {
      shift: shift ? resolveShift(shift, types) : null,
      tasks: tasks.length,
      bills,
      events: todayEvents.length,
      habitsDone: habits.filter((h) => isDone(h, valueOn(logs, h.id!, day))).length,
      habitsTotal: habits.length,
    };
  }, [day]);
  const next = doses.find((d) => !d.intake && d.time >= nowHM()) ?? doses.find((d) => !d.intake);
  const billSum = info?.bills.reduce((s, b) => s + b.amount, 0) ?? 0;
  const tile = (icon: ReactNode, title: string, lines: ReactNode, to: string) => (
    <button className="gold-tile" onClick={() => nav(to)}>
      <span className="ic">{icon}</span>
      <span className="t">{title}</span>
      <span className="v">{lines}</span>
    </button>
  );
  const s = info?.shift;
  return (
    <div className="tiles3">
      {tile(<Hourglass size={22} />, t('Schicht'), s ? <>{t(s.type.name)}{s.type.kind === 'work' && <><br />{s.start} – {s.end}</>}</> : t('Frei'), '/shifts')}
      {tile(<Pill size={22} />, t('Medikament'), next ? <>{next.time} {t('Uhr')}<br />{next.med.name}</> : doses.length ? t('Alles genommen') : t('Keine'), '/health/today')}
      {tile(<Coins size={22} />, t('Zahlungen'), info?.bills.length ? <>{t('{n} offen', { n: info.bills.length })}<br />({fmtMoney(billSum)})</> : t('Nichts fällig'), '/finance/bills')}
      {tile(<CheckSquare size={22} />, t('Aufgaben'), t('{n} offen', { n: info?.tasks ?? 0 }), '/tasks/day')}
      {tile(<CalendarDays size={22} />, t('Termine'), info?.events ? t('{n} heute', { n: info.events }) : t('Keine heute'), '/calendar')}
      {tile(<Sprout size={22} />, t('Gewohnheiten'), `${info?.habitsDone ?? 0} / ${info?.habitsTotal ?? 0}`, '/habits')}
    </div>
  );
}

function MoonPill({ day }: { day: string }) {
  const spirit = useDailySpirit(day);
  const nav = useNavigate();
  if (!spirit) return null;
  const m = spirit.moon;
  return (
    <button className="gold-pill" style={{ width: '100%' }} onClick={() => nav('/spirit/moon')}>
      <MoonGlyph illumination={m.illumination} waxing={m.waxing} size={36} />
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 14 }}>{t('Mondphase')}</div>
        <div className="small" style={{ opacity: 0.85 }}>{moonName(m)} · {Math.round(m.illumination * 100)} % · {moonMeaning(m.key).energy.split(' · ')[0]}</div>
      </div>
    </button>
  );
}

function NextDays({ day }: { day: string }) {
  const nav = useNavigate();
  const from = addDays(day, 1);
  const agenda = useAgenda(from, addDays(day, 4));
  const days = Array.from({ length: 4 }, (_, i) => addDays(from, i));
  return (
    <div className="tiles3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
      {days.map((d) => {
        const items = agenda?.get(d) ?? [];
        const shift = items.find((i) => i.kind === 'shift');
        const rest = items.filter((i) => i.kind !== 'shift' && i.kind !== 'moon');
        return (
          <button key={d} className="gold-tile" style={{ minHeight: 92, padding: '8px 4px' }} onClick={() => nav('/calendar')}>
            <span className="t">{weekdaysShort()[fromISO(d).getDay()]}</span>
            <span className="v">{String(fromISO(d).getDate()).padStart(2, '0')}.{String(fromISO(d).getMonth() + 1).padStart(2, '0')}.</span>
            {shift && shift.kind === 'shift' ? <span className="shift-pill" style={{ background: shift.type.color, color: contrastText(shift.type.color), fontSize: 11, padding: '1px 6px' }}>{t(shift.type.short)}</span> : <span style={{ height: 14 }} />}
            <span className="cal-dots">{rest.slice(0, 3).map((it, i) => <i key={i} style={{ background: itemColor(it) }} />)}</span>
          </button>
        );
      })}
    </div>
  );
}

function MedsWidget({ day }: { day: string }) {
  const doses = useTodayDoses(day) ?? [];
  if (!doses.length) return null;
  return <Section title={t('Einnahmen heute')} to="/health/today"><div className="list">{doses.slice(0, 4).map((d) => <DoseRow key={`${d.med.id}-${d.time}`} d={d} />)}</div></Section>;
}

function TasksWidget({ day }: { day: string }) {
  const nav = useNavigate();
  const tasks = useLiveQuery(() => db.tasks.filter((x) => !x.done && (!x.due || x.due <= day)).toArray(), [day]) ?? [];
  const sorted = tasks.sort((a, b) => a.priority - b.priority || (a.due ?? '').localeCompare(b.due ?? '')).slice(0, 5);
  return (
    <Section title={t('Offene Aufgaben')} to="/tasks/day">
      {sorted.length ? <div className="list">{sorted.map((x) => <TaskRow key={x.id} t={x} onEdit={() => nav('/tasks/day')} />)}</div> : <div className="card small muted">{t('Keine offenen Aufgaben für heute 🌿')}</div>}
    </Section>
  );
}

function BillsWidget({ day }: { day: string }) {
  const bills = useLiveQuery(() => db.bills.filter((b) => !b.paidAt && b.due <= addDays(day, 14)).toArray(), [day]) ?? [];
  if (!bills.length) return null;
  return (
    <Section title={t('Anstehende Zahlungen')} to="/finance/bills">
      <div className="list">
        {bills.sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4).map((b) => (
          <div key={b.id} className="list-item">
            <button className="check" aria-label={t('Als bezahlt markieren')} onClick={() => void payBill(b, day)} />
            <div className="grow"><div className="title">{b.title}</div><div className="meta" style={{ color: b.due < day ? 'var(--danger)' : undefined }}>{t('Fällig')} {relDay(b.due, day).toLowerCase()}</div></div>
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
    <Section title={t('Nächste Termine')} to="/tasks/events">
      <div className="list">
        {items.map(({ d, i }, k) => i.kind === 'event' && (
          <button key={k} className="list-item" onClick={() => nav('/calendar')}>
            <span className="bar-accent" style={{ background: itemColor(i) }} />
            <div className="grow"><div className="title">{i.event.title}</div><div className="meta">{relDay(d, day)}{i.event.time ? ` · ${i.event.time} ${t('Uhr')}` : ''}</div></div>
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
  return (
    <Section title={t('Gewohnheiten')} to="/habits">
      <div className="list">{habits.slice(0, 3).map((h) => <HabitRow key={h.id} h={h} logs={logs} day={day} />)}</div>
    </Section>
  );
}

const EXTRA: Partial<Record<string, (p: { day: string }) => ReactNode>> = {
  meds: MedsWidget, tasks: TasksWidget, bills: BillsWidget, events: EventsWidget, habits: HabitsWidget,
};

export default function Dashboard() {
  const day = useToday();
  const settings = useSettings();
  const [plus, setPlus] = useState(false);
  const visible = (id: string) => settings.widgets.find((w) => w.id === id)?.visible !== false;
  return (
    <div className="screen">
      <Hero onPlus={() => setPlus(true)} />
      <div className="stack">
        {visible('impulse') && <ImpulseScroll day={day} />}
        {visible('today') && <>
          <div className="ornament mt">{t('Mein Tagesüberblick')}</div>
          <OverviewTiles day={day} />
        </>}
        {visible('moon') && <MoonPill day={day} />}
        {visible('preview') && <>
          <div className="ornament mt">{t('Die nächsten Tage')}</div>
          <NextDays day={day} />
        </>}
        <div className="dash-cols">
          {settings.widgets.filter((w) => w.visible && EXTRA[w.id]).map((w) => {
            const W = EXTRA[w.id]!;
            return <div key={w.id}><W day={day} /></div>;
          })}
        </div>
      </div>
      <QuickAdd open={plus} setOpen={setPlus} />
    </div>
  );
}
