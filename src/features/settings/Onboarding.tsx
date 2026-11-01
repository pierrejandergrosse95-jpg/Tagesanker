import { Bell } from 'lucide-react';
import { useState } from 'react';
import { germanTzOffset, profileSign } from '../../core/astro/zodiac';
import { db } from '../../core/db';
import { updateSettings, useSettings } from '../../core/hooks';
import { requestPermission, rescheduleAll } from '../../core/notifications';
import type { Profile } from '../../core/types';
import { t } from '../../i18n';
import { Field, Hint, Segmented } from '../../ui/components';
import { Emblem } from '../../ui/emblems';
import { Scene } from '../../ui/scenes';
import { BirthForm } from '../spirit/Profile';

export default function Onboarding() {
  const settings = useSettings();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<Profile>({ id: 'me' });
  const sign = profileSign(profile);

  const finish = async () => {
    if (profile.birthDate) await db.profile.put({ ...profile, tzOffsetMin: germanTzOffset(profile.birthDate, profile.birthTime) });
    await updateSettings({ name: name.trim(), onboarded: true });
    void rescheduleAll();
  };

  if (step === 0) {
    return (
      <div className="splash">
        <Scene variant="night" seed={5} extraSky={480} lanterns={10} />
        <div className="splash-content">
          <div className="splash-title">Tagesanker</div>
          <p className="serif" style={{ fontSize: 'clamp(17px, 4.6vw, 22px)', marginTop: 8, textShadow: '0 1px 8px rgb(0 0 0 / .6)' }}>
            {t('Dein Alltag. Dein Rhythmus.')}<br />{t('Deine innere Balance.')}
          </p>
          <div className="grow" />
          <div className="row" style={{ justifyContent: 'space-between', width: '100%', maxWidth: 420, alignItems: 'flex-end' }}>
            <Emblem name="book" style={{ width: 'clamp(90px, 26vw, 130px)', height: 'clamp(90px, 26vw, 130px)' }} />
            <Emblem name="candle" style={{ width: 'clamp(60px, 16vw, 90px)', height: 'clamp(60px, 16vw, 90px)' }} />
          </div>
          <div style={{ width: '100%', maxWidth: 300, marginTop: 10 }}>
            <Segmented value={settings.lang === 'system' ? 'system' : settings.lang} onChange={(l) => void updateSettings({ lang: l })} options={[{ value: 'de', label: 'Deutsch' }, { value: 'en', label: 'English' }, { value: 'system', label: 'Auto' }]} />
          </div>
          <button className="btn parchment" style={{ minWidth: 220 }} onClick={() => setStep(1)}>{t('App starten')}</button>
          <p className="tiny" style={{ marginTop: 12, opacity: 0.85 }}>{t('Privat & offline – deine Daten bleiben auf deinem Gerät.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 40 }}>
      {step === 1 && (
        <div className="stack">
          <div className="center"><Emblem name="quill" size={90} /></div>
          <h1>{t('Wie dürfen wir dich nennen?')}</h1>
          <Field label="Vorname"><input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t('z. B. Lena')} onKeyDown={(e) => e.key === 'Enter' && setStep(2)} /></Field>
          <button className="btn block" onClick={() => setStep(2)}>{t('Weiter')}</button>
        </div>
      )}
      {step === 2 && (
        <div className="stack">
          <div className="center"><Emblem name="star" size={80} /></div>
          <h1>{t('Dein Geburtsprofil')}</h1>
          <p className="small muted">{t('Optional – für dein Sternzeichen, persönliche Impulse und ein Geburtshoroskop. Du kannst es jederzeit später ergänzen.')}</p>
          <div className="card"><BirthForm value={profile} onChange={setProfile} /></div>
          {sign && <div className="card cosmic center"><span className="serif gold-text" style={{ fontSize: 30 }}>{sign.symbol}</span> <span className="serif" style={{ fontSize: 20 }}>{sign.name}</span><div className="small muted">{sign.keywords.join(' · ')}</div></div>}
          <div className="grid2">
            <button className="btn ghost" onClick={() => { setProfile({ id: 'me' }); setStep(3); }}>{t('Überspringen')}</button>
            <button className="btn" onClick={() => setStep(3)}>{t('Weiter')}</button>
          </div>
          <Hint>Geburtsdaten werden nur lokal gespeichert.</Hint>
        </div>
      )}
      {step === 3 && (
        <div className="stack center" style={{ alignItems: 'center' }}>
          <Bell size={44} className="gold-text" />
          <h1>{t('Erinnerungen')}</h1>
          <p className="small muted">{t('Tagesanker erinnert dich an Schichten, Medikamente, Zahlungen, Termine und deinen Tagesimpuls. Jede Art lässt sich später einzeln abschalten.')}</p>
          <button className="btn block" onClick={async () => { await requestPermission(); await finish(); }}>{t('Benachrichtigungen erlauben')}</button>
          <button className="btn ghost block" onClick={finish}>{t('Später')}</button>
        </div>
      )}
      <div className="row mt" style={{ justifyContent: 'center', gap: 6 }}>
        {[1, 2, 3].map((i) => <span key={i} className="swatch" style={{ background: i === step ? 'var(--forest)' : 'var(--line)' }} />)}
      </div>
    </div>
  );
}
