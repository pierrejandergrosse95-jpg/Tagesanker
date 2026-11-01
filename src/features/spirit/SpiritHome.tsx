import { BookHeart, ChevronRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { topicName } from '../../content/impulses';
import { moonMeaning } from '../../content/moon';
import { monthlyGuidance, weeklyImpulse } from '../../core/astro/guidance';
import { upcomingMoonEvents } from '../../core/astro/moon';
import { elementName } from '../../core/astro/zodiac';
import { fmtDayMonth, fmtLong, isoWeek, toISO } from '../../core/dates';
import { useToday } from '../../core/hooks';
import { t, quote } from '../../i18n';
import { Hint, MoonGlyph } from '../../ui/components';
import { HubHero } from '../../ui/hub';
import { moonName, phaseName } from './moonText';
import { toggleLike, useDailySpirit } from './useSpirit';

/** Seite „Tagesimpuls“: Impuls des Tages, Mond, Wochen- und Monatsimpuls. */
export default function SpiritHome() {
  const day = useToday();
  const nav = useNavigate();
  const spirit = useDailySpirit(day);
  const next = upcomingMoonEvents(day, 1);

  return (
    <div className="screen">
      <HubHero title={t('Tagesimpuls')} sub={fmtLong(day)} scene={{ variant: 'lanterns', lanterns: 12, seed: 41 }} emblem="candle" />
      {spirit && (
        <div className="stack">
          <div className="parchment-card">
            <div className="row between">
              <span className="badge gold">{topicName(spirit.impulse.topic)}</span>
              <button className="icon-btn" style={{ color: '#8a2c38' }} aria-label={t('Merken')} onClick={() => void toggleLike(day)}><Heart size={20} fill={spirit.liked ? '#8a2c38' : 'none'} /></button>
            </div>
            <p className="serif" style={{ fontSize: 21, lineHeight: 1.4, marginTop: 6, fontStyle: 'italic' }}>{quote(spirit.impulse.text)}</p>
            <div className="divider" style={{ background: 'rgb(120 80 30 / .25)' }} />
            <div className="small muted">{t('Reflexionsfrage')}</div>
            <div style={{ marginTop: 4 }}>{spirit.impulse.question}</div>
            <button className="btn sm mt" onClick={() => nav(`/spirit/journal/new?prompt=${encodeURIComponent(spirit.impulse.question)}`)}><BookHeart size={16} /> {t('Im Tagebuch beantworten')}</button>
          </div>

          <button className="card tap row" onClick={() => nav('/spirit/moon')}>
            <MoonGlyph illumination={spirit.moon.illumination} waxing={spirit.moon.waxing} size={58} />
            <div className="grow">
              <div className="card-label">{t('Aktuelle Mondphase')}</div>
              <div className="bold">{moonName(spirit.moon)}</div>
              <div className="small muted">{moonMeaning(spirit.moon.key).energy}{next[0] ? ` · ${phaseName(next[0].phase)} ${fmtDayMonth(toISO(next[0].date))}` : ''}</div>
            </div>
            <ChevronRight size={18} className="faint" />
          </button>

          {spirit.sign ? (
            <>
              <div className="card">
                <div className="row">
                  <span className="serif gold-text" style={{ fontSize: 34 }}>{spirit.sign.symbol}</span>
                  <div className="grow">
                    <div className="card-label">{t('Wochenimpuls')} · {t('KW')} {isoWeek(day)}</div>
                    <div className="bold">{spirit.sign.name} · {t('Element')} {elementName(spirit.sign.element)}</div>
                  </div>
                </div>
                <p className="mt small">{weeklyImpulse(day, spirit.sign.element)}</p>
              </div>
              {(() => {
                const m = monthlyGuidance(day, spirit.sign);
                return (
                  <div className="card gold">
                    <div className="card-label">{t('Monatsimpuls')} · {t('Sonne in {s}', { s: m.sunSign.name })} {m.sunSign.symbol}</div>
                    <div className="bold" style={{ marginTop: 4 }}>{m.theme}</div>
                    <p className="small" style={{ marginTop: 4 }}>{m.text}</p>
                  </div>
                );
              })()}
            </>
          ) : (
            <button className="scroll-btn" onClick={() => nav('/spirit/profile')}>
              <span className="lbl">{t('Geburtsprofil anlegen – für persönliche Wochen- und Monatsimpulse')}</span>
              <ChevronRight size={20} className="chev" />
            </button>
          )}
          <Hint>{t('Astrologie, Tarot und Impulse sind spirituelle Anregungen zur Selbstreflexion – keine wissenschaftlich gesicherten Aussagen oder Vorhersagen.')}</Hint>
        </div>
      )}
    </div>
  );
}
