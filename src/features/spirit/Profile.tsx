import { useEffect, useMemo, useState } from 'react';
import { CITIES, elementName, fmtDeg, germanTzOffset, modalityName, natalChart, profileSign } from '../../core/astro/zodiac';
import { fmtLong, fmtShort } from '../../core/dates';
import { db } from '../../core/db';
import { useProfile, useToday } from '../../core/hooks';
import type { Profile } from '../../core/types';
import { Field, Hint, useUi } from '../../ui/components';
import { HubHero, ScrollMenu } from '../../ui/hub';
import { t } from '../../i18n';
import { Bell, CalendarDays, Scale, Sparkles, Sprout, Star, UserRound } from 'lucide-react';
import { monthlyGuidance } from '../../core/astro/guidance';

export function BirthForm({ value, onChange }: { value: Profile; onChange: (p: Profile) => void }) {
  const set = (p: Partial<Profile>) => onChange({ ...value, ...p });
  const cityMatch = CITIES.find((c) => c.name === value.birthPlace);
  return (
    <div className="form">
      <Field label="Geburtsdatum"><input className="input" type="date" value={value.birthDate ?? ''} onChange={(e) => set({ birthDate: e.target.value || undefined })} /></Field>
      <Field label="Geburtszeit (optional)"><input className="input" type="time" value={value.birthTime ?? ''} onChange={(e) => set({ birthTime: e.target.value || undefined })} /></Field>
      <Field label="Geburtsort (optional)">
        <input className="input" list="kt-cities" value={value.birthPlace ?? ''} placeholder={t('Stadt wählen oder eingeben')} onChange={(e) => {
          const c = CITIES.find((x) => x.name.toLowerCase() === e.target.value.toLowerCase());
          set({ birthPlace: e.target.value || undefined, ...(c ? { lat: c.lat, lon: c.lon } : {}) });
        }} />
        <datalist id="kt-cities">{CITIES.map((c) => <option key={c.name} value={c.name} />)}</datalist>
      </Field>
      {value.birthPlace && !cityMatch && (
        <div className="grid2">
          <Field label="Breitengrad (N)"><input className="input" type="number" step="0.01" value={value.lat ?? ''} onChange={(e) => set({ lat: e.target.value === '' ? undefined : Number(e.target.value) })} /></Field>
          <Field label="Längengrad (O)"><input className="input" type="number" step="0.01" value={value.lon ?? ''} onChange={(e) => set({ lon: e.target.value === '' ? undefined : Number(e.target.value) })} /></Field>
        </div>
      )}
    </div>
  );
}

