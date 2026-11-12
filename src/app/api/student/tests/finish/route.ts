import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { finishTestAttempt } from "@/lib/test-service";

const FinishSchema = z.object({ attemptId: z.number().int().positive() });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "student" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = FinishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  const result = await finishTestAttempt(user.id, parsed.data.attemptId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    redirectTo: `/student/tests/result/${parsed.data.attemptId}`,
  });
}
