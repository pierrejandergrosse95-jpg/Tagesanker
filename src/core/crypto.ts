/** Kryptografie-Helfer auf Basis von WebCrypto (in Android-WebView und Browsern verfügbar). */

const enc = new TextEncoder();
const dec = new TextDecoder();
const ITERATIONS = 150_000;

export function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export function fromB64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pbkdf2Bits(secret: string, salt: Uint8Array<ArrayBuffer>, bits = 256): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, bits);
}

/** PIN-Hash im Format "salt$hash" (Base64). */
export async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await pbkdf2Bits(pin, salt);
  return `${toB64(salt)}$${toB64(bits)}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split('$');
  if (!saltB64 || !hashB64) return false;
  const bits = await pbkdf2Bits(pin, fromB64(saltB64));
  const a = new Uint8Array(bits);
  const b = fromB64(hashB64);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export interface EncryptedPayload {
  format: 'klartakt-encrypted';
  v: 1;
  salt: string;
  iv: string;
  data: string;
}

async function aesKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const raw = await pbkdf2Bits(password, salt);
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encryptText(plain: string, password: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await aesKey(password, salt);
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plain));
  return { format: 'klartakt-encrypted', v: 1, salt: toB64(salt), iv: toB64(iv), data: toB64(data) };
}

export async function decryptText(payload: EncryptedPayload, password: string): Promise<string> {
  const key = await aesKey(password, fromB64(payload.salt));
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(payload.iv) }, key, fromB64(payload.data));
    return dec.decode(plain);
  } catch {
    throw new Error('Falsches Passwort oder beschädigte Datei.');
  }
}
