import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { group_members, groups, users } from "@/db/schema";
import { generatePassword, generateUniqueLogin } from "./credentials";
import type { AuthUser } from "./auth";

export interface CreatedStudent {
  id: number;
  full_name: string;
  login: string;
  password: string; // plain text, returned ONCE at creation
}

/** Returns the group if the user may manage it (admin: any group, teacher: own groups only). */
export async function getManagedGroup(user: Pick<AuthUser, "id" | "role">, groupId: number) {
  if (user.role !== "admin" && user.role !== "teacher") return null;
  const rows = await db
    .select()
    .from(groups)
    .where(
      user.role === "admin"
        ? eq(groups.id, groupId)
        : and(eq(groups.id, groupId), eq(groups.teacher_id, user.id))
    )
    .limit(1);
  return rows[0] ?? null;
}

/** True if the user may manage the student (admin: any student, teacher: students of own groups). */
export async function canManageStudent(
  user: Pick<AuthUser, "id" | "role">,
  studentId: number
): Promise<boolean> {
  if (user.role === "admin") {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.role, "student")))
      .limit(1);
    return rows.length > 0;
  }
  if (user.role !== "teacher") return false;
  const rows = await db
    .select({ studentId: group_members.student_id })
    .from(group_members)
    .innerJoin(groups, eq(group_members.group_id, groups.id))
    .innerJoin(users, eq(group_members.student_id, users.id))
    .where(
      and(
        eq(group_members.student_id, studentId),
        eq(groups.teacher_id, user.id),
        eq(users.role, "student")
      )
    )
    .limit(1);
  return rows.length > 0;
}

function isUniqueViolation(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /UNIQUE/i.test(message);
}

/**
 * Creates one student account per name (auto login + random password) and adds
 * them all to the group, atomically. Passwords are returned only here.
 */
export async function createStudentsInGroup(
  groupId: number,
  fullNames: string[],
  nowMs = Date.now()
): Promise<CreatedStudent[]> {
  if (fullNames.length === 0) return [];

  const plain = fullNames.map(() => generatePassword());
  const hashes = await Promise.all(plain.map((p) => bcrypt.hash(p, 10)));

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.transaction(async (tx) => {
        const existing = await tx.select({ login: users.login }).from(users);
        const taken = new Set(existing.map((u) => u.login.toLowerCase()));

        const created: CreatedStudent[] = [];
        for (let i = 0; i < fullNames.length; i++) {
          const login = generateUniqueLogin(fullNames[i], taken);
          const [row] = await tx
            .insert(users)
            .values({
              login,
              password_hash: hashes[i],
              full_name: fullNames[i],
              role: "student",
              created_at: nowMs,
            })
            .returning({ id: users.id });
          await tx.insert(group_members).values({
            group_id: groupId,
            student_id: row.id,
            joined_at: nowMs,
          });
          created.push({ id: row.id, full_name: fullNames[i], login, password: plain[i] });
        }
        return created;
      });
    } catch (err) {
      lastError = err;
      // A concurrent request took one of the logins: retry with a fresh login set.
      if (!isUniqueViolation(err)) throw err;
    }
  }
  throw lastError;
}

/** Sets a new random password for a student and returns it (shown once). */
export async function resetStudentPassword(studentId: number): Promise<string> {
  const password = generatePassword();
  const hash = await bcrypt.hash(password, 10);
  await db
    .update(users)
    .set({ password_hash: hash })
    .where(and(eq(users.id, studentId), eq(users.role, "student")));
  return password;
}
