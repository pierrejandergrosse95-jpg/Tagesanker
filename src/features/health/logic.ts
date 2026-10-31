import { occursOn } from '../../core/recurrence';
import type { HM, ISODate, Med, MedIntake } from '../../core/types';

export interface Dose {
  med: Med;
  time: HM;
  intake?: MedIntake;
}

export function dosesForDay(meds: Med[], intakes: MedIntake[], day: ISODate): Dose[] {
  const out: Dose[] = [];
  for (const med of meds) {
    if (!med.active || !occursOn(med.startDate, med.recurrence, day)) continue;
    for (const time of med.times) {
      const intake = intakes.find((i) => i.medId === med.id && i.date === day && i.time === time);
      out.push({ med, time, intake });
    }
  }
  return out.sort((a, b) => a.time.localeCompare(b.time) || a.med.name.localeCompare(b.med.name));
}

/** Durchschnittlicher Tagesbedarf in Einheiten (z. B. Tabletten). */
export function dailyNeed(med: Med): number {
  const perDay = med.perIntake * med.times.length;
  switch (med.recurrence.freq) {
    case 'daily': return perDay;
    case 'weekly': return perDay / 7;
    case 'weekdays': return (perDay * (med.recurrence.weekdays?.length ?? 0)) / 7;
    case 'interval': return perDay / Math.max(1, med.recurrence.every ?? 1);
    case 'monthly': return perDay / 30;
    case 'yearly': return perDay / 365;
    case 'none': return 0;
  }
}

/** Verbleibende Tage laut Vorrat, oder null wenn kein Vorrat gepflegt. */
export function daysLeft(med: Med): number | null {
  if (med.stock == null) return null;
  const need = dailyNeed(med);
  if (need <= 0) return null;
  return Math.floor(med.stock / need);
}

export function isLowStock(med: Med): boolean {
  const d = daysLeft(med);
  return d != null && d <= med.lowThresholdDays;
}

/** Einnahmetreue (0–1) für eine Liste von Dosen. */
export function adherence(doses: Dose[]): number {
  if (!doses.length) return 1;
  return doses.filter((d) => d.intake).length / doses.length;
}
