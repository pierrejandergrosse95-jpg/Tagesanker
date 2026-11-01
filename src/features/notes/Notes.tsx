import { useLiveQuery } from 'dexie-react-hooks';
import { FileSignature, FileText, Heart, Lightbulb, List, Paperclip, Pin, Plus, Receipt, Search, StickyNote, Leaf, Stethoscope } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../core/db';
import type { Note } from '../../core/types';
import { t, t as tr } from '../../i18n';
import { Empty, TopBar } from '../../ui/components';
import { HubHero, ScrollMenu } from '../../ui/hub';

export const NOTE_CATEGORIES: { name: string; icon: typeof StickyNote; color: string }[] = [
  { name: 'Allgemein', icon: StickyNote, color: '#6F8C6E' },
  { name: 'Einkaufsliste', icon: List, color: '#4F5D75' },
  { name: 'Dokumente', icon: Paperclip, color: '#9A8C7A' },
  { name: 'Verträge', icon: FileSignature, color: '#6E8FCB' },
  { name: 'Rechnungen', icon: Receipt, color: '#B5543F' },
  { name: 'Ideen', icon: Lightbulb, color: '#C9A55C' },
  { name: 'Hof & Garten', icon: Leaf, color: '#4E9A86' },
  { name: 'Gesundheit', icon: Stethoscope, color: '#C27A6B' },
  { name: 'Persönlich', icon: Heart, color: '#8A2C38' },
];

/** Ältere Kategorie „Verträge & Rechnungen“ wird wie „Verträge“ behandelt. */
const normalize = (c: string) => (c === 'Verträge & Rechnungen' ? 'Verträge' : c);
export const categoryMeta = (name: string) => NOTE_CATEGORIES.find((c) => c.name === normalize(name)) ?? NOTE_CATEGORIES[0];

export async function createNote(category = 'Allgemein', checklist = false): Promise<number> {
  return db.notes.add({ title: '', body: '', category, pinned: 0, checklist: checklist ? [] : undefined, updatedAt: Date.now() });
}

function noteMatches(n: Note, q: string): boolean {
  const s = q.toLowerCase();
  return n.title.toLowerCase().includes(s) || n.body.toLowerCase().includes(s) || !!n.checklist?.some((i) => i.text.toLowerCase().includes(s)) || !!n.attachments?.some((a) => a.name.toLowerCase().includes(s));
}

/** Hub-Einträge wie in der Vorlage; „Meine Notizen“ bündelt die freien Kategorien. */
const PERSONAL = ['Allgemein', 'Ideen', 'Hof & Garten', 'Gesundheit', 'Persönlich'];

function NoteList({ list }: { list: Note[] }) {
  const nav = useNavigate();
  return (
    <div className="list">
      {list.map((n) => {
        const meta = categoryMeta(n.category);
        const open = n.checklist?.filter((i) => !i.done).length;
        return (
          <button key={n.id} className="list-item" onClick={() => nav(`/notes/${n.id}`)}>
            <span className="bar-accent" style={{ background: meta.color }} />
            <div className="grow">
              <div className="title row" style={{ gap: 6 }}>{n.pinned ? <Pin size={13} /> : null}{n.title || t('Ohne Titel')}</div>
              <div className="meta ellipsis">
                {t(meta.name)} · {n.checklist ? t('{a} offen von {b}', { a: open ?? 0, b: n.checklist.length }) : n.body.slice(0, 80) || '–'}
                {n.attachments?.length ? ` · 📎 ${n.attachments.length}` : ''}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function NotesScreen() {
  const nav = useNavigate();
  const { cat } = useParams();
  const [q, setQ] = useState('');
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), []) ?? [];
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of notes) m.set(normalize(n.category), (m.get(normalize(n.category)) ?? 0) + 1);
    return m;
  }, [notes]);

  const add = async (category = 'Allgemein') => nav(`/notes/${await createNote(category, category === 'Einkaufsliste')}`);

  if (!cat) {
    const mine = PERSONAL.reduce((s, c) => s + (counts.get(c) ?? 0), 0);
    return (
      <div className="screen">
        <HubHero title={t('Notizen & Dokumente')} scene={{ variant: 'night', seed: 31 }} emblem="letter"
          actions={<button className="icon-btn" aria-label={t('Neue Notiz')} onClick={() => void add()}><Plus size={24} /></button>} />
        <ScrollMenu items={[
          { key: 'mine', label: t('Meine Notizen'), icon: <StickyNote size={20} />, badge: mine || undefined, to: '/notes/c/mine' },
          { key: 'shop', label: t('Einkaufslisten'), icon: <List size={20} />, badge: counts.get('Einkaufsliste') || undefined, to: '/notes/c/Einkaufsliste' },
          { key: 'docs', label: t('Dokumente'), icon: <FileText size={20} />, badge: counts.get('Dokumente') || undefined, to: '/notes/c/Dokumente' },
          { key: 'contracts', label: t('Verträge'), icon: <FileSignature size={20} />, badge: counts.get('Verträge') || undefined, to: '/notes/c/Verträge' },
          { key: 'invoices', label: t('Rechnungen'), icon: <Receipt size={20} />, badge: counts.get('Rechnungen') || undefined, to: '/notes/c/Rechnungen' },
          { key: 'search', label: t('Suche'), icon: <Search size={20} />, to: '/search' },
        ]} />
        {notes.length > 0 && (
          <>
            <div className="section-title"><h2>{t('Zuletzt bearbeitet')}</h2></div>
            <NoteList list={notes.slice(0, 5)} />
          </>
        )}
      </div>
    );
  }

  const inCat = (n: Note) => (cat === 'mine' ? PERSONAL.includes(normalize(n.category)) : normalize(n.category) === cat);
  const list = notes.filter((n) => inCat(n) && (!q || noteMatches(n, q))).sort((a, b) => b.pinned - a.pinned);
  const title = cat === 'mine' ? 'Meine Notizen' : cat === 'Einkaufsliste' ? 'Einkaufslisten' : cat;
  return (
    <div className="screen">
      <TopBar title={title} back="/notes" actions={<button className="icon-btn filled" aria-label={t('Neue Notiz')} onClick={() => void add(cat === 'mine' ? 'Allgemein' : cat)}><Plus size={22} /></button>} />
      <div className="row card flat mb" style={{ padding: '4px 12px' }}>
        <Search size={18} className="faint" />
        <input className="input" style={{ border: 0, background: 'transparent', boxShadow: 'none' }} placeholder={t('Notizen durchsuchen …')} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length ? <NoteList list={list} /> : <div className="card"><Empty text={q ? tr('Nichts gefunden.') : tr('Noch keine Einträge in dieser Kategorie.')} /></div>}
    </div>
  );
}
