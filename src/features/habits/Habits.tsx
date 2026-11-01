import { useLiveQuery } from 'dexie-react-hooks';
import { BookOpen, Check, Droplet, Dumbbell, Flame, Flower2, Footprints, Heart, Leaf, Minus, Moon, NotebookPen, Plus, Sun, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { addDays, daysInRange, fromISO, startOfMonth, startOfWeek, weekdaysShort } from '../../core/dates';
import { db } from '../../core/db';
import { locale, t, t as tr } from '../../i18n';
import { HubHero } from '../../ui/hub';
import { useToday } from '../../core/hooks';
import type { Habit, HabitLog, ISODate } from '../../core/types';
import { ColorPicker, Empty, Field, ProgressBar, Ring, Segmented, Sheet, useUi } from '../../ui/components';
import { completionRate, dayProgress, isDone, streak, valueOn, weekCount } from './logic';

export const HABIT_ICONS: Record<string, typeof Droplet> = {
  drop: Droplet, dumbbell: Dumbbell, lotus: Flower2, book: BookOpen, moon: Moon, walk: Footprints, sun: Sun, heart: Heart, pen: NotebookPen, leaf: Leaf,
};

export async function setHabitValue(habitId: number, date: ISODate, value: number): Promise<void> {
  const existing = await db.habitLogs.where('[habitId+date]').equals([habitId, date]).first();
  const v = Math.max(0, Math.round(value * 100) / 100);
  if (existing) await db.habitLogs.update(existing.id!, { value: v });
  else await db.habitLogs.add({ habitId, date, value: v });
}

function stepFor(h: Habit): number {
  if (h.unit.toLowerCase().startsWith('min')) return 5;
  if (h.target <= 1) return 1;
  if (h.unit.toLowerCase().startsWith('stund')) return 0.5;
  return 1;
}

function HabitEditor({ habit, onClose }: { habit: Habit | null; onClose: () => void }) {
  const [h, setH] = useState(habit);
  const { confirm } = useUi();
  useEffect(() => setH(habit), [habit]);
  if (!h) return null;
  const set = (p: Partial<Habit>) => setH({ ...h, ...p });
  return (
    <Sheet open onClose={onClose} title={h.id ? tr('Gewohnheit bearbeiten') : 'Neue Gewohnheit'} actions={<>
      {h.id && <button className="btn danger" onClick={async () => { if (await confirm('Gewohnheit samt Verlauf löschen?', { ok: 'Löschen', danger: true })) { await db.habitLogs.where('habitId').equals(h.id!).delete(); await db.habits.delete(h.id!); onClose(); } }}><Trash2 size={18} /></button>}
      <button className="btn" disabled={!h.name.trim() || h.target <= 0} onClick={async () => { await db.habits.put(h); onClose(); }}>{t('Speichern')}</button>
    </>}>
      <div className="form">
        <Field label="Name"><input className="input" autoFocus value={h.name} onChange={(e) => set({ name: e.target.value })} placeholder={t('z. B. Tägliche Reflexion')} /></Field>
        <div className="grid2">
          <Field label="Tagesziel"><input className="input" type="number" min={0.5} step={0.5} value={h.target} onChange={(e) => set({ target: Number(e.target.value) || 0 })} /></Field>
          <Field label="Einheit"><input className="input" value={h.unit} onChange={(e) => set({ unit: e.target.value })} placeholder={t('Minuten, Gläser, mal')} /></Field>
        </div>
        <Field label="Häufigkeit">
          <select className="select" value={h.freq} onChange={(e) => set({ freq: e.target.value as Habit['freq'] })}>
            <option value="daily">{t('Täglich')}</option>
            <option value="weekly">{t('Mehrmals pro Woche')}</option>
          </select>
        </Field>
        {h.freq === 'weekly' && <Field label="Wie oft pro Woche?"><input className="input" type="number" min={1} max={7} value={h.timesPerWeek} onChange={(e) => set({ timesPerWeek: Math.min(7, Math.max(1, Number(e.target.value) || 1)) })} /></Field>}
        <Field label="Symbol">
          <div className="chips">
            {Object.entries(HABIT_ICONS).map(([k, Icon]) => <button type="button" key={k} className={`chip ${h.icon === k ? 'active' : ''}`} onClick={() => set({ icon: k })} aria-label={k}><Icon size={18} /></button>)}
          </div>
        </Field>
        <Field label="Farbe"><ColorPicker value={h.color} onChange={(color) => set({ color })} /></Field>
        <Field label="Erinnerung (optional)"><input className="input" type="time" value={h.remindTime ?? ''} onChange={(e) => set({ remindTime: e.target.value || undefined })} /></Field>
      </div>
    </Sheet>
  );
}

export function HabitRow({ h, logs, day }: { h: Habit; logs: HabitLog[]; day: ISODate }) {
  const Icon = HABIT_ICONS[h.icon] ?? Leaf;
  const value = valueOn(logs, h.id!, day);
  const done = isDone(h, value);
  const step = stepFor(h);
  return (
    <div className="list-item">
      <span className="tile" style={{ minHeight: 0 }}><span className="icon-wrap" style={{ width: 42, height: 42, borderRadius: '50%', background: `color-mix(in srgb, ${h.color} 18%, var(--card))`, color: h.color }}><Icon size={20} /></span></span>
      <div className="grow">
        <div className="title">{t(h.name)}</div>
        <div className="meta">{value.toLocaleString(locale())} / {h.target.toLocaleString(locale())} {t(h.unit)}{h.freq === 'weekly' ? ` · ${weekCount(h, logs, day)}/${h.timesPerWeek} ${t('diese Woche')}` : ''}</div>
        <div style={{ marginTop: 6 }}><ProgressBar value={dayProgress(h, logs, day)} color={h.color} /></div>
      </div>
      <button className="icon-btn soft" style={{ width: 32, height: 32 }} aria-label={t('Weniger')} onClick={() => void setHabitValue(h.id!, day, value - step)}><Minus size={16} /></button>
      <button className="icon-btn soft" style={{ width: 32, height: 32 }} aria-label={t('Mehr')} onClick={() => void setHabitValue(h.id!, day, value + step)}><Plus size={16} /></button>
      <button className={`check ${done ? 'on' : ''}`} aria-label={done ? tr('Zurücksetzen') : tr('Erledigt')} onClick={() => void setHabitValue(h.id!, day, done ? 0 : h.target)}>{done && <Check size={16} />}</button>
    </div>
  );
}

export default function HabitsScreen() {
  const today = useToday();
  const [tab, setTab] = useState<'day' | 'stats'>('day');
  const [day, setDay] = useState(today);
  const [edit, setEdit] = useState<Habit | null>(null);
  const habits = useLiveQuery(() => db.habits.orderBy('order').filter((h) => !h.archived).toArray(), []) ?? [];
  const from = addDays(today, -60);
  const logs = useLiveQuery(() => db.habitLogs.where('date').between(from, addDays(today, 7), true, true).toArray(), [from, today]) ?? [];
  const weekStart = startOfWeek(day);
  const newHabit = (): Habit => ({ name: '', icon: 'leaf', color: '#6F8C6E', unit: 'mal', target: 1, freq: 'daily', timesPerWeek: 3, archived: 0, order: Date.now() });

  return (
    <div className="screen">
      <HubHero title={t('Gewohnheiten & Routinen')} image="habits" actions={<button className="icon-btn" aria-label={t('Neue Gewohnheit')} onClick={() => setEdit(newHabit())}><Plus size={24} /></button>} />
      <Segmented value={tab} onChange={setTab} options={[{ value: 'day', label: 'Tag' }, { value: 'stats', label: 'Statistik' }]} />
      {tab === 'day' && (
        <>
          <div className="week-strip">
            {daysInRange(weekStart, addDays(weekStart, 6)).map((d) => (
              <button key={d} className={`${d === day ? 'active' : ''} ${d === today ? 'today' : ''}`} onClick={() => setDay(d)}>
                {weekdaysShort()[fromISO(d).getDay()]}
                <span className="n">{fromISO(d).getDate()}</span>
              </button>
            ))}
          </div>
          {habits.length ? <div className="list">{habits.map((h) => <HabitRow key={h.id} h={h} logs={logs} day={day} />)}</div> : <div className="card"><Empty text="Lege deine erste Gewohnheit an." /></div>}
          <p className="tiny faint center mt">{t('Unter „Statistik“ siehst du Fortschritte und kannst Gewohnheiten bearbeiten.')}</p>
        </>
      )}
      {tab === 'stats' && (
        <div className="stack">
          {habits.map((h) => {
            const Icon = HABIT_ICONS[h.icon] ?? Leaf;
            const week = completionRate(h, logs, startOfWeek(today), today);
            const month = completionRate(h, logs, startOfMonth(today), today);
            const last28 = daysInRange(addDays(today, -27), today);
            return (
              <button key={h.id} className="card tap" onClick={() => setEdit(h)}>
                <div className="row">
                  <Icon size={20} color={h.color} />
                  <div className="grow bold">{t(h.name)}</div>
                  <span className="badge gold"><Flame size={12} /> {streak(h, logs, today)} {t('Tage')}</span>
                </div>
                <div className="row mt" style={{ gap: 16 }}>
                  <Ring value={week} color={h.color}>{Math.round(week * 100)}%</Ring>
                  <div className="small"><div className="muted">{t('Diese Woche')}</div></div>
                  <Ring value={month} color={h.color}>{Math.round(month * 100)}%</Ring>
                  <div className="small"><div className="muted">{t('Dieser Monat')}</div></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 3, marginTop: 12 }}>
                  {last28.map((d) => {
                    const p = dayProgress(h, logs, d);
                    return <span key={d} title={d} style={{ aspectRatio: '1', borderRadius: 4, background: p >= 1 ? h.color : p > 0 ? `color-mix(in srgb, ${h.color} ${Math.round(25 + p * 50)}%, var(--card-2))` : 'var(--card-2)' }} />;
                  })}
                </div>
                <div className="tiny faint mt">{t('Letzte 4 Wochen')}</div>
              </button>
            );
          })}
          {!habits.length && <div className="card"><Empty text="Noch keine Gewohnheiten." /></div>}
        </div>
      )}
      <HabitEditor habit={edit} onClose={() => setEdit(null)} />
    </div>
  );
}
