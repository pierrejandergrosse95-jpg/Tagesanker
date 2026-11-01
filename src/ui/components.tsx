import { ChevronLeft, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Recurrence } from '../core/types';
import { t } from '../i18n';
import { weekdaysShort } from '../core/dates';

const tr = (x: ReactNode) => (typeof x === 'string' ? t(x) : x);

export function TopBar({ title, sub, back, actions }: { title: ReactNode; sub?: ReactNode; back?: boolean | string; actions?: ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="topbar">
      {back && (
        <button className="icon-btn" aria-label={t('Zurück')} onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}>
          <ChevronLeft size={24} />
        </button>
      )}
      <div className="grow">
        <h1>{tr(title)}</h1>
        {sub && <div className="sub">{tr(sub)}</div>}
      </div>
      {actions}
    </header>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>
          {t(o.label)}
        </button>
      ))}
    </div>
  );
}

export function Sheet({ open, onClose, title, children, actions }: { open: boolean; onClose: () => void; title: string; children: ReactNode; actions?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={t(title)} onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <div className="sheet-head">
          <h2>{t(title)}</h2>
          <button className="icon-btn soft" aria-label={t('Schließen')} onClick={onClose}><X size={20} /></button>
        </div>
        {children}
        {actions && <div className="sheet-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{t(label)}</span>
      {children}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="toggle" aria-label={label ? t(label) : undefined}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  );
}

export function Empty({ icon, text, action }: { icon?: ReactNode; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      {icon}
      <div>{t(text)}</div>
      {action}
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <div className="note-hint">
      <Info size={14} style={{ flex: 'none', marginTop: 2 }} />
      <span>{tr(children)}</span>
    </div>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="progress">
      <div style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }} />
    </div>
  );
}

export function Ring({ value, size = 44, stroke = 5, color = 'var(--sage)', children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--card-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset .4s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600 }}>{children}</div>
    </div>
  );
}

/** Donut mit Segmenten (z. B. Ausgaben vs. verfügbar). */
export function Donut({ segments, size = 168, stroke = 18, children }: { segments: { value: number; color: string }[]; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--card-2)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const len = (Math.max(0, s.value) / total) * c;
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  );
}

/** Einfaches Balkendiagramm mit optionalem Vergleichsbalken. */
export function Bars({ data, height = 140, format }: { data: { label: string; a: number; b?: number }[]; height?: number; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.a, d.b ?? 0]));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: height + 22 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} title={format ? `${format(d.a)}${d.b != null ? ' / ' + format(d.b) : ''}` : undefined}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
            <div style={{ width: d.b != null ? 7 : 14, height: (d.a / max) * height, background: 'var(--sage)', borderRadius: 4, minHeight: d.a ? 2 : 0 }} />
            {d.b != null && <div style={{ width: 7, height: (d.b / max) * height, background: 'var(--gold)', borderRadius: 4, minHeight: d.b ? 2 : 0 }} />}
          </div>
          <span className="tiny faint">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Mond-Symbol mit korrekter Beleuchtung (Terminator als Ellipse). */
export function MoonGlyph({ illumination, waxing, size = 56 }: { illumination: number; waxing: boolean; size?: number }) {
  const r = size / 2 - 1;
  const cx = size / 2;
  const k = Math.max(0, Math.min(1, illumination));
  const rx = Math.abs(1 - 2 * k) * r;
  // Helle Seite: rechts bei zunehmendem Mond (Nordhalbkugel)
  const sweepOuter = waxing ? 1 : 0;
  const sweepInner = k > 0.5 ? (waxing ? 1 : 0) : waxing ? 0 : 1;
  const d = `M ${cx} ${cx - r} A ${r} ${r} 0 0 ${sweepOuter} ${cx} ${cx + r} A ${rx} ${r} 0 0 ${sweepInner} ${cx} ${cx - r} Z`;
  const id = `moonshade-${size}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <defs>
        <radialGradient id={id} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fbf3dc" />
          <stop offset="100%" stopColor="#d8c79c" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cx} r={r} fill="#2a2d3a" />
      {k > 0.01 && <path d={d} fill={`url(#${id})`} />}
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgb(201 165 92 / .5)" strokeWidth={1} />
    </svg>
  );
}

