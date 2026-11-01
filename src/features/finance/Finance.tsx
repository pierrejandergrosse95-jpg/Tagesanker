import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowDown, ArrowUp, BarChart3, Check, ChevronLeft, ChevronRight, Landmark, Plus, Receipt, Repeat, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { t, t as tr } from '../../i18n';
import { HubHero, ScrollMenu } from '../../ui/hub';
import { addDays, addMonths, endOfMonth, fmtMonthYear, fmtShort, monthNamesShort, relDay, startOfMonth } from '../../core/dates';
import { db } from '../../core/db';
import { useToday } from '../../core/hooks';
import { describeRecurrence, nextOccurrence, NO_REPEAT } from '../../core/recurrence';
import { withoutId } from '../../core/util';
import type { Bill, Debt, FinanceEntry, FinanceKind } from '../../core/types';
import { Bars, Donut, Empty, Field, Hint, ProgressBar, RecurrencePicker, Segmented, Sheet, TopBar, useUi } from '../../ui/components';
import {
  billStatus, budgetUsage, centsToInput, EXPENSE_CATEGORIES, fmtMoney, INCOME_CATEGORIES, monthSummary, parseMoney,
  type BillStatus,
} from './logic';

const STATUS: Record<BillStatus, { label: string; cls: string }> = {
  paid: { label: 'Bezahlt', cls: '' }, overdue: { label: 'Überfällig', cls: 'danger' }, soon: { label: 'Bald fällig', cls: 'gold' }, open: { label: 'Offen', cls: '' },
};

function MoneyField({ label, cents, onChange }: { label: string; cents: number; onChange: (c: number) => void }) {
  const [text, setText] = useState(cents ? centsToInput(cents) : '');
  return (
    <Field label={label}>
      <input className="input" inputMode="decimal" placeholder="0,00 €" value={text} onChange={(e) => { setText(e.target.value); const v = parseMoney(e.target.value); if (v != null) onChange(v); }} />
    </Field>
  );
}

/** Zahlung als bezahlt markieren – bei Wiederholung wird die nächste Fälligkeit angelegt. */
export async function payBill(b: Bill, paidAt: string): Promise<void> {
  await db.transaction('rw', db.bills, db.debts, async () => {
    if (b.paidAt) {
      await db.bills.update(b.id!, { paidAt: undefined });
      if (b.debtId) {
        const d = await db.debts.get(b.debtId);
        if (d) await db.debts.update(d.id!, { paid: Math.max(0, d.paid - b.amount) });
      }
      return;
    }
    await db.bills.update(b.id!, { paidAt });
    let continueSeries = b.recurrence.freq !== 'none';
    if (b.debtId) {
      const d = await db.debts.get(b.debtId);
      if (d) {
        const paid = d.paid + b.amount;
        await db.debts.update(d.id!, { paid });
        if (paid >= d.total) continueSeries = false;
        else {
          const nextAmount = Math.min(d.rate, d.total - paid);
          if (continueSeries) {
            const next = nextOccurrence(b.due, b.recurrence, b.due);
            const exists = next && (await db.bills.where('due').equals(next).filter((x) => x.debtId === b.debtId).count());
            if (next && !exists) await db.bills.add({ ...withoutId(b), due: next, paidAt: undefined, amount: nextAmount });
          }
          return;
        }
      }
    }
    if (continueSeries) {
      const next = nextOccurrence(b.due, b.recurrence, b.due);
      if (next) await db.bills.add({ ...withoutId(b), due: next, paidAt: undefined });
    }
  });
}

