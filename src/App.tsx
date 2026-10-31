import { App as CapApp } from '@capacitor/app';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarDays, Heart, Home, Plus, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { db, ensureSeed } from './core/db';
import { useSettings } from './core/hooks';
import { initNotifications, isNative, rescheduleAll, scheduleSoon } from './core/notifications';
import Dashboard from './features/dashboard/Dashboard';
import Areas from './features/dashboard/Areas';
import Onboarding from './features/settings/Onboarding';
import SettingsScreen from './features/settings/Settings';
import CalendarScreen from './features/calendar/Calendar';
import ShiftsScreen from './features/shifts/Shifts';
import TasksScreen from './features/tasks/Tasks';
import HealthScreen from './features/health/Health';
import FinanceScreen from './features/finance/Finance';
import NotesScreen from './features/notes/Notes';
import NoteEditor from './features/notes/NoteEditor';
import HabitsScreen from './features/habits/Habits';
import SpiritHome from './features/spirit/SpiritHome';
import ProfileScreen from './features/spirit/Profile';
import MoonScreen from './features/spirit/Moon';
import MeditationScreen from './features/spirit/Meditation';
import TarotScreen from './features/spirit/Tarot';
import JournalScreen from './features/spirit/Journal';
import SearchScreen from './features/search/Search';
import QuickAdd from './features/dashboard/QuickAdd';
import Discover from './features/dashboard/Discover';
import ProfileHome from './features/settings/ProfileHome';

function useTheme() {
  const { theme } = useSettings();
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#121813' : '#F4EFE4');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}

const NAV_LEFT = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/calendar', label: 'Kalender', icon: CalendarDays },
];
const NAV_RIGHT = [
  { to: '/discover', label: 'Entdecken', icon: Heart },
  { to: '/profile', label: 'Profil', icon: UserRound },
];

function BottomNav({ onPlus }: { onPlus: () => void }) {
  const item = ({ to, label, icon: Icon, end }: (typeof NAV_LEFT)[number] & { end?: boolean }) => (
    <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
      <Icon size={22} strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  );
  return (
    <nav className="bottom-nav" aria-label="Hauptnavigation">
      <div className="inner">
        {NAV_LEFT.map(item)}
        <div className="plus"><button aria-label="Hinzufügen" onClick={onPlus}><Plus size={28} /></button></div>
        {NAV_RIGHT.map(item)}
      </div>
    </nav>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const settings = useLiveQuery(() => db.settings.get('main'), [ready]);
  const nav = useNavigate();
  const loc = useLocation();
  useTheme();

  useEffect(() => {
    ensureSeed().then(() => setReady(true)).catch(console.error);
    void initNotifications((route) => nav(route));
    // Erinnerungen bei jeder Datenänderung neu planen
    const tables = ['shifts', 'meds', 'bills', 'tasks', 'events', 'habits', 'settings'] as const;
    const off: (() => void)[] = [];
    for (const t of tables) {
      const table = db.table(t);
      const h = () => scheduleSoon();
      table.hook('creating', h);
      table.hook('updating', h);
      table.hook('deleting', h);
      off.push(() => {
        table.hook('creating').unsubscribe(h);
        table.hook('updating').unsubscribe(h);
        table.hook('deleting').unsubscribe(h);
      });
    }
    return () => off.forEach((f) => f());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (settings?.onboarded) void rescheduleAll().catch(console.error);
  }, [settings?.onboarded]);

  // Android-Zurück-Taste
  useEffect(() => {
    if (!isNative()) return;
    const p = CapApp.addListener('backButton', () => {
      if (document.querySelector('.backdrop')) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      } else if (loc.pathname === '/') {
        void CapApp.exitApp();
      } else {
        nav(-1);
      }
    });
    return () => void p.then((h) => h.remove());
  }, [loc.pathname, nav]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  if (!ready || !settings) return <div className="app" />;
  if (!settings.onboarded) return <div className="app"><Onboarding /></div>;

  const immersive = /^\/spirit\/meditation\/.+/.test(loc.pathname);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/areas" element={<Areas />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/profile" element={<ProfileHome />} />
        <Route path="/calendar" element={<CalendarScreen />} />
        <Route path="/shifts" element={<ShiftsScreen />} />
        <Route path="/tasks" element={<TasksScreen />} />
        <Route path="/health" element={<HealthScreen />} />
        <Route path="/finance" element={<FinanceScreen />} />
        <Route path="/notes" element={<NotesScreen />} />
        <Route path="/notes/:id" element={<NoteEditor />} />
        <Route path="/habits" element={<HabitsScreen />} />
        <Route path="/spirit" element={<SpiritHome />} />
        <Route path="/spirit/profile" element={<ProfileScreen />} />
        <Route path="/spirit/moon" element={<MoonScreen />} />
        <Route path="/spirit/meditation" element={<MeditationScreen />} />
        <Route path="/spirit/meditation/:id" element={<MeditationScreen />} />
        <Route path="/spirit/tarot" element={<TarotScreen />} />
        <Route path="/spirit/journal" element={<JournalScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
      <QuickAdd open={plusOpen} setOpen={setPlusOpen} />
      {!immersive && <BottomNav onPlus={() => setPlusOpen(true)} />}
    </div>
  );
}
