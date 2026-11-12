import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, getLang } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { getActiveBlock } from "@/lib/active-exam";
import { t } from "@/lib/i18n";
import { db } from "@/db";
import { exam_attempts, attempt_answers, answers, questions } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

const PracticeSchema = z.object({
  attemptId: z.number().int().positive().optional(),
  mode: z.enum(["ticket", "topic", "mistakes"]),
  ticketId: z.number().int().positive().nullable().optional(),
  topicId: z.number().int().positive().nullable().optional(),
  questionIds: z.array(z.number().int().positive()).optional(),
  questionId: z.number().int().positive().optional(),
  answerId: z.number().int().positive().optional(),
  finish: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "student" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const activeBlock = await getActiveBlock(user.id);
  if (activeBlock) {
    const lang = await getLang();
    const key = activeBlock.kind === "test" ? "student.testInProgress" : "student.examInProgress";
    const descKey =
      activeBlock.kind === "test" ? "student.testInProgressDesc" : "student.examInProgressDesc";
    return NextResponse.json(
      { error: `${t(lang, key)}: ${t(lang, descKey)}` },
      { status: 423 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = PracticeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;
  const now = Date.now();
  let attemptId = data.attemptId;
  let attemptQuestionIds: number[] = [];

  if (attemptId) {
    const attemptRows = await db
      .select()
      .from(exam_attempts)
      .where(eq(exam_attempts.id, attemptId))
      .limit(1);

    if (attemptRows.length === 0) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 400 });
    }

    const attempt = attemptRows[0];
    if (attempt.student_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (attempt.mode === "exam" || attempt.finished_at !== null) {
      return NextResponse.json({ error: "Invalid attempt state" }, { status: 400 });
    }

    try {
      attemptQuestionIds = JSON.parse(attempt.question_ids_json || "[]");
    } catch {
      attemptQuestionIds = [];
    }
  } else {
    let validQuestionIds: number[] = [];
    if (data.questionIds && data.questionIds.length > 0) {
      const pubRows = await db
        .select({ id: questions.id })
        .from(questions)
        .where(
          and(
            inArray(questions.id, data.questionIds),
            eq(questions.status, "published")
          )
        );
      const pubSet = new Set(pubRows.map((r) => r.id));
      validQuestionIds = data.questionIds.filter((id) => pubSet.has(id));
    }

    const inserted = await db
      .insert(exam_attempts)
      .values({
        student_id: user.id,
        mode: data.mode,
        ticket_id: data.ticketId ?? null,
        topic_id: data.topicId ?? null,
        question_ids_json: JSON.stringify(validQuestionIds),
        started_at: now,
        correct: 0,
        wrong: 0,
        passed: false,
      })
      .returning();
    attemptId = inserted[0].id;
    attemptQuestionIds = validQuestionIds;
  }

  let isCorrectResult: boolean | null = null;

  if (data.questionId !== undefined || data.answerId !== undefined) {
    if (!data.questionId || !data.answerId) {
      return NextResponse.json({ error: "Question and answer required" }, { status: 400 });
    }

    if (attemptQuestionIds.length > 0 && !attemptQuestionIds.includes(data.questionId)) {
      return NextResponse.json(
        { error: "Question is not in the attempt question set" },
        { status: 400 }
      );
    }

    const ansRows = await db
      .select()
      .from(answers)
      .where(and(eq(answers.id, data.answerId), eq(answers.question_id, data.questionId)))
      .limit(1);

    if (ansRows.length === 0) {
      return NextResponse.json({ error: "Invalid answer for question" }, { status: 400 });
    }

    isCorrectResult = ansRows[0].is_correct;

    const existing = await db
      .select()
      .from(attempt_answers)
      .where(
        and(
          eq(attempt_answers.attempt_id, attemptId),
          eq(attempt_answers.question_id, data.questionId)
        )
      );

    if (existing.length === 0) {
      await db.insert(attempt_answers).values({
        attempt_id: attemptId,
        question_id: data.questionId,
        answer_id: data.answerId,
        is_correct: isCorrectResult,
      });
    }
  }

  // Recalculate attempt totals
  const allAttemptAnswers = await db
    .select()
    .from(attempt_answers)
    .where(eq(attempt_answers.attempt_id, attemptId));

  const correct = allAttemptAnswers.filter((a) => a.is_correct).length;
  const wrong = allAttemptAnswers.filter((a) => !a.is_correct).length;
  const appSettings = await getAppSettings();
  const passed = wrong <= appSettings.exam_max_wrong && correct > 0;

  await db
    .update(exam_attempts)
    .set({
      correct,
      wrong,
      passed,
      ...(data.finish ? { finished_at: now } : {}),
    })
    .where(and(eq(exam_attempts.id, attemptId), eq(exam_attempts.student_id, user.id)));

  return NextResponse.json({
    ok: true,
    attemptId,
    isCorrect: isCorrectResult,
    correct,
    wrong,
    passed,
  });
}
