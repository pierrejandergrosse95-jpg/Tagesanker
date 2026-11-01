import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, Flower2, Heart, Hourglass, Moon, Music, Pause, Play, Sparkles, Square, Sunrise, Timer, Trash2, Upload, Volume2, VolumeX, Wind } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BREATH_PATTERNS, localBreath, localMeditation, MEDITATIONS } from '../../content/meditations';
import { addDays, today } from '../../core/dates';
import { db } from '../../core/db';
import { pickFile } from '../../core/platform';
import { Empty, Hint, useUi } from '../../ui/components';
import { Scene } from '../../ui/scenes';
import { setHabitValue } from '../habits/Habits';
import { HubHero } from '../../ui/hub';
import { t, lang } from '../../i18n';
import type { ReactNode } from 'react';

const DURATIONS = [5, 10, 15, 20, 30];

let audioCtx: AudioContext | null = null;
/** Sanfter Klangschalen-Ton per WebAudio (keine Audiodatei nötig). */
export function bell(): void {
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx;
    const t = ctx.currentTime;
    for (const [f, g] of [[432, 0.25], [864, 0.08], [1296, 0.04]] as const) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(g, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 6.1);
    }
  } catch {
    /* Audio nicht verfügbar */
  }
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang() === 'en' ? 'en-GB' : 'de-DE';
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

async function logSession(kind: string, minutes: number) {
  if (minutes < 1) return;
  const day = today();
  await db.meditations.add({ date: day, kind, minutes, createdAt: Date.now() });
  const habit = await db.habits.filter((h) => !h.archived && h.name.toLowerCase().includes('meditation')).first();
  if (habit) {
    const log = await db.habitLogs.where('[habitId+date]').equals([habit.id!, day]).first();
    await setHabitValue(habit.id!, day, (log?.value ?? 0) + (habit.unit.toLowerCase().startsWith('min') ? minutes : 1));
  }
}

