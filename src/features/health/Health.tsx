import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, Check, ClipboardList, History, NotebookPen, Package, Pill, Plus, Stethoscope, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addDays, fmtDayMonth, fmtLong, fmtShort, relDay, today } from '../../core/dates';
import { db } from '../../core/db';
import { useToday } from '../../core/hooks';
import { describeRecurrence, occurrencesBetween } from '../../core/recurrence';
import type { CalEvent, HealthNote, Med } from '../../core/types';
import { ColorPicker, Empty, Field, Hint, ProgressBar, Ring, RecurrencePicker, Sheet, TopBar, useUi } from '../../ui/components';
import { HubHero, ScrollMenu } from '../../ui/hub';
import { t, t as tr } from '../../i18n';
import { blankEvent, EventEditor } from '../calendar/Calendar';
import { adherence, dailyNeed, daysLeft, dosesForDay, isLowStock, type Dose } from './logic';

export async function takeDose(d: Dose): Promise<void> {
  await db.transaction('rw', db.medIntakes, db.meds, async () => {
    if (d.intake) {
      await db.medIntakes.delete(d.intake.id!);
      if (d.med.stock != null) await db.meds.update(d.med.id!, { stock: d.med.stock + d.med.perIntake });
    } else {
      const day = today();
      await db.medIntakes.add({ medId: d.med.id!, date: day, time: d.time, takenAt: Date.now() });
      if (d.med.stock != null) await db.meds.update(d.med.id!, { stock: Math.max(0, d.med.stock - d.med.perIntake) });
    }
  });
}

/** Hook: heutige Dosen inkl. Einnahmestatus. */
export function useTodayDoses(day: string): Dose[] | undefined {
  return useLiveQuery(async () => {
    const [meds, intakes] = await Promise.all([db.meds.where('active').equals(1).toArray(), db.medIntakes.where('date').equals(day).toArray()]);
    return dosesForDay(meds, intakes, day);
  }, [day]);
}

function MedEditor({ med, onClose }: { med: Med | null; onClose: () => void }) {
  const [m, setM] = useState(med);
  const [timeInput, setTimeInput] = useState('08:00');
  const { confirm } = useUi();
  useEffect(() => setM(med), [med]);
  if (!m) return null;
  const set = (p: Partial<Med>) => setM({ ...m, ...p });
  const save = async () => {
    if (!m.name.trim() || !m.times.length) return;
    if (m.id) await db.meds.put(m);
    else await db.meds.add(m);
    onClose();
  };
  const remove = async () => {
    if (m.id && (await confirm(t('„{n}“ und die gesamte Einnahmehistorie löschen?', { n: m.name }), { ok: 'Löschen', danger: true }))) {
      await db.medIntakes.where('medId').equals(m.id).delete();
      await db.meds.delete(m.id);
      onClose();
    }
  };
  return (
    <Sheet open onClose={onClose} title={m.id ? tr('Medikament bearbeiten') : tr('Medikament hinzufügen')} actions={<>
      {m.id && <button className="btn danger" onClick={remove}><Trash2 size={18} /></button>}
      <button className="btn" onClick={save} disabled={!m.name.trim() || !m.times.length}>{t('Speichern')}</button>
    </>}>
      <div className="form">
        <div className="grid2">
          <Field label="Name"><input className="input" autoFocus value={m.name} onChange={(e) => set({ name: e.target.value })} placeholder={t('z. B. Magnesium')} /></Field>
          <Field label="Dosierung"><input className="input" value={m.dose} onChange={(e) => set({ dose: e.target.value })} placeholder={t('z. B. 400 mg')} /></Field>
        </div>
        <Field label="Einnahmehinweise"><input className="input" value={m.instructions ?? ''} onChange={(e) => set({ instructions: e.target.value })} placeholder={t('z. B. zum Essen, mit viel Wasser')} /></Field>
        <Field label="Einnahmezeiten">
          <div className="chips">
            {m.times.map((t) => (
              <button key={t} type="button" className="chip active" onClick={() => set({ times: m.times.filter((x) => x !== t) })}>{t} <X size={12} /></button>
            ))}
          </div>
          <div className="row">
            <input className="input" type="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} />
            <button type="button" className="btn secondary" onClick={() => timeInput && !m.times.includes(timeInput) && set({ times: [...m.times, timeInput].sort() })}>{t('Hinzufügen')}</button>
          </div>
        </Field>
        <Field label="Wiederholung"><RecurrencePicker value={m.recurrence} onChange={(recurrence) => set({ recurrence })} allow={['daily', 'weekdays', 'weekly', 'interval', 'monthly']} /></Field>
        <Field label="Beginn"><input className="input" type="date" value={m.startDate} onChange={(e) => set({ startDate: e.target.value })} /></Field>
        <div className="grid3">
          <Field label="Vorrat (Stück)"><input className="input" type="number" min={0} value={m.stock ?? ''} onChange={(e) => set({ stock: e.target.value === '' ? undefined : Number(e.target.value) })} /></Field>
          <Field label="Pro Einnahme"><input className="input" type="number" min={0} step={0.5} value={m.perIntake} onChange={(e) => set({ perIntake: Number(e.target.value) || 0 })} /></Field>
          <Field label="Warnen ab (Tage)"><input className="input" type="number" min={0} value={m.lowThresholdDays} onChange={(e) => set({ lowThresholdDays: Number(e.target.value) || 0 })} /></Field>
        </div>
        <Field label="Farbe"><ColorPicker value={m.color} onChange={(color) => set({ color })} /></Field>
        <label className="row"><input type="checkbox" checked={!!m.active} onChange={(e) => set({ active: e.target.checked ? 1 : 0 })} /> {t('Aktiv (Erinnerungen & Tagesplan)')}</label>
        <Hint>{t('Tagesanker dient nur der Organisation. Dosierung und Einnahme bitte immer mit Ärztin, Arzt oder Apotheke abstimmen.')}</Hint>
      </div>
    </Sheet>
  );
}

