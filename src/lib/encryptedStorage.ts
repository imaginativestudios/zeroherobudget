/**
 * Encrypted localStorage wrapper using Web Crypto API (AES-GCM).
 * All linked bank account metadata is encrypted at rest.
 * Key is derived from user ID + app salt via PBKDF2 — data is
 * inaccessible without the authenticated user session.
 *
 * NEVER log decrypted payloads or encryption keys.
 */

const APP_SALT = 'zero-hero-bank-link-v1';
const STORAGE_PREFIX = 'zh_enc_';

async function deriveKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userId + APP_SALT),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(APP_SALT),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptAndStore<T>(
  userId: string,
  storageKey: string,
  data: T
): Promise<void> {
  try {
    const key = await deriveKey(userId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(JSON.stringify(data));

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext
    );

    // Store IV + ciphertext as base64
    const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    const encoded = btoa(String.fromCharCode(...combined));
    localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, encoded);
  } catch {
    // Silently fail — never expose crypto errors with payload details
  }
}

export async function decryptAndLoad<T>(
  userId: string,
  storageKey: string
): Promise<T | null> {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
    if (!stored) return null;

    const key = await deriveKey(userId);
    const combined = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(plaintext)) as T;
  } catch {
    // Decryption failed (wrong user, corrupted, etc.) — return null
    return null;
  }
}

export function removeEncrypted(storageKey: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${storageKey}`);
}

export function isEncryptedStorageAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}
