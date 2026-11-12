import { describe, it, expect, beforeAll } from "vitest";
import { runMigrations } from "@/db/migrate";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  SESSION_DURATION_MS,
  getSessionExpiry,
  isSessionActive,
} from "./session-config";
import { createSessionRecord, findUserBySessionToken } from "./auth";

describe("Session Configuration & Absolute Expiry (Brief 2)", () => {
  beforeAll(async () => {
    await runMigrations();
  });

  describe("Session duration constants", () => {
    it("session lifetime is exactly 3 hours absolute", () => {
      const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
      expect(SESSION_DURATION_MS).toBe(THREE_HOURS_MS);
      expect(SESSION_DURATION_MS).toBe(10_800_000);
    });

    it("calculates session expiry strictly at 3 hours from login time", () => {
      const loginTime = 1_000_000;
      expect(getSessionExpiry(loginTime)).toBe(loginTime + SESSION_DURATION_MS);
    });

    it("evaluates session validity strictly before expires_at", () => {
      const expiresAt = 5_000_000;
      expect(isSessionActive(expiresAt, 4_999_999)).toBe(true);
      expect(isSessionActive(expiresAt, 5_000_000)).toBe(false);
      expect(isSessionActive(expiresAt, 5_000_001)).toBe(false);
    });
  });

  describe("Session lifecycle in database", () => {
    it("creates a session with fixed 3-hour expiry and expires after 3 hours", async () => {
      let [testUser] = await db.select().from(users).limit(1);
      if (!testUser) {
        [testUser] = await db
          .insert(users)
          .values({
            login: `session_user_${Date.now()}`,
            password_hash: "hash",
            full_name: "Session User",
            role: "student",
            created_at: Date.now(),
          })
          .returning();
      }
      expect(testUser).toBeDefined();

      const loginTime = 10_000_000;
      const { token, expiresAt } = await createSessionRecord(testUser.id, loginTime);

      expect(expiresAt).toBe(loginTime + SESSION_DURATION_MS);

      // 1. Immediately after login -> valid
      const userAtLogin = await findUserBySessionToken(token, loginTime);
      expect(userAtLogin).not.toBeNull();
      expect(userAtLogin?.id).toBe(testUser.id);

      // 2. 2 hours later -> valid
      const userAt2h = await findUserBySessionToken(token, loginTime + 2 * 60 * 60 * 1000);
      expect(userAt2h).not.toBeNull();
      expect(userAt2h?.id).toBe(testUser.id);

      // Verify that findUserBySessionToken did NOT extend expires_at in the database
      const [savedSession] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);
      expect(savedSession.expires_at).toBe(loginTime + SESSION_DURATION_MS);

      // 3. Exactly at 3 hours or 3 hours + 1 ms -> expired (returns null)
      const userAt3h = await findUserBySessionToken(token, loginTime + SESSION_DURATION_MS);
      expect(userAt3h).toBeNull();

      const userAfter3h = await findUserBySessionToken(token, loginTime + SESSION_DURATION_MS + 1000);
      expect(userAfter3h).toBeNull();
    });
  });
});
