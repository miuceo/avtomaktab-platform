import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { enterAssignment } from "@/lib/test-service";

const StartSchema = z.object({ assignmentId: z.number().int().positive() });

/** Start (or resume) a test attempt for an assignment of one of the student's groups. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "student" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = StartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  const result = await enterAssignment(user.id, parsed.data.assignmentId);
  if (!result.ok) {
    const status = result.error === "notFound" ? 404 : result.error === "notMember" ? 403 : 409;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    ok: true,
    attemptId: result.attemptId,
    finished: result.finished,
    redirectTo: result.finished
      ? `/student/tests/result/${result.attemptId}`
      : `/student/tests/run/${result.attemptId}`,
  });
}