export function EntryEditor({ entry, onClose }: { entry: FinanceEntry | null; onClose: () => void }) {
  const [e, setE] = useState(entry);
  useEffect(() => setE(entry), [entry]);
  if (!e) return null;
  const set = (p: Partial<FinanceEntry>) => setE({ ...e, ...p });
  const cats = e.kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return (
    <Sheet open onClose={onClose} title={e.id ? tr('Buchung bearbeiten') : e.kind === 'income' ? tr('Einnahme erfassen') : tr('Ausgabe erfassen')} actions={<>
      {e.id && <button className="btn danger" onClick={async () => { await db.finance.delete(e.id!); onClose(); }}><Trash2 size={18} /></button>}
      <button className="btn" disabled={!e.title.trim() || e.amount <= 0} onClick={async () => { await db.finance.put(e); onClose(); }}>{t('Speichern')}</button>
    </>}>
      <div className="form">
        <Segmented value={e.kind} onChange={(kind: FinanceKind) => set({ kind, category: kind === 'income' ? 'Gehalt' : 'Sonstiges' })} options={[{ value: 'expense', label: 'Ausgabe' }, { value: 'income', label: 'Einnahme' }]} />
        <Field label="Bezeichnung"><input className="input" autoFocus value={e.title} onChange={(ev) => set({ title: ev.target.value })} placeholder={e.kind === 'income' ? 'z. B. Gehalt' : 'z. B. Wocheneinkauf'} /></Field>
        <div className="grid2">
          <MoneyField label="Betrag" cents={e.amount} onChange={(amount) => set({ amount })} />
          <Field label="Datum"><input className="input" type="date" value={e.date} onChange={(ev) => set({ date: ev.target.value })} /></Field>
        </div>
        <Field label="Kategorie"><select className="select" value={e.category} onChange={(ev) => set({ category: ev.target.value })}>{cats.map((c) => <option key={c} value={c}>{t(c)}</option>)}</select></Field>
        <label className="row"><input type="checkbox" checked={!!e.monthly} onChange={(ev) => set({ monthly: ev.target.checked ? 1 : 0 })} /> {t('Jeden Monat (Fixbetrag ab diesem Monat)')}</label>
        <Field label="Notiz"><input className="input" value={e.note ?? ''} onChange={(ev) => set({ note: ev.target.value })} /></Field>
      </div>
    </Sheet>
  );
}

function BillEditor({ bill, onClose }: { bill: Bill | null; onClose: () => void }) {
  const [b, setB] = useState(bill);
  const { confirm } = useUi();
  useEffect(() => setB(bill), [bill]);
  if (!b) return null;
  const set = (p: Partial<Bill>) => setB({ ...b, ...p });
  return (
    <Sheet open onClose={onClose} title={b.id ? tr('Zahlung bearbeiten') : tr('Neue Zahlung / Rechnung')} actions={<>
      {b.id && <button className="btn danger" onClick={async () => { if (await confirm('Zahlung löschen?', { ok: 'Löschen', danger: true })) { await db.bills.delete(b.id!); onClose(); } }}><Trash2 size={18} /></button>}
      <button className="btn" disabled={!b.title.trim() || b.amount <= 0} onClick={async () => { await db.bills.put(b); onClose(); }}>{t('Speichern')}</button>
    </>}>
      <div className="form">
        <Field label="Bezeichnung"><input className="input" autoFocus value={b.title} onChange={(e) => set({ title: e.target.value })} placeholder={t('z. B. Strom, Handyvertrag')} /></Field>
        <div className="grid2">
          <MoneyField label="Betrag" cents={b.amount} onChange={(amount) => set({ amount })} />
          <Field label="Fällig am"><input className="input" type="date" value={b.due} onChange={(e) => set({ due: e.target.value })} /></Field>
        </div>
        <Field label="Kategorie"><select className="select" value={b.category} onChange={(e) => set({ category: e.target.value })}>{EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{t(c)}</option>)}</select></Field>
        <Field label="Wiederholung"><RecurrencePicker value={b.recurrence} onChange={(recurrence) => set({ recurrence })} allow={['none', 'monthly', 'yearly', 'weekly', 'interval']} /></Field>
        <Field label="Erinnern">
          <select className="select" value={b.remindDays} onChange={(e) => set({ remindDays: Number(e.target.value) })}>
            {[0, 1, 2, 3, 5, 7, 14].map((d) => <option key={d} value={d}>{d === 0 ? tr('Am Fälligkeitstag') : `${d} Tag(e) vorher`}</option>)}
          </select>
        </Field>
        <Field label="Notiz"><input className="input" value={b.note ?? ''} onChange={(e) => set({ note: e.target.value })} /></Field>
      </div>
    </Sheet>
  );
}

