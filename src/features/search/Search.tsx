import { useLiveQuery } from 'dexie-react-hooks';
import { BookHeart, CalendarDays, CheckSquare, HeartPulse, Pill, Receipt, Search, StickyNote, Target, Wallet } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { fmtShort } from '../../core/dates';
import { db } from '../../core/db';
import { useSettings } from '../../core/hooks';
import { Empty, TopBar } from '../../ui/components';
import { fmtMoney } from '../finance/logic';

interface Hit {
  key: string;
  icon: ReactNode;
  title: string;
  meta: string;
  to: string;
}

const has = (q: string, ...vals: (string | undefined)[]) => vals.some((v) => v?.toLowerCase().includes(q));

export default function SearchScreen() {
  const nav = useNavigate();
  const settings = useSettings();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const hits = useLiveQuery(async (): Promise<Hit[]> => {
    if (query.length < 2) return [];
    const [tasks, events, notes, meds, bills, finance, healthNotes, habits, journal] = await Promise.all([
      db.tasks.toArray(), db.events.toArray(), db.notes.toArray(), db.meds.toArray(), db.bills.toArray(),
      db.finance.toArray(), db.healthNotes.toArray(), db.habits.toArray(), settings.journalPinHash ? Promise.resolve([]) : db.journal.toArray(),
    ]);
    const out: Hit[] = [];
    for (const t of tasks) if (has(query, t.title, t.note, t.category)) out.push({ key: `t${t.id}`, icon: <CheckSquare size={18} />, title: t.title, meta: `Aufgabe${t.done ? ' · erledigt' : ''}${t.due ? ' · ' + fmtShort(t.due) : ''}`, to: '/tasks' });
    for (const e of events) if (has(query, e.title, e.note, e.location)) out.push({ key: `e${e.id}`, icon: <CalendarDays size={18} />, title: e.title, meta: `${e.kind === 'birthday' ? 'Geburtstag' : e.kind === 'doctor' ? 'Arzttermin' : 'Termin'} · ${fmtShort(e.date)}`, to: '/calendar' });
    for (const n of notes) if (has(query, n.title, n.body, n.category, ...(n.checklist ?? []).map((c) => c.text), ...(n.attachments ?? []).map((a) => a.name))) out.push({ key: `n${n.id}`, icon: <StickyNote size={18} />, title: n.title || 'Ohne Titel', meta: `Notiz · ${n.category}`, to: `/notes/${n.id}` });
    for (const m of meds) if (has(query, m.name, m.dose, m.instructions)) out.push({ key: `m${m.id}`, icon: <Pill size={18} />, title: m.name, meta: `Medikament · ${m.dose}`, to: '/health?tab=meds' });
    for (const b of bills) if (has(query, b.title, b.note, b.category)) out.push({ key: `b${b.id}`, icon: <Receipt size={18} />, title: b.title, meta: `Zahlung · ${fmtMoney(b.amount)} · ${b.paidAt ? 'bezahlt' : 'fällig ' + fmtShort(b.due)}`, to: '/finance?tab=bills' });
    for (const f of finance) if (has(query, f.title, f.note, f.category)) out.push({ key: `f${f.id}`, icon: <Wallet size={18} />, title: f.title, meta: `${f.kind === 'income' ? 'Einnahme' : 'Ausgabe'} · ${fmtMoney(f.amount)} · ${fmtShort(f.date)}`, to: '/finance?tab=entries' });
    for (const h of healthNotes) if (has(query, h.title, h.text)) out.push({ key: `h${h.id}`, icon: <HeartPulse size={18} />, title: h.title, meta: `Gesundheitsnotiz · ${fmtShort(h.date)}`, to: '/health' });
    for (const h of habits) if (has(query, h.name)) out.push({ key: `g${h.id}`, icon: <Target size={18} />, title: h.name, meta: 'Gewohnheit', to: '/habits' });
    for (const j of journal) if (has(query, j.text, j.answer, j.prompt, ...j.gratitude)) out.push({ key: `j${j.id}`, icon: <BookHeart size={18} />, title: j.prompt ?? 'Tagebucheintrag', meta: `Tagebuch · ${fmtShort(j.date)}`, to: '/spirit/journal' });
    return out.slice(0, 80);
  }, [query, settings.journalPinHash]);

  return (
    <div className="screen">
      <TopBar title="Suche" back />
      <div className="row card flat mb" style={{ padding: '4px 12px' }}>
        <Search size={18} className="faint" />
        <input className="input" autoFocus style={{ border: 0, background: 'transparent', boxShadow: 'none' }} placeholder="Aufgaben, Termine, Notizen, Zahlungen …" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {query.length < 2 ? <Empty icon={<Search size={30} />} text="Durchsuche alle Bereiche von KlarTakt." /> : hits?.length ? (
        <div className="list">
          {hits.map((h) => (
            <button key={h.key} className="list-item" onClick={() => nav(h.to)}>
              <span className="faint">{h.icon}</span>
              <div className="grow"><div className="title">{h.title}</div><div className="meta">{h.meta}</div></div>
            </button>
          ))}
        </div>
      ) : <Empty text="Keine Treffer." />}
      {settings.journalPinHash && query.length >= 2 && <p className="tiny faint center mt">Geschützte Tagebucheinträge werden nicht durchsucht.</p>}
    </div>
  );
}
