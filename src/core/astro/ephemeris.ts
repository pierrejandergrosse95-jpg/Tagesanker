/** Niedrig-präzise Ephemeriden (Meeus Kap. 12, 25, 47) – Genauigkeit im Bogenminutenbereich. */

const RAD = Math.PI / 180;
const sin = (deg: number) => Math.sin(deg * RAD);
const cos = (deg: number) => Math.cos(deg * RAD);
export const norm360 = (x: number) => ((x % 360) + 360) % 360;

export function toJD(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function jdToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

const centuries = (jd: number) => (jd - 2451545) / 36525;

/** Scheinbare ekliptikale Länge der Sonne in Grad. */
export function sunLongitude(jd: number): number {
  const T = centuries(jd);
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
  const O = 125.04 - 1934.136 * T;
  return norm360(L0 + C - 0.00569 - 0.00478 * sin(O));
}

/** Geozentrische ekliptikale Länge des Mondes in Grad (Hauptterme). */
export function moonLongitude(jd: number): number {
  const T = centuries(jd);
  const Lp = 218.3164477 + 481267.88123421 * T;
  const D = 297.8501921 + 445267.1114034 * T;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9633964 + 477198.8675055 * T;
  const F = 93.272095 + 483202.0175233 * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const l =
    6.288774 * sin(Mp) + 1.274027 * sin(2 * D - Mp) + 0.658314 * sin(2 * D) + 0.213618 * sin(2 * Mp) -
    0.185116 * E * sin(M) - 0.114332 * sin(2 * F) + 0.058793 * sin(2 * D - 2 * Mp) +
    0.057066 * E * sin(2 * D - M - Mp) + 0.053322 * sin(2 * D + Mp) + 0.045758 * E * sin(2 * D - M) -
    0.040923 * E * sin(M - Mp) - 0.03472 * sin(D) - 0.030383 * E * sin(M + Mp) +
    0.015327 * sin(2 * D - 2 * F) - 0.012528 * sin(Mp + 2 * F) + 0.01098 * sin(Mp - 2 * F) +
    0.010675 * sin(4 * D - Mp) + 0.010034 * sin(3 * Mp) + 0.008548 * sin(4 * D - 2 * Mp) -
    0.007888 * E * sin(2 * D + M - Mp) - 0.006766 * E * sin(2 * D + M) - 0.005163 * sin(D - Mp) +
    0.004987 * E * sin(D + M) + 0.004036 * E * sin(2 * D - M + Mp) + 0.003994 * sin(2 * D + 2 * Mp);
  return norm360(Lp + l);
}

/** Aszendent (ekliptikale Länge) für Zeitpunkt und Ort (Breite φ, östliche Länge λ in Grad). */
export function ascendant(jd: number, lat: number, lon: number): number {
  const T = centuries(jd);
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000;
  const lst = norm360(gmst + lon);
  const eps = 23.4392911 - 0.0130042 * T;
  const y = cos(lst);
  const x = -(sin(lst) * cos(eps) + Math.tan(lat * RAD) * sin(eps));
  return norm360(Math.atan2(y, x) / RAD);
}
