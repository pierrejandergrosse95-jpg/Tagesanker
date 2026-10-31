import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { downloadText } from './backup';

/** Speichert/teilt eine Textdatei. Android: Datei im Cache + Teilen-Dialog (Drive, Mail, Dateien …). */
export async function saveTextFile(filename: string, text: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    downloadText(filename, text);
    return;
  }
  const res = await Filesystem.writeFile({ path: filename, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
  await Share.share({ title: filename, url: res.uri, dialogTitle: 'Backup speichern' });
}

/** Öffnet einen Anhang (Blob) zur Ansicht. */
export async function openBlob(blob: Blob, name: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }
  const data = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
  const res = await Filesystem.writeFile({ path: name, data, directory: Directory.Cache });
  await Share.share({ title: name, url: res.uri });
}

export function pickFile(accept: string, multiple = false): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.onchange = () => resolve(Array.from(input.files ?? []));
    input.click();
  });
}
