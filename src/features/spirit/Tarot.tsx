import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, Layers, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { MAJOR_ARCANA, THREE_CARD_POSITIONS } from '../../content/tarot';
import { fmtShort } from '../../core/dates';
import { db } from '../../core/db';
import { useToday } from '../../core/hooks';
import type { TarotDraw } from '../../core/types';
import { Empty, Field, Hint, Segmented, Sheet, TopBar } from '../../ui/components';
import { SpiritNav } from './SpiritHome';

function drawCards(n: number): { card: number; reversed: boolean }[] {
  const deck = MAJOR_ARCANA.map((c) => c.n);
  const rnd = new Uint32Array(n * 2);
  crypto.getRandomValues(rnd);
  const out: { card: number; reversed: boolean }[] = [];
  for (let i = 0; i < n; i++) {
    const idx = rnd[i * 2] % deck.length;
    out.push({ card: deck.splice(idx, 1)[0], reversed: rnd[i * 2 + 1] % 4 === 0 });
  }
  return out;
}

export const cardImage = (n: number) => `./tarot/${String(n).padStart(2, '0')}.jpg`;

export function CardFace({ card, reversed, label, onClick }: { card: number; reversed: boolean; label?: string; onClick?: () => void }) {
  const c = MAJOR_ARCANA[card];
  return (
    <button className={`tarot-card ${reversed ? 'reversed' : ''}`} onClick={onClick} aria-label={`${c.name}${reversed ? ', umgekehrt' : ''}`}>
      {label && <span className="pos">{label}</span>}
      <span className="art">
        <img src={cardImage(card)} alt="" loading="lazy" />
        <span className="num">{c.roman}</span>
      </span>
      <span className="name">{c.name}</span>
      {reversed && <span className="pos">umgekehrt</span>}
    </button>
  );
}

function CardBack({ onClick }: { onClick: () => void }) {
  return (
    <button className="tarot-card back" onClick={onClick} aria-label="Tageskarte ziehen">
      <span className="art"><span>✦</span></span>
      <span className="name">Tagesanker</span>
    </button>
  );
}

function Interpretation({ card, reversed, position }: { card: number; reversed: boolean; position?: string }) {
  const c = MAJOR_ARCANA[card];
  return (
    <div className="card">
      {position && <div className="card-label">{position}</div>}
      <div className="row between"><h3>{c.name}{reversed ? ' (umgekehrt)' : ''}</h3><span className="serif gold-text" style={{ fontSize: 22 }}>{c.symbol}</span></div>
      <div className="chips mt">{c.keywords.map((k) => <span key={k} className="badge gold">{k}</span>)}</div>
      <p className="small mt">{reversed ? c.reversed : c.upright}</p>
      <p className="small mt"><b>Reflexion:</b> {c.question}</p>
    </div>
  );
}

