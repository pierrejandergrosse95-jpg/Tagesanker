import { Anchor, Bell } from 'lucide-react';
import { Scene } from '../../ui/scenes';
import { useState } from 'react';
import { germanTzOffset, profileSign } from '../../core/astro/zodiac';
import { db } from '../../core/db';
import { updateSettings } from '../../core/hooks';
import { requestPermission, rescheduleAll } from '../../core/notifications';
import type { Profile } from '../../core/types';
import { Field, Hint } from '../../ui/components';
import { BirthForm } from '../spirit/Profile';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<Profile>({ id: 'me' });
  const sign = profileSign(profile);

  const finish = async () => {
    if (profile.birthDate) await db.profile.put({ ...profile, tzOffsetMin: germanTzOffset(profile.birthDate, profile.birthTime) });
    await updateSettings({ name: name.trim(), onboarded: true });
    void rescheduleAll();
  };

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 40 }}>
      {step === 0 && (
        <div className="splash">
          <Scene variant="lanterns" animal="owl" seed={5} extraSky={480} lanterns={26} />
          <div className="splash-content">
            <Anchor size={40} color="#f3dca0" strokeWidth={1.5} />
            <div className="splash-title" style={{ marginTop: 8 }}>Tagesanker</div>
            <p className="serif" style={{ fontSize: 20, marginTop: 10, textShadow: '0 1px 8px rgb(0 0 0 / .4)' }}>Dein Alltag. Dein Rhythmus.<br />Deine innere Balance.</p>
            <div className="grow" />
            <button className="btn" style={{ minWidth: 220 }} onClick={() => setStep(1)}>Die Reise beginnt →</button>
            <p className="tiny" style={{ marginTop: 14, opacity: 0.85 }}>Privat & offline – deine Daten bleiben auf deinem Gerät.</p>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="stack">
          <h1>Wie dürfen wir dich nennen?</h1>
          <Field label="Vorname"><input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Lena" onKeyDown={(e) => e.key === 'Enter' && setStep(2)} /></Field>
          <button className="btn block" onClick={() => setStep(2)}>Weiter</button>
        </div>
      )}
      {step === 2 && (
        <div className="stack">
          <h1>Dein Geburtsprofil</h1>
          <p className="small muted">Optional – für dein Sternzeichen, persönliche Impulse und ein Geburtshoroskop. Du kannst es jederzeit später ergänzen.</p>
          <div className="card"><BirthForm value={profile} onChange={setProfile} /></div>
          {sign && <div className="card cosmic center"><span className="serif gold-text" style={{ fontSize: 30 }}>{sign.symbol}</span> <span className="serif" style={{ fontSize: 20 }}>{sign.name}</span><div className="small muted">{sign.keywords.join(' · ')}</div></div>}
          <div className="grid2">
            <button className="btn ghost" onClick={() => { setProfile({ id: 'me' }); setStep(3); }}>Überspringen</button>
            <button className="btn" onClick={() => setStep(3)}>Weiter</button>
          </div>
          <Hint>Geburtsdaten werden nur lokal gespeichert.</Hint>
        </div>
      )}
      {step === 3 && (
        <div className="stack center" style={{ alignItems: 'center' }}>
          <Bell size={44} className="gold-text" />
          <h1>Erinnerungen</h1>
          <p className="small muted">Tagesanker erinnert dich an Schichten, Medikamente, Zahlungen, Termine und deinen Tagesimpuls. Jede Art lässt sich später einzeln abschalten.</p>
          <button className="btn block" onClick={async () => { await requestPermission(); await finish(); }}>Benachrichtigungen erlauben</button>
          <button className="btn ghost block" onClick={finish}>Später</button>
        </div>
      )}
      {step > 0 && <div className="row mt" style={{ justifyContent: 'center', gap: 6 }}>
        {[0, 1, 2, 3].map((i) => <span key={i} className="swatch" style={{ background: i === step ? 'var(--forest)' : 'var(--line)' }} />)}
      </div>}
    </div>
  );
}