export default function ProfileScreen() {
  const stored = useProfile();
  const day = useToday();
  const { toast } = useUi();
  const [p, setP] = useState<Profile>({ id: 'me' });
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (stored) setP(stored);
    else setEditing(true);
  }, [stored]);
  const sign = useMemo(() => profileSign(stored), [stored]);
  const chart = useMemo(() => (stored?.birthTime ? natalChart(stored) : null), [stored]);
  const month = sign ? monthlyGuidance(day, sign) : null;

  const save = async () => {
    const tz = p.birthDate ? germanTzOffset(p.birthDate, p.birthTime) : undefined;
    await db.profile.put({ ...p, id: 'me', tzOffsetMin: p.tzOffsetMin ?? tz });
    setEditing(false);
    toast(t('Profil gespeichert'));
  };

  const ul = (items: string[]) => <ul className="small" style={{ paddingLeft: 18, margin: '4px 0 0' }}>{items.map((x) => <li key={x} style={{ marginBottom: 3 }}>{x}</li>)}</ul>;

  if (editing || !sign) {
    return (
      <div className="screen">
        <HubHero title={t('Geburtsprofil')} scene={{ variant: 'night', seed: 37 }} emblem="star" />
        <div className="card stack">
          <h3>{t('Dein Geburtsprofil')}</h3>
          <p className="small muted">{t('Aus dem Geburtsdatum bestimmt Tagesanker dein Sternzeichen. Mit Geburtszeit und -ort entsteht zusätzlich ein vereinfachtes Geburtshoroskop (Sonne, Mond, Aszendent).')}</p>
          <BirthForm value={p} onChange={setP} />
          {p.birthDate && p.birthTime && (
            <Field label="Zeitzone zur Geburt">
              <select className="select" value={p.tzOffsetMin ?? germanTzOffset(p.birthDate, p.birthTime)} onChange={(e) => setP({ ...p, tzOffsetMin: Number(e.target.value) })}>
                {[-300, -240, 0, 60, 120, 180, 240, 330, 480, 540].map((m) => <option key={m} value={m}>{t('UTC')}{m >= 0 ? '+' : '−'}{Math.abs(m / 60)}{m === 60 ? ` (${t('MEZ')})` : m === 120 ? ` (${t('MESZ / Sommerzeit')})` : ''}</option>)}
              </select>
            </Field>
          )}
          <button className="btn" disabled={!p.birthDate} onClick={save}>{t('Speichern')}</button>
          <Hint>{t('Geburtsdaten bleiben ausschließlich auf deinem Gerät.')}</Hint>
        </div>
      </div>
    );
  }

  const chartContent = chart ? (
    <div className="card">
      <div className="list" style={{ boxShadow: 'none' }}>
        <div className="list-item"><span className="serif gold-text" style={{ fontSize: 22, width: 28 }}>☉</span><div className="grow"><div className="title">{t('Sonne in {s}', { s: chart.sun.name })} {chart.sun.symbol}</div><div className="meta">{fmtDeg(chart.sunDeg)} · {t('Wesenskern, Lebenskraft')}</div></div></div>
        <div className="list-item"><span className="serif gold-text" style={{ fontSize: 22, width: 28 }}>☽</span><div className="grow"><div className="title">{t('Mond in {s}', { s: chart.moon.name })} {chart.moon.symbol}</div><div className="meta">{fmtDeg(chart.moonDeg)} · {t('Gefühlswelt, Bedürfnisse')}</div></div></div>
        {chart.asc ? (
          <div className="list-item"><span className="serif gold-text" style={{ fontSize: 18, width: 28 }}>{t('AC')}</span><div className="grow"><div className="title">{t('Aszendent {s}', { s: chart.asc.name })} {chart.asc.symbol}</div><div className="meta">{fmtDeg(chart.ascDeg!)} · {t('Ausstrahlung, erster Eindruck')}</div></div></div>
        ) : <div className="list-item small muted">{t('Für den Aszendenten bitte den Geburtsort ergänzen.')}</div>}
      </div>
      <p className="small mt">{t('Dein Mond in {s} steht in der Deutung für emotionale Bedürfnisse rund um {k}.', { s: chart.moon.name, k: chart.moon.keywords.join(', ').toLowerCase() })}</p>
    </div>
  ) : <Hint>{t('Mit Geburtszeit (und Ort) kannst du zusätzlich Mondzeichen und Aszendent berechnen lassen.')}</Hint>;

  return (
    <div className="screen">
      <HubHero title={t('Geburtsprofil')} scene={{ variant: 'night', seed: 37 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', color: '#f3e3b8', zIndex: 1, textShadow: '0 2px 10px rgb(0 0 0 / .7)' }}>
          <div className="serif" style={{ fontSize: 'clamp(44px, 12vw, 64px)', lineHeight: 1, color: '#f0d48e' }}>{sign.symbol}</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 26 }}>{sign.name}</div>
          <div className="serif" style={{ fontSize: 16 }}>{stored?.birthDate ? fmtLong(stored.birthDate).replace(/^[^,]+, /, '') : ''}</div>
        </div>
      </HubHero>
      <ScrollMenu initialOpen="profile" items={[
        { key: 'profile', label: t('Dein Profil'), icon: <UserRound size={20} />, content: (
          <div className="card stack">
            <div className="small">{sign.range} · {elementName(sign.element)} · {modalityName(sign.modality)} · {t('Herrscher')}: {sign.ruler}</div>
            <div className="chips">{sign.keywords.map((k) => <span key={k} className="badge gold">{k}</span>)}</div>
            <div className="small muted">{t('Geboren am')} {stored?.birthDate ? fmtShort(stored.birthDate) : '–'}{stored?.birthTime ? `, ${stored.birthTime} ${t('Uhr')}` : ''}{stored?.birthPlace ? ` · ${stored.birthPlace}` : ''}</div>
            <button className="btn sm secondary" onClick={() => setEditing(true)}>{t('Ändern')}</button>
          </div>
        ) },
        { key: 'traits', label: t('Eigenschaften'), icon: <Sparkles size={20} />, content: <div className="card"><p className="small">{sign.traits}</p></div> },
        { key: 'sc', label: t('Stärken & Herausforderungen'), icon: <Scale size={20} />, content: (
          <div className="grid2">
            <div className="card"><h3>{t('Stärken')}</h3>{ul(sign.strengths)}</div>
            <div className="card"><h3>{t('Herausforderungen')}</h3>{ul(sign.challenges)}</div>
          </div>
        ) },
        { key: 'growth', label: t('Entwicklungsthemen'), icon: <Sprout size={20} />, content: <div className="card">{ul(sign.growth)}</div> },
        { key: 'month', label: t('Aktueller Monat'), icon: <CalendarDays size={20} />, content: month && (
          <div className="card">
            <div className="card-label">{t('Sonne in {s}', { s: month.sunSign.name })} {month.sunSign.symbol}</div>
            <div className="bold" style={{ marginTop: 4 }}>{month.theme}</div>
            <p className="small" style={{ marginTop: 4 }}>{month.text}</p>
          </div>
        ) },
        { key: 'chart', label: t('Geburtshoroskop'), icon: <Star size={20} />, content: chartContent },
        { key: 'impulses', label: t('Deine Tagesimpulse'), icon: <Bell size={20} />, to: '/spirit/impulse' },
      ]} />
      <Hint>{t('Astrologische Aussagen sind spirituelle Interpretationen und keine wissenschaftlich gesicherten Tatsachen. Die Positionen werden astronomisch berechnet (Genauigkeit ca. 1°).')}</Hint>
    </div>
  );
}
