import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, HelpCircle, History, Layers, LayoutGrid, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { card, MAJOR_ARCANA, threeCardPositions } from '../../content/tarot';
import { fmtShort } from '../../core/dates';
import { db } from '../../core/db';
import { useToday } from '../../core/hooks';
import type { TarotDraw } from '../../core/types';
import { t, quote } from '../../i18n';
import { Empty, Field, Hint, Sheet, TopBar } from '../../ui/components';
import { HubHero, ScrollMenu } from '../../ui/hub';

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

export function CardFace({ card: n, reversed, label, onClick }: { card: number; reversed: boolean; label?: string; onClick?: () => void }) {
  const c = card(n);
  return (
    <button className={`tarot-card ${reversed ? 'reversed' : ''}`} onClick={onClick} aria-label={`${c.name}${reversed ? `, ${t('umgekehrt')}` : ''}`}>
      {label && <span className="pos">{label}</span>}
      <span className="art">
        <img src={cardImage(n)} alt="" loading="lazy" />
        <span className="num">{c.roman}</span>
      </span>
      <span className="name">{c.name}</span>
      {reversed && <span className="pos">{t('umgekehrt')}</span>}
    </button>
  );
}

function CardBack({ onClick }: { onClick: () => void }) {
  return (
    <button className="tarot-card back" onClick={onClick} aria-label={t('Tageskarte ziehen')}>
      <span className="art"><span>✦</span></span>
      <span className="name">Tagesanker</span>
    </button>
  );
}

function Interpretation({ card: n, reversed, position }: { card: number; reversed: boolean; position?: string }) {
  const c = card(n);
  return (
    <div className="card">
      {position && <div className="card-label">{position}</div>}
      <div className="row between"><h3>{c.name}{reversed ? ` (${t('umgekehrt')})` : ''}</h3><span className="serif gold-text" style={{ fontSize: 22 }}>{c.symbol}</span></div>
      <div className="chips mt">{c.keywords.map((k) => <span key={k} className="badge gold">{k}</span>)}</div>
      <p className="small mt">{reversed ? c.reversed : c.upright}</p>
      <p className="small mt"><b>{t('Reflexion')}:</b> {c.question}</p>
    </div>
  );
}

type Mode = 'day' | 'three' | 'question' | 'all' | 'history';
const TITLES: Record<Mode, string> = { day: 'Tageskarte', three: 'Drei-Karten-Legung', question: 'Eigene Frage stellen', all: 'Alle Karten', history: 'Kartenhistorie' };

