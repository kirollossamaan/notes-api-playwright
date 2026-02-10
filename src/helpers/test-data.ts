/**
 * Shared test data helpers for unique values and passwords.
 */

/** Unique string for dynamic test data (avoids collisions across runs). */
export function randomString(prefix: string): string {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

/** Random alphanumeric password of given length. */
export function randomPassword(len: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}
