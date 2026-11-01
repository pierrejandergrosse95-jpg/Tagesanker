import { BookOpen, ChevronLeft, ChevronRight, Flame, HelpCircle, Moon as MoonIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { moonEventsBetween, moonInfo, PHASE_KEY_NAMES, type MoonPhaseKey } from '../../core/astro/moon';
import { addDays, addMonths, daysInRange, endOfMonth, fmtLong, fmtMonthYear, fromISO, startOfMonth, startOfWeek, toISO, weekdaysLong, weekdaysShort } from '../../core/dates';
import { useToday } from '../../core/hooks';
import { moonMeaning } from '../../content/moon';
import { locale, t } from '../../i18n';
import { Hint, MoonGlyph, Segmented } from '../../ui/components';
import { HubHero, ScrollMenu } from '../../ui/hub';
import { moonName, phaseName } from './moonText';

const ul = (items: string[]) => <ul className="small" style={{ paddingLeft: 18, margin: 0 }}>{items.map((q) => <li key={q} style={{ marginBottom: 4 }}>{q}</li>)}</ul>;

export default function MoonScreen() {
  const day = useToday();
  const now = useMemo(() => moonInfo(new Date()), [day]); // eslint-disable-line react-hooks/exhaustive-deps
  const [tab, setTab] = useState<MoonPhaseKey>(now.key);
  const [cursor, setCursor] = useState(startOfMonth(day));
  const events = useMemo(() => moonEventsBetween(day, addDays(day, 90)), [day]);
  const gridStart = startOfWeek(cursor);
  const gridEnd = addDays(startOfWeek(endOfMonth(cursor)), 6);
  const monthEvents = useMemo(() => new Map(moonEventsBetween(gridStart, gridEnd).map((e) => [toISO(e.date), e])), [gridStart, gridEnd]);
  const current = moonMeaning(now.key);
  const meaning = moonMeaning(tab);

  const allPhases = (
    <div className="stack">
      <div className="list">
        {events.slice(0, 6).map((e, i) => (
          <div key={i} className="list-item">
            <MoonGlyph illumination={[0, 0.5, 1, 0.5][e.phase]} waxing={e.phase <= 1} size={30} />
            <div className="grow"><div className="title">{phaseName(e.phase)}</div><div className="meta">{weekdaysLong()[e.date.getDay()]}, {e.date.toLocaleDateString(locale())} · {e.date.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })}</div></div>
          </div>
        ))}
      </div>
      <div className="row between">
        <button className="icon-btn" aria-label={t('Vorheriger Monat')} onClick={() => setCursor(addMonths(cursor, -1, 1))}><ChevronLeft /></button>
        <h2>{fmtMonthYear(cursor)}</h2>
        <button className="icon-btn" aria-label={t('Nächster Monat')} onClick={() => setCursor(addMonths(cursor, 1, 1))}><ChevronRight /></button>
      </div>
      <div className="card" style={{ padding: 10 }}>
        <div className="cal-grid">
          {[1, 2, 3, 4, 5, 6, 0].map((d) => <div key={d} className="cal-head">{weekdaysShort()[d]}</div>)}
          {daysInRange(gridStart, gridEnd).map((d) => {
            const m = moonInfo(d);
            const ev = monthEvents.get(d);
            return (
              <div key={d} className={`cal-cell ${d.slice(0, 7) !== cursor.slice(0, 7) ? 'other' : ''} ${d === day ? 'today' : ''}`} title={ev ? phaseName(ev.phase) : moonName(m)}>
                <span className="num" style={{ fontSize: 12, width: 22, height: 22 }}>{fromISO(d).getDate()}</span>
                <span style={{ outline: ev ? '1.5px solid var(--gold)' : undefined, borderRadius: '50%', lineHeight: 0 }}><MoonGlyph illumination={m.illumination} waxing={m.waxing} size={18} /></span>
              </div>
            );
          })}
        </div>
      </div>
      <Segmented value={tab} onChange={setTab} options={(['new', 'waxing', 'full', 'waning'] as MoonPhaseKey[]).map((k) => ({ value: k, label: PHASE_KEY_NAMES[k].replace(' Mond', '') }))} />
      <div className="card">
        <h3>{meaning.title}</h3>
        <div className="small gold-text bold">{meaning.energy}</div>
        <p className="mt small">{meaning.meaning}</p>
      </div>
    </div>
  );

  return (
    <div className="screen">
      <HubHero title={t('Mondkalender')} scene={{ variant: 'night', seed: 31 }}>
        <div style={{ position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)', zIndex: 1, filter: 'drop-shadow(0 0 18px rgb(255 240 200 / .45))' }}><MoonGlyph illumination={now.illumination} waxing={now.waxing} size={72} /></div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(var(--safe-top) + 48px)', textAlign: 'center', color: '#f3e3b8', zIndex: 1, textShadow: '0 2px 10px rgb(0 0 0 / .8)' }}>
          <div className="small">{t('Aktuelle Phase')}</div>
          <div className="serif" style={{ fontSize: 20 }}>{moonName(now)}</div>
          <div className="small">({fmtLong(day)})</div>
        </div>
      </HubHero>
      <div className="small muted center mb">{t('{p} % beleuchtet · Mondalter {a} Tage', { p: Math.round(now.illumination * 100), a: now.age.toFixed(1) })}</div>
      <ScrollMenu initialOpen="meaning" items={[
        { key: 'meaning', label: t('Bedeutung der Phase'), icon: <BookOpen size={20} />, content: <div className="card"><div className="small gold-text bold">{current.energy}</div><p className="small mt">{current.meaning}</p></div> },
        { key: 'questions', label: t('Reflexionsfragen'), icon: <HelpCircle size={20} />, content: <div className="card">{ul(current.questions)}</div> },
        { key: 'rituals', label: t('Ritualideen'), icon: <Flame size={20} />, content: <div className="card">{ul(current.rituals)}</div> },
        { key: 'all', label: t('Alle Mondphasen'), icon: <MoonIcon size={20} />, content: allPhases },
      ]} />
      <Hint>Mondphasen werden astronomisch berechnet (Meeus, Genauigkeit wenige Minuten). Die Deutungen sind spirituelle Anregungen.</Hint>
    </div>
  );
}
