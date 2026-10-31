import { ArrowDown, ArrowUp, Bell, Database, Download, Eye, EyeOff, Lock, Palette, Shield, Sparkles, Trash2, Upload, User, Briefcase, LayoutGrid } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { backupFileName, exportBackupText, isEncrypted, restoreBackupText, wipeAll } from '../../core/backup';
import { hashPin, verifyPin } from '../../core/crypto';
import { updateSettings, useSettings } from '../../core/hooks';
import { CATEGORY_LABELS, cancelAllNotifications, collectReminders, isNative, permissionState, requestPermission, rescheduleAll } from '../../core/notifications';
import { pickFile, saveTextFile } from '../../core/platform';
import type { DashboardWidget, NotifyCategory, Settings, ThemeMode } from '../../core/types';
import { Field, Hint, Segmented, Sheet, Toggle, TopBar, useUi } from '../../ui/components';

const WIDGET_LABELS: Record<DashboardWidget, string> = {
  shift: 'Heutige Schicht', today: 'Überblick-Kacheln', meds: 'Medikamente heute', tasks: 'Offene Aufgaben', bills: 'Anstehende Zahlungen',
  events: 'Nächste Termine', habits: 'Gewohnheiten', moon: 'Mondphase', impulse: 'Spiritueller Tagesimpuls', preview: 'Vorschau nächste Tage',
};

function Group({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section>
      <div className="section-title"><h2 className="row" style={{ gap: 8 }}>{icon}{title}</h2></div>
      <div className="card stack">{children}</div>
    </section>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: ReactNode }) {
  return (
    <div className="row between">
      <div className="grow"><div>{label}</div>{sub && <div className="tiny muted">{sub}</div>}</div>
      {children}
    </div>
  );
}

function PinSheet({ open, onClose, current }: { open: boolean; onClose: () => void; current?: string }) {
  const [oldPin, setOldPin] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [err, setErr] = useState('');
  const { toast } = useUi();
  useEffect(() => { setOldPin(''); setPin(''); setPin2(''); setErr(''); }, [open]);
  const save = async (remove = false) => {
    if (current && !(await verifyPin(oldPin, current))) return setErr('Die bisherige PIN ist falsch.');
    if (remove) {
      await updateSettings({ journalPinHash: undefined });
      toast('PIN entfernt');
      return onClose();
    }
    if (!/^\d{4,6}$/.test(pin)) return setErr('Die PIN muss aus 4–6 Ziffern bestehen.');
    if (pin !== pin2) return setErr('Die PINs stimmen nicht überein.');
    await updateSettings({ journalPinHash: await hashPin(pin) });
    toast('Tagebuch ist jetzt geschützt');
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title={current ? 'Tagebuch-PIN ändern' : 'Tagebuch-PIN festlegen'} actions={<>
      {current && <button className="btn danger" onClick={() => save(true)}>Entfernen</button>}
      <button className="btn" onClick={() => save(false)}>Speichern</button>
    </>}>
      <div className="form">
        {current && <Field label="Bisherige PIN"><input className="input" type="password" inputMode="numeric" value={oldPin} onChange={(e) => setOldPin(e.target.value)} /></Field>}
        <Field label="Neue PIN (4–6 Ziffern)"><input className="input" type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} /></Field>
        <Field label="PIN wiederholen"><input className="input" type="password" inputMode="numeric" maxLength={6} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} /></Field>
        {err && <div className="small" style={{ color: 'var(--danger)' }}>{err}</div>}
        <Hint>Die PIN wird nur als sicherer Hash gespeichert. Wird sie vergessen, kann das Tagebuch nur über „Alle Daten löschen“ zurückgesetzt werden.</Hint>
      </div>
    </Sheet>
  );
}

