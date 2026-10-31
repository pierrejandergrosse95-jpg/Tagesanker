import Dexie, { type Table } from 'dexie';
import type {
  AudioFile, Bill, Budget, CalEvent, Debt, FinanceEntry, Habit, HabitLog, HealthNote,
  ImpulseLog, JournalEntry, MeditationSession, Med, MedIntake, Note, Profile, Settings,
  Shift, ShiftPattern, ShiftType, Task, TarotDraw,
} from './types';

export class KlarTaktDB extends Dexie {
  settings!: Table<Settings, string>;
  profile!: Table<Profile, string>;
  shiftTypes!: Table<ShiftType, number>;
  shifts!: Table<Shift, number>;
  shiftPatterns!: Table<ShiftPattern, number>;
  tasks!: Table<Task, number>;
  events!: Table<CalEvent, number>;
  meds!: Table<Med, number>;
  medIntakes!: Table<MedIntake, number>;
  healthNotes!: Table<HealthNote, number>;
  finance!: Table<FinanceEntry, number>;
  bills!: Table<Bill, number>;
  debts!: Table<Debt, number>;
  budgets!: Table<Budget, number>;
  notes!: Table<Note, number>;
  habits!: Table<Habit, number>;
  habitLogs!: Table<HabitLog, number>;
  journal!: Table<JournalEntry, number>;
  tarotDraws!: Table<TarotDraw, number>;
  meditations!: Table<MeditationSession, number>;
  audio!: Table<AudioFile, number>;
  impulses!: Table<ImpulseLog, string>;

  constructor(name = 'klartakt') {
    super(name);
    // Schema-Version 1. Neue Felder/Indizes → neue .version(n) mit Migration ergänzen.
    this.version(1).stores({
      settings: 'id',
      profile: 'id',
      shiftTypes: '++id, order',
      shifts: '++id, &date, typeId',
      shiftPatterns: '++id',
      tasks: '++id, scope, due, done, category',
      events: '++id, date, kind',
      meds: '++id, active',
      medIntakes: '++id, medId, date, [medId+date]',
      healthNotes: '++id, date',
      finance: '++id, date, kind, category, monthly',
      bills: '++id, due, paidAt, debtId',
      debts: '++id',
      budgets: '++id, &category',
      notes: '++id, category, pinned, updatedAt',
      habits: '++id, order, archived',
      habitLogs: '++id, habitId, date, [habitId+date]',
      journal: '++id, date, kind',
      tarotDraws: '++id, date',
      meditations: '++id, date',
      audio: '++id',
      impulses: 'date',
    });
  }
}

export const db = new KlarTaktDB();

/** Alle Tabellennamen – für Backup/Export/Löschen. */
export const TABLES = [
  'settings', 'profile', 'shiftTypes', 'shifts', 'shiftPatterns', 'tasks', 'events', 'meds',
  'medIntakes', 'healthNotes', 'finance', 'bills', 'debts', 'budgets', 'notes', 'habits',
  'habitLogs', 'journal', 'tarotDraws', 'meditations', 'audio', 'impulses',
] as const;
export type TableName = (typeof TABLES)[number];

export const DEFAULT_SETTINGS: Settings = {
  id: 'main',
  name: '',
  onboarded: false,
  theme: 'system',
  weeklyHours: 40,
  workDaysPerWeek: 5,
  notify: {
    shifts: true, meds: true, bills: true, tasks: true, events: true, birthdays: true,
    meditation: false, habits: false, impulse: true,
  },
  notifyTimes: { impulse: '07:30', meditation: '20:30', shiftLeadMin: 60, taskTime: '09:00' },
  widgets: [
    { id: 'shift', visible: true },
    { id: 'today', visible: true },
    { id: 'meds', visible: true },
    { id: 'tasks', visible: true },
    { id: 'habits', visible: true },
    { id: 'moon', visible: true },
    { id: 'impulse', visible: true },
    { id: 'preview', visible: true },
    { id: 'bills', visible: false },
    { id: 'events', visible: false },
  ],
  aiEnabled: false,
  currency: 'EUR',
};

export const DEFAULT_SHIFT_TYPES: ShiftType[] = [
  { name: 'Frühschicht', short: 'F', color: '#D9A441', start: '06:00', end: '14:00', breakMin: 30, kind: 'work', order: 0 },
  { name: 'Spätschicht', short: 'S', color: '#6E8FCB', start: '14:00', end: '22:00', breakMin: 30, kind: 'work', order: 1 },
  { name: 'Nachtschicht', short: 'N', color: '#8E6BA8', start: '22:00', end: '06:00', breakMin: 45, kind: 'work', order: 2 },
  { name: 'Frei', short: '–', color: '#A9BFA3', start: '00:00', end: '00:00', breakMin: 0, kind: 'off', order: 3 },
  { name: 'Urlaub', short: 'U', color: '#4E9A86', start: '00:00', end: '00:00', breakMin: 0, kind: 'vacation', order: 4 },
  { name: 'Krank', short: 'K', color: '#C27A6B', start: '00:00', end: '00:00', breakMin: 0, kind: 'sick', order: 5 },
];

export const DEFAULT_HABITS: Habit[] = [
  { name: 'Wasser trinken', icon: 'drop', color: '#6E8FCB', unit: 'Gläser', target: 8, freq: 'daily', timesPerWeek: 7, archived: 0, order: 0 },
  { name: 'Bewegung', icon: 'dumbbell', color: '#6F8C6E', unit: 'Minuten', target: 30, freq: 'daily', timesPerWeek: 7, archived: 0, order: 1 },
  { name: 'Meditation', icon: 'lotus', color: '#C27A6B', unit: 'Minuten', target: 10, freq: 'daily', timesPerWeek: 7, archived: 0, order: 2 },
  { name: 'Lesen', icon: 'book', color: '#8E6BA8', unit: 'Minuten', target: 20, freq: 'daily', timesPerWeek: 7, archived: 0, order: 3 },
  { name: 'Schlaf', icon: 'moon', color: '#4F5D75', unit: 'Stunden', target: 8, freq: 'daily', timesPerWeek: 7, archived: 0, order: 4 },
];

/** Legt beim ersten Start Grunddaten an. Idempotent. */
export async function ensureSeed(database: KlarTaktDB = db): Promise<void> {
  await database.transaction('rw', [database.settings, database.shiftTypes, database.habits], async () => {
    const s = await database.settings.get('main');
    if (!s) await database.settings.put(DEFAULT_SETTINGS);
    else {
      // Neue Standardfelder für bestehende Installationen ergänzen
      const merged: Settings = {
        ...DEFAULT_SETTINGS, ...s,
        notify: { ...DEFAULT_SETTINGS.notify, ...s.notify },
        notifyTimes: { ...DEFAULT_SETTINGS.notifyTimes, ...s.notifyTimes },
        widgets: [
          ...s.widgets.filter((w) => DEFAULT_SETTINGS.widgets.some((d) => d.id === w.id)),
          ...DEFAULT_SETTINGS.widgets.filter((d) => !s.widgets.some((w) => w.id === d.id)),
        ],
      };
      await database.settings.put(merged);
    }
    if ((await database.shiftTypes.count()) === 0) await database.shiftTypes.bulkAdd(DEFAULT_SHIFT_TYPES);
    if ((await database.habits.count()) === 0) await database.habits.bulkAdd(DEFAULT_HABITS);
  });
}
