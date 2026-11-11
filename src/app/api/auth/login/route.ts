import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, getDefaultRouteForRole } from "@/lib/auth";
import { checkLoginRateLimit, resetLoginRateLimit } from "@/lib/rate-limit";

const LoginSchema = z.object({
  login: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "local";
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "invalidCredentials" }, { status: 400 });
    }

    const rateKey = `${ip}:${parsed.data.login.toLowerCase()}`;
    const rate = checkLoginRateLimit(rateKey);
    if (!rate.allowed) {
      return NextResponse.json({ error: "rateLimited" }, { status: 429 });
    }

    const found = await db
      .select()
      .from(users)
      .where(eq(users.login, parsed.data.login.trim()))
      .limit(1);

    if (found.length === 0) {
      return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
    }

    const user = found[0];
    const valid = await verifyPassword(parsed.data.password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
    }

    resetLoginRateLimit(rateKey);
    await createSession(user.id, user.role);

    return NextResponse.json({
      ok: true,
      role: user.role,
      redirectTo: getDefaultRouteForRole(user.role),
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
