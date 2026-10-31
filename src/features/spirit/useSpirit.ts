import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo } from 'react';
import { IMPULSES, type Impulse } from '../../content/impulses';
import { selectImpulse } from '../../core/astro/guidance';
import { moonInfo, type MoonInfo } from '../../core/astro/moon';
import { profileSign, type SignInfo } from '../../core/astro/zodiac';
import { addDays } from '../../core/dates';
import { db } from '../../core/db';
import { useProfile } from '../../core/hooks';
import type { ISODate } from '../../core/types';

export interface DailySpirit {
  impulse: Impulse;
  liked: boolean;
  moon: MoonInfo;
  sign: SignInfo | null;
}

/** Tagesimpuls: einmal pro Tag gewählt und gespeichert (keine Wiederholung der letzten 30 Tage). */
export function useDailySpirit(day: ISODate): DailySpirit | undefined {
  const profile = useProfile();
  const sign = useMemo(() => profileSign(profile), [profile]);
  const moon = useMemo(() => moonInfo(day), [day]);
  const log = useLiveQuery(() => db.impulses.get(day), [day]);
  const recent = useLiveQuery(() => db.impulses.where('date').between(addDays(day, -30), day, true, false).toArray(), [day]);

  const computed = useMemo(() => {
    if (!recent) return undefined;
    return selectImpulse(day, sign?.element ?? null, moon.key, recent.map((r) => r.impulseId));
  }, [day, sign, moon.key, recent]);

  useEffect(() => {
    if (log === undefined && computed && recent) {
      void db.impulses.get(day).then((ex) => (ex ? undefined : db.impulses.put({ date: day, impulseId: computed.id, liked: 0 })));
    }
  }, [log, computed, recent, day]);

  const impulse = (log && IMPULSES.find((i) => i.id === log.impulseId)) || computed;
  if (!impulse) return undefined;
  return { impulse, liked: !!log?.liked, moon, sign };
}

export async function toggleLike(day: ISODate): Promise<void> {
  const ex = await db.impulses.get(day);
  if (ex) await db.impulses.update(day, { liked: ex.liked ? 0 : 1 });
}