function NoteEditor({ note, onClose }: { note: HealthNote | null; onClose: () => void }) {
  const [n, setN] = useState(note);
  useEffect(() => setN(note), [note]);
  if (!n) return null;
  return (
    <Sheet open onClose={onClose} title="Gesundheitsnotiz" actions={<>
      {n.id && <button className="btn danger" onClick={async () => { await db.healthNotes.delete(n.id!); onClose(); }}><Trash2 size={18} /></button>}
      <button className="btn" disabled={!n.title.trim()} onClick={async () => { await db.healthNotes.put(n); onClose(); }}>{t('Speichern')}</button>
    </>}>
      <div className="form">
        <Field label="Datum"><input className="input" type="date" value={n.date} onChange={(e) => setN({ ...n, date: e.target.value })} /></Field>
        <Field label="Titel"><input className="input" value={n.title} onChange={(e) => setN({ ...n, title: e.target.value })} placeholder={t('z. B. Blutdruck, Symptome, Befund')} /></Field>
        <Field label="Notiz"><textarea className="textarea" value={n.text} onChange={(e) => setN({ ...n, text: e.target.value })} /></Field>
      </div>
    </Sheet>
  );
}

export function DoseRow({ d }: { d: Dose }) {
  return (
    <div className="list-item" style={{ background: d.intake ? 'var(--sage-soft)' : undefined }}>
      <button className={`check ${d.intake ? 'on' : ''}`} style={{ width: 34, height: 34 }} aria-label={d.intake ? tr('Einnahme zurücknehmen') : tr('Als eingenommen markieren')} onClick={() => void takeDose(d)}>
        {d.intake && <Check size={18} />}
      </button>
      <div className="grow">
        <div className="title">{d.med.name}</div>
        <div className="meta">{d.med.dose}{d.med.instructions ? ` · ${d.med.instructions}` : ''}</div>
      </div>
      <div className="right small" style={{ textAlign: 'right' }}>
        <div className="bold">{d.time}</div>
        {d.intake && <div className="tiny muted">✓ {new Date(d.intake.takenAt).toTimeString().slice(0, 5)}</div>}
      </div>
    </div>
  );
}

type Tab = 'today' | 'meds' | 'stock' | 'doctor' | 'notes' | 'history';
const TITLES: Record<Tab, string> = {
  today: 'Einnahmeplan', meds: 'Meine Medikamente', stock: 'Vorrat & Nachkauf', doctor: 'Arzttermine', notes: 'Gesundheitsnotizen', history: 'Verlauf',
};