function DebtEditor({ debt, onClose }: { debt: Debt | null; onClose: () => void }) {
  const [d, setD] = useState(debt);
  const day = useToday();
  const { confirm } = useUi();
  useEffect(() => setD(debt), [debt]);
  if (!d) return null;
  const set = (p: Partial<Debt>) => setD({ ...d, ...p });
  const save = async () => {
    if (!d.title.trim() || d.total <= 0) return;
    if (d.id) {
      await db.debts.put(d);
    } else {
      const id = await db.debts.add(d);
      // Erste Rate als wiederkehrende Zahlung anlegen
      let due = `${day.slice(0, 8)}${String(Math.min(d.dayOfMonth, 28)).padStart(2, '0')}`;
      if (due < day) due = addMonths(due, 1);
      if (d.rate > 0 && d.paid < d.total) {
        await db.bills.add({ title: `${t('Rate')}: ${d.title}`, amount: Math.min(d.rate, d.total - d.paid), category: 'Kredite', due, recurrence: { freq: 'monthly' }, remindDays: 3, debtId: id });
      }
    }
    onClose();
  };
  return (
    <Sheet open onClose={onClose} title={d.id ? tr('Schuld / Kredit bearbeiten') : tr('Ratenzahlung anlegen')} actions={<>
      {d.id && <button className="btn danger" onClick={async () => { if (await confirm('Eintrag und offene Raten löschen?', { ok: 'Löschen', danger: true })) { await db.bills.where('debtId').equals(d.id!).filter((b) => !b.paidAt).delete(); await db.debts.delete(d.id!); onClose(); } }}><Trash2 size={18} /></button>}
      <button className="btn" onClick={save}>{t('Speichern')}</button>
    </>}>
      <div className="form">
        <Field label="Bezeichnung"><input className="input" value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder={t('z. B. Autokredit, Ratenkauf Waschmaschine')} /></Field>
        <Field label="Gläubiger (optional)"><input className="input" value={d.creditor ?? ''} onChange={(e) => set({ creditor: e.target.value })} /></Field>
        <div className="grid2">
          <MoneyField label="Gesamtbetrag" cents={d.total} onChange={(total) => set({ total })} />
          <MoneyField label="Bereits getilgt" cents={d.paid} onChange={(paid) => set({ paid })} />
        </div>
        <div className="grid2">
          <MoneyField label="Monatliche Rate" cents={d.rate} onChange={(rate) => set({ rate })} />
          <Field label="Fällig am (Tag)"><input className="input" type="number" min={1} max={31} value={d.dayOfMonth} onChange={(e) => set({ dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })} /></Field>
        </div>
        {!d.id && <Hint>{t('Die monatliche Rate wird automatisch als wiederkehrende Zahlung angelegt. Beim Bezahlen wird der Restbetrag reduziert.')}</Hint>}
      </div>
    </Sheet>
  );
}

function BudgetSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];
  const [cat, setCat] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState(0);
  if (!open) return null;
  return (
    <Sheet open onClose={onClose} title="Monatsbudgets">
      <div className="stack">
        {budgets.length > 0 && (
          <div className="list">
            {budgets.map((b) => (
              <div key={b.id} className="list-item">
                <div className="grow"><div className="title">{b.category}</div><div className="meta">{fmtMoney(b.amount)} {t('/ Monat')}</div></div>
                <button className="icon-btn" aria-label={t('Entfernen')} onClick={() => db.budgets.delete(b.id!)}><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="grid2">
          <Field label="Kategorie"><select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>{EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{t(c)}</option>)}</select></Field>
          <MoneyField label="Budget" cents={amount} onChange={setAmount} />
        </div>
        <button className="btn secondary" disabled={amount <= 0} onClick={async () => {
          const ex = await db.budgets.where('category').equals(cat).first();
          if (ex) await db.budgets.update(ex.id!, { amount });
          else await db.budgets.add({ category: cat, amount });
        }}><Plus size={18} /> {t('Budget festlegen')}</button>
      </div>
    </Sheet>
  );
}

function BillRow({ b, onEdit }: { b: Bill; onEdit: (b: Bill) => void }) {
  const day = useToday();
  const st = billStatus(b, day);
  return (
    <div className={`list-item ${b.paidAt ? 'done' : ''}`}>
      <button className={`check ${b.paidAt ? 'on' : ''}`} aria-label={b.paidAt ? tr('Als offen markieren') : 'Als bezahlt markieren'} onClick={() => void payBill(b, day)}>{b.paidAt && <Check size={16} />}</button>
      <button className="grow" style={{ background: 'none', border: 0, textAlign: 'left', padding: 0 }} onClick={() => onEdit(b)}>
        <div className="title">{b.title}</div>
        <div className="meta row" style={{ gap: 6 }}>
          {b.paidAt ? `Bezahlt am ${fmtShort(b.paidAt)}` : `Fällig ${relDay(b.due, day).toLowerCase()} · ${fmtShort(b.due)}`}
          {b.recurrence.freq !== 'none' && <><Repeat size={11} />{describeRecurrence(b.recurrence)}</>}
        </div>
      </button>
      <div style={{ textAlign: 'right' }}>
        <div className="bold">{fmtMoney(b.amount)}</div>
        {!b.paidAt && <span className={`badge ${STATUS[st].cls}`}>{STATUS[st].label}</span>}
      </div>
    </div>
  );
}

type Tab = 'bills' | 'fixed' | 'expenses' | 'income' | 'debts' | 'stats';
const TITLES: Record<Tab, string> = { bills: 'Zahlungen', fixed: 'Fixkosten', expenses: 'Ausgaben', income: 'Einnahmen', debts: 'Raten & Schulden', stats: 'Budget & Statistiken' };

function MonthSwitch({ month, setMonth }: { month: string; setMonth: (m: string) => void }) {
  return (
    <div className="row between mb">
      <button className="icon-btn" aria-label={t('Vorheriger Monat')} onClick={() => setMonth(addMonths(month, -1, 1))}><ChevronLeft /></button>
      <h2>{fmtMonthYear(month)}</h2>
      <button className="icon-btn" aria-label={t('Nächster Monat')} onClick={() => setMonth(addMonths(month, 1, 1))}><ChevronRight /></button>
    </div>
  );
}

export default function FinanceScreen() {
  const day = useToday();
  const { section } = useParams();
  const tab = (section as Tab | undefined) ?? null;
  const [month, setMonth] = useState(startOfMonth(day));
  const [editEntry, setEditEntry] = useState<FinanceEntry | null>(null);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const entries = useLiveQuery(() => db.finance.toArray(), []) ?? [];
  const bills = useLiveQuery(() => db.bills.toArray(), []) ?? [];
  const debts = useLiveQuery(() => db.debts.toArray(), []) ?? [];
  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];

  const summary = useMemo(() => monthSummary(month, entries, bills), [month, entries, bills]);
  const openThisMonth = bills.filter((b) => !b.paidAt && b.due <= endOfMonth(month)).sort((a, b) => a.due.localeCompare(b.due));
  const openSum = openThisMonth.reduce((s, b) => s + b.amount, 0);
  const available = summary.balance - openSum;
  const year = month.slice(0, 4);
  const yearData = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const m = `${year}-${String(i + 1).padStart(2, '0')}-01`;
    const s = monthSummary(m, entries, bills);
    return { label: monthNamesShort()[i].slice(0, 1), a: s.income, b: s.expenses, s };
  }), [year, entries, bills]);
  const inMonth = (e: FinanceEntry) => (e.monthly ? e.date <= endOfMonth(month) : e.date.slice(0, 7) === month.slice(0, 7));
  const listFor = (f: (e: FinanceEntry) => boolean) => entries.filter((e) => inMonth(e) && f(e)).sort((a, b) => b.date.localeCompare(a.date));
  const usage = budgetUsage(budgets, summary);
  const openCount = bills.filter((b) => !b.paidAt).length;

  const newEntry = (kind: FinanceKind, monthly = false): FinanceEntry => ({ kind, title: '', amount: 0, category: kind === 'income' ? 'Gehalt' : monthly ? 'Wohnen' : 'Lebensmittel', date: day, monthly: monthly ? 1 : 0 });
  const newBill = (): Bill => ({ title: '', amount: 0, category: 'Sonstiges', due: addDays(day, 7), recurrence: NO_REPEAT, remindDays: 3 });
  const newDebt = (): Debt => ({ title: '', total: 0, rate: 0, dayOfMonth: 1, paid: 0 });

  const editors = (
    <>
      <EntryEditor entry={editEntry} onClose={() => setEditEntry(null)} />
      <BillEditor bill={editBill} onClose={() => setEditBill(null)} />
      <DebtEditor debt={editDebt} onClose={() => setEditDebt(null)} />
      <BudgetSheet open={budgetOpen} onClose={() => setBudgetOpen(false)} />
    </>
  );

  const entryList = (list: FinanceEntry[], empty: string) => list.length ? (
    <div className="list">
      {list.map((e) => (
        <button key={e.id} className="list-item" onClick={() => setEditEntry(e)}>
          <div className="grow">
            <div className="title">{e.title}</div>
            <div className="meta row" style={{ gap: 4 }}>{t(e.category)} · {e.monthly ? <><Repeat size={11} /> {t('monatlich')}</> : fmtShort(e.date)}</div>
          </div>
          <div className="bold" style={{ color: e.kind === 'income' ? 'var(--ok)' : undefined }}>{e.kind === 'income' ? '+' : '−'}{fmtMoney(e.amount)}</div>
        </button>
      ))}
    </div>
  ) : <div className="card"><Empty text={empty} /></div>;

  if (!tab) {
    return (
      <div className="screen">
        <HubHero title={t('Finanzen')} back={false} image="finance"
          actions={<button className="icon-btn" aria-label={t('Ausgabe erfassen')} onClick={() => setEditEntry(newEntry('expense'))}><Plus size={24} /></button>} />
        <MonthSwitch month={month} setMonth={setMonth} />
        <div className="row" style={{ gap: 10, alignItems: 'stretch' }}>
          <button className="gold-tile grow" style={{ minHeight: 80, background: '#1f4a2c' }} onClick={() => setEditEntry(newEntry('income'))}>
            <span className="t">{t('Einnahmen')}</span><span className="kpi" style={{ fontSize: 20 }}>{fmtMoney(summary.income)}</span>
          </button>
          <div style={{ width: 112, flex: 'none' }}>
            <Donut size={112} stroke={9} segments={[{ value: summary.expenses, color: '#c0453a' }, { value: Math.max(0, summary.balance), color: '#3f8a52' }]}>
              <div><div className="tiny muted">{t('Saldo')}</div><div className="bold" style={{ fontSize: 14, color: summary.balance < 0 ? 'var(--danger)' : 'var(--ok)' }}>{summary.balance >= 0 ? '+' : ''}{fmtMoney(summary.balance)}</div></div>
            </Donut>
          </div>
          <button className="gold-tile grow" style={{ minHeight: 80, background: '#4a1f22' }} onClick={() => setEditEntry(newEntry('expense'))}>
            <span className="t">{t('Ausgaben')}</span><span className="kpi" style={{ fontSize: 20 }}>{fmtMoney(summary.expenses)}</span>
          </button>
        </div>
        <div className="small muted center mt mb">{t('Verfügbar nach offenen Zahlungen')}: <b style={{ color: available < 0 ? 'var(--danger)' : undefined }}>{fmtMoney(available)}</b></div>
        <ScrollMenu items={[
          { key: 'bills', label: t('Zahlungen'), icon: <Receipt size={20} />, badge: openCount ? t('{n} offen', { n: openCount }) : undefined, to: '/finance/bills' },
          { key: 'fixed', label: t('Fixkosten'), icon: <Repeat size={20} />, to: '/finance/fixed' },
          { key: 'expenses', label: t('Ausgaben'), icon: <ArrowDown size={20} />, to: '/finance/expenses' },
          { key: 'income', label: t('Einnahmen'), icon: <ArrowUp size={20} />, to: '/finance/income' },
          { key: 'debts', label: t('Raten & Schulden'), icon: <Landmark size={20} />, badge: debts.length || undefined, to: '/finance/debts' },
          { key: 'stats', label: t('Budget & Statistiken'), icon: <BarChart3 size={20} />, to: '/finance/stats' },
        ]} />
        <Hint>{t('Alle Beträge werden nur lokal auf deinem Gerät gespeichert. Es ist keine Bankverbindung nötig.')}</Hint>
        {editors}
      </div>
    );
  }

  const add = () => {
    if (tab === 'bills') setEditBill(newBill());
    else if (tab === 'debts') setEditDebt(newDebt());
    else if (tab === 'income') setEditEntry(newEntry('income'));
    else if (tab === 'fixed') setEditEntry(newEntry('expense', true));
    else setEditEntry(newEntry('expense'));
  };

  return (
    <div className="screen">
      <TopBar title={TITLES[tab]} back="/finance" actions={<button className="icon-btn filled" aria-label={t('Neu')} onClick={add}><Plus size={22} /></button>} />
      {(tab === 'expenses' || tab === 'income' || tab === 'fixed' || tab === 'stats') && <MonthSwitch month={month} setMonth={setMonth} />}

      {tab === 'fixed' && entryList(listFor((e) => e.monthly === 1), tr('Noch keine Fixkosten oder festen Einnahmen. Lege z. B. Miete oder Gehalt als monatliche Buchung an.'))}
      {tab === 'expenses' && entryList(listFor((e) => e.kind === 'expense'), tr('Keine Ausgaben in diesem Monat.'))}
      {tab === 'income' && entryList(listFor((e) => e.kind === 'income'), tr('Keine Einnahmen in diesem Monat.'))}

      {tab === 'stats' && (
        <div className="stack">
          <div className="card">
            <Donut segments={[{ value: summary.expenses, color: 'var(--sage)' }, { value: openSum, color: 'var(--danger)' }, { value: Math.max(0, available), color: 'var(--gold)' }]}>
              <div>
                <div className="kpi" style={{ color: available < 0 ? 'var(--danger)' : undefined }}>{fmtMoney(available)}</div>
                <div className="tiny muted">{t('verfügbar')}</div>
              </div>
            </Donut>
            <div className="row center mt" style={{ justifyContent: 'center', gap: 14 }}>
              <span className="row tiny muted" style={{ gap: 4 }}><span className="swatch" style={{ background: 'var(--sage)' }} />{t('Ausgaben')}</span>
              <span className="row tiny muted" style={{ gap: 4 }}><span className="swatch" style={{ background: 'var(--danger)' }} />{t('Offen')}</span>
              <span className="row tiny muted" style={{ gap: 4 }}><span className="swatch" style={{ background: 'var(--gold)' }} />{t('Verfügbar')}</span>
            </div>
          </div>
          <div className="section-title"><h2>{t('Ausgaben nach Kategorie')}</h2><button onClick={() => setBudgetOpen(true)}>{t('Budgets')}</button></div>
          <div className="card stack">
            {summary.byCategory.length ? summary.byCategory.map((c) => {
              const u = usage.find((x) => x.category === c.category);
              return (
                <div key={c.category}>
                  <div className="row between small"><span>{t(c.category)}</span><span className="bold">{fmtMoney(c.amount)}{u ? <span className="muted"> / {fmtMoney(u.budget)}</span> : null}</span></div>
                  <ProgressBar value={u ? u.ratio : c.amount / Math.max(1, summary.expenses)} color={u && u.ratio > 1 ? 'var(--danger)' : undefined} />
                </div>
              );
            }) : <div className="muted small">{t('Noch keine Ausgaben in diesem Monat.')}</div>}
            {usage.filter((u) => !summary.byCategory.some((c) => c.category === u.category)).map((u) => (
              <div key={u.category}><div className="row between small"><span>{t(u.category)}</span><span className="muted">{fmtMoney(0)} / {fmtMoney(u.budget)}</span></div><ProgressBar value={0} /></div>
            ))}
          </div>
          <div className="section-title"><h2>{t('Jahresübersicht')} {year}</h2></div>
          <div className="card">
            <Bars data={yearData} format={(n) => fmtMoney(n)} />
            <div className="row mt" style={{ justifyContent: 'center', gap: 14 }}>
              <span className="row tiny muted" style={{ gap: 4 }}><span className="swatch" style={{ background: 'var(--sage)' }} />{t('Einnahmen')}</span>
              <span className="row tiny muted" style={{ gap: 4 }}><span className="swatch" style={{ background: 'var(--gold)' }} />{t('Ausgaben')}</span>
            </div>
          </div>
          <div className="grid2">
            <div className="card"><div className="card-label">{t('Einnahmen')} {year}</div><div className="kpi">{fmtMoney(yearData.reduce((s, d) => s + d.a, 0))}</div></div>
            <div className="card"><div className="card-label">{t('Ausgaben')} {year}</div><div className="kpi">{fmtMoney(yearData.reduce((s, d) => s + (d.b ?? 0), 0))}</div></div>
          </div>
          <div className="list">
            {yearData.map((d, i) => (
              <div key={i} className="list-item">
                <div className="grow">{monthNamesShort()[i]}</div>
                <div className="small" style={{ color: d.s.balance < 0 ? 'var(--danger)' : 'var(--ok)' }}>{d.s.balance >= 0 ? '+' : ''}{fmtMoney(d.s.balance)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'bills' && (
        <div className="stack">
          {(['overdue', 'soon', 'open'] as BillStatus[]).map((st) => {
            const list = bills.filter((b) => billStatus(b, day) === st).sort((a, b) => a.due.localeCompare(b.due));
            if (!list.length) return null;
            return (
              <div key={st}>
                <div className="small bold muted" style={{ margin: '6px 4px' }}>{t(STATUS[st].label)} · {fmtMoney(list.reduce((s, b) => s + b.amount, 0))}</div>
                <div className="list">{list.map((b) => <BillRow key={b.id} b={b} onEdit={setEditBill} />)}</div>
              </div>
            );
          })}
          {!bills.some((b) => !b.paidAt) && <div className="card"><Empty icon={<Receipt size={30} />} text="Keine offenen Zahlungen." /></div>}
          <button className="btn secondary" onClick={() => setEditBill(newBill())}><Plus size={18} /> {t('Zahlung / Rechnung hinzufügen')}</button>
          {bills.some((b) => b.paidAt) && (
            <>
              <div className="small bold muted" style={{ margin: '6px 4px' }}>{t('Zuletzt bezahlt')}</div>
              <div className="list">{bills.filter((b) => b.paidAt).sort((a, b) => b.paidAt!.localeCompare(a.paidAt!)).slice(0, 10).map((b) => <BillRow key={b.id} b={b} onEdit={setEditBill} />)}</div>
            </>
          )}
        </div>
      )}

      {tab === 'debts' && (
        <div className="stack">
          {debts.length ? debts.map((d) => {
            const rest = Math.max(0, d.total - d.paid);
            const months = d.rate > 0 ? Math.ceil(rest / d.rate) : null;
            return (
              <button key={d.id} className="card tap" onClick={() => setEditDebt(d)}>
                <div className="row between"><div className="bold">{d.title}</div><span className="badge">{rest === 0 ? t('Abbezahlt 🎉') : t('{n} Raten offen', { n: months ?? '–' })}</span></div>
                {d.creditor && <div className="small muted">{d.creditor}</div>}
                <div className="mt"><ProgressBar value={d.paid / Math.max(1, d.total)} /></div>
                <div className="row between small mt"><span className="muted">{t('Getilgt')} {fmtMoney(d.paid)}</span><span>{t('Rest')} <b>{fmtMoney(rest)}</b></span></div>
                <div className="tiny muted">{t('Rate {rate} am {day}. des Monats', { rate: fmtMoney(d.rate), day: d.dayOfMonth })}</div>
              </button>
            );
          }) : <div className="card"><Empty icon={<Landmark size={30} />} text="Keine Kredite oder Ratenzahlungen erfasst." /></div>}
          {debts.length > 0 && (
            <div className="card row between"><span>{t('Gesamtschulden')}</span><b>{fmtMoney(debts.reduce((s, d) => s + Math.max(0, d.total - d.paid), 0))}</b></div>
          )}
          <button className="btn secondary" onClick={() => setEditDebt(newDebt())}><Plus size={18} /> {t('Ratenzahlung / Schuld anlegen')}</button>
        </div>
      )}

      {editors}
    </div>
  );
}
