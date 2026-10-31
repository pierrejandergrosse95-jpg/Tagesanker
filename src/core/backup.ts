import { db, ensureSeed, TABLES, type TagesankerDB } from './db';
import { decryptText, encryptText, fromB64, toB64, type EncryptedPayload } from './crypto';

export interface BackupFile {
  format: 'tagesanker-backup';
  version: 1;
  createdAt: string;
  tables: Record<string, unknown[]>;
}

const BLOB_TAG = '__blob__';

async function encodeBlobs(value: unknown): Promise<unknown> {
  if (value instanceof Blob) {
    const buf = await value.arrayBuffer();
    return { [BLOB_TAG]: true, type: value.type, data: toB64(buf) };
  }
  if (Array.isArray(value)) return Promise.all(value.map(encodeBlobs));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = await encodeBlobs(v);
    return out;
  }
  return value;
}

function decodeBlobs(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(decodeBlobs);
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if (o[BLOB_TAG] === true) return new Blob([fromB64(String(o.data))], { type: String(o.type ?? '') });
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) out[k] = decodeBlobs(v);
    return out;
  }
  return value;
}

export async function createBackup(database: TagesankerDB = db): Promise<BackupFile> {
  const tables: Record<string, unknown[]> = {};
  for (const name of TABLES) {
    const rows = await database.table(name).toArray();
    tables[name] = (await encodeBlobs(rows)) as unknown[];
  }
  return { format: 'tagesanker-backup', version: 1, createdAt: new Date().toISOString(), tables };
}

export async function exportBackupText(password?: string, database: TagesankerDB = db): Promise<string> {
  const json = JSON.stringify(await createBackup(database));
  if (!password) return json;
  return JSON.stringify(await encryptText(json, password));
}

export function isEncrypted(text: string): boolean {
  try {
    return (JSON.parse(text) as { format?: string }).format === 'tagesanker-encrypted';
  } catch {
    return false;
  }
}

/** Ersetzt alle Daten durch den Inhalt des Backups. */
export async function restoreBackupText(text: string, password?: string, database: TagesankerDB = db): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Die Datei ist kein gültiges Tagesanker-Backup.');
  }
  if ((parsed as { format?: string }).format === 'tagesanker-encrypted') {
    if (!password) throw new Error('Dieses Backup ist verschlüsselt. Bitte Passwort eingeben.');
    parsed = JSON.parse(await decryptText(parsed as EncryptedPayload, password));
  }
  const backup = parsed as BackupFile;
  if (backup.format !== 'tagesanker-backup' || !backup.tables) throw new Error('Die Datei ist kein gültiges Tagesanker-Backup.');
  await database.transaction('rw', TABLES.map((t) => database.table(t)), async () => {
    for (const name of TABLES) {
      const table = database.table(name);
      await table.clear();
      const rows = backup.tables[name];
      if (Array.isArray(rows) && rows.length) await table.bulkPut(decodeBlobs(rows) as object[]);
    }
  });
  await ensureSeed(database);
}

/** Löscht ALLE Daten unwiderruflich. */
export async function wipeAll(database: TagesankerDB = db): Promise<void> {
  await database.transaction('rw', TABLES.map((t) => database.table(t)), async () => {
    for (const name of TABLES) await database.table(name).clear();
  });
  try {
    localStorage.clear();
  } catch {
    /* ignorieren */
  }
}

export function backupFileName(encrypted: boolean): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `tagesanker-backup-${stamp}${encrypted ? '.verschluesselt' : ''}.json`;
}

/** Bietet eine Textdatei zum Speichern an (Browser-Download bzw. Android-Share-Sheet über WebView-Download). */
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