export default function HealthScreen() {
  const day = useToday();
  const nav = useNavigate();
  const { section } = useParams();
  const tab = (section as Tab | undefined) ?? null;
  const [editMed, setEditMed] = useState<Med | null>(null);
  const [editNote, setEditNote] = useState<HealthNote | null>(null);
  const [editEvent, setEditEvent] = useState<CalEvent | null>(null);
  const doses = useTodayDoses(day) ?? [];
  const meds = useLiveQuery(() => db.meds.toArray(), []) ?? [];
  const notes = useLiveQuery(() => db.healthNotes.orderBy('date').reverse().toArray(), []) ?? [];
  const doctorEvents = useLiveQuery(() => db.events.where('kind').equals('doctor').toArray(), []) ?? [];
  const historyFrom = addDays(day, -13);
  const history = useLiveQuery(async () => {
    const [ms, intakes] = await Promise.all([db.meds.toArray(), db.medIntakes.where('date').between(historyFrom, day, true, true).toArray()]);
    const days = Array.from({ length: 14 }, (_, i) => addDays(day, -i));
    return days.map((d) => ({ day: d, doses: dosesForDay(ms, intakes, d) }));
  }, [day]) ?? [];

  const upcomingDoctor = useMemo(() => doctorEvents
    .flatMap((e) => occurrencesBetween(e.date, e.recurrence, day, addDays(day, 365)).slice(0, 1).map((d) => ({ e, d })))
    .sort((a, b) => a.d.localeCompare(b.d)), [doctorEvents, day]);

  const low = meds.filter((m) => m.active && isLowStock(m));
  const done = doses.filter((d) => d.intake).length;

  const newMed = (): Med => ({ name: '', dose: '', times: ['08:00'], recurrence: { freq: 'daily' }, startDate: day, perIntake: 1, lowThresholdDays: 7, active: 1, color: '#6F8C6E' });

  const editors = (
    <>
      <MedEditor med={editMed} onClose={() => setEditMed(null)} />
      <NoteEditor note={editNote} onClose={() => setEditNote(null)} />
      <EventEditor event={editEvent} onClose={() => setEditEvent(null)} />
    </>
  );

  if (!tab) {
    return (
      <div className="screen">
        <HubHero title={t('Medikamente & Gesundheit')} back={false} scene={{ variant: 'forest', seed: 9 }} emblem="potion"
          actions={<button className="icon-btn" aria-label={t('Medikament hinzufügen')} onClick={() => setEditMed(newMed())}><Plus size={24} /></button>} />
        {doses.length > 0 && (
          <button className="card tap row mb" onClick={() => nav('/health/today')}>
            <Ring value={done / doses.length} size={52}>{done}/{doses.length}</Ring>
            <div className="grow"><div className="bold">{t('Einnahmen heute')}</div><div className="small muted">{done === doses.length ? t('Alles erledigt 🌿') : t('{n} offen', { n: doses.length - done })}</div></div>
          </button>
        )}
        <ScrollMenu items={[
          { key: 'meds', label: t('Meine Medikamente'), icon: <Pill size={20} />, badge: meds.length || undefined, to: '/health/meds' },
          { key: 'today', label: t('Einnahmeplan'), icon: <ClipboardList size={20} />, badge: doses.length ? `${done}/${doses.length}` : undefined, to: '/health/today' },
          { key: 'stock', label: t('Vorrat & Nachkauf'), icon: <Package size={20} />, badge: low.length ? `⚠ ${low.length}` : undefined, to: '/health/stock' },
          { key: 'doctor', label: t('Arzttermine'), icon: <Stethoscope size={20} />, badge: upcomingDoctor.length || undefined, to: '/health/doctor' },
          { key: 'notes', label: t('Gesundheitsnotizen'), icon: <NotebookPen size={20} />, to: '/health/notes' },
          { key: 'history', label: t('Verlauf'), icon: <History size={20} />, to: '/health/history' },
        ]} />
        <Hint>{t('Tagesanker dient nur der Organisation. Dosierung und Einnahme bitte immer mit Ärztin, Arzt oder Apotheke abstimmen.')}</Hint>
        {editors}
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title={TITLES[tab]} back="/health" sub={tab === 'today' ? fmtLong(day) : undefined} actions={
        tab === 'doctor' ? <button className="icon-btn filled" aria-label={t('Neuer Termin')} onClick={() => setEditEvent(blankEvent(day, 'doctor'))}><Plus size={22} /></button>
          : tab === 'notes' ? <button className="icon-btn filled" aria-label={t('Neue Notiz')} onClick={() => setEditNote({ date: day, title: '', text: '' })}><Plus size={22} /></button>
            : <button className="icon-btn filled" aria-label={t('Medikament hinzufügen')} onClick={() => setEditMed(newMed())}><Plus size={22} /></button>
      } />

      {tab === 'stock' && (
        <div className="stack">
          {meds.filter((m) => m.stock != null).sort((a, b) => (daysLeft(a) ?? 9999) - (daysLeft(b) ?? 9999)).map((m) => {
            const left = daysLeft(m);
            return (
              <button key={m.id} className="card tap" onClick={() => setEditMed(m)} style={{ background: isLowStock(m) ? 'var(--danger-soft)' : undefined }}>
                <div className="row between"><div className="bold">{m.name}</div><span className={`badge ${isLowStock(m) ? 'danger' : ''}`}>{left != null ? t('{n} Tage', { n: left }) : '–'}</span></div>
                <div className="small muted">{t('Vorrat')}: {m.stock} · {t('pro Tag')}: {Math.round(dailyNeed(m) * 10) / 10}</div>
                <div style={{ marginTop: 6 }}><ProgressBar value={Math.min(1, (left ?? 0) / 30)} color={isLowStock(m) ? 'var(--danger)' : undefined} /></div>
              </button>
            );
          })}
          {!meds.some((m) => m.stock != null) && <div className="card"><Empty text="Trage beim Medikament einen Vorrat ein, um rechtzeitig an den Nachkauf erinnert zu werden." /></div>}
        </div>
      )}


      {tab === 'today' && (
        <div className="stack">
          {doses.length > 0 && (
            <div className="card row">
              <Ring value={done / doses.length} size={52}>{done}/{doses.length}</Ring>
              <div className="grow"><div className="bold">{t('Einnahmen heute')}</div><div className="small muted">{done === doses.length ? t('Alles erledigt 🌿') : t('{n} offen', { n: doses.length - done })}</div></div>
            </div>
          )}
          {low.map((m) => (
            <div key={m.id} className="card row" style={{ background: 'var(--danger-soft)' }}>
              <AlertTriangle size={20} color="var(--danger)" />
              <div className="grow small"><b>{m.name}</b>: Vorrat reicht noch ca. {daysLeft(m)} Tage ({m.stock} Stück).</div>
            </div>
          ))}
          {doses.length ? <div className="list">{doses.map((d) => <DoseRow key={`${d.med.id}-${d.time}`} d={d} />)}</div> : (
            <div className="card"><Empty icon={<Pill size={30} />} text="Heute sind keine Einnahmen geplant." action={<button className="btn secondary" onClick={() => setEditMed(newMed())}><Plus size={18} /> {t('Medikament hinzufügen')}</button>} /></div>
          )}
        </div>
      )}

      {tab === 'meds' && (
        <div className="stack">
          {meds.length ? (
            <div className="list">
              {meds.map((m) => {
                const left = daysLeft(m);
                return (
                  <button key={m.id} className="list-item" onClick={() => setEditMed(m)} style={{ opacity: m.active ? 1 : 0.55 }}>
                    <span className="bar-accent" style={{ background: m.color }} />
                    <div className="grow">
                      <div className="title">{m.name} <span className="muted small">{m.dose}</span></div>
                      <div className="meta">{describeRecurrence(m.recurrence)} · {m.times.join(', ')} {t('Uhr')}</div>
                    </div>
                    {m.stock != null && <span className={`badge ${isLowStock(m) ? 'danger' : ''}`}>{m.stock} St.{left != null ? ` · ${left} T.` : ''}</span>}
                  </button>
                );
              })}
            </div>
          ) : <div className="card"><Empty icon={<Pill size={30} />} text="Noch keine Medikamente angelegt." /></div>}
          <button className="btn secondary" onClick={() => setEditMed(newMed())}><Plus size={18} /> {t('Medikament hinzufügen')}</button>
        </div>
      )}

      {tab === 'history' && (
        <div className="stack">
          {history.filter((h) => h.doses.length).map((h) => (
            <div key={h.day} className="card">
              <div className="row between">
                <div className="bold">{h.day === day ? 'Heute' : fmtDayMonth(h.day)}</div>
                <span className={`badge ${adherence(h.doses) < 1 && h.day < day ? 'danger' : ''}`}>{Math.round(adherence(h.doses) * 100)} %</span>
              </div>
              <div className="chips mt">
                {h.doses.map((d) => <span key={`${d.med.id}-${d.time}`} className={`chip ${d.intake ? 'active' : ''}`}>{d.intake ? '✓' : '○'} {d.med.name} {d.time}</span>)}
              </div>
            </div>
          ))}
          {!history.some((h) => h.doses.length) && <div className="card"><Empty text="Noch keine Einnahmehistorie." /></div>}
        </div>
      )}

      {tab === 'doctor' && (
        <div className="stack">
          {upcomingDoctor.length ? (
            <div className="list">
              {upcomingDoctor.map(({ e, d }) => (
                <button key={e.id} className="list-item" onClick={() => setEditEvent(e)}>
                  <Stethoscope size={18} color="var(--danger)" />
                  <div className="grow"><div className="title">{e.title}</div><div className="meta">{relDay(d, day)} · {fmtShort(d)}{e.time ? `, ${e.time} ${t('Uhr')}` : ''}</div></div>
                </button>
              ))}
            </div>
          ) : <div className="card"><Empty text="Keine anstehenden Arzttermine." /></div>}
        </div>
      )}

      {tab === 'notes' && (
        <div className="stack">
          {notes.length ? (
            <div className="list">
              {notes.map((n) => (
                <button key={n.id} className="list-item" onClick={() => setEditNote(n)}>
                  <div className="grow"><div className="title">{n.title}</div><div className="meta ellipsis">{fmtShort(n.date)} · {n.text}</div></div>
                </button>
              ))}
            </div>
          ) : <div className="card"><Empty text="Hier kannst du Befunde, Symptome oder Fragen für den nächsten Arztbesuch festhalten." /></div>}
        </div>
      )}

      {editors}
    </div>
  );
}