export default function TarotScreen() {
  const day = useToday();
  const nav = useNavigate();
  const { mode } = useParams();
  const tab = (mode as Mode | undefined) ?? null;
  const [browse, setBrowse] = useState(0);
  const [question, setQuestion] = useState('');
  const [current, setCurrent] = useState<TarotDraw | null>(null);
  const [detail, setDetail] = useState<TarotDraw | null>(null);
  const todayCard = useLiveQuery(() => db.tarotDraws.where('date').equals(day).filter((d) => d.spread === 'day').first(), [day]);
  const history = useLiveQuery(() => db.tarotDraws.orderBy('date').reverse().toArray(), []) ?? [];

  const drawDay = async () => {
    await db.tarotDraws.add({ date: day, spread: 'day', cards: drawCards(1), createdAt: Date.now() });
  };
  const drawThree = async (withQuestion: boolean) => {
    const draw: TarotDraw = { date: day, spread: 'three', question: withQuestion ? question.trim() || undefined : undefined, cards: drawCards(3), createdAt: Date.now() };
    const id = await db.tarotDraws.add(draw);
    setCurrent({ ...draw, id });
  };

  if (!tab) {
    return (
      <div className="screen">
        <HubHero title={t('Tarot & Orakel')} scene={{ variant: 'lanterns', seed: 17 }} emblem="cards" />
        {todayCard && (
          <button className="card tap row mb" onClick={() => nav('/spirit/tarot/day')}>
            <img src={cardImage(todayCard.cards[0].card)} alt="" style={{ width: 38, aspectRatio: '240 / 660', objectFit: 'cover', borderRadius: 4, transform: todayCard.cards[0].reversed ? 'rotate(180deg)' : undefined }} />
            <div className="grow"><div className="card-label">{t('Deine Tageskarte')}</div><div className="bold">{card(todayCard.cards[0].card).name}</div></div>
          </button>
        )}
        <ScrollMenu items={[
          { key: 'day', label: t('Tageskarte ziehen'), icon: <Sparkles size={20} />, to: '/spirit/tarot/day' },
          { key: 'three', label: t('Drei-Karten-Legung'), icon: <Layers size={20} />, to: '/spirit/tarot/three' },
          { key: 'question', label: t('Eigene Frage stellen'), icon: <HelpCircle size={20} />, to: '/spirit/tarot/question' },
          { key: 'all', label: t('Alle Karten'), icon: <LayoutGrid size={20} />, to: '/spirit/tarot/all' },
          { key: 'history', label: t('Kartenhistorie'), icon: <History size={20} />, badge: history.length || undefined, to: '/spirit/tarot/history' },
        ]} />
        <Hint>Die Karten sind Impulse zur Selbstreflexion und keine Vorhersage der Zukunft. Gezogen werden die 22 Großen Arkana; die Kartenbilder stammen aus deinem eigenen Kartenset.</Hint>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title={TITLES[tab]} back="/spirit/tarot" />

      {tab === 'day' && (
        <div className="stack">
          {todayCard ? (
            <>
              <div style={{ width: 'min(200px, 50vw)', margin: '0 auto' }}><CardFace card={todayCard.cards[0].card} reversed={todayCard.cards[0].reversed} /></div>
              <Interpretation card={todayCard.cards[0].card} reversed={todayCard.cards[0].reversed} />
              <Field label="Deine Gedanken zur Karte">
                <textarea className="textarea" defaultValue={todayCard.note ?? ''} onBlur={(e) => db.tarotDraws.update(todayCard.id!, { note: e.target.value })} placeholder={t('Was löst die Karte in dir aus?')} />
              </Field>
            </>
          ) : (
            <>
              <div style={{ width: 'min(200px, 50vw)', margin: '10px auto' }}><CardBack onClick={drawDay} /></div>
              <p className="center muted small">{t('Atme tief durch, denke an deinen Tag – und ziehe eine Karte.')}</p>
              <button className="btn" onClick={drawDay}><Layers size={18} /> {t('Tageskarte ziehen')}</button>
            </>
          )}
        </div>
      )}

      {(tab === 'three' || tab === 'question') && (
        <div className="stack">
          {tab === 'question' && (
            <Field label="Deine Frage"><input className="input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t('z. B. Was hilft mir gerade in meiner Situation?')} /></Field>
          )}
          <button className="btn" disabled={tab === 'question' && !question.trim()} onClick={() => drawThree(tab === 'question')}><Layers size={18} /> {t('Drei Karten legen')}</button>
          {current && (
            <>
              {current.question && <div className="parchment-card small serif" style={{ fontSize: 17 }}>{quote(current.question)}</div>}
              <div className="grid3">{current.cards.map((c, i) => <CardFace key={i} card={c.card} reversed={c.reversed} label={threeCardPositions()[i]} />)}</div>
              {current.cards.map((c, i) => <Interpretation key={i} card={c.card} reversed={c.reversed} position={threeCardPositions()[i]} />)}
            </>
          )}
        </div>
      )}

      {tab === 'all' && (
        <div className="stack">
          <div className="row" style={{ justifyContent: 'center', gap: 6 }}>
            <button className="icon-btn" aria-label={t('Vorherige Karte')} onClick={() => setBrowse((browse + 21) % 22)}><ChevronLeft size={26} /></button>
            <div style={{ width: 'min(190px, 48vw)' }}><CardFace card={browse} reversed={false} /></div>
            <button className="icon-btn" aria-label={t('Nächste Karte')} onClick={() => setBrowse((browse + 1) % 22)}><ChevronRight size={26} /></button>
          </div>
          <div className="hscroll">
            {MAJOR_ARCANA.map((c) => (
              <button key={c.n} onClick={() => setBrowse(c.n)} aria-label={card(c.n).name} style={{ border: browse === c.n ? '2px solid var(--gold)' : '2px solid transparent', borderRadius: 8, padding: 0, width: 44, background: 'none', overflow: 'hidden' }}>
                <img src={cardImage(c.n)} alt="" loading="lazy" style={{ width: '100%', display: 'block', aspectRatio: '240 / 660', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
          <Interpretation card={browse} reversed={false} />
          <div className="card small"><b>{t('Umgekehrt')}:</b> {card(browse).reversed}</div>
        </div>
      )}

      {tab === 'history' && (
        history.length ? (
          <div className="list">
            {history.map((h) => (
              <button key={h.id} className="list-item" onClick={() => setDetail(h)}>
                <span className="row" style={{ gap: 3 }}>{h.cards.map((c, i) => <img key={i} src={cardImage(c.card)} alt="" loading="lazy" style={{ width: 22, aspectRatio: '240 / 660', objectFit: 'cover', borderRadius: 3, transform: c.reversed ? 'rotate(180deg)' : undefined }} />)}</span>
                <div className="grow">
                  <div className="title">{h.cards.map((c) => card(c.card).name + (c.reversed ? ' ↺' : '')).join(' · ')}</div>
                  <div className="meta">{fmtShort(h.date)} · {h.spread === 'day' ? t('Tageskarte') : t('Drei-Karten-Legung')}{h.question ? ` · „${h.question}“` : ''}</div>
                </div>
              </button>
            ))}
          </div>
        ) : <div className="card"><Empty text="Noch keine Karten gezogen." /></div>
      )}

      <Sheet open={!!detail} onClose={() => setDetail(null)} title={detail ? fmtShort(detail.date) : ''} actions={detail && <button className="btn danger" onClick={async () => { await db.tarotDraws.delete(detail.id!); setDetail(null); }}><Trash2 size={18} /> {t('Löschen')}</button>}>
        {detail && (
          <div className="stack">
            {detail.question && <div className="parchment-card small">{quote(detail.question)}</div>}
            {detail.cards.map((c, i) => <Interpretation key={i} card={c.card} reversed={c.reversed} position={detail.spread === 'three' ? threeCardPositions()[i] : undefined} />)}
            {detail.note && <div className="card"><div className="card-label">{t('Deine Notiz')}</div><p className="small">{detail.note}</p></div>}
          </div>
        )}
      </Sheet>
    </div>
  );
}
