import { useNavigate } from 'react-router-dom';
import { t } from '../../i18n';
import type { EmblemName } from '../../ui/emblems';
import { EmblemTile, HubHero, type AreaImage } from '../../ui/hub';

export const AREAS: { to: string; label: string; emblem: EmblemName; image: AreaImage }[] = [
  { to: '/shifts', label: 'Schichtplan', emblem: 'hourglass', image: 'shifts' },
  { to: '/health', label: 'Medikamente', emblem: 'potion', image: 'health' },
  { to: '/finance', label: 'Finanzen', emblem: 'coins', image: 'finance' },
  { to: '/tasks', label: 'Aufgaben', emblem: 'scroll', image: 'tasks' },
  { to: '/notes', label: 'Notizen', emblem: 'book', image: 'notes' },
  { to: '/habits', label: 'Gewohnheiten', emblem: 'sprout', image: 'habits' },
  { to: '/spirit', label: 'Spiritualität', emblem: 'crystal', image: 'spirit' },
  { to: '/calendar', label: 'Kalender', emblem: 'calendar', image: 'calendar' },
  { to: '/search', label: 'Suche', emblem: 'owl', image: 'home' },
  { to: '/settings', label: 'Einstellungen', emblem: 'gear', image: 'settings' },
];

export default function Areas() {
  const nav = useNavigate();
  return (
    <div className="screen">
      <HubHero title={t('Bereiche')} image="home" />
      <div className="tiles">
        {AREAS.map((a) => <EmblemTile key={a.to} image={a.image} label={t(a.label)} onClick={() => nav(a.to)} />)}
      </div>
    </div>
  );
}
