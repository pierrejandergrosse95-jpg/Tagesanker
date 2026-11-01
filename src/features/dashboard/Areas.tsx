import { useNavigate } from 'react-router-dom';
import { t } from '../../i18n';
import type { EmblemName } from '../../ui/emblems';
import { EmblemTile, HubHero } from '../../ui/hub';

export const AREAS: { to: string; label: string; emblem: EmblemName }[] = [
  { to: '/shifts', label: 'Schichtplan', emblem: 'hourglass' },
  { to: '/health', label: 'Medikamente', emblem: 'potion' },
  { to: '/finance', label: 'Finanzen', emblem: 'coins' },
  { to: '/tasks', label: 'Aufgaben', emblem: 'scroll' },
  { to: '/notes', label: 'Notizen', emblem: 'book' },
  { to: '/habits', label: 'Gewohnheiten', emblem: 'sprout' },
  { to: '/spirit', label: 'Spiritualität', emblem: 'crystal' },
  { to: '/calendar', label: 'Kalender', emblem: 'calendar' },
  { to: '/search', label: 'Suche', emblem: 'owl' },
  { to: '/settings', label: 'Einstellungen', emblem: 'gear' },
];

export default function Areas() {
  const nav = useNavigate();
  return (
    <div className="screen">
      <HubHero title={t('Bereiche')} scene={{ variant: 'lanterns', castle: true, seed: 11 }} />
      <div className="tiles">
        {AREAS.map((a) => <EmblemTile key={a.to} emblem={a.emblem} label={t(a.label)} onClick={() => nav(a.to)} />)}
      </div>
    </div>
  );
}