function Session({ id, minutes }: { id: string; minutes: number }) {
  const nav = useNavigate();
  const { toast } = useUi();
  const total = minutes * 60;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [voice, setVoice] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const startedAt = useRef<number | null>(null);
  const base = useRef(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const finished = useRef(false);

  const rawMed = MEDITATIONS.find((m) => m.id === id);
  const med = rawMed ? localMeditation(rawMed) : undefined;
  const rawBreath = id.startsWith('breath-') ? BREATH_PATTERNS.find((b) => `breath-${b.id}` === id) : undefined;
  const breath = rawBreath ? localBreath(rawBreath) : undefined;
  const audioId = id.startsWith('audio-') ? Number(id.slice(6)) : null;
  const audio = useLiveQuery(() => (audioId ? db.audio.get(audioId) : undefined), [audioId]);
  const audioUrl = useMemo(() => (audio ? URL.createObjectURL(audio.blob) : undefined), [audio]);
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const title = med?.title ?? breath?.name ?? audio?.name ?? t('Stille Meditation');
  const kind = med?.id ?? (breath ? 'breath' : audioId ? 'audio' : 'timer');

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const e = base.current + (Date.now() - (startedAt.current ?? Date.now())) / 1000;
      setElapsed(Math.min(total, e));
      if (e >= total && !finished.current) {
        finished.current = true;
        setRunning(false);
        bell();
        void logSession(kind, minutes);
        toast(t('Schön, dass du dir diese Zeit genommen hast 🌿'));
      }
    }, 250);
    return () => clearInterval(timer);
  }, [running, total, kind, minutes, toast]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (running) void a.play().catch(() => {});
    else a.pause();
  }, [running]);

  // Atemrhythmus
  const cycle = breath ? breath.phases.reduce((a, b) => a + b, 0) : 0;
  useEffect(() => {
    if (!breath || !running) return;
    const t = elapsed % cycle;
    let acc = 0;
    for (let i = 0; i < 4; i++) {
      acc += breath.phases[i];
      if (t < acc) { if (i !== breathPhase) setBreathPhase(i); break; }
    }
  }, [elapsed, breath, cycle, running, breathPhase]);

  const stepIndex = med ? Math.min(med.steps.length - 1, Math.floor((elapsed / total) * med.steps.length)) : 0;
  useEffect(() => {
    if (voice && running && med) speak(med.steps[stepIndex]);
  }, [stepIndex, voice, running, med]);
  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);

  const toggle = () => {
    if (finished.current) {
      finished.current = false;
      base.current = 0;
      setElapsed(0);
    }
    if (running) {
      base.current = elapsed;
      setRunning(false);
    } else {
      if (elapsed === 0) bell();
      startedAt.current = Date.now();
      setRunning(true);
    }
  };

  const stop = async () => {
    setRunning(false);
    if (!finished.current && elapsed >= 60) await logSession(kind, Math.round(elapsed / 60));
    nav('/spirit/meditation', { replace: true });
  };

  const breathLabels = [t('Einatmen'), t('Halten'), t('Ausatmen'), t('Halten')];
  const scale = breathPhase === 0 || breathPhase === 1 ? 1.35 : 0.85;

  return (
    <div className="meditate-screen" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%', opacity: 0.55, pointerEvents: 'none' }}><Scene variant={breath ? 'dawn' : 'night'} animal="none" seed={23} /></div>
      <div style={{ position: 'relative' }}>
      <div className="row between">
        <button className="icon-btn" style={{ color: '#efe8d8' }} aria-label={t('Zurück')} onClick={stop}><ChevronLeft size={24} /></button>
        {med && (
          <button className="icon-btn" style={{ color: '#efe8d8' }} aria-label={voice ? t('Vorlesen aus') : t('Vorlesen an')} onClick={() => setVoice(!voice)}>{voice ? <Volume2 size={22} /> : <VolumeX size={22} />}</button>
        )}
      </div>
      <div className="center" style={{ marginTop: 30 }}>
        <h1 style={{ fontSize: 30 }}>{title}</h1>
        <div className="small" style={{ color: '#c7bfae' }}>{t('{n} Minuten', { n: minutes })}</div>
      </div>

      {breath ? (
        <div className="breath-circle" style={{ transform: `scale(${running ? scale : 1})`, transitionDuration: `${running ? breath.phases[breathPhase] : 0.6}s`, color: '#f1e4c4' }}>
          {running ? breathLabels[breathPhase] : t('Bereit')}
        </div>
      ) : (
        <div className="serif center" style={{ minHeight: 180, display: 'grid', placeItems: 'center', fontSize: 21, lineHeight: 1.5, padding: '30px 10px', color: '#f4efe4' }}>
          {med ? (elapsed > 0 ? med.steps[stepIndex] : med.subtitle) : running ? t('Atme. Sei einfach da.') : t('Finde eine bequeme Haltung.')}
        </div>
      )}

      <div className="center serif" style={{ fontSize: 40, margin: '10px 0 24px' }}>{fmt(total - elapsed)}</div>
      <button className="play-btn" aria-label={running ? t('Pause') : t('Start')} onClick={toggle}>{running ? <Pause size={34} /> : <Play size={34} style={{ marginLeft: 4 }} />}</button>
      <div style={{ margin: '28px 8px 0' }}>
        <div className="progress" style={{ background: 'rgb(255 255 255 / .15)' }}><div style={{ width: `${(elapsed / total) * 100}%`, background: '#c9a55c' }} /></div>
      </div>
      {elapsed > 0 && <div className="center mt"><button className="btn ghost" style={{ color: '#c7bfae' }} onClick={stop}><Square size={16} /> {t('Beenden')}</button></div>}
      {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}
    </div>
    </div>
  );
}

