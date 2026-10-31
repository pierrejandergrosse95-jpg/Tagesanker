import { useLiveQuery } from 'dexie-react-hooks';
import { Check, CheckSquare, Paperclip, Pin, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../core/db';
import { openBlob, pickFile } from '../../core/platform';
import type { Note } from '../../core/types';
import { TopBar, useUi } from '../../ui/components';
import { NOTE_CATEGORIES } from './Notes';

const MAX_FILE = 15 * 1024 * 1024;

function Thumb({ blob, name, onOpen, onRemove }: { blob: Blob; name: string; onOpen: () => void; onRemove: () => void }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob.type.startsWith('image/')) return;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return (
    <div className="card flat" style={{ padding: 6, width: 104, position: 'relative' }}>
      <button onClick={onOpen} style={{ border: 0, background: 'none', padding: 0, width: '100%' }}>
        {url ? <img src={url} alt={name} style={{ width: '100%', height: 72, objectFit: 'cover', borderRadius: 8 }} /> : <div style={{ height: 72, display: 'grid', placeItems: 'center' }}><Paperclip /></div>}
        <div className="tiny ellipsis">{name}</div>
      </button>
      <button className="icon-btn soft" style={{ position: 'absolute', top: -8, right: -8, width: 26, height: 26 }} aria-label="Anhang entfernen" onClick={onRemove}><X size={14} /></button>
    </div>
  );
}

export default function NoteEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const { confirm, toast } = useUi();
  const stored = useLiveQuery(() => db.notes.get(Number(id)), [id]);
  const [n, setN] = useState<Note | null>(null);
  const [newItem, setNewItem] = useState('');
  const saveTimer = useRef<number>(undefined);

  useEffect(() => {
    if (stored && (!n || n.id !== stored.id)) setN(stored);
  }, [stored, n]);

  const update = (patch: Partial<Note>) => {
    if (!n) return;
    const next = { ...n, ...patch, updatedAt: Date.now() };
    setN(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void db.notes.put(next), 300);
  };

  // Leere Notizen beim Verlassen verwerfen
  useEffect(() => () => {
    clearTimeout(saveTimer.current);
    void db.notes.get(Number(id)).then((cur) => {
      if (cur && !cur.title.trim() && !cur.body.trim() && !cur.checklist?.length && !cur.attachments?.length) void db.notes.delete(cur.id!);
    });
  }, [id]);

  if (stored === undefined && !n) return <div className="screen" />;
  if (!n) return <div className="screen"><TopBar title="Notiz nicht gefunden" back /></div>;

  const flush = async () => {
    clearTimeout(saveTimer.current);
    await db.notes.put(n);
  };

  const addAttachments = async () => {
    const files = await pickFile('image/*,application/pdf,.doc,.docx,.txt', true);
    const ok = files.filter((f) => f.size <= MAX_FILE);
    if (ok.length < files.length) toast('Dateien über 15 MB wurden übersprungen.');
    if (!ok.length) return;
    update({ attachments: [...(n.attachments ?? []), ...ok.map((f) => ({ name: f.name, type: f.type, size: f.size, blob: f as Blob }))] });
  };

  return (
    <div className="screen">
      <TopBar title="" back actions={<>
        <button className="icon-btn" aria-label={n.pinned ? 'Lösen' : 'Anheften'} onClick={() => update({ pinned: n.pinned ? 0 : 1 })}><Pin size={20} fill={n.pinned ? 'currentColor' : 'none'} /></button>
        <button className="icon-btn" aria-label="Checkliste" onClick={() => update({ checklist: n.checklist ? undefined : [] })}><CheckSquare size={20} /></button>
        <button className="icon-btn" aria-label="Anhang hinzufügen" onClick={addAttachments}><Paperclip size={20} /></button>
        <button className="icon-btn" aria-label="Löschen" onClick={async () => { if (await confirm('Notiz löschen?', { ok: 'Löschen', danger: true })) { clearTimeout(saveTimer.current); await db.notes.delete(n.id!); nav(-1); } }}><Trash2 size={20} /></button>
      </>} />
      <div className="stack">
        <input className="input serif" style={{ fontSize: 22, border: 0, background: 'transparent', padding: '4px 2px' }} placeholder="Titel" value={n.title} onChange={(e) => update({ title: e.target.value })} onBlur={flush} />
        <select className="select" value={n.category} onChange={(e) => update({ category: e.target.value })}>
          {NOTE_CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
        </select>
        {n.checklist && (
          <div className="list">
            {n.checklist.map((item, i) => (
              <div key={i} className={`list-item ${item.done ? 'done' : ''}`}>
                <button className={`check ${item.done ? 'on' : ''}`} style={{ width: 24, height: 24 }} aria-label="Abhaken" onClick={() => update({ checklist: n.checklist!.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })}>{item.done && <Check size={14} />}</button>
                <input className="grow title" style={{ border: 0, background: 'transparent', outline: 'none', textDecoration: item.done ? 'line-through' : undefined }} value={item.text} onChange={(e) => update({ checklist: n.checklist!.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
                <button className="icon-btn" style={{ width: 30, height: 30 }} aria-label="Entfernen" onClick={() => update({ checklist: n.checklist!.filter((_, j) => j !== i) })}><X size={16} /></button>
              </div>
            ))}
            <form className="list-item" onSubmit={(e) => { e.preventDefault(); if (newItem.trim()) { update({ checklist: [...n.checklist!, { text: newItem.trim(), done: false }] }); setNewItem(''); } }}>
              <Plus size={20} className="faint" />
              <input className="grow" style={{ border: 0, background: 'transparent', outline: 'none' }} placeholder="Eintrag hinzufügen" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
            </form>
            {n.checklist.some((x) => x.done) && (
              <button className="list-item small muted" onClick={() => update({ checklist: n.checklist!.filter((x) => !x.done) })}>Erledigte entfernen</button>
            )}
          </div>
        )}
        <textarea className="textarea" style={{ minHeight: 260 }} placeholder="Schreibe hier …" value={n.body} onChange={(e) => update({ body: e.target.value })} onBlur={flush} />
        {n.attachments && n.attachments.length > 0 && (
          <div className="chips">
            {n.attachments.map((a, i) => (
              <Thumb key={i} blob={a.blob} name={a.name} onOpen={() => void openBlob(a.blob, a.name)} onRemove={() => update({ attachments: n.attachments!.filter((_, j) => j !== i) })} />
            ))}
          </div>
        )}
        <div className="tiny faint">Zuletzt geändert: {new Date(n.updatedAt).toLocaleString('de-DE')}</div>
      </div>
    </div>
  );
}
