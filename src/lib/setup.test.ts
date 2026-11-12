import { describe, it, expect, beforeAll } from "vitest";
import { runMigrations } from "@/db/migrate";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  SetupSchema,
  createFirstAdmin,
  hasAdmin,
  resetSetupCache,
} from "./setup";

describe("Setup Guard & First Admin Creation (Brief 2)", () => {
  beforeAll(async () => {
    await runMigrations();
  });

  describe("SetupSchema validation", () => {
    it("validates valid admin setup input", () => {
      const valid = SetupSchema.safeParse({
        fullName: "Bosh Administrator",
        login: "superadmin",
        password: "password123",
        repeatPassword: "password123",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects passwords shorter than 8 characters", () => {
      const invalid = SetupSchema.safeParse({
        fullName: "Admin",
        login: "admin",
        password: "short",
        repeatPassword: "short",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects password mismatch", () => {
      const mismatch = SetupSchema.safeParse({
        fullName: "Admin",
        login: "admin",
        password: "password123",
        repeatPassword: "different123",
      });
      expect(mismatch.success).toBe(false);
      if (!mismatch.success) {
        expect(mismatch.error.issues[0]?.message).toBe("passwordMismatch");
      }
    });

    it("rejects invalid login characters", () => {
      const invalidLogin = SetupSchema.safeParse({
        fullName: "Admin",
        login: "admin with spaces!",
        password: "password123",
        repeatPassword: "password123",
      });
      expect(invalidLogin.success).toBe(false);
    });
  });

  describe("Setup guard against second admin", () => {
    it("creates the first admin successfully, and prevents creating a second admin", async () => {
      resetSetupCache();
      const initialAdmin = await hasAdmin();

      if (!initialAdmin) {
        // Fresh database: first admin creation must succeed
        const first = await createFirstAdmin({
          fullName: "Bosh Admin",
          login: `admin_first_${Date.now()}`,
          password: "secure_pass_8chars",
        });
        expect(first.ok).toBe(true);
        expect(await hasAdmin()).toBe(true);
      }

      // Once an admin exists, any subsequent createFirstAdmin call must fail with 'exists'
      const second = await createFirstAdmin({
        fullName: "Ikkinchi Admin",
        login: `admin_two_${Date.now()}`,
        password: "secure_pass_8chars",
      });

      expect(second.ok).toBe(false);
      if (!second.ok) {
        expect(second.reason).toBe("exists");
      }
    });
  });
});
