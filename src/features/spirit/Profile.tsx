import { useEffect, useMemo, useState } from 'react';
import { CITIES, fmtDeg, germanTzOffset, natalChart, profileSign } from '../../core/astro/zodiac';
import { fmtShort } from '../../core/dates';
import { db } from '../../core/db';
import { useProfile, useToday } from '../../core/hooks';
import type { Profile } from '../../core/types';
import { Field, Hint, TopBar, useUi } from '../../ui/components';
import { SpiritNav } from './SpiritHome';
import { monthlyGuidance } from '../../core/astro/guidance';

export function BirthForm({ value, onChange }: { value: Profile; onChange: (p: Profile) => void }) {
  const set = (p: Partial<Profile>) => onChange({ ...value, ...p });
  const cityMatch = CITIES.find((c) => c.name === value.birthPlace);
  return (
    <div className="form">
      <Field label="Geburtsdatum"><input className="input" type="date" value={value.birthDate ?? ''} onChange={(e) => set({ birthDate: e.target.value || undefined })} /></Field>
      <Field label="Geburtszeit (optional)"><input className="input" type="time" value={value.birthTime ?? ''} onChange={(e) => set({ birthTime: e.target.value || undefined })} /></Field>
      <Field label="Geburtsort (optional)">
        <input className="input" list="kt-cities" value={value.birthPlace ?? ''} placeholder="Stadt wählen oder eingeben" onChange={(e) => {
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
    toast('Profil gespeichert');
  };

  return (
    <div className="screen spirit-screen">
      <TopBar title="Astrologie" sub="Persönliches Geburtsprofil" />
      <SpiritNav active="/spirit/profile" />
      {editing || !sign ? (
        <div className="card stack">
          <h3>Dein Geburtsprofil</h3>
          <p className="small muted">Aus dem Geburtsdatum bestimmt KlarTakt dein Sternzeichen. Mit Geburtszeit und -ort entsteht zusätzlich ein vereinfachtes Geburtshoroskop (Sonne, Mond, Aszendent).</p>
          <BirthForm value={p} onChange={setP} />
          {p.birthDate && p.birthTime && (
            <Field label="Zeitzone zur Geburt">
              <select className="select" value={p.tzOffsetMin ?? germanTzOffset(p.birthDate, p.birthTime)} onChange={(e) => setP({ ...p, tzOffsetMin: Number(e.target.value) })}>
                {[-300, -240, 0, 60, 120, 180, 240, 330, 480, 540].map((m) => <option key={m} value={m}>UTC{m >= 0 ? '+' : '−'}{Math.abs(m / 60)}{m === 60 ? ' (MEZ)' : m === 120 ? ' (MESZ / Sommerzeit)' : ''}</option>)}
              </select>
            </Field>
          )}
          <button className="btn" disabled={!p.birthDate} onClick={save}>Speichern</button>
          <Hint>Geburtsdaten bleiben ausschließlich auf deinem Gerät.</Hint>
        </div>
      ) : (
        <div className="stack">
          <div className="card cosmic center" style={{ padding: 24 }}>
            <div className="serif gold-text" style={{ fontSize: 64, lineHeight: 1 }}>{sign.symbol}</div>
            <h1 className="mt">{sign.name}</h1>
            <div className="small muted">{sign.range} · {sign.element} · {sign.modality} · Herrscher: {sign.ruler}</div>
            <div className="chips mt" style={{ justifyContent: 'center' }}>{sign.keywords.map((k) => <span key={k} className="badge gold">{k}</span>)}</div>
          </div>
          <div className="card"><h3>Typische Eigenschaften</h3><p className="mt small">{sign.traits}</p></div>
          <div className="grid2">
            <div className="card"><h3>Stärken</h3><ul className="small" style={{ paddingLeft: 18, margin: '8px 0 0' }}>{sign.strengths.map((s) => <li key={s}>{s}</li>)}</ul></div>
            <div className="card"><h3>Herausforderungen</h3><ul className="small" style={{ paddingLeft: 18, margin: '8px 0 0' }}>{sign.challenges.map((s) => <li key={s}>{s}</li>)}</ul></div>
          </div>
          <div className="card tint"><h3>Persönliche Entwicklungsthemen</h3><ul className="small" style={{ paddingLeft: 18, margin: '8px 0 0' }}>{sign.growth.map((s) => <li key={s}>{s}</li>)}</ul></div>
          {month && (
            <div className="card gold">
              <div className="card-label">Monatlicher Impuls · Sonne in {month.sunSign.name}</div>
              <div className="bold mt" style={{ marginTop: 4 }}>{month.theme}</div>
              <p className="small" style={{ marginTop: 4 }}>{month.text}</p>
            </div>
          )}
          {chart ? (
            <div className="card">
              <h3>Geburtshoroskop (vereinfacht)</h3>
              <div className="list mt" style={{ boxShadow: 'none' }}>
                <div className="list-item"><span className="serif gold-text" style={{ fontSize: 22, width: 28 }}>☉</span><div className="grow"><div className="title">Sonne in {chart.sun.name} {chart.sun.symbol}</div><div className="meta">{fmtDeg(chart.sunDeg)} · Wesenskern, Lebenskraft</div></div></div>
                <div className="list-item"><span className="serif gold-text" style={{ fontSize: 22, width: 28 }}>☽</span><div className="grow"><div className="title">Mond in {chart.moon.name} {chart.moon.symbol}</div><div className="meta">{fmtDeg(chart.moonDeg)} · Gefühlswelt, Bedürfnisse</div></div></div>
                {chart.asc ? (
                  <div className="list-item"><span className="serif gold-text" style={{ fontSize: 18, width: 28 }}>AC</span><div className="grow"><div className="title">Aszendent {chart.asc.name} {chart.asc.symbol}</div><div className="meta">{fmtDeg(chart.ascDeg!)} · Ausstrahlung, erster Eindruck</div></div></div>
                ) : <div className="list-item small muted">Für den Aszendenten bitte den Geburtsort ergänzen.</div>}
              </div>
              <p className="small mt">Dein Mond in {chart.moon.name} steht in der Deutung für emotionale Bedürfnisse rund um <b>{chart.moon.keywords.join(', ').toLowerCase()}</b>.{chart.asc ? ` Der Aszendent ${chart.asc.name} beschreibt deine Ausstrahlung – nach außen zeigen sich oft Themen wie ${chart.asc.keywords.join(', ').toLowerCase()}.` : ''}</p>
            </div>
          ) : (
            <Hint>Mit Geburtszeit (und Ort) kannst du zusätzlich Mondzeichen und Aszendent berechnen lassen.</Hint>
          )}
          <div className="card row between">
            <div className="small muted">Geboren am {stored?.birthDate ? fmtShort(stored.birthDate) : '–'}{stored?.birthTime ? `, ${stored.birthTime} Uhr` : ''}{stored?.birthPlace ? ` in ${stored.birthPlace}` : ''}</div>
            <button className="btn sm secondary" onClick={() => setEditing(true)}>Ändern</button>
          </div>
          <Hint>Astrologische Aussagen sind spirituelle Interpretationen und keine wissenschaftlich gesicherten Tatsachen. Die Positionen werden astronomisch berechnet (Genauigkeit ca. 1°).</Hint>
        </div>
      )}
    </div>
  );
}
