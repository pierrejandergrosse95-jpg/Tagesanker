import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { db, DEFAULT_SETTINGS } from './db';
import { today as todayISO } from './dates';
import type { Profile, Settings } from './types';

export function useSettings(): Settings {
  return useLiveQuery(() => db.settings.get('main'), []) ?? DEFAULT_SETTINGS;
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const s = (await db.settings.get('main')) ?? DEFAULT_SETTINGS;
  await db.settings.put({ ...s, ...patch });
}

export function useProfile(): Profile | undefined {
  return useLiveQuery(() => db.profile.get('me'), []);
}

/** Aktueller Tag – aktualisiert sich um Mitternacht und bei Rückkehr in die App. */
export function useToday(): string {
  const [day, setDay] = useState(todayISO());
  useEffect(() => {
    const tick = () => setDay(todayISO());
    const id = window.setInterval(tick, 60000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);
  return day;
}
