import { diffDays, endOfMonth, startOfMonth } from '../../core/dates';
import type { Bill, Budget, FinanceEntry, ISODate } from '../../core/types';

export const EXPENSE_CATEGORIES = [
  'Wohnen', 'Energie', 'Lebensmittel', 'Mobilität', 'Versicherung', 'Kommunikation',
  'Gesundheit', 'Freizeit', 'Kleidung', 'Abos', 'Kredite', 'Sparen', 'Geschenke', 'Sonstiges',
];
export const INCOME_CATEGORIES = ['Gehalt', 'Nebenjob', 'Zuschüsse', 'Erstattung', 'Geschenk', 'Sonstiges'];

export function fmtMoney(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(cents / 100);
}

/** "12,50" / "12.50" / "1.234,56" → Cent */
export function parseMoney(input: string): number | null {
  const s = input.trim().replace(/\s|€/g, '');
  if (!s) return null;
  let norm = s;
  if (s.includes(',')) norm = s.replace(/\./g, '').replace(',', '.');
  const n = Number(norm);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export const centsToInput = (c: number) => (c / 100).toFixed(2).replace('.', ',');

export type BillStatus = 'paid' | 'overdue' | 'soon' | 'open';

export function billStatus(b: Bill, today: ISODate): BillStatus {
  if (b.paidAt) return 'paid';
  const d = diffDays(today, b.due);
  if (d < 0) return 'overdue';
  if (d <= 7) return 'soon';
  return 'open';
}

export interface MonthSummary {
  income: number;
  expenses: number;
  balance: number;
  byCategory: { category: string; amount: number }[];
}

/** Ist eine monatlich wiederkehrende Buchung im Monat `month` (beliebiger Tag) aktiv? */
function monthlyActive(e: FinanceEntry, month: ISODate): boolean {
  return e.monthly === 1 && e.date <= endOfMonth(month);
}

export function monthSummary(month: ISODate, entries: FinanceEntry[], bills: Bill[]): MonthSummary {
  const from = startOfMonth(month);
  const to = endOfMonth(month);
  let income = 0;
  let expenses = 0;
  const cats = new Map<string, number>();
  const addExp = (cat: string, amount: number) => {
    expenses += amount;
    cats.set(cat, (cats.get(cat) ?? 0) + amount);
  };
  for (const e of entries) {
    const inMonth = e.monthly ? monthlyActive(e, month) : e.date >= from && e.date <= to;
    if (!inMonth) continue;
    if (e.kind === 'income') income += e.amount;
    else addExp(e.category, e.amount);
  }
  for (const b of bills) if (b.paidAt && b.paidAt >= from && b.paidAt <= to) addExp(b.category, b.amount);
  const byCategory = [...cats.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  return { income, expenses, balance: income - expenses, byCategory };
}

/** Offene Rechnungen eines Monats (noch nicht bezahlt, Fälligkeit im Monat oder überfällig). */
export function openBillsUntil(bills: Bill[], until: ISODate): Bill[] {
  return bills.filter((b) => !b.paidAt && b.due <= until).sort((a, b) => a.due.localeCompare(b.due));
}

export interface BudgetUsage {
  category: string;
  budget: number;
  spent: number;
  ratio: number;
}

export function budgetUsage(budgets: Budget[], summary: MonthSummary): BudgetUsage[] {
  return budgets.map((b) => {
    const spent = summary.byCategory.find((c) => c.category === b.category)?.amount ?? 0;
    return { category: b.category, budget: b.amount, spent, ratio: b.amount > 0 ? spent / b.amount : 0 };
  });
}
