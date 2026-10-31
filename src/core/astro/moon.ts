/**
 * Mondphasen nach Jean Meeus, "Astronomical Algorithms" (2. Aufl.), Kap. 47 und 49.
 * Die Zeitpunkte der Hauptphasen sind auf wenige Minuten genau.
 */
import { addDays, fromISO, toISO } from '../dates';
import type { ISODate } from '../types';
import { jdToDate, moonLongitude, sunLongitude, toJD } from './ephemeris';

const RAD = Math.PI / 180;
const sin = (deg: number) => Math.sin(deg * RAD);
const cos = (deg: number) => Math.cos(deg * RAD);

export type PrincipalPhase = 0 | 1 | 2 | 3; // Neumond, erstes Viertel, Vollmond, letztes Viertel

/** ΔT (TT − UT) in Sekunden, Näherung nach Espenak/Meeus für 2005–2050. */
function deltaT(year: number): number {
  const t = year - 2000;
  if (year >= 2005 && year < 2050) return 62.92 + 0.32217 * t + 0.005589 * t * t;
  if (year >= 1986 && year < 2005) {
    return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  }
  const u = (year - 1820) / 100;
  return -20 + 32 * u * u;
}

/** Julianisches Datum (TT → UT korrigiert) der Hauptphase `phase` zum Lunationsindex k (ganzzahlig). */
export function phaseJD(kInt: number, phase: PrincipalPhase): number {
  const k = kInt + phase / 4;
  const T = k / 1236.85;
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T * T - 0.00000011 * T ** 3;
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T ** 3 - 0.000000058 * T ** 4;
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T ** 3 + 0.000000011 * T ** 4;
  const O = 124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T ** 3;

  let c = 0;
  if (phase === 0 || phase === 2) {
    const n = phase === 0;
    c += (n ? -0.4072 : -0.40614) * sin(Mp);
    c += (n ? 0.17241 : 0.17302) * E * sin(M);
    c += (n ? 0.01608 : 0.01614) * sin(2 * Mp);
    c += (n ? 0.01039 : 0.01043) * sin(2 * F);
    c += (n ? 0.00739 : 0.00734) * E * sin(Mp - M);
    c += (n ? -0.00514 : -0.00515) * E * sin(Mp + M);
    c += (n ? 0.00208 : 0.00209) * E * E * sin(2 * M);
    c += -0.00111 * sin(Mp - 2 * F);
    c += -0.00057 * sin(Mp + 2 * F);
    c += 0.00056 * E * sin(2 * Mp + M);
    c += -0.00042 * sin(3 * Mp);
    c += 0.00042 * E * sin(M + 2 * F);
    c += 0.00038 * E * sin(M - 2 * F);
    c += -0.00024 * E * sin(2 * Mp - M);
    c += -0.00017 * sin(O);
    c += -0.00007 * sin(Mp + 2 * M);
    c += 0.00004 * sin(2 * Mp - 2 * F);
    c += 0.00004 * sin(3 * M);
    c += 0.00003 * sin(Mp + M - 2 * F);
    c += 0.00003 * sin(2 * Mp + 2 * F);
    c += -0.00003 * sin(Mp + M + 2 * F);
    c += 0.00003 * sin(Mp - M + 2 * F);
    c += -0.00002 * sin(Mp - M - 2 * F);
    c += -0.00002 * sin(3 * Mp + M);
    c += 0.00002 * sin(4 * Mp);
  } else {
    c += -0.62801 * sin(Mp);
    c += 0.17172 * E * sin(M);
    c += -0.01183 * E * sin(Mp + M);
    c += 0.00862 * sin(2 * Mp);
    c += 0.00804 * sin(2 * F);
    c += 0.00454 * E * sin(Mp - M);
    c += 0.00204 * E * E * sin(2 * M);
    c += -0.0018 * sin(Mp - 2 * F);
    c += -0.0007 * sin(Mp + 2 * F);
    c += -0.0004 * sin(3 * Mp);
    c += -0.00034 * E * sin(2 * Mp - M);
    c += 0.00032 * E * sin(M + 2 * F);
    c += 0.00032 * E * sin(M - 2 * F);
    c += -0.00028 * E * E * sin(Mp + 2 * M);
    c += 0.00027 * E * sin(2 * Mp + M);
    c += -0.00017 * sin(O);
    c += -0.00005 * sin(Mp - M - 2 * F);
    c += 0.00004 * sin(2 * Mp + 2 * F);
    c += -0.00004 * sin(Mp + M + 2 * F);
    c += 0.00004 * sin(Mp - 2 * M);
    c += 0.00003 * sin(Mp + M - 2 * F);
    c += 0.00003 * sin(3 * M);
    c += 0.00002 * sin(2 * Mp - 2 * F);
    c += 0.00002 * sin(Mp - M + 2 * F);
    c += -0.00002 * sin(3 * Mp + M);
    const W = 0.00306 - 0.00038 * E * cos(M) + 0.00026 * cos(Mp) - 0.00002 * cos(Mp - M) + 0.00002 * cos(Mp + M) + 0.00002 * cos(2 * F);
    c += phase === 1 ? W : -W;
  }

  const A = [
    299.77 + 0.107408 * k - 0.009173 * T * T, 251.88 + 0.016321 * k, 251.83 + 26.651886 * k,
    349.42 + 36.412478 * k, 84.66 + 18.206239 * k, 141.74 + 53.303771 * k, 207.14 + 2.453732 * k,
    154.84 + 7.30686 * k, 34.52 + 27.261239 * k, 207.19 + 0.121824 * k, 291.34 + 1.844379 * k,
    161.72 + 24.198154 * k, 239.56 + 25.513099 * k, 331.55 + 3.592518 * k,
  ];
  const AC = [325, 165, 164, 126, 110, 62, 60, 56, 47, 42, 40, 37, 35, 23];
  for (let i = 0; i < 14; i++) c += (AC[i] / 1e6) * sin(A[i]);

  jde += c;
  const year = 2000 + k / 12.3685;
  return jde - deltaT(year) / 86400;
}

