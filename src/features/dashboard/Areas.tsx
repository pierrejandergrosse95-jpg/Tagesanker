import { BookHeart, Briefcase, CalendarDays, CheckSquare, Flower2, HeartPulse, Layers, Moon, Search, Settings, Sparkles, Star, StickyNote, Target, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../ui/components';

const GROUPS = [
  {
    title: 'Organisation',
    items: [
      { to: '/calendar', label: 'Kalender', icon: CalendarDays },
      { to: '/shifts', label: 'Schichtplan', icon: Briefcase },
      { to: '/tasks', label: 'Aufgaben', icon: CheckSquare },
      { to: '/notes', label: 'Notizen', icon: StickyNote },
    ],
  },
  {
    title: 'Persönliche Verwaltung',
    items: [
      { to: '/health', label: 'Gesundheit', icon: HeartPulse },
      { to: '/finance', label: 'Finanzen', icon: Wallet },
      { to: '/habits', label: 'Gewohnheiten', icon: Target },
    ],
  },
  {
    title: 'Meine innere Reise',
    items: [
      { to: '/spirit', label: 'Tagesimpuls', icon: Sparkles },
      { to: '/spirit/meditation', label: 'Meditation', icon: Flower2 },
      { to: '/spirit/moon', label: 'Mondkalender', icon: Moon },
      { to: '/spirit/profile', label: 'Astrologie', icon: Star },
      { to: '/spirit/tarot', label: 'Tarot', icon: Layers },
      { to: '/spirit/journal', label: 'Tagebuch', icon: BookHeart },
    ],
  },
  {
    title: 'App',
    items: [
      { to: '/search', label: 'Suche', icon: Search },
      { to: '/settings', label: 'Einstellungen', icon: Settings },
    ],
  },
];

export default function Areas() {
  const nav = useNavigate();
  return (
    <div className="screen">
      <TopBar title="Bereiche" back />
      {GROUPS.map((g) => (
        <section key={g.title}>
          <div className="section-title"><h2>{g.title}</h2></div>
          <div className="grid3">
            {g.items.map(({ to, label, icon: Icon }) => (
              <button key={to} className="card tap center" style={{ padding: '14px 6px' }} onClick={() => nav(to)}>
                <span className="tile" style={{ minHeight: 0, alignItems: 'center' }}><span className="icon-wrap"><Icon size={20} /></span></span>
                <div className="small bold" style={{ marginTop: 6 }}>{label}</div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
