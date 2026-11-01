import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, Pencil, Plus, Repeat, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  addDays, addMonths, daysInRange, endOfMonth, fmtDayMonth, fmtDuration, fmtLong, fmtMonthYear, fromISO, startOfMonth,
  startOfWeek, weekdaysShort,
} from '../../core/dates';
import { db } from '../../core/db';
import { t, t as tr } from '../../i18n';
import { useSettings, useToday } from '../../core/hooks';
import type { ISODate, Shift, ShiftKind, ShiftPattern, ShiftType } from '../../core/types';
import { ColorPicker, Empty, Field, Hint, Segmented, Sheet, useUi } from '../../ui/components';
import { HubHero } from '../../ui/hub';
import { contrastText, expandPattern, resolveShift, shiftMinutes, workStats } from './logic';

const KIND_LABEL: Record<ShiftKind, string> = { work: 'Arbeit', vacation: 'Urlaub', off: 'Frei', sick: 'Krank' };

/** Auswahl-Sheet: Schicht für einen Tag setzen, Zeiten anpassen, entfernen. */
export function ShiftDaySheet({ date, onClose }: { date: ISODate | null; onClose: () => void }) {
  const types = useLiveQuery(() => db.shiftTypes.orderBy('order').toArray(), []) ?? [];
  const existing = useLiveQuery(() => (date ? db.shifts.where('date').equals(date).first() : undefined), [date]);
  const [draft, setDraft] = useState<Shift | null>(null);
  useEffect(() => {
    if (date) setDraft(existing ?? null);
  }, [existing, date]);
  if (!date) return null;
  const type = types.find((t) => t.id === draft?.typeId);
  const save = async () => {
    if (!draft) return;
    const clean: Shift = { ...draft, date };
    if (type && clean.start === type.start) delete clean.start;
    if (type && clean.end === type.end) delete clean.end;
    if (type && clean.breakMin === type.breakMin) delete clean.breakMin;
    const prev = await db.shifts.where('date').equals(date).first();
    if (prev) await db.shifts.put({ ...clean, id: prev.id });
    else await db.shifts.add(clean);
    onClose();
  };
  const remove = async () => {
    await db.shifts.where('date').equals(date).delete();
    onClose();
  };
  return (
    <Sheet open onClose={onClose} title={fmtLong(date)} actions={<>
      {existing && <button className="btn danger" onClick={remove}><Trash2 size={18} /> {t('Entfernen')}</button>}
      <button className="btn" onClick={save} disabled={!draft}>{t('Speichern')}</button>
    </>}>
      <div className="form">
        <div className="grid3">
          {types.map((t) => (
            <button key={t.id} className="card tap center" style={{ padding: 10, background: draft?.typeId === t.id ? t.color : undefined, color: draft?.typeId === t.id ? contrastText(t.color) : undefined, borderColor: t.color }}
              onClick={() => setDraft({ date, typeId: t.id!, note: draft?.note })}>
              <div className="bold">{tr(t.short)}</div>
              <div className="tiny">{tr(t.name)}</div>
            </button>
          ))}
        </div>
        {draft && type?.kind === 'work' && (
          <>
            <div className="grid3">
              <Field label="Beginn"><input className="input" type="time" value={draft.start ?? type.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} /></Field>
              <Field label="Ende"><input className="input" type="time" value={draft.end ?? type.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} /></Field>
              <Field label="Pause (min)"><input className="input" type="number" min={0} value={draft.breakMin ?? type.breakMin} onChange={(e) => setDraft({ ...draft, breakMin: Number(e.target.value) || 0 })} /></Field>
            </div>
            <div className="muted small">Arbeitszeit: <b>{fmtDuration(shiftMinutes(resolveShift(draft, types)!))}</b></div>
          </>
        )}
        {draft && <Field label="Notiz"><input className="input" value={draft.note ?? ''} onChange={(e) => setDraft({ ...draft, note: e.target.value })} /></Field>}
      </div>
    </Sheet>
  );
}

