import { useMemo, useState } from 'react';
import { moonEventsBetween, moonInfo, PHASE_KEY_NAMES, PHASE_NAMES, type MoonPhaseKey } from '../../core/astro/moon';
import { addDays, addMonths, daysInRange, endOfMonth, fmtLong, fmtMonthYear, fromISO, startOfMonth, startOfWeek, toISO, WEEKDAYS_LONG, WEEKDAYS_SHORT } from '../../core/dates';
import { useToday } from '../../core/hooks';
import { MOON_MEANINGS } from '../../content/moon';
import { Hint, MoonGlyph, Segmented, TopBar } from '../../ui/components';
import { SpiritNav } from './SpiritHome';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MoonScreen() {
  const day = useToday();
  const now = useMemo(() => moonInfo(new Date()), [day]); // eslint-disable-line react-hooks/exhaustive-deps
  const [tab, setTab] = useState<MoonPhaseKey>(now.key);
  const [cursor, setCursor] = useState(startOfMonth(day));
  const events = useMemo(() => moonEventsBetween(day, addDays(day, 90)), [day]);
  const gridStart = startOfWeek(cursor);
  const gridEnd = addDays(startOfWeek(endOfMonth(cursor)), 6);
  const monthEvents = useMemo(() => new Map(moonEventsBetween(gridStart, gridEnd).map((e) => [toISO(e.date), e])), [gridStart, gridEnd]);
  const meaning = MOON_MEANINGS[tab];

  return (
    <div className="screen spirit-screen">
      <TopBar title="Mondkalender" />
      <SpiritNav active="/spirit/moon" />
      <div className="stack">
        <div className="card cosmic center" style={{ padding: 22 }}>
          <MoonGlyph illumination={now.illumination} waxing={now.waxing} size={120} />
          <h1 className="mt">{now.name}</h1>
          <div className="small muted">{Math.round(now.illumination * 100)} % beleuchtet · Mondalter {now.age.toFixed(1).replace('.', ',')} Tage</div>
          <div className="small faint mt">{fmtLong(day)}</div>
        </div>

        <div className="section-title" style={{ marginTop: 6 }}><h2>Nächste Mondphasen</h2></div>
        <div className="list">
          {events.slice(0, 6).map((e, i) => (
            <div key={i} className="list-item">
              <MoonGlyph illumination={[0, 0.5, 1, 0.5][e.phase]} waxing={e.phase <= 1} size={30} />
              <div className="grow"><div className="title">{PHASE_NAMES[e.phase]}</div><div className="meta">{WEEKDAYS_LONG[e.date.getDay()]}, {e.date.toLocaleDateString('de-DE')} · {e.date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</div></div>
            </div>
          ))}
        </div>

        <div className="row between mt">
          <button className="icon-btn" aria-label="Vorheriger Monat" onClick={() => setCursor(addMonths(cursor, -1, 1))}><ChevronLeft /></button>
          <h2>{fmtMonthYear(cursor)}</h2>
          <button className="icon-btn" aria-label="Nächster Monat" onClick={() => setCursor(addMonths(cursor, 1, 1))}><ChevronRight /></button>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div className="cal-grid">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => <div key={d} className="cal-head">{WEEKDAYS_SHORT[d]}</div>)}
            {daysInRange(gridStart, gridEnd).map((d) => {
              const m = moonInfo(d);
              const ev = monthEvents.get(d);
              return (
                <div key={d} className={`cal-cell ${d.slice(0, 7) !== cursor.slice(0, 7) ? 'other' : ''} ${d === day ? 'today' : ''}`} title={ev ? PHASE_NAMES[ev.phase] : m.name}>
                  <span className="num" style={{ fontSize: 12, width: 22, height: 22 }}>{fromISO(d).getDate()}</span>
                  <span style={{ outline: ev ? '1.5px solid var(--gold)' : undefined, borderRadius: '50%', lineHeight: 0 }}><MoonGlyph illumination={m.illumination} waxing={m.waxing} size={18} /></span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="section-title"><h2>Bedeutung der Phasen</h2></div>
        <Segmented value={tab} onChange={setTab} options={(['new', 'waxing', 'full', 'waning'] as MoonPhaseKey[]).map((k) => ({ value: k, label: PHASE_KEY_NAMES[k].replace(' Mond', '') }))} />
        <div className="card">
          <h3>{meaning.title}</h3>
          <div className="small gold-text bold">{meaning.energy}</div>
          <p className="mt small">{meaning.meaning}</p>
        </div>
        <div className="card">
          <h3>Reflexionsfragen</h3>
          <ul className="small" style={{ paddingLeft: 18, margin: '8px 0 0' }}>{meaning.questions.map((q) => <li key={q} style={{ marginBottom: 4 }}>{q}</li>)}</ul>
        </div>
        <div className="card tint">
          <h3>Ritualideen</h3>
          <ul className="small" style={{ paddingLeft: 18, margin: '8px 0 0' }}>{meaning.rituals.map((q) => <li key={q} style={{ marginBottom: 4 }}>{q}</li>)}</ul>
        </div>
        <Hint>Mondphasen werden astronomisch berechnet (Meeus, Genauigkeit wenige Minuten). Die Deutungen sind spirituelle Anregungen.</Hint>
      </div>
    </div>
  );
}
