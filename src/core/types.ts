/** ISO-Kalendertag in lokaler Zeit: "YYYY-MM-DD" */
export type ISODate = string;
/** Uhrzeit in lokaler Zeit: "HH:MM" */
export type HM = string;

export type Freq = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | 'interval';

/** Wiederholungsregel, gemeinsam genutzt von Aufgaben, Terminen, Medikamenten, Zahlungen. */
export interface Recurrence {
  freq: Freq;
  /** Für 'weekdays': 0 = Sonntag … 6 = Samstag */
  weekdays?: number[];
  /** Für 'interval': alle n Tage */
  every?: number;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export type NotifyCategory =
  | 'shifts' | 'meds' | 'bills' | 'tasks' | 'events' | 'birthdays'
  | 'meditation' | 'habits' | 'impulse';

export type DashboardWidget =
  | 'today' | 'shift' | 'meds' | 'bills' | 'tasks' | 'events'
  | 'moon' | 'impulse' | 'habits' | 'preview';

export interface Settings {
  id: 'main';
  name: string;
  onboarded: boolean;
  theme: ThemeMode;
  weeklyHours: number;
  workDaysPerWeek: number;
  notify: Record<NotifyCategory, boolean>;
  notifyTimes: { impulse: HM; meditation: HM; shiftLeadMin: number; taskTime: HM };
  widgets: { id: DashboardWidget; visible: boolean }[];
  aiEnabled: boolean;
  journalPinHash?: string;
  currency: string;
}

export interface Profile {
  id: 'me';
  birthDate?: ISODate;
  birthTime?: HM;
  birthPlace?: string;
  lat?: number;
  lon?: number;
  /** Zeitzonen-Offset in Minuten zur Geburt (z. B. 60 für MEZ, 120 für MESZ) */
  tzOffsetMin?: number;
}

export type ShiftKind = 'work' | 'vacation' | 'off' | 'sick';

export interface ShiftType {
  id?: number;
  name: string;
  short: string;
  color: string;
  start: HM;
  end: HM;
  breakMin: number;
  kind: ShiftKind;
  order: number;
}

export interface Shift {
  id?: number;
  date: ISODate;
  typeId: number;
  start?: HM;
  end?: HM;
  breakMin?: number;
  note?: string;
}

export interface ShiftPattern {
  id?: number;
  name: string;
  /** Folge von ShiftType-IDs, 0 = kein Eintrag */
  sequence: number[];
}

export type TaskScope = 'day' | 'week' | 'month';
export type Priority = 1 | 2 | 3; // 1 hoch, 2 mittel, 3 niedrig

export interface Task {
  id?: number;
  title: string;
  note?: string;
  scope: TaskScope;
  due?: ISODate;
  time?: HM;
  priority: Priority;
  category?: string;
  recurrence: Recurrence;
  remind: boolean;
  done: 0 | 1;
  doneAt?: number;
  order: number;
  createdAt: number;
}

export type EventKind = 'appointment' | 'birthday' | 'doctor';

export interface CalEvent {
  id?: number;
  title: string;
  kind: EventKind;
  date: ISODate;
  time?: HM;
  endTime?: HM;
  location?: string;
  note?: string;
  recurrence: Recurrence;
  remindMin?: number;
}

export interface Med {
  id?: number;
  name: string;
  dose: string;
  instructions?: string;
  times: HM[];
  recurrence: Recurrence;
  startDate: ISODate;
  stock?: number;
  perIntake: number;
  lowThresholdDays: number;
  active: 0 | 1;
  color: string;
}

export interface MedIntake {
  id?: number;
  medId: number;
  date: ISODate;
  time: HM;
  takenAt: number;
}

export interface HealthNote {
  id?: number;
  date: ISODate;
  title: string;
  text: string;
}

export type FinanceKind = 'income' | 'expense';

export interface FinanceEntry {
  id?: number;
  kind: FinanceKind;
  title: string;
  amount: number; // Cent
  category: string;
  date: ISODate;
  monthly: 0 | 1;
  note?: string;
}

export interface Bill {
  id?: number;
  title: string;
  amount: number; // Cent
  category: string;
  due: ISODate;
  recurrence: Recurrence;
  remindDays: number;
  paidAt?: ISODate;
  note?: string;
  /** Verknüpfung, wenn Rate eines Kredits */
  debtId?: number;
}

export interface Debt {
  id?: number;
  title: string;
  creditor?: string;
  total: number; // Cent
  rate: number; // Cent
  dayOfMonth: number;
  paid: number; // bereits getilgt, Cent
  note?: string;
}

export interface Budget {
  id?: number;
  category: string;
  amount: number; // Cent / Monat
}

export interface Attachment {
  name: string;
  type: string;
  size: number;
  blob: Blob;
}

export interface Note {
  id?: number;
  title: string;
  body: string;
  category: string;
  checklist?: { text: string; done: boolean }[];
  pinned: 0 | 1;
  attachments?: Attachment[];
  updatedAt: number;
}

export interface Habit {
  id?: number;
  name: string;
  icon: string;
  color: string;
  unit: string;
  target: number;
  /** 'daily' = Ziel pro Tag, 'weekly' = an X Tagen pro Woche erledigt */
  freq: 'daily' | 'weekly';
  timesPerWeek: number;
  remindTime?: HM;
  archived: 0 | 1;
  order: number;
}

export interface HabitLog {
  id?: number;
  habitId: number;
  date: ISODate;
  value: number;
}

export type JournalKind = 'thoughts' | 'gratitude' | 'goals' | 'dreams' | 'insights' | 'free';

export interface JournalEntry {
  id?: number;
  date: ISODate;
  kind: JournalKind;
  mood?: number; // 1–5
  emotions: string[];
  gratitude: string[];
  prompt?: string;
  answer?: string;
  text: string;
  createdAt: number;
}

export interface TarotDraw {
  id?: number;
  date: ISODate;
  spread: 'day' | 'three';
  question?: string;
  cards: { card: number; reversed: boolean }[];
  note?: string;
  createdAt: number;
}

export interface MeditationSession {
  id?: number;
  date: ISODate;
  kind: string;
  minutes: number;
  createdAt: number;
}

export interface AudioFile {
  id?: number;
  name: string;
  blob: Blob;
}

export interface ImpulseLog {
  date: ISODate;
  impulseId: string;
  liked: 0 | 1;
}