export default function MeditationScreen() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { confirm } = useUi();
  const [minutes, setMinutes] = useState(10);
  const audios = useLiveQuery(() => db.audio.toArray(), []) ?? [];
  const history = useLiveQuery(() => db.meditations.where('date').aboveOrEqual(addDays(today(), -30)).toArray(), []) ?? [];

  if (id) return <Session id={id} minutes={Number(params.get('min')) || (id.startsWith('breath-') ? 5 : 10)} />;

  const go = (sid: string) => nav(`/spirit/meditation/${sid}?min=${minutes}`);
  const totalMin = history.reduce((s, h) => s + h.minutes, 0);
  const ICONS: Record<string, ReactNode> = {
    morning: <Sunrise size={24} />, evening: <Moon size={24} />, stress: <Wind size={24} />, selflove: <Heart size={24} />,
    focus: <Sparkles size={24} />, sleep: <Moon size={24} />, calm: <Flower2 size={24} />,
  };

  return (
    <div className="screen">
      <HubHero title={t('Meditation & Achtsamkeit')} scene={{ variant: 'sunset', seed: 23 }} emblem="lotus" />
      <div className="stack">
        <div className="card">
          <div className="card-label row" style={{ gap: 6 }}><Timer size={14} /> {t('Dauer wählen')}</div>
          <div className="chips mt">
            {DURATIONS.map((d) => <button key={d} className={`chip ${minutes === d ? 'active' : ''}`} onClick={() => setMinutes(d)}>{d} {t('Min.')}</button>)}
            <input className="input" type="number" min={1} max={120} style={{ width: 90, minHeight: 34, padding: '4px 10px' }} value={minutes} onChange={(e) => setMinutes(Math.min(120, Math.max(1, Number(e.target.value) || 1)))} aria-label={t('Eigene Dauer in Minuten')} />
          </div>
          <div className="small muted mt">{t('Letzte 30 Tage: {n} Sitzungen · {m} Minuten', { n: history.length, m: totalMin })}</div>
        </div>

        <div className="grid2 wide-4">
          {MEDITATIONS.map((raw) => {
            const m = localMeditation(raw);
            return (
              <button key={m.id} className="gold-tile" style={{ minHeight: 96 }} onClick={() => go(m.id)}>
                <span className="ic">{ICONS[m.id]}</span>
                <span className="t">{m.title}</span>
                <span className="v">{m.subtitle}</span>
              </button>
            );
          })}
          <button className="gold-tile" style={{ minHeight: 96 }} onClick={() => go('breath-box')}>
            <span className="ic"><Wind size={24} /></span>
            <span className="t">{t('Atemübung')}</span>
            <span className="v">{localBreath(BREATH_PATTERNS[0]).name}</span>
          </button>
        </div>

        <button className="scroll-btn" onClick={() => go('timer')}>
          <span className="ic"><Hourglass size={22} /></span>
          <span className="lbl">{t('Freie Meditation (Timer)')}</span>
          <Play size={18} className="chev" />
        </button>

        <div className="section-title"><h2>{t('Atemübungen')}</h2></div>
        <div className="list">
          {BREATH_PATTERNS.map((raw) => {
            const b = localBreath(raw);
            return (
              <button key={b.id} className="list-item" onClick={() => go(`breath-${b.id}`)}>
                <Wind size={18} className="muted" />
                <div className="grow"><div className="title">{b.name}</div><div className="meta">{b.description}</div></div>
                <Play size={18} className="faint" />
              </button>
            );
          })}
        </div>

        <div className="section-title"><h2>{t('Eigene Audiodateien')}</h2>
          <button onClick={async () => {
            const files = await pickFile('audio/*', true);
            for (const f of files) await db.audio.add({ name: f.name.replace(/\.[^.]+$/, ''), blob: f });
          }}><Upload size={14} /> {t('Hinzufügen')}</button>
        </div>
        {audios.length ? (
          <div className="list">
            {audios.map((a) => (
              <div key={a.id} className="list-item">
                <button className="row grow" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left' }} onClick={() => go(`audio-${a.id}`)}>
                  <Music size={18} className="faint" />
                  <div className="grow"><div className="title">{a.name}</div><div className="meta">{t('Eigene Aufnahme')} · {(a.blob.size / 1024 / 1024).toFixed(1)} {t('MB')}</div></div>
                </button>
                <button className="icon-btn" aria-label={t('Löschen')} onClick={async () => { if (await confirm(t('„{n}“ entfernen?', { n: a.name }), { ok: 'Entfernen', danger: true })) await db.audio.delete(a.id!); }}><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        ) : <div className="card"><Empty text="Binde eigene Meditationen, Klänge oder Musik ein – sie bleiben offline auf dem Gerät." /></div>}
        <Hint>{t('Geführte Meditationen zeigen die Anleitung Schritt für Schritt; mit dem Lautsprecher-Symbol kann sie vorgelesen werden. Abgeschlossene Sitzungen zählen automatisch zur Gewohnheit „Meditation“.')}</Hint>
      </div>
    </div>
  );
}
