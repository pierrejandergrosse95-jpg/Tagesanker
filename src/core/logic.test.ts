import { describe, expect, it } from 'vitest';
import { addMonths, isoWeek, startOfWeek } from './dates';
import { nextOccurrence, occurrencesBetween, occursOn } from './recurrence';
import { moonEventsBetween, moonInfo } from './astro/moon';
import { germanTzOffset, natalChart, signFromDate } from './astro/zodiac';
import { monthlyGuidance, selectImpulse } from './astro/guidance';
import { IMPULSES } from '../content/impulses';
import { expandPattern, workMinutes, workStats } from '../features/shifts/logic';
import { billStatus, monthSummary, parseMoney } from '../features/finance/logic';
import { daysLeft, dosesForDay } from '../features/health/logic';
import { streak } from '../features/habits/logic';
import type { Med, ShiftType } from './types';
import { setLang } from '../i18n';

setLang('de');

describe('Datum & Wiederholung', () => {
  it('berechnet Kalenderwochen und Wochenstart', () => {
    expect(isoWeek('2025-04-22')).toBe(17);
    expect(isoWeek('2021-01-03')).toBe(53);
    expect(startOfWeek('2025-04-27')).toBe('2025-04-21');
  });
  it('klemmt Monatsenden', () => {
    expect(addMonths('2025-01-31', 1)).toBe('2025-02-28');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
  });
  it('erkennt Vorkommen', () => {
    expect(occursOn('2025-01-31', { freq: 'monthly' }, '2025-02-28')).toBe(true);
    expect(occursOn('2025-04-01', { freq: 'weekdays', weekdays: [1, 3] }, '2025-04-23')).toBe(true);
    expect(occursOn('2025-04-01', { freq: 'interval', every: 3 }, '2025-04-07')).toBe(true);
    expect(nextOccurrence('2025-01-31', { freq: 'monthly' }, '2025-02-28')).toBe('2025-03-31');
    expect(occurrencesBetween('2000-03-15', { freq: 'yearly' }, '2025-01-01', '2025-12-31')).toEqual(['2025-03-15']);
    expect(occurrencesBetween('2025-04-01', { freq: 'weekly' }, '2025-04-02', '2025-04-30')).toEqual(['2025-04-08', '2025-04-15', '2025-04-22', '2025-04-29']);
  });
});

describe('Mondphasen (Meeus)', () => {
  it('trifft bekannte Phasen auf wenige Minuten', () => {
    const ev = moonEventsBetween('2025-04-01', '2025-04-30');
    const full = ev.find((e) => e.phase === 2)!;
    const neu = ev.find((e) => e.phase === 0)!;
    // Vollmond 13.04.2025 00:22 UTC, Neumond 27.04.2025 19:31 UTC
    expect(Math.abs(full.date.getTime() - Date.UTC(2025, 3, 13, 0, 22))).toBeLessThan(5 * 60000);
    expect(Math.abs(neu.date.getTime() - Date.UTC(2025, 3, 27, 19, 31))).toBeLessThan(5 * 60000);
  });
  it('liefert plausible Beleuchtung', () => {
    const atFull = moonInfo(new Date(Date.UTC(2025, 3, 13, 0, 22)));
    expect(atFull.illumination).toBeGreaterThan(0.99);
    const waxing = moonInfo(new Date(Date.UTC(2025, 3, 7, 12)));
    expect(waxing.waxing).toBe(true);
    expect(waxing.key).toBe('waxing');
  });
});

describe('Sternzeichen & Horoskop', () => {
  it('bestimmt Zeichen aus Datum', () => {
    expect(signFromDate('1990-03-21').name).toBe('Widder');
    expect(signFromDate('1990-01-10').name).toBe('Steinbock');
    expect(signFromDate('1990-12-25').name).toBe('Steinbock');
    expect(signFromDate('1995-08-23').name).toBe('Löwe');
    expect(signFromDate('1995-02-19').name).toBe('Wassermann');
  });
  it('berücksichtigt Sommerzeit', () => {
    expect(germanTzOffset('2025-07-01')).toBe(120);
    expect(germanTzOffset('2025-12-01')).toBe(60);
  });
  it('berechnet Sonne, Mond, Aszendent', () => {
    // 01.01.2000 12:00 UT, Greenwich: Sonne ~280,4° (Steinbock), Mond ~223° (Skorpion)
    const c = natalChart({ id: 'me', birthDate: '2000-01-01', birthTime: '12:00', lat: 51.48, lon: 0, tzOffsetMin: 0 })!;
    expect(c.sun.name).toBe('Steinbock');
    expect(Math.abs(c.sunDeg - 280.4)).toBeLessThan(0.3);
    expect(c.moon.name).toBe('Skorpion');
    expect(c.asc).toBeDefined();
  });
  it('wiederholt Impulse nicht und bleibt stabil pro Tag', () => {
    const a = selectImpulse('2025-04-22', 'Feuer', 'waxing', []);
    const b = selectImpulse('2025-04-22', 'Feuer', 'waxing', []);
    expect(a.id).toBe(b.id);
    const recent = IMPULSES.slice(0, 50).map((i) => i.id);
    expect(recent).not.toContain(selectImpulse('2025-04-23', 'Erde', 'full', recent).id);
  });
  it('Monatsimpuls im Geburtstagsmonat', () => {
    expect(monthlyGuidance('2025-04-01', signFromDate('1990-04-01')).theme).toContain('Neubeginn');
  });
});

