import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronRight, FileText, Heart, Lightbulb, List, Paperclip, Pin, Plus, Search, StickyNote, Leaf, Stethoscope } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../core/db';
import type { Note } from '../../core/types';
import { Empty, TopBar } from '../../ui/components';

export const NOTE_CATEGORIES: { name: string; icon: typeof StickyNote; color: string }[] = [
  { name: 'Allgemein', icon: StickyNote, color: '#6F8C6E' },
  { name: 'Einkaufsliste', icon: List, color: '#4F5D75' },
  { name: 'Hof & Garten', icon: Leaf, color: '#4E9A86' },
  { name: 'Ideen', icon: Lightbulb, color: '#C9A55C' },
  { name: 'Dokumente', icon: Paperclip, color: '#9A8C7A' },
  { name: 'Verträge & Rechnungen', icon: FileText, color: '#6E8FCB' },
  { name: 'Gesundheit', icon: Stethoscope, color: '#C27A6B' },
  { name: 'Persönlich', icon: Heart, color: '#B5543F' },
];

export const categoryMeta = (name: string) => NOTE_CATEGORIES.find((c) => c.name === name) ?? NOTE_CATEGORIES[0];

export async function createNote(category = 'Allgemein', checklist = false): Promise<number> {
  return db.notes.add({ title: '', body: '', category, pinned: 0, checklist: checklist ? [] : undefined, updatedAt: Date.now() });
}

function noteMatches(n: Note, q: string): boolean {
  const s = q.toLowerCase();
  return n.title.toLowerCase().includes(s) || n.body.toLowerCase().includes(s) || !!n.checklist?.some((i) => i.text.toLowerCase().includes(s)) || !!n.attachments?.some((a) => a.name.toLowerCase().includes(s));
}

export default function NotesScreen() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), []) ?? [];

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of notes) m.set(n.category, (m.get(n.category) ?? 0) + 1);
    return m;
  }, [notes]);

  const list = notes.filter((n) => (!cat || n.category === cat) && (!q || noteMatches(n, q))).sort((a, b) => b.pinned - a.pinned);
  const add = async () => {
    const id = await createNote(cat ?? 'Allgemein', cat === 'Einkaufsliste');
    nav(`/notes/${id}`);
  };

  return (
    <div className="screen">
      <TopBar title={cat ?? 'Notizen'} back={cat ? undefined : true} actions={<>
        {cat && <button className="btn sm ghost" onClick={() => setCat(null)}>Alle</button>}
        <button className="icon-btn filled" aria-label="Neue Notiz" onClick={add}><Plus size={22} /></button>
      </>} />
      <div className="row card flat mb" style={{ padding: '4px 12px' }}>
        <Search size={18} className="faint" />
        <input className="input" style={{ border: 0, background: 'transparent', boxShadow: 'none' }} placeholder="Notizen durchsuchen …" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {!cat && !q && (
        <div className="list mb">
          {NOTE_CATEGORIES.map((c) => (
            <button key={c.name} className="list-item" onClick={() => setCat(c.name)}>
              <span className="tile" style={{ minHeight: 0 }}><span className="icon-wrap" style={{ background: `color-mix(in srgb, ${c.color} 18%, var(--card))`, color: c.color }}><c.icon size={18} /></span></span>
              <div className="grow"><div className="title">{c.name}</div><div className="meta">{counts.get(c.name) ?? 0} Einträge</div></div>
              <ChevronRight size={18} className="faint" />
            </button>
          ))}
        </div>
      )}

      {(cat || q || notes.length > 0) && <div className="section-title"><h2>{q ? 'Suchergebnisse' : cat ? 'Einträge' : 'Zuletzt bearbeitet'}</h2></div>}
      {list.length ? (
        <div className="list">
          {(cat || q ? list : list.slice(0, 8)).map((n) => {
            const meta = categoryMeta(n.category);
            const open = n.checklist?.filter((i) => !i.done).length;
            return (
              <button key={n.id} className="list-item" onClick={() => nav(`/notes/${n.id}`)}>
                <span className="bar-accent" style={{ background: meta.color }} />
                <div className="grow">
                  <div className="title row" style={{ gap: 6 }}>{n.pinned ? <Pin size={13} /> : null}{n.title || 'Ohne Titel'}</div>
                  <div className="meta ellipsis">
                    {n.checklist ? `${open} offen von ${n.checklist.length}` : n.body.slice(0, 80) || '–'}
                    {n.attachments?.length ? ` · 📎 ${n.attachments.length}` : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (cat || q) ? <div className="card"><Empty text={q ? 'Nichts gefunden.' : 'Noch keine Einträge in dieser Kategorie.'} /></div> : null}
    </div>
  );
}