function TypeEditor({ type, onClose }: { type: ShiftType | null; onClose: () => void }) {
  const [t, setT] = useState(type);
  const { confirm } = useUi();
  useEffect(() => setT(type), [type]);
  if (!t) return null;
  const set = (p: Partial<ShiftType>) => setT({ ...t, ...p });
  const save = async () => {
    if (!t.name.trim()) return;
    if (t.id) await db.shiftTypes.put(t);
    else await db.shiftTypes.add({ ...t, order: Date.now() });
    onClose();
  };
  const remove = async () => {
    if (!t.id) return;
    const used = await db.shifts.where('typeId').equals(t.id).count();
    if (await confirm(used ? tr('Diese Schichtart ist an {n} Tagen eingetragen. Diese Einträge werden ebenfalls gelöscht.', { n: used }) : tr('Schichtart löschen?'), { ok: 'Löschen', danger: true })) {
      await db.shifts.where('typeId').equals(t.id).delete();
      await db.shiftTypes.delete(t.id);
      onClose();
    }
  };
  return (
    <Sheet open onClose={onClose} title={t.id ? tr('Schichtart bearbeiten') : tr('Neue Schichtart')} actions={<>
      {t.id && <button className="btn danger" onClick={remove}><Trash2 size={18} /></button>}
      <button className="btn" onClick={save}>{tr('Speichern')}</button>
    </>}>
      <div className="form">
        <div className="grid2">
          <Field label="Name"><input className="input" value={t.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <Field label="Kürzel"><input className="input" maxLength={3} value={tr(t.short)} onChange={(e) => set({ short: e.target.value })} /></Field>
        </div>
        <Field label="Art">
          <select className="select" value={t.kind} onChange={(e) => set({ kind: e.target.value as ShiftKind })}>
            {(Object.keys(KIND_LABEL) as ShiftKind[]).map((k) => <option key={k} value={k}>{tr(KIND_LABEL[k])}</option>)}
          </select>
        </Field>
        {t.kind === 'work' && (
          <div className="grid3">
            <Field label="Beginn"><input className="input" type="time" value={t.start} onChange={(e) => set({ start: e.target.value })} /></Field>
            <Field label="Ende"><input className="input" type="time" value={t.end} onChange={(e) => set({ end: e.target.value })} /></Field>
            <Field label="Pause (min)"><input className="input" type="number" min={0} value={t.breakMin} onChange={(e) => set({ breakMin: Number(e.target.value) || 0 })} /></Field>
          </div>
        )}
        <Field label="Farbe"><ColorPicker value={t.color} onChange={(color) => set({ color })} /></Field>
      </div>
    </Sheet>
  );
}

function PatternSheet({ open, onClose, types }: { open: boolean; onClose: () => void; types: ShiftType[] }) {
  const patterns = useLiveQuery(() => db.shiftPatterns.toArray(), []) ?? [];
  const day = useToday();
  const { toast, confirm } = useUi();
  const [edit, setEdit] = useState<ShiftPattern | null>(null);
  const [apply, setApply] = useState<{ pattern: ShiftPattern; start: ISODate; weeks: number; overwrite: boolean } | null>(null);
  const typeById = (id: number) => types.find((t) => t.id === id);

  const doApply = async () => {
    if (!apply) return;
    const shifts = expandPattern(apply.pattern, apply.start, apply.weeks * 7);
    const end = addDays(apply.start, apply.weeks * 7 - 1);
    await db.transaction('rw', db.shifts, async () => {
      const existing = await db.shifts.where('date').between(apply.start, end, true, true).toArray();
      const byDate = new Map(existing.map((s) => [s.date, s]));
      for (const s of shifts) {
        const prev = byDate.get(s.date);
        if (prev && !apply.overwrite) continue;
        if (prev) await db.shifts.put({ ...s, id: prev.id });
        else await db.shifts.add(s);
      }
      if (apply.overwrite) {
        const covered = new Set(shifts.map((s) => s.date));
        for (const prev of existing) if (!covered.has(prev.date)) await db.shifts.delete(prev.id!);
      }
    });
    toast(t('{n} Schichten eingetragen', { n: shifts.length }));
    setApply(null);
    onClose();
  };

  if (!open) return null;
  if (edit) {
    return (
      <Sheet open onClose={() => setEdit(null)} title={edit.id ? tr('Muster bearbeiten') : tr('Neues Schichtmuster')} actions={<>
        {edit.id && <button className="btn danger" onClick={async () => { if (await confirm('Muster löschen?', { ok: 'Löschen', danger: true })) { await db.shiftPatterns.delete(edit.id!); setEdit(null); } }}><Trash2 size={18} /></button>}
        <button className="btn" disabled={!edit.name.trim() || !edit.sequence.length} onClick={async () => { await db.shiftPatterns.put(edit); setEdit(null); }}>{t('Speichern')}</button>
      </>}>
        <div className="form">
          <Field label="Name"><input className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder={t('z. B. 2-2-2 Wechselschicht')} /></Field>
          <div>
            <div className="small muted mb">{t('Abfolge (')}{edit.sequence.length} Tage) – tippe, um einen Tag zu entfernen:</div>
            <div className="chips">
              {edit.sequence.map((id, i) => {
                const t = typeById(id);
                return <button key={i} className="chip" style={{ background: t?.color ?? 'var(--card-2)', color: t ? contrastText(t.color) : undefined, borderColor: 'transparent' }} onClick={() => setEdit({ ...edit, sequence: edit.sequence.filter((_, j) => j !== i) })}>{t ? tr(t.short) : '·'}</button>;
              })}
            </div>
          </div>
          <div className="small muted">{t('Tag hinzufügen:')}</div>
          <div className="chips">
            {types.map((t) => <button key={t.id} className="chip" onClick={() => setEdit({ ...edit, sequence: [...edit.sequence, t.id!] })}>+ {tr(t.name)}</button>)}
            <button className="chip" onClick={() => setEdit({ ...edit, sequence: [...edit.sequence, 0] })}>{t('+ ohne Eintrag')}</button>
          </div>
        </div>
      </Sheet>
    );
  }
  if (apply) {
    return (
      <Sheet open onClose={() => setApply(null)} title={`„${apply.pattern.name}“ anwenden`} actions={<button className="btn" onClick={doApply}>{t('Eintragen')}</button>}>
        <div className="form">
          <Field label="Beginnt am"><input className="input" type="date" value={apply.start} onChange={(e) => setApply({ ...apply, start: e.target.value })} /></Field>
          <Field label="Für wie viele Wochen?"><input className="input" type="number" min={1} max={104} value={apply.weeks} onChange={(e) => setApply({ ...apply, weeks: Math.max(1, Number(e.target.value) || 1) })} /></Field>
          <label className="row"><input type="checkbox" checked={apply.overwrite} onChange={(e) => setApply({ ...apply, overwrite: e.target.checked })} /> {t('Bestehende Einträge überschreiben')}</label>
        </div>
      </Sheet>
    );
  }
  return (
    <Sheet open onClose={onClose} title="Schichtmuster">
      <div className="stack">
        {patterns.length ? (
          <div className="list">
            {patterns.map((p) => (
              <div key={p.id} className="list-item">
                <div className="grow">
                  <div className="title">{p.name}</div>
                  <div className="meta">{p.sequence.map((id) => (typeById(id) ? tr(typeById(id)!.short) : '·')).join(' ')}</div>
                </div>
                <button className="icon-btn" aria-label={t('Bearbeiten')} onClick={() => setEdit(p)}><Pencil size={18} /></button>
                <button className="btn sm" onClick={() => setApply({ pattern: p, start: startOfWeek(day), weeks: 4, overwrite: false })}>{t('Anwenden')}</button>
              </div>
            ))}
          </div>
        ) : <Empty icon={<Repeat size={28} />} text="Speichere wiederkehrende Abfolgen, z. B. F F S S N N – –, und trage sie mit einem Tipp für Wochen ein." />}
        <button className="btn secondary" onClick={() => setEdit({ name: '', sequence: [] })}><Plus size={18} /> {t('Neues Muster')}</button>
      </div>
    </Sheet>
  );
}

