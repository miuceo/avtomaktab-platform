import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import type { Lang } from "./i18n";

export const SESSION_COOKIE_NAME = "avtomaktab_session";
export const ROLE_COOKIE_NAME = "avtomaktab_role";
export const LANG_COOKIE_NAME = "avtomaktab_lang";
export const THEME_COOKIE_NAME = "avtomaktab_theme";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type UserRole = "admin" | "teacher" | "student";

export interface AuthUser {
  id: number;
  login: string;
  full_name: string;
  role: UserRole;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number, role: UserRole): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;

  await db.insert(sessions).values({
    user_id: userId,
    token,
    expires_at: expiresAt,
    created_at: now,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
  cookieStore.set(ROLE_COOKIE_NAME, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(ROLE_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const now = Date.now();
  const rows = await db
    .select({
      id: users.id,
      login: users.login,
      full_name: users.full_name,
      role: users.role,
      expires_at: sessions.expires_at,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.user_id, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expires_at, now)))
    .limit(1);

  if (rows.length === 0) return null;

  return {
    id: rows[0].id,
    login: rows[0].login,
    full_name: rows[0].full_name,
    role: rows[0].role,
  };
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!allowedRoles.includes(user.role)) {
    redirect(getDefaultRouteForRole(user.role));
  }
  return user;
}

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "teacher":
      return "/teacher";
    case "student":
    default:
      return "/student";
  }
}

export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const val = cookieStore.get(LANG_COOKIE_NAME)?.value;
  return val === "ru" ? "ru" : "uz";
}
