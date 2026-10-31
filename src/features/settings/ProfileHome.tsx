import { Anchor, Bell, ChevronRight, Database, Palette, Pencil, Settings, Star } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileSign } from '../../core/astro/zodiac';
import { updateSettings, useProfile, useSettings } from '../../core/hooks';
import type { Settings as S } from '../../core/types';
import { Field, Sheet } from '../../ui/components';
import { Scene } from '../../ui/scenes';

const AVATARS: { id: S['avatar']; label: string }[] = [
  { id: 'fox', label: 'Fuchs' }, { id: 'deer', label: 'Hirsch' }, { id: 'owl', label: 'Eule' }, { id: 'hen', label: 'Huhn' }, { id: 'cat', label: 'Katze' },
];

export function Avatar({ kind, size = 112 }: { kind: S['avatar']; size?: number }) {
  return (
    <div className="avatar-ring" style={{ width: size + 8, height: size + 8 }}>
      <div><Scene variant={kind === 'owl' ? 'night' : kind === 'hen' ? 'meadow' : kind === 'deer' ? 'forest' : 'sunset'} animal={kind} castle={false} seed={3} animalX={205} animalScale={2.6} /></div>
    </div>
  );
}

export default function ProfileHome() {
  const s = useSettings();
  const profile = useProfile();
  const sign = profileSign(profile);
  const nav = useNavigate();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState('');
  const [motto, setMotto] = useState('');
  const [avatar, setAvatar] = useState<S['avatar']>('fox');

  const open = () => {
    setName(s.name);
    setMotto(s.motto);
    setAvatar(s.avatar);
    setEdit(true);
  };

  const links = [
    { icon: Settings, label: 'Einstellungen', to: '/settings' },
    { icon: Palette, label: 'Design & Dashboard', to: '/settings#design' },
    { icon: Bell, label: 'Erinnerungen', to: '/settings#notify' },
    { icon: Database, label: 'Sicherung & Daten', to: '/settings#backup' },
    { icon: Star, label: 'Geburtsprofil & Sternzeichen', to: '/spirit/profile' },
    { icon: Anchor, label: 'Über Tagesanker', to: '/settings#about' },
  ];

  return (
    <div className="screen">
      <header className="topbar"><h1 className="grow">Profil</h1></header>
      <div className="center stack" style={{ alignItems: 'center', gap: 6 }}>
        <button onClick={open} style={{ border: 0, background: 'none', padding: 0 }} aria-label="Profil bearbeiten"><Avatar kind={s.avatar} /></button>
        <h2 className="row" style={{ gap: 6, marginTop: 8 }}>{s.name || 'Dein Name'} <span className="gold-text">✦</span></h2>
        <p className="serif muted" style={{ fontSize: 17, fontStyle: 'italic' }}>„{s.motto}“</p>
        {sign && <span className="badge gold">{sign.symbol} {sign.name}</span>}
        <button className="btn sm ghost" onClick={open}><Pencil size={14} /> Bearbeiten</button>
      </div>
      <div className="list mt">
        {links.map(({ icon: Icon, label, to }) => (
          <button key={label} className="list-item" onClick={() => nav(to)}>
            <Icon size={19} className="muted" />
            <span className="grow">{label}</span>
            <ChevronRight size={18} className="faint" />
          </button>
        ))}
      </div>

      <Sheet open={edit} onClose={() => setEdit(false)} title="Profil bearbeiten" actions={<button className="btn" onClick={async () => { await updateSettings({ name: name.trim(), motto: motto.trim() || s.motto, avatar }); setEdit(false); }}>Speichern</button>}>
        <div className="form">
          <Field label="Name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Mein Motto"><input className="input" value={motto} onChange={(e) => setMotto(e.target.value)} /></Field>
          <Field label="Mein Begleiter">
            <div className="grid3">
              {AVATARS.map((a) => (
                <button key={a.id} type="button" className={`card tap center ${avatar === a.id ? 'tint' : ''}`} style={{ padding: 8, outline: avatar === a.id ? '2px solid var(--forest)' : undefined }} onClick={() => setAvatar(a.id)}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', margin: '0 auto' }}><Scene variant={a.id === 'owl' ? 'night' : a.id === 'hen' ? 'meadow' : a.id === 'deer' ? 'forest' : 'sunset'} animal={a.id} castle={false} animalX={205} animalScale={2.6} /></div>
                  <div className="small mt" style={{ marginTop: 4 }}>{a.label}</div>
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Sheet>
    </div>
  );
}
