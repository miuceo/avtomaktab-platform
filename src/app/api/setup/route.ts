import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { SetupSchema, createFirstAdmin, hasAdmin } from "@/lib/setup";

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  // Once any admin exists this endpoint behaves as if it did not exist.
  if (await hasAdmin()) return notFound();

  const body = await req.json().catch(() => ({}));
  const parsed = SetupSchema.safeParse(body);
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some((i) => i.message === "passwordMismatch");
    return NextResponse.json(
      { error: mismatch ? "passwordMismatch" : "invalidInput" },
      { status: 400 }
    );
  }

  const result = await createFirstAdmin({
    fullName: parsed.data.fullName,
    login: parsed.data.login,
    password: parsed.data.password,
  });

  if (!result.ok) {
    if (result.reason === "exists") return notFound();
    return NextResponse.json({ error: "loginTaken" }, { status: 409 });
  }

  await createSession(result.id, "admin");
  return NextResponse.json({ ok: true, redirectTo: "/admin" });
}
