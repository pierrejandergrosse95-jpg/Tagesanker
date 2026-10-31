import { useLiveQuery } from 'dexie-react-hooks';
import { Delete, Lock, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EMOTIONS, JOURNAL_PROMPTS } from '../../content/meditations';
import { hashString } from '../../core/astro/guidance';
import { verifyPin } from '../../core/crypto';
import { fmtLong, fmtShort, MONTHS } from '../../core/dates';
import { db } from '../../core/db';
import { useSettings, useToday } from '../../core/hooks';
import type { JournalEntry, JournalKind } from '../../core/types';
import { Empty, Field, Hint, Sheet, TopBar, useUi } from '../../ui/components';
import { SpiritNav } from './SpiritHome';

export const KIND_LABEL: Record<JournalKind, string> = {
  thoughts: 'Gedanken', gratitude: 'Dankbarkeit', goals: 'Ziele', dreams: 'Wünsche & Träume', insights: 'Erkenntnisse', free: 'Freier Text',
};
const MOODS = ['😔', '😕', '😐', '🙂', '😊'];

let unlocked = false;
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) unlocked = false;
  });
}

export const promptOfDay = (day: string) => JOURNAL_PROMPTS[hashString(`p${day}`) % JOURNAL_PROMPTS.length];

function PinLock({ hash, onUnlock }: { hash: string; onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    if (pin.length < 4) return;
    void verifyPin(pin, hash).then((ok) => {
      if (ok) { unlocked = true; onUnlock(); }
      else if (pin.length >= 6) { setError(true); setPin(''); }
    });
  }, [pin, hash, onUnlock]);
  return (
    <div className="lock-screen">
      <Lock size={34} />
      <h2>Tagebuch ist geschützt</h2>
      <p className="small muted">{error ? 'Falsche PIN – bitte erneut versuchen.' : 'Bitte PIN eingeben'}</p>
      <div className="pin-dots">{Array.from({ length: Math.max(4, pin.length) }, (_, i) => <i key={i} className={i < pin.length ? 'on' : ''} />)}</div>
      <div className="pin-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <button key={n} onClick={() => { setError(false); setPin((p) => (p + n).slice(0, 6)); }}>{n}</button>)}
        <span />
        <button onClick={() => setPin((p) => (p + 0).slice(0, 6))}>0</button>
        <button aria-label="Löschen" onClick={() => setPin((p) => p.slice(0, -1))}><Delete size={22} /></button>
      </div>
    </div>
  );
}

