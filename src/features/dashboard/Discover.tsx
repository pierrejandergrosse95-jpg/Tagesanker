import { BookHeart, Briefcase, CheckSquare, Flower2, HeartPulse, Layers, Moon, Search, Star, StickyNote, Target, Wallet, Wind, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SceneCard, type SceneProps } from '../../ui/scenes';
import { TopBar } from '../../ui/components';

export interface Area {
  to: string;
  label: string;
  sub: string;
  icon: typeof Star;
  scene: SceneProps;
}

export const AREAS: { title: string; items: Area[] }[] = [
  {
    title: 'Mein Alltag',
    items: [
      { to: '/tasks', label: 'Aufgaben', sub: 'Tag, Woche, Monat', icon: CheckSquare, scene: { variant: 'meadow', animal: 'hen', castle: false, seed: 3 } },
      { to: '/shifts', label: 'Schichtplan', sub: 'Arbeitszeit & Konto', icon: Briefcase, scene: { variant: 'dawn', animal: 'none', seed: 5 } },
      { to: '/health', label: 'Gesundheit', sub: 'Medikamente & Arzt', icon: HeartPulse, scene: { variant: 'forest', animal: 'deer', castle: false, seed: 9 } },
      { to: '/finance', label: 'Finanzen', sub: 'Zahlungen & Budget', icon: Wallet, scene: { variant: 'sunset', animal: 'none', seed: 11 } },
      { to: '/habits', label: 'Gewohnheiten', sub: 'Kleine Schritte', icon: Target, scene: { variant: 'meadow', animal: 'cat', seed: 13 } },
      { to: '/notes', label: 'Notizen', sub: 'Listen & Dokumente', icon: StickyNote, scene: { variant: 'lanterns', lanterns: 6, castle: false, animal: 'owl', seed: 17 } },
    ],
  },
  {
    title: 'Meine innere Reise',
    items: [
      { to: '/spirit', label: 'Tagesimpuls', sub: 'Gedanken für heute', icon: Sparkles, scene: { variant: 'sunset', animal: 'fox', seed: 19 } },
      { to: '/spirit/meditation', label: 'Meditation', sub: 'Ruhe & Atem', icon: Flower2, scene: { variant: 'night', animal: 'none', seed: 23 } },
      { to: '/spirit/meditation/breath-box', label: 'Atemübung', sub: 'Box-Atmung', icon: Wind, scene: { variant: 'dawn', animal: 'deer', castle: false, seed: 29 } },
      { to: '/spirit/moon', label: 'Mondkalender', sub: 'Phasen & Rituale', icon: Moon, scene: { variant: 'night', animal: 'owl', castle: false, seed: 31 } },
      { to: '/spirit/profile', label: 'Astrologie', sub: 'Sternzeichen & Horoskop', icon: Star, scene: { variant: 'lanterns', lanterns: 0, animal: 'fox', seed: 37 } },
      { to: '/spirit/tarot', label: 'Tarot', sub: 'Karte des Tages', icon: Layers, scene: { variant: 'lanterns', seed: 41 } },
      { to: '/spirit/journal', label: 'Tagebuch', sub: 'Meine Reise', icon: BookHeart, scene: { variant: 'forest', animal: 'none', seed: 43 } },
      { to: '/search', label: 'Suche', sub: 'Alles finden', icon: Search, scene: { variant: 'meadow', animal: 'none', seed: 47 } },
    ],
  },
];

export default function Discover() {
  const nav = useNavigate();
  return (
    <div className="screen">
      <TopBar title="Entdecken" />
      {AREAS.map((g) => (
        <section key={g.title}>
          <div className="section-title"><h2>{g.title}</h2></div>
          <div className="grid2">
            {g.items.map(({ to, label, sub, icon: Icon, scene }) => (
              <SceneCard key={to} scene={scene} height={150} onClick={() => nav(to)} label={label}>
                <span className="scene-badge"><Icon size={17} /></span>
                <span className="t">{label}</span>
                <span className="s">{sub}</span>
              </SceneCard>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
