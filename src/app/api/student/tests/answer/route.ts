import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { submitTestAnswer } from "@/lib/test-service";

const AnswerSchema = z.object({
  attemptId: z.number().int().positive(),
  questionId: z.number().int().positive(),
  answerId: z.number().int().positive(),
});

/**
 * Saves one answer server-side. The response never says whether it was correct
 * (the review is only available after the attempt is finished).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "student" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = AnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  const result = await submitTestAnswer(user.id, parsed.data);
  if (!result.ok) {
    const status =
      result.error === "notFound"
        ? 404
        : result.error === "expired" || result.error === "finished"
          ? 409
          : 400;
    return NextResponse.json({ error: result.error, finished: status === 409 }, { status });
  }
  return NextResponse.json({ ok: true, remainingSeconds: result.remainingSeconds });
}
