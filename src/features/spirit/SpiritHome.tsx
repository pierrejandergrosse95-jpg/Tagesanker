import { useLiveQuery } from 'dexie-react-hooks';
import { BookHeart, ChevronRight, Flower2, Heart, Layers, Moon, Sparkles, Star, UserRound, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { monthlyGuidance, weeklyImpulse } from '../../core/astro/guidance';
import { PHASE_NAMES, upcomingMoonEvents } from '../../core/astro/moon';
import { fmtDayMonth, fmtLong, isoWeek, toISO } from '../../core/dates';
import { db } from '../../core/db';
import { useToday } from '../../core/hooks';
import { Hint, MoonGlyph, TopBar } from '../../ui/components';
import { Scene } from '../../ui/scenes';
import { MAJOR_ARCANA } from '../../content/tarot';
import { toggleLike, useDailySpirit } from './useSpirit';

export function SpiritNav({ active }: { active: string }) {
  const nav = useNavigate();
  const items = [
    { to: '/spirit', label: 'Heute' }, { to: '/spirit/meditation', label: 'Meditation' }, { to: '/spirit/moon', label: 'Mond' },
    { to: '/spirit/profile', label: 'Astrologie' }, { to: '/spirit/tarot', label: 'Tarot' }, { to: '/spirit/journal', label: 'Tagebuch' },
  ];
  return (
    <div className="hscroll mb">
      {items.map((i) => <button key={i.to} className={`chip ${active === i.to ? 'active' : ''}`} onClick={() => nav(i.to, { replace: true })}>{i.label}</button>)}
    </div>
  );
}

export default function SpiritHome() {
  const day = useToday();
  const nav = useNavigate();
  const spirit = useDailySpirit(day);
  const todayCard = useLiveQuery(() => db.tarotDraws.where('date').equals(day).filter((d) => d.spread === 'day').first(), [day]);
  const next = upcomingMoonEvents(day, 2);

  return (
    <div className="screen spirit-screen">
      <TopBar title="Spiritualität" sub="Meine innere Reise" actions={<button className="icon-btn" aria-label="Geburtsprofil" onClick={() => nav('/spirit/profile')}><UserRound size={22} /></button>} />
      <SpiritNav active="/spirit" />
      {spirit && (
        <div className="stack">
          <div className="card cosmic" style={{ padding: 20 }}>
            <div style={{ height: 150, margin: '-20px -20px 14px' }}><Scene variant="lanterns" animal="none" seed={41} /></div>
            <div className="row between">
              <span className="badge gold">{spirit.impulse.topic}</span>
              <button className="icon-btn" style={{ color: '#f1e4c4' }} aria-label="Merken" onClick={() => void toggleLike(day)}><Heart size={20} fill={spirit.liked ? '#c9a55c' : 'none'} color="#c9a55c" /></button>
            </div>
            <h2 className="mt" style={{ fontSize: 15, color: '#c7bfae', fontFamily: 'var(--sans)', fontWeight: 500 }}>Dein Tagesimpuls · {fmtLong(day)}</h2>
            <p className="serif" style={{ fontSize: 21, lineHeight: 1.4, marginTop: 8 }}>„{spirit.impulse.text}“</p>
            <div className="divider" style={{ background: 'rgb(255 255 255 / .12)' }} />
            <div className="small muted">Reflexionsfrage</div>
            <div className="mt" style={{ marginTop: 4 }}>{spirit.impulse.question}</div>
            <button className="btn secondary sm mt" onClick={() => nav(`/spirit/journal?prompt=${encodeURIComponent(spirit.impulse.question)}`)}><BookHeart size={16} /> Im Tagebuch beantworten</button>
          </div>

          <button className="card tap row" onClick={() => nav('/spirit/moon')}>
            <MoonGlyph illumination={spirit.moon.illumination} waxing={spirit.moon.waxing} size={58} />
            <div className="grow">
              <div className="card-label">Aktuelle Mondphase</div>
              <div className="bold">{spirit.moon.name}</div>
              <div className="small muted">{Math.round(spirit.moon.illumination * 100)} % beleuchtet{next[0] ? ` · ${PHASE_NAMES[next[0].phase]} am ${fmtDayMonth(toISO(next[0].date))}` : ''}</div>
            </div>
            <ChevronRight size={18} className="faint" />
          </button>

          {spirit.sign ? (
            <>
              <button className="card tap" onClick={() => nav('/spirit/profile')}>
                <div className="row">
                  <span className="serif gold-text" style={{ fontSize: 34 }}>{spirit.sign.symbol}</span>
                  <div className="grow">
                    <div className="card-label">Wochenimpuls · KW {isoWeek(day)}</div>
                    <div className="bold">{spirit.sign.name} · Element {spirit.sign.element}</div>
                  </div>
                </div>
                <p className="mt small">{weeklyImpulse(day, spirit.sign.element)}</p>
              </button>
              {(() => {
                const m = monthlyGuidance(day, spirit.sign);
                return (
                  <div className="card gold">
                    <div className="card-label">Monatsimpuls · Sonne in {m.sunSign.name} {m.sunSign.symbol}</div>
                    <div className="bold mt" style={{ marginTop: 4 }}>{m.theme}</div>
                    <p className="small mt" style={{ marginTop: 4 }}>{m.text}</p>
                  </div>
                );
              })()}
            </>
          ) : (
            <button className="card tap row" onClick={() => nav('/spirit/profile')}>
              <Star size={22} className="gold-text" />
              <div className="grow"><div className="bold">Geburtsprofil anlegen</div><div className="small muted">Für Sternzeichen, persönliche Wochen- und Monatsimpulse.</div></div>
              <ChevronRight size={18} className="faint" />
            </button>
          )}

          <div className="grid2">
            <button className="card tap tile" onClick={() => nav('/spirit/meditation')}><span className="icon-wrap"><Flower2 size={18} /></span><div className="bold">Meditation</div><div className="tiny muted">Geführt, Timer, eigene Audios</div></button>
            <button className="card tap tile" onClick={() => nav('/spirit/meditation/breath-box')}><span className="icon-wrap"><Wind size={18} /></span><div className="bold">Atemübung</div><div className="tiny muted">Box-Atmung, 4-7-8 …</div></button>
            <button className="card tap tile" onClick={() => nav('/spirit/tarot')}><span className="icon-wrap"><Layers size={18} /></span><div className="bold">Tageskarte</div><div className="tiny muted">{todayCard ? MAJOR_ARCANA[todayCard.cards[0].card].name : 'Noch nicht gezogen'}</div></button>
            <button className="card tap tile" onClick={() => nav('/spirit/journal')}><span className="icon-wrap"><BookHeart size={18} /></span><div className="bold">Tagebuch</div><div className="tiny muted">Gedanken, Dankbarkeit</div></button>
          </div>
          <Hint>Astrologie, Tarot und Impulse sind spirituelle Anregungen zur Selbstreflexion – keine wissenschaftlich gesicherten Aussagen oder Vorhersagen. <Sparkles size={11} /> <Moon size={11} /></Hint>
        </div>
      )}
    </div>
  );
}