export default function TarotScreen() {
  const day = useToday();
  const [tab, setTab] = useState<'day' | 'three' | 'all' | 'history'>('day');
  const [browse, setBrowse] = useState(0);
  const [question, setQuestion] = useState('');
  const [current, setCurrent] = useState<TarotDraw | null>(null);
  const [detail, setDetail] = useState<TarotDraw | null>(null);
  const todayCard = useLiveQuery(() => db.tarotDraws.where('date').equals(day).filter((d) => d.spread === 'day').first(), [day]);
  const history = useLiveQuery(() => db.tarotDraws.orderBy('date').reverse().toArray(), []) ?? [];

  const drawDay = async () => {
    const draw: TarotDraw = { date: day, spread: 'day', cards: drawCards(1), createdAt: Date.now() };
    await db.tarotDraws.add(draw);
  };
  const drawThree = async () => {
    const draw: TarotDraw = { date: day, spread: 'three', question: question.trim() || undefined, cards: drawCards(3), createdAt: Date.now() };
    const id = await db.tarotDraws.add(draw);
    setCurrent({ ...draw, id });
  };

  return (
    <div className="screen spirit-screen">
      <TopBar title="Tarot & Orakel" />
      <SpiritNav active="/spirit/tarot" />
      <Segmented value={tab} onChange={setTab} options={[{ value: 'day', label: 'Tageskarte' }, { value: 'three', label: 'Drei Karten' }, { value: 'all', label: 'Alle Karten' }, { value: 'history', label: 'Verlauf' }]} />

      {tab === 'day' && (
        <div className="stack">
          {todayCard ? (
            <>
              <div style={{ width: 170, margin: '0 auto' }}><CardFace card={todayCard.cards[0].card} reversed={todayCard.cards[0].reversed} /></div>
              <Interpretation card={todayCard.cards[0].card} reversed={todayCard.cards[0].reversed} />
              <Field label="Deine Gedanken zur Karte">
                <textarea className="textarea" defaultValue={todayCard.note ?? ''} onBlur={(e) => db.tarotDraws.update(todayCard.id!, { note: e.target.value })} placeholder="Was löst die Karte in dir aus?" />
              </Field>
            </>
          ) : (
            <>
              <div style={{ width: 170, margin: '10px auto' }}><CardBack onClick={drawDay} /></div>
              <p className="center muted small">Atme tief durch, denke an deinen Tag – und ziehe eine Karte.</p>
              <button className="btn gold" onClick={drawDay}><Layers size={18} /> Tageskarte ziehen</button>
            </>
          )}
        </div>
      )}

      {tab === 'three' && (
        <div className="stack">
          <Field label="Deine Frage (optional)"><input className="input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="z. B. Was hilft mir gerade in meiner Situation?" /></Field>
          <button className="btn gold" onClick={drawThree}><Layers size={18} /> Drei Karten legen</button>
          {current && (
            <>
              {current.question && <div className="card cosmic small">„{current.question}“</div>}
              <div className="grid3">{current.cards.map((c, i) => <CardFace key={i} card={c.card} reversed={c.reversed} label={THREE_CARD_POSITIONS[i]} />)}</div>
              {current.cards.map((c, i) => <Interpretation key={i} card={c.card} reversed={c.reversed} position={THREE_CARD_POSITIONS[i]} />)}
            </>
          )}
        </div>
      )}

      {tab === 'all' && (
        <div className="stack">
          <div className="row" style={{ justifyContent: 'center', gap: 6 }}>
            <button className="icon-btn" aria-label="Vorherige Karte" onClick={() => setBrowse((browse + 21) % 22)}><ChevronLeft size={26} /></button>
            <div style={{ width: 180 }}><CardFace card={browse} reversed={false} /></div>
            <button className="icon-btn" aria-label="Nächste Karte" onClick={() => setBrowse((browse + 1) % 22)}><ChevronRight size={26} /></button>
          </div>
          <div className="hscroll">
            {MAJOR_ARCANA.map((c) => (
              <button key={c.n} onClick={() => setBrowse(c.n)} aria-label={c.name} style={{ border: browse === c.n ? '2px solid var(--gold)' : '2px solid transparent', borderRadius: 8, padding: 0, width: 44, background: 'none', overflow: 'hidden' }}>
                <img src={cardImage(c.n)} alt="" loading="lazy" style={{ width: '100%', display: 'block', aspectRatio: '240 / 660', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
          <Interpretation card={browse} reversed={false} />
          <div className="card small"><b>Umgekehrt:</b> {MAJOR_ARCANA[browse].reversed}</div>
        </div>
      )}

      {tab === 'history' && (
        history.length ? (
          <div className="list">
            {history.map((h) => (
              <button key={h.id} className="list-item" onClick={() => setDetail(h)}>
                <span className="row" style={{ gap: 3 }}>{h.cards.map((c, i) => <img key={i} src={cardImage(c.card)} alt="" loading="lazy" style={{ width: 22, aspectRatio: '240 / 660', objectFit: 'cover', borderRadius: 3, transform: c.reversed ? 'rotate(180deg)' : undefined }} />)}</span>
                <div className="grow">
                  <div className="title">{h.cards.map((c) => MAJOR_ARCANA[c.card].name + (c.reversed ? ' ↺' : '')).join(' · ')}</div>
                  <div className="meta">{fmtShort(h.date)} · {h.spread === 'day' ? 'Tageskarte' : 'Drei-Karten-Legung'}{h.question ? ` · „${h.question}“` : ''}</div>
                </div>
              </button>
            ))}
          </div>
        ) : <div className="card"><Empty text="Noch keine Karten gezogen." /></div>
      )}

      <Hint>Die Karten sind Impulse zur Selbstreflexion und keine Vorhersage der Zukunft. Gezogen werden die 22 Großen Arkana; die Kartenbilder stammen aus deinem eigenen Kartenset.</Hint>

      <Sheet open={!!detail} onClose={() => setDetail(null)} title={detail ? fmtShort(detail.date) : ''} actions={detail && <button className="btn danger" onClick={async () => { await db.tarotDraws.delete(detail.id!); setDetail(null); }}><Trash2 size={18} /> Löschen</button>}>
        {detail && (
          <div className="stack">
            {detail.question && <div className="card cosmic small">„{detail.question}“</div>}
            {detail.cards.map((c, i) => <Interpretation key={i} card={c.card} reversed={c.reversed} position={detail.spread === 'three' ? THREE_CARD_POSITIONS[i] : undefined} />)}
            {detail.note && <div className="card"><div className="card-label">Deine Notiz</div><p className="small">{detail.note}</p></div>}
          </div>
        )}
      </Sheet>
    </div>
  );
}