function EntryEditor({ entry, onClose }: { entry: JournalEntry | null; onClose: () => void }) {
  const [e, setE] = useState(entry);
  const [g, setG] = useState('');
  const { confirm } = useUi();
  useEffect(() => setE(entry), [entry]);
  if (!e) return null;
  const set = (p: Partial<JournalEntry>) => setE({ ...e, ...p });
  const empty = !e.text.trim() && !e.answer?.trim() && !e.gratitude.length && !e.emotions.length && !e.mood;
  return (
    <Sheet open onClose={onClose} title={e.id ? fmtLong(e.date) : 'Neuer Eintrag'} actions={<>
      {e.id && <button className="btn danger" onClick={async () => { if (await confirm('Eintrag löschen?', { ok: 'Löschen', danger: true })) { await db.journal.delete(e.id!); onClose(); } }}><Trash2 size={18} /></button>}
      <button className="btn" disabled={empty} onClick={async () => { await db.journal.put(e); onClose(); }}>Speichern</button>
    </>}>
      <div className="form">
        <div className="grid2">
          <Field label="Datum"><input className="input" type="date" value={e.date} onChange={(ev) => set({ date: ev.target.value })} /></Field>
          <Field label="Art"><select className="select" value={e.kind} onChange={(ev) => set({ kind: ev.target.value as JournalKind })}>{(Object.keys(KIND_LABEL) as JournalKind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select></Field>
        </div>
        <Field label="Wie geht es dir?">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            {MOODS.map((m, i) => <button key={i} type="button" className={`chip ${e.mood === i + 1 ? 'active' : ''}`} style={{ fontSize: 22, padding: '4px 10px' }} onClick={() => set({ mood: e.mood === i + 1 ? undefined : i + 1 })}>{m}</button>)}
          </div>
        </Field>
        <Field label="Gefühle">
          <div className="chips">{EMOTIONS.map((em) => { const on = e.emotions.includes(em); return <button key={em} type="button" className={`chip ${on ? 'active' : ''}`} onClick={() => set({ emotions: on ? e.emotions.filter((x) => x !== em) : [...e.emotions, em] })}>{em}</button>; })}</div>
        </Field>
        {e.prompt !== undefined && (
          <Field label={e.prompt}>
            <textarea className="textarea" style={{ minHeight: 80 }} value={e.answer ?? ''} onChange={(ev) => set({ answer: ev.target.value })} />
          </Field>
        )}
        <Field label="Dankbar bin ich für …">
          {e.gratitude.map((x, i) => (
            <div key={i} className="row"><span className="grow small">• {x}</span><button type="button" className="icon-btn" style={{ width: 30, height: 30 }} aria-label="Entfernen" onClick={() => set({ gratitude: e.gratitude.filter((_, j) => j !== i) })}>×</button></div>
          ))}
          <div className="row">
            <input className="input" value={g} onChange={(ev) => setG(ev.target.value)} placeholder="z. B. einen ruhigen Morgen" onKeyDown={(ev) => { if (ev.key === 'Enter' && g.trim()) { ev.preventDefault(); set({ gratitude: [...e.gratitude, g.trim()] }); setG(''); } }} />
            <button type="button" className="btn secondary" onClick={() => { if (g.trim()) { set({ gratitude: [...e.gratitude, g.trim()] }); setG(''); } }}><Plus size={18} /></button>
          </div>
        </Field>
        <Field label="Gedanken"><textarea className="textarea" style={{ minHeight: 160 }} value={e.text} onChange={(ev) => set({ text: ev.target.value })} placeholder="Was bewegt dich gerade?" /></Field>
      </div>
    </Sheet>
  );
}

export default function JournalScreen() {
  const day = useToday();
  const settings = useSettings();
  const [params, setParams] = useSearchParams();
  const [, force] = useState(0);
  const [edit, setEdit] = useState<JournalEntry | null>(null);
  const [kind, setKind] = useState<JournalKind | 'all'>('all');
  const [q, setQ] = useState('');
  const entries = useLiveQuery(() => db.journal.orderBy('date').reverse().toArray(), []) ?? [];
  const locked = !!settings.journalPinHash && !unlocked;

  const newEntry = (prompt?: string): JournalEntry => ({ date: day, kind: 'thoughts', emotions: [], gratitude: [], text: '', prompt, answer: prompt ? '' : undefined, createdAt: Date.now() });

  useEffect(() => {
    const p = params.get('prompt');
    if (p && !locked) {
      setEdit(newEntry(p));
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, locked]);

  const list = useMemo(() => entries.filter((e) => (kind === 'all' || e.kind === kind) && (!q || [e.text, e.answer, ...e.gratitude, ...e.emotions].join(' ').toLowerCase().includes(q.toLowerCase()))), [entries, kind, q]);
  const groups = useMemo(() => {
    const m = new Map<string, JournalEntry[]>();
    for (const e of list) {
      const k = e.date.slice(0, 7);
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return [...m.entries()];
  }, [list]);

  if (locked) return <div className="screen spirit-screen"><TopBar title="Tagebuch" /><SpiritNav active="/spirit/journal" /><PinLock hash={settings.journalPinHash!} onUnlock={() => force((x) => x + 1)} /></div>;

  const prompt = promptOfDay(day);
  const lookback = entries.find((e) => e.date.slice(5) === day.slice(5) && e.date < day);

  return (
    <div className="screen spirit-screen">
      <TopBar title="Tagebuch" sub="Meine persönliche Reise" actions={<button className="icon-btn filled" aria-label="Neuer Eintrag" onClick={() => setEdit(newEntry())}><Plus size={22} /></button>} />
      <SpiritNav active="/spirit/journal" />
      <div className="stack">
        <button className="card cosmic tap" onClick={() => setEdit(newEntry(prompt))}>
          <div className="small muted">Reflexionsfrage des Tages</div>
          <div className="serif" style={{ fontSize: 20, marginTop: 6 }}>{prompt}</div>
          <div className="small gold-text mt">Antworten →</div>
        </button>
        {lookback && (
          <button className="card gold tap" onClick={() => setEdit(lookback)}>
            <div className="card-label">Heute vor {Number(day.slice(0, 4)) - Number(lookback.date.slice(0, 4))} Jahr(en)</div>
            <p className="small ellipsis mt">{lookback.answer || lookback.text || lookback.gratitude.join(', ')}</p>
          </button>
        )}
        <div className="row card flat" style={{ padding: '4px 12px' }}>
          <Search size={18} className="faint" />
          <input className="input" style={{ border: 0, background: 'transparent', boxShadow: 'none' }} placeholder="Einträge durchsuchen …" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="hscroll">
          <button className={`chip ${kind === 'all' ? 'active' : ''}`} onClick={() => setKind('all')}>Alle</button>
          {(Object.keys(KIND_LABEL) as JournalKind[]).map((k) => <button key={k} className={`chip ${kind === k ? 'active' : ''}`} onClick={() => setKind(k)}>{KIND_LABEL[k]}</button>)}
        </div>
        {groups.length ? groups.map(([month, items]) => (
          <div key={month}>
            <div className="small bold muted" style={{ margin: '6px 4px' }}>{MONTHS[Number(month.slice(5)) - 1]} {month.slice(0, 4)}</div>
            <div className="list">
              {items.map((e) => (
                <button key={e.id} className="list-item" onClick={() => setEdit(e)}>
                  <span style={{ fontSize: 22, width: 28 }}>{e.mood ? MOODS[e.mood - 1] : '·'}</span>
                  <div className="grow">
                    <div className="title ellipsis">{e.prompt ?? KIND_LABEL[e.kind]}</div>
                    <div className="meta ellipsis">{fmtShort(e.date)} · {e.answer || e.text || e.gratitude.join(', ') || e.emotions.join(', ')}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )) : <div className="card"><Empty text="Dein Tagebuch ist noch leer. Beginne mit der Frage des Tages." /></div>}
        {!settings.journalPinHash && <Hint>Tipp: In den Einstellungen kannst du das Tagebuch mit einer PIN schützen.</Hint>}
      </div>
      <EntryEditor entry={edit} onClose={() => setEdit(null)} />
    </div>
  );
}
