import bcrypt from "bcryptjs";
import { z } from "zod";
import { client } from "@/db";

export const SetupSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    login: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .regex(/^[A-Za-z0-9._-]+$/),
    password: z.string().min(8).max(200),
    repeatPassword: z.string().max(200),
  })
  .refine((v) => v.password === v.repeatPassword, {
    path: ["repeatPassword"],
    message: "passwordMismatch",
  });

export type SetupInput = z.infer<typeof SetupSchema>;

// Once an admin is known to exist it can never disappear through the app
// (the last admin cannot be deleted or demoted), so a positive answer is cached.
let adminKnownToExist = false;

export function resetSetupCache(): void {
  adminKnownToExist = false;
}

export async function hasAdmin(): Promise<boolean> {
  if (adminKnownToExist) return true;
  const res = await client.execute("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1");
  if (res.rows.length > 0) {
    adminKnownToExist = true;
    return true;
  }
  return false;
}

export type CreateFirstAdminResult =
  | { ok: true; id: number; login: string }
  | { ok: false; reason: "exists" | "login_taken" };

/**
 * Creates the very first admin. The "no admin yet" check happens inside the
 * INSERT statement itself, so two concurrent requests can never both succeed.
 */
export async function createFirstAdmin(
  input: { fullName: string; login: string; password: string },
  nowMs = Date.now()
): Promise<CreateFirstAdminResult> {
  const passwordHash = await bcrypt.hash(input.password, 10);

  try {
    const res = await client.execute({
      sql: `INSERT INTO users (login, password_hash, full_name, role, created_at)
            SELECT ?, ?, ?, 'admin', ?
            WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin')`,
      args: [input.login.trim(), passwordHash, input.fullName.trim(), nowMs],
    });

    if (res.rowsAffected === 0) {
      return { ok: false, reason: "exists" };
    }
    adminKnownToExist = true;
    return { ok: true, id: Number(res.lastInsertRowid), login: input.login.trim() };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/UNIQUE/i.test(message)) {
      return { ok: false, reason: "login_taken" };
    }
    throw err;
  }
}
