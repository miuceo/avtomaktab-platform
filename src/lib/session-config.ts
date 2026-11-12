/**
 * Session lifetime: 3 hours ABSOLUTE, counted from the moment of login.
 * It is never extended by activity, and the cookies expire at the same moment.
 */
export const SESSION_DURATION_MS = 3 * 60 * 60 * 1000;

export function getSessionExpiry(loginAtMs: number): number {
  return loginAtMs + SESSION_DURATION_MS;
}

/** A session is valid strictly before its `expires_at`. */
export function isSessionActive(expiresAtMs: number, nowMs: number): boolean {
  return expiresAtMs > nowMs;
}