function BackupSheet({ mode, onClose }: { mode: 'export' | 'import' | null; onClose: () => void }) {
  const { toast, confirm } = useUi();
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setPw(''); setFile(null); }, [mode]);
  if (!mode) return null;
  const doExport = async () => {
    setBusy(true);
    try {
      const text = await exportBackupText(pw || undefined);
      await saveTextFile(backupFileName(!!pw), text);
      localStorage.setItem('kt-last-backup', new Date().toISOString());
      toast('Backup erstellt');
      onClose();
    } catch (e) {
      toast(`Fehler: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };
  const doImport = async () => {
    if (!file) return;
    if (!(await confirm('Alle aktuellen Daten werden durch das Backup ersetzt. Fortfahren?', { ok: 'Wiederherstellen', danger: true }))) return;
    setBusy(true);
    try {
      await restoreBackupText(file, pw || undefined);
      await rescheduleAll();
      toast('Daten wiederhergestellt');
      onClose();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const needsPw = mode === 'import' && file != null && isEncrypted(file);
  return (
    <Sheet open onClose={onClose} title={mode === 'export' ? 'Backup erstellen' : 'Backup wiederherstellen'} actions={
      mode === 'export'
        ? <button className="btn" disabled={busy} onClick={doExport}><Download size={18} /> Exportieren</button>
        : <button className="btn" disabled={busy || !file || (needsPw && !pw)} onClick={doImport}><Upload size={18} /> Wiederherstellen</button>
    }>
      <div className="form">
        {mode === 'import' && (
          <button className="btn secondary" onClick={async () => { const [f] = await pickFile('application/json,.json'); if (f) setFile(await f.text()); }}>
            {file ? 'Datei ausgewählt ✓' : 'Backup-Datei auswählen'}
          </button>
        )}
        {(mode === 'export' || needsPw) && (
          <Field label={mode === 'export' ? 'Passwort zur Verschlüsselung (empfohlen)' : 'Passwort des Backups'}>
            <div className="row">
              <input className="input" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
              <button className="icon-btn" type="button" aria-label="Passwort anzeigen" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </Field>
        )}
        <Hint>{mode === 'export'
          ? 'Das Backup enthält alle Daten inkl. Anhänge, Tagebuch, Finanz- und Gesundheitsdaten. Mit Passwort wird es mit AES-256 verschlüsselt – ohne Passwort ist es lesbar. Bewahre es sicher auf.'
          : 'Beim Wiederherstellen werden die aktuellen Daten vollständig ersetzt.'}</Hint>
      </div>
    </Sheet>
  );
}

export default function SettingsScreen() {
  const s = useSettings();
  const nav = useNavigate();
  const { toast, confirm } = useUi();
  const [perm, setPerm] = useState<string>('prompt');
  const [pinOpen, setPinOpen] = useState(false);
  const [backup, setBackup] = useState<'export' | 'import' | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  useEffect(() => { void permissionState().then(setPerm); }, []);
  useEffect(() => { void collectReminders(s).then((r) => setPending(r.length)); }, [s]);
  const set = (p: Partial<Settings>) => void updateSettings(p);
  const lastBackup = (() => { try { return localStorage.getItem('kt-last-backup'); } catch { return null; } })();

  const moveWidget = (i: number, dir: -1 | 1) => {
    const w = [...s.widgets];
    const j = i + dir;
    if (j < 0 || j >= w.length) return;
    [w[i], w[j]] = [w[j], w[i]];
    set({ widgets: w });
  };

  return (
    <div className="screen">
      <TopBar title="Einstellungen" back />
      <div className="stack">
        <Group icon={<User size={18} />} title="Profil">
          <Field label="Dein Name"><input className="input" value={s.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <button className="btn secondary" onClick={() => nav('/spirit/profile')}>Geburtsprofil & Sternzeichen</button>
        </Group>

        <Group icon={<Palette size={18} />} title="Darstellung">
          <Segmented value={s.theme} onChange={(theme: ThemeMode) => set({ theme })} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Hell' }, { value: 'dark', label: 'Nachtmodus' }]} />
        </Group>

        <Group icon={<LayoutGrid size={18} />} title="Dashboard anpassen">
          {s.widgets.map((w, i) => (
            <div key={w.id} className="row">
              <Toggle checked={w.visible} onChange={(v) => set({ widgets: s.widgets.map((x) => (x.id === w.id ? { ...x, visible: v } : x)) })} label={WIDGET_LABELS[w.id]} />
              <span className="grow" style={{ opacity: w.visible ? 1 : 0.5 }}>{WIDGET_LABELS[w.id]}</span>
              <button className="icon-btn" style={{ width: 32, height: 32 }} aria-label="Nach oben" onClick={() => moveWidget(i, -1)} disabled={i === 0}><ArrowUp size={16} /></button>
              <button className="icon-btn" style={{ width: 32, height: 32 }} aria-label="Nach unten" onClick={() => moveWidget(i, 1)} disabled={i === s.widgets.length - 1}><ArrowDown size={16} /></button>
            </div>
          ))}
        </Group>

        <Group icon={<Briefcase size={18} />} title="Arbeitszeit">
          <div className="grid2">
            <Field label="Sollstunden pro Woche"><input className="input" type="number" min={0} max={80} step={0.5} value={s.weeklyHours} onChange={(e) => set({ weeklyHours: Number(e.target.value) || 0 })} /></Field>
            <Field label="Arbeitstage pro Woche"><input className="input" type="number" min={1} max={7} value={s.workDaysPerWeek} onChange={(e) => set({ workDaysPerWeek: Math.min(7, Math.max(1, Number(e.target.value) || 5)) })} /></Field>
          </div>
        </Group>

        <Group icon={<Bell size={18} />} title="Benachrichtigungen">
          {perm !== 'granted' && (
            <div className="card flat tint">
              <p className="small">{perm === 'denied' ? 'Benachrichtigungen sind in den Systemeinstellungen blockiert.' : 'Erlaube Benachrichtigungen, damit Tagesanker dich erinnern kann.'}</p>
              {perm !== 'denied' && <button className="btn sm mt" onClick={async () => { const ok = await requestPermission(); setPerm(ok ? 'granted' : 'denied'); if (ok) await rescheduleAll(); }}>Erlauben</button>}
            </div>
          )}
          {(Object.keys(CATEGORY_LABELS) as NotifyCategory[]).map((k) => (
            <Row key={k} label={CATEGORY_LABELS[k]}><Toggle checked={s.notify[k]} onChange={(v) => set({ notify: { ...s.notify, [k]: v } })} label={CATEGORY_LABELS[k]} /></Row>
          ))}
          <div className="divider" />
          <div className="grid2">
            <Field label="Tagesimpuls um"><input className="input" type="time" value={s.notifyTimes.impulse} onChange={(e) => set({ notifyTimes: { ...s.notifyTimes, impulse: e.target.value } })} /></Field>
            <Field label="Meditation um"><input className="input" type="time" value={s.notifyTimes.meditation} onChange={(e) => set({ notifyTimes: { ...s.notifyTimes, meditation: e.target.value } })} /></Field>
            <Field label="Aufgaben ohne Uhrzeit um"><input className="input" type="time" value={s.notifyTimes.taskTime} onChange={(e) => set({ notifyTimes: { ...s.notifyTimes, taskTime: e.target.value } })} /></Field>
            <Field label="Schicht-Vorlauf (Min.)"><input className="input" type="number" min={0} max={600} value={s.notifyTimes.shiftLeadMin} onChange={(e) => set({ notifyTimes: { ...s.notifyTimes, shiftLeadMin: Number(e.target.value) || 0 } })} /></Field>
          </div>
          <div className="tiny muted">{pending != null ? `${pending} Erinnerungen in den nächsten 14 Tagen geplant.` : ''} {isNative() ? '' : 'Im Browser erscheinen Erinnerungen nur, solange Tagesanker geöffnet ist – in der Android-App systemweit.'}</div>
        </Group>

        <Group icon={<Lock size={18} />} title="Datenschutz">
          <Row label="Tagebuch-PIN" sub={s.journalPinHash ? 'Aktiv' : 'Nicht gesetzt'}><button className="btn sm secondary" onClick={() => setPinOpen(true)}>{s.journalPinHash ? 'Ändern' : 'Festlegen'}</button></Row>
          <Hint>Alle Daten bleiben ausschließlich lokal auf diesem Gerät. Es gibt kein Konto, keine Cloud und keine Analyse-Tracker.</Hint>
        </Group>

        <Group icon={<Database size={18} />} title="Datensicherung">
          <div className="tiny muted">Letztes Backup: {lastBackup ? new Date(lastBackup).toLocaleString('de-DE') : 'noch keins'}</div>
          <div className="grid2">
            <button className="btn secondary" onClick={() => setBackup('export')}><Download size={18} /> Exportieren</button>
            <button className="btn secondary" onClick={() => setBackup('import')}><Upload size={18} /> Wiederherstellen</button>
          </div>
          <button className="btn danger" onClick={async () => {
            if (!(await confirm('Wirklich ALLE Daten unwiderruflich löschen? Erstelle vorher ein Backup, wenn du sie behalten möchtest.', { ok: 'Alles löschen', danger: true }))) return;
            if (!(await confirm('Letzte Sicherheitsabfrage: Alle Termine, Schichten, Finanzen, Medikamente, Notizen und Tagebucheinträge werden gelöscht.', { ok: 'Endgültig löschen', danger: true }))) return;
            await cancelAllNotifications();
            await wipeAll();
            toast('Alle Daten wurden gelöscht');
            window.location.hash = '#/';
            window.location.reload();
          }}><Trash2 size={18} /> Alle Daten löschen</button>
        </Group>

        <Group icon={<Sparkles size={18} />} title="KI-Unterstützung">
          <Row label="KI-Tagesübersicht & Reflexionsimpulse" sub="Geplant für eine spätere Version. Tagesanker funktioniert vollständig ohne KI."><Toggle checked={false} onChange={() => toast('Diese Funktion folgt in einer späteren Version.')} label="KI" /></Row>
        </Group>

        <Group icon={<Shield size={18} />} title="Über Tagesanker">
          <div className="small">Tagesanker <span className="muted">· Version 0.1.0</span></div>
          <div className="small muted">Dein Alltag. Dein Rhythmus. Deine innere Balance.</div>
          <Hint>Gesundheits- und Finanzfunktionen dienen der Organisation und Dokumentation – keine medizinische oder finanzielle Beratung. Astrologie, Tarot und Impulse sind spirituelle Anregungen, keine gesicherten Tatsachen.</Hint>
        </Group>
      </div>
      <PinSheet open={pinOpen} onClose={() => setPinOpen(false)} current={s.journalPinHash} />
      <BackupSheet mode={backup} onClose={() => setBackup(null)} />
    </div>
  );
}