describe('Schichten', () => {
  const types: ShiftType[] = [
    { id: 1, name: 'Nacht', short: 'N', color: '#000000', start: '22:00', end: '06:00', breakMin: 45, kind: 'work', order: 0 },
    { id: 2, name: 'Urlaub', short: 'U', color: '#000000', start: '00:00', end: '00:00', breakMin: 0, kind: 'vacation', order: 1 },
  ];
  it('rechnet über Mitternacht', () => {
    expect(workMinutes('22:00', '06:00', 45)).toBe(435);
    expect(workMinutes('14:00', '22:00', 30)).toBe(450);
  });
  it('berechnet Saldo', () => {
    const st = workStats('2025-04-21', '2025-04-27', [
      { date: '2025-04-21', typeId: 1 }, { date: '2025-04-22', typeId: 1 }, { date: '2025-04-23', typeId: 2 },
    ], types, { weeklyHours: 40, workDaysPerWeek: 5 });
    expect(st.workedMin).toBe(870);
    expect(st.creditedMin).toBe(480);
    expect(st.targetMin).toBe(2400);
    expect(st.balanceMin).toBe(870 + 480 - 2400);
  });
  it('rollt Muster aus', () => {
    const s = expandPattern({ name: 'x', sequence: [1, 1, 0] }, '2025-04-01', 6);
    expect(s.map((x) => x.date)).toEqual(['2025-04-01', '2025-04-02', '2025-04-04', '2025-04-05']);
  });
});

describe('Finanzen', () => {
  it('parst Beträge', () => {
    expect(parseMoney('1.234,56')).toBe(123456);
    expect(parseMoney('59.99')).toBe(5999);
    expect(parseMoney('abc')).toBeNull();
    expect(parseMoney('1,234.56')).toBe(123456);
    expect(parseMoney('12,5')).toBe(1250);
  });
  it('bilanziert Monat inkl. Fixkosten und bezahlter Rechnungen', () => {
    const s = monthSummary('2025-04-15', [
      { kind: 'income', title: 'Gehalt', amount: 245000, category: 'Gehalt', date: '2025-01-01', monthly: 1 },
      { kind: 'expense', title: 'Miete', amount: 90000, category: 'Wohnen', date: '2025-01-01', monthly: 1 },
      { kind: 'expense', title: 'Einkauf', amount: 5000, category: 'Lebensmittel', date: '2025-04-03', monthly: 0 },
      { kind: 'expense', title: 'Alt', amount: 5000, category: 'Lebensmittel', date: '2025-03-03', monthly: 0 },
    ], [{ title: 'Strom', amount: 5999, category: 'Energie', due: '2025-04-25', recurrence: { freq: 'monthly' }, remindDays: 3, paidAt: '2025-04-20' }]);
    expect(s.income).toBe(245000);
    expect(s.expenses).toBe(90000 + 5000 + 5999);
  });
  it('Status von Rechnungen', () => {
    const b = { title: 'x', amount: 1, category: 'x', due: '2025-04-25', recurrence: { freq: 'none' as const }, remindDays: 0 };
    expect(billStatus(b, '2025-04-22')).toBe('soon');
    expect(billStatus(b, '2025-04-26')).toBe('overdue');
    expect(billStatus(b, '2025-04-01')).toBe('open');
  });
});

describe('Medikamente & Gewohnheiten', () => {
  const med: Med = { id: 1, name: 'Magnesium', dose: '400 mg', times: ['08:00', '20:00'], recurrence: { freq: 'daily' }, startDate: '2025-04-01', stock: 30, perIntake: 1, lowThresholdDays: 7, active: 1, color: '#000' };
  it('Dosen und Reichweite', () => {
    const doses = dosesForDay([med], [{ medId: 1, date: '2025-04-22', time: '08:00', takenAt: 0 }], '2025-04-22');
    expect(doses).toHaveLength(2);
    expect(doses[0].intake).toBeDefined();
    expect(doses[1].intake).toBeUndefined();
    expect(daysLeft(med)).toBe(15);
  });
  it('Serien', () => {
    const h = { id: 1, name: 'W', icon: '', color: '', unit: '', target: 2, freq: 'daily' as const, timesPerWeek: 7, archived: 0 as const, order: 0 };
    const logs = [
      { habitId: 1, date: '2025-04-20', value: 2 }, { habitId: 1, date: '2025-04-21', value: 3 },
      { habitId: 1, date: '2025-04-22', value: 1 },
    ];
    expect(streak(h, logs, '2025-04-22')).toBe(2);
  });
});