export interface MoonEvent {
  phase: PrincipalPhase;
  date: Date;
}

/** Alle Hauptphasen im Zeitraum [from, to] (lokale Kalendertage). */
export function moonEventsBetween(from: ISODate, to: ISODate): MoonEvent[] {
  const start = fromISO(from).getTime();
  const end = fromISO(addDays(to, 1)).getTime();
  const yearFrac = fromISO(from).getFullYear() + fromISO(from).getMonth() / 12;
  const k0 = Math.floor((yearFrac - 2000) * 12.3685) - 2;
  const out: MoonEvent[] = [];
  for (let k = k0; ; k++) {
    let past = false;
    for (const p of [0, 1, 2, 3] as PrincipalPhase[]) {
      const d = jdToDate(phaseJD(k, p));
      const t = d.getTime();
      if (t >= end) past = true;
      else if (t >= start) out.push({ phase: p, date: d });
    }
    if (past) break;
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export type MoonPhaseKey = 'new' | 'waxing' | 'full' | 'waning';

export interface MoonInfo {
  key: MoonPhaseKey;
  /** Detail-Name für die Anzeige, z. B. "Zunehmender Halbmond" */
  name: string;
  /** Beleuchteter Anteil 0–1 */
  illumination: number;
  waxing: boolean;
  /** Mondalter in Tagen seit dem letzten Neumond */
  age: number;
  /** Elongation Mond–Sonne 0–360° */
  elongation: number;
  /** Hauptphase, die genau an diesem Kalendertag eintritt */
  eventToday?: MoonEvent;
}

export const PHASE_NAMES: Record<PrincipalPhase, string> = {
  0: 'Neumond', 1: 'Erstes Viertel', 2: 'Vollmond', 3: 'Letztes Viertel',
};

export const PHASE_KEY_NAMES: Record<MoonPhaseKey, string> = {
  new: 'Neumond', waxing: 'Zunehmender Mond', full: 'Vollmond', waning: 'Abnehmender Mond',
};

/** Mondinformationen für einen Zeitpunkt (Standard: jetzt) bzw. einen Kalendertag (Mittag). */
export function moonInfo(at: Date | ISODate = new Date()): MoonInfo {
  const date = typeof at === 'string' ? new Date(fromISO(at).getTime() + 12 * 3600000) : at;
  const jd = toJD(date);
  const elong = (((moonLongitude(jd) - sunLongitude(jd)) % 360) + 360) % 360;
  const illumination = (1 - cos(elong)) / 2;
  const waxing = elong < 180;
  const day = toISO(date);
  const events = moonEventsBetween(addDays(day, -32), day);
  const lastNew = [...events].reverse().find((e) => e.phase === 0 && e.date <= date);
  const age = lastNew ? (date.getTime() - lastNew.date.getTime()) / 86400000 : (elong / 360) * 29.53;
  const eventToday = moonEventsBetween(day, day)[0];

  let key: MoonPhaseKey;
  let name: string;
  if (eventToday?.phase === 0) { key = 'new'; name = 'Neumond'; }
  else if (eventToday?.phase === 2) { key = 'full'; name = 'Vollmond'; }
  else if (eventToday?.phase === 1) { key = 'waxing'; name = 'Zunehmender Halbmond'; }
  else if (eventToday?.phase === 3) { key = 'waning'; name = 'Abnehmender Halbmond'; }
  else if (waxing) { key = 'waxing'; name = illumination < 0.5 ? 'Zunehmende Sichel' : 'Zunehmender Mond'; }
  else { key = 'waning'; name = illumination < 0.5 ? 'Abnehmende Sichel' : 'Abnehmender Mond'; }

  return { key, name, illumination, waxing, age, elongation: elong, eventToday };
}

/** Nächste Hauptphasen ab heute. */
export function upcomingMoonEvents(from: ISODate, count = 4): MoonEvent[] {
  return moonEventsBetween(from, addDays(from, 40)).slice(0, count);
}