type Tab = 'month' | 'list' | 'account' | 'types';

export default function ShiftsScreen() {
  const day = useToday();
  const settings = useSettings();
  const [tab, setTab] = useState<Tab>('month');
  const [cursor, setCursor] = useState(startOfMonth(day));
  const [selected, setSelected] = useState<ISODate | null>(null);
  const [editType, setEditType] = useState<ShiftType | null>(null);
  const [patternsOpen, setPatternsOpen] = useState(false);
  const types = useLiveQuery(() => db.shiftTypes.orderBy('order').toArray(), []) ?? [];
  const monthFrom = startOfMonth(cursor);
  const monthTo = endOfMonth(cursor);
  const gridStart = startOfWeek(monthFrom);
  const gridEnd = addDays(startOfWeek(monthTo), 6);
  const shifts = useLiveQuery(() => db.shifts.where('date').between(gridStart, gridEnd, true, true).toArray(), [gridStart, gridEnd]) ?? [];
  const yearShifts = useLiveQuery(() => db.shifts.where('date').between(`${cursor.slice(0, 4)}-01-01`, `${cursor.slice(0, 4)}-12-31`, true, true).toArray(), [cursor]) ?? [];
  const firstShift = useLiveQuery(() => db.shifts.orderBy('date').first(), [])?.date;
  const byDate = useMemo(() => new Map(shifts.map((s) => [s.date, s])), [shifts]);
  const typeMap = useMemo(() => new Map(types.map((t) => [t.id!, t])), [types]);

  const until = (end: ISODate) => (end < day ? end : day);
  const weekFrom = startOfWeek(day);
  const stats = {
    week: workStats(weekFrom, addDays(weekFrom, 6), yearShifts, types, settings, firstShift),
    month: workStats(monthFrom, monthTo, yearShifts, types, settings, firstShift),
    monthToDate: workStats(monthFrom, until(monthTo), yearShifts, types, settings, firstShift),
    yearToDate: workStats(`${cursor.slice(0, 4)}-01-01`, until(`${cursor.slice(0, 4)}-12-31`), yearShifts, types, settings, firstShift),
  };

  return (
    <div className="screen">
      <HubHero compact title={t('Schichtplan')} image="shifts" actions={<button className="icon-btn" aria-label={t('Schicht eintragen')} onClick={() => setSelected(day)}><Plus size={24} /></button>} />
      <Segmented value={tab} onChange={setTab} options={[{ value: 'month', label: 'Monat' }, { value: 'list', label: 'Liste' }, { value: 'account', label: 'Stunden' }, { value: 'types', label: 'Schichtarten' }]} />

      {(tab === 'month' || tab === 'list' || tab === 'account') && (
        <div className="row between mb">
          <button className="icon-btn" aria-label={t('Vorheriger Monat')} onClick={() => setCursor(addMonths(cursor, -1, 1))}><ChevronLeft /></button>
          <h2>{fmtMonthYear(cursor)}</h2>
          <button className="icon-btn" aria-label={t('Nächster Monat')} onClick={() => setCursor(addMonths(cursor, 1, 1))}><ChevronRight /></button>
        </div>
      )}

      {tab === 'month' && (
        <>
          <div className="card" style={{ padding: 10 }}>
            <div className="cal-grid">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => <div key={d} className="cal-head">{weekdaysShort()[d]}</div>)}
              {daysInRange(gridStart, gridEnd).map((d) => {
                const s = byDate.get(d);
                const t = s && typeMap.get(s.typeId);
                return (
                  <button key={d} className={`cal-cell ${d.slice(0, 7) !== cursor.slice(0, 7) ? 'other' : ''} ${d === day ? 'today' : ''}`} onClick={() => setSelected(d)} aria-label={fmtLong(d)}>
                    <span className="num">{fromISO(d).getDate()}</span>
                    {t && <span className="shift-pill" style={{ background: t.color, color: contrastText(t.color), fontSize: 11, padding: '1px 6px' }}>{tr(t.short)}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          {(() => {
            const ts = byDate.get(day);
            const r = ts ? resolveShift(ts, typeMap) : null;
            return (
              <button className="gold-tile mt" style={{ width: '100%', alignItems: 'stretch', textAlign: 'left', padding: '12px 16px', minHeight: 0 }} onClick={() => setSelected(day)}>
                <span className="t" style={{ fontSize: 15 }}>{t('Heute')} – {fmtDayMonth(day)}</span>
                {r ? (
                  <>
                    <span className="row between" style={{ marginTop: 6 }}><span className="row" style={{ gap: 8 }}><span className="swatch" style={{ background: r.type.color, width: 12, height: 12 }} />{t(r.type.name)}</span>{r.type.kind === 'work' && <span>{r.start} – {r.end}</span>}</span>
                    {r.type.kind === 'work' && <span className="v" style={{ marginTop: 4 }}>• {t('Arbeitszeit')}: {fmtDuration(shiftMinutes(r))} · {t('Pause')}: {r.breakMin} {t('min')}</span>}
                  </>
                ) : <span className="v">{t('Keine Schicht eingetragen')}</span>}
              </button>
            );
          })()}
          <div className="chips mt">
            {types.map((x) => <span key={x.id} className="row small muted" style={{ gap: 5 }}><span className="swatch" style={{ background: x.color }} />{t(x.name)}</span>)}
          </div>
          <button className="btn secondary block mt" onClick={() => setPatternsOpen(true)}><Repeat size={18} /> {t('Schichtmuster eintragen')}</button>
          <div className="grid2 mt">
            <div className="card"><div className="card-label">{t('Diese Woche')}</div><div className="kpi">{fmtDuration(stats.week.workedMin)}</div></div>
            <div className="card"><div className="card-label">{t('Saldo Monat (bis heute)')}</div><div className="kpi" style={{ color: stats.monthToDate.balanceMin < 0 ? 'var(--danger)' : 'var(--ok)' }}>{fmtDuration(stats.monthToDate.balanceMin)}</div></div>
          </div>
        </>
      )}

      {tab === 'list' && (
        <div className="list">
          {daysInRange(monthFrom, monthTo).map((d) => {
            const s = byDate.get(d);
            const r = s ? resolveShift(s, typeMap) : null;
            return (
              <button key={d} className="list-item" onClick={() => setSelected(d)} style={{ background: d === day ? 'var(--sage-soft)' : undefined }}>
                <div style={{ width: 40 }}>
                  <div className="small muted">{weekdaysShort()[fromISO(d).getDay()]}</div>
                  <div className="bold">{fromISO(d).getDate()}.</div>
                </div>
                {r ? (
                  <div className="grow card flat" style={{ padding: '8px 12px', background: `color-mix(in srgb, ${r.type.color} 22%, var(--card))` }}>
                    <div className="row"><span className="swatch" style={{ background: r.type.color }} /><span className="bold">{t(r.type.name)}</span></div>
                    <div className="meta">{r.type.kind === 'work' ? `${r.start} – ${r.end} · ${fmtDuration(shiftMinutes(r))}` : t(KIND_LABEL[r.type.kind])}{s?.note ? ` · ${s.note}` : ''}</div>
                  </div>
                ) : <div className="grow faint small">–</div>}
              </button>
            );
          })}
        </div>
      )}

      {tab === 'account' && (
        <div className="stack">
          <div className="card">
            <div className="card-label">{t('Arbeitszeitkonto')} {fmtMonthYear(cursor)}</div>
            <div className="grid2 mt">
              <div><div className="small muted">{t('Ist (gesamt)')}</div><div className="kpi">{fmtDuration(stats.month.workedMin)}</div></div>
              <div><div className="small muted">{t('Soll (Monat)')}</div><div className="kpi">{fmtDuration(stats.month.targetMin)}</div></div>
              <div><div className="small muted">{t('Urlaub / Krank gutgeschr.')}</div><div className="kpi">{fmtDuration(stats.month.creditedMin)}</div></div>
              <div><div className="small muted">{t('Saldo bis heute')}</div><div className="kpi" style={{ color: stats.monthToDate.balanceMin < 0 ? 'var(--danger)' : 'var(--ok)' }}>{fmtDuration(stats.monthToDate.balanceMin)}</div></div>
            </div>
          </div>
          <div className="grid3">
            <div className="card center"><div className="kpi">{stats.month.workDays}</div><div className="tiny muted">{t('Arbeitstage')}</div></div>
            <div className="card center"><div className="kpi">{stats.month.vacationDays}</div><div className="tiny muted">{t('Urlaubstage')}</div></div>
            <div className="card center"><div className="kpi">{stats.month.sickDays}</div><div className="tiny muted">{t('Krank')}</div></div>
          </div>
          <div className="card">
            <div className="card-label">{t('Jahr')} {cursor.slice(0, 4)} {t('bis heute')}</div>
            <div className="row between mt"><span>{t('Gearbeitet')}</span><b>{fmtDuration(stats.yearToDate.workedMin)}</b></div>
            <div className="row between"><span>{t('Urlaubstage')}</span><b>{stats.yearToDate.vacationDays}</b></div>
            <div className="row between"><span>{t('Über-/Minusstunden')}</span><b style={{ color: stats.yearToDate.balanceMin < 0 ? 'var(--danger)' : 'var(--ok)' }}>{fmtDuration(stats.yearToDate.balanceMin)}</b></div>
          </div>
          <Hint>{t('Soll =')} {settings.weeklyHours} Wochenstunden anteilig auf die Kalendertage (ab deinem ersten Eintrag). Urlaub und Krankheit werden mit dem Tagessoll ({fmtDuration((settings.weeklyHours * 60) / settings.workDaysPerWeek)}) gutgeschrieben. Anpassbar in den Einstellungen.</Hint>
        </div>
      )}

      {tab === 'types' && (
        <div className="stack">
          <div className="list">
            {types.map((t) => (
              <button key={t.id} className="list-item" onClick={() => setEditType(t)}>
                <span className="shift-pill" style={{ background: t.color, color: contrastText(t.color), fontSize: 13, padding: '4px 8px' }}>{tr(t.short)}</span>
                <div className="grow">
                  <div className="title">{tr(t.name)}</div>
                  <div className="meta">{t.kind === 'work' ? `${t.start} – ${t.end} · ${tr('Pause')} ${t.breakMin} min` : tr(KIND_LABEL[t.kind])}</div>
                </div>
                <Pencil size={16} className="faint" />
              </button>
            ))}
          </div>
          <button className="btn secondary" onClick={() => setEditType({ name: '', short: '', color: '#6F8C6E', start: '08:00', end: '16:30', breakMin: 30, kind: 'work', order: types.length })}><Plus size={18} /> {t('Eigene Schicht erstellen')}</button>
          <button className="btn ghost" onClick={() => setPatternsOpen(true)}><Repeat size={18} /> {t('Schichtmuster verwalten')}</button>
        </div>
      )}

      <ShiftDaySheet date={selected} onClose={() => setSelected(null)} />
      <TypeEditor type={editType} onClose={() => setEditType(null)} />
      <PatternSheet open={patternsOpen} onClose={() => setPatternsOpen(false)} types={types} />
    </div>
  );
}