export const PALETTE = ['#1F3A2E', '#6F8C6E', '#A9BFA3', '#C9A55C', '#D9A441', '#C27A6B', '#B5543F', '#8E6BA8', '#6E8FCB', '#4E9A86', '#4F5D75', '#9A8C7A'];

export function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="chips">
      {PALETTE.map((c) => (
        <button key={c} type="button" aria-label={`${t('Farbe')} ${c}`} className={`color-dot ${value.toLowerCase() === c.toLowerCase() ? 'active' : ''}`} style={{ background: c }} onClick={() => onChange(c)} />
      ))}
    </div>
  );
}

const WD = [1, 2, 3, 4, 5, 6, 0];

export function RecurrencePicker({ value, onChange, allow = ['none', 'daily', 'weekly', 'weekdays', 'interval', 'monthly', 'yearly'] }: { value: Recurrence; onChange: (r: Recurrence) => void; allow?: Recurrence['freq'][] }) {
  const labels: Record<Recurrence['freq'], string> = { none: 'Einmalig', daily: 'Täglich', weekly: 'Wöchentlich', weekdays: 'Bestimmte Tage', interval: 'Alle X Tage', monthly: 'Monatlich', yearly: 'Jährlich' };
  return (
    <div className="stack" style={{ gap: 8 }}>
      <select className="select" value={value.freq} onChange={(e) => {
        const freq = e.target.value as Recurrence['freq'];
        onChange({ freq, weekdays: freq === 'weekdays' ? value.weekdays ?? [1, 2, 3, 4, 5] : undefined, every: freq === 'interval' ? value.every ?? 2 : undefined });
      }}>
        {allow.map((f) => <option key={f} value={f}>{t(labels[f])}</option>)}
      </select>
      {value.freq === 'weekdays' && (
        <div className="chips">
          {WD.map((d) => {
            const on = value.weekdays?.includes(d);
            return (
              <button type="button" key={d} className={`chip ${on ? 'active' : ''}`} onClick={() => onChange({ ...value, weekdays: on ? value.weekdays!.filter((x) => x !== d) : [...(value.weekdays ?? []), d] })}>
                {weekdaysShort()[d]}
              </button>
            );
          })}
        </div>
      )}
      {value.freq === 'interval' && (
        <input className="input" type="number" min={1} max={365} value={value.every ?? 2} onChange={(e) => onChange({ ...value, every: Math.max(1, Number(e.target.value) || 1) })} />
      )}
    </div>
  );
}

/* ---------- Toast & Bestätigung ---------- */

interface UiCtx {
  toast: (msg: string) => void;
  confirm: (msg: string, opts?: { ok?: string; danger?: boolean }) => Promise<boolean>;
}
const Ctx = createContext<UiCtx>({ toast: () => {}, confirm: async () => false });
export const useUi = () => useContext(Ctx);

export function UiProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [dlg, setDlg] = useState<{ msg: string; ok: string; danger?: boolean; resolve: (v: boolean) => void } | null>(null);
  const toast = useCallback((m: string) => {
    m = t(m);
    setMsg(m);
    window.setTimeout(() => setMsg((cur) => (cur === m ? null : cur)), 2400);
  }, []);
  const confirm = useCallback((m: string, opts?: { ok?: string; danger?: boolean }) => new Promise<boolean>((resolve) => setDlg({ msg: t(m), ok: t(opts?.ok ?? 'OK'), danger: opts?.danger, resolve })), []);
  const close = (v: boolean) => {
    dlg?.resolve(v);
    setDlg(null);
  };
  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}
      {msg && <div className="toast" role="status">{msg}</div>}
      <Sheet open={!!dlg} onClose={() => close(false)} title="Bitte bestätigen" actions={<>
        <button className="btn secondary" onClick={() => close(false)}>{t('Abbrechen')}</button>
        <button className={`btn ${dlg?.danger ? 'danger' : ''}`} onClick={() => close(true)}>{dlg?.ok}</button>
      </>}>
        <p>{dlg?.msg}</p>
      </Sheet>
    </Ctx.Provider>
  );
}
