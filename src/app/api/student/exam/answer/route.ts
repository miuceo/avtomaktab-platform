import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { db } from "@/db";
import { exam_attempts, attempt_answers, answers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { evaluateExamState } from "@/lib/exam-logic";

const ExamAnswerPayloadSchema = z.object({
  attemptId: z.number().int().positive(),
  questionId: z.number().int().positive().optional(),
  answerId: z.number().int().positive().optional(),
  finish: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "student" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ExamAnswerPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
  }

  const { attemptId, questionId, answerId, finish } = parsed.data;

  const attemptRows = await db
    .select()
    .from(exam_attempts)
    .where(and(eq(exam_attempts.id, attemptId), eq(exam_attempts.student_id, user.id)))
    .limit(1);

  if (attemptRows.length === 0) {
    return NextResponse.json({ error: "Urinish topilmadi" }, { status: 404 });
  }

  const attempt = attemptRows[0];

  if (attempt.mode !== "exam") {
    return NextResponse.json({ error: "Noto'g'ri urinish rejimi" }, { status: 400 });
  }

  const questionIds: number[] = JSON.parse(attempt.question_ids_json || "[]");

  if (questionId !== undefined) {
    if (!questionIds.includes(questionId)) {
      return NextResponse.json(
        { error: "Savol ushbu imtihon ro'yxatida mavjud emas" },
        { status: 400 }
      );
    }
    if (answerId === undefined) {
      return NextResponse.json({ error: "Javob tanlanmagan" }, { status: 400 });
    }
  }

  if (attempt.finished_at) {
    return NextResponse.json({
      finished: true,
      attemptId: attempt.id,
    });
  }

  const appSettings = await getAppSettings();
  const totalQuestions = questionIds.length || appSettings.exam_question_count;
  const nowMs = Date.now();

  // Check existing answers first
  const existingAnswers = await db
    .select()
    .from(attempt_answers)
    .where(eq(attempt_answers.attempt_id, attemptId));

  // Pre-evaluate before accepting new answer (in case already timed out or exceeded wrong limit)
  const preEval = evaluateExamState({
    totalQuestions,
    maxWrong: appSettings.exam_max_wrong,
    durationMinutes: appSettings.exam_minutes,
    startedAtMs: attempt.started_at,
    nowMs,
    answers: existingAnswers.map((a) => ({
      questionId: a.question_id,
      answerId: a.answer_id,
      isCorrect: a.is_correct,
    })),
  });

  if (
    !preEval.finished &&
    questionId &&
    answerId &&
    !existingAnswers.some((a) => a.question_id === questionId)
  ) {
    // Verify the answer belongs to the question on the server
    const ansRows = await db
      .select()
      .from(answers)
      .where(and(eq(answers.id, answerId), eq(answers.question_id, questionId)))
      .limit(1);

    if (ansRows.length === 0) {
      return NextResponse.json({ error: "Javob ushbu savolga tegishli emas" }, { status: 400 });
    }

    const isCorrect = ansRows[0].is_correct;
    await db.insert(attempt_answers).values({
      attempt_id: attemptId,
      question_id: questionId,
      answer_id: answerId,
      is_correct: isCorrect,
    });
    existingAnswers.push({
      id: 0,
      attempt_id: attemptId,
      question_id: questionId,
      answer_id: answerId,
      is_correct: isCorrect,
    });
  }

  const finalEval = evaluateExamState({
    totalQuestions,
    maxWrong: appSettings.exam_max_wrong,
    durationMinutes: appSettings.exam_minutes,
    startedAtMs: attempt.started_at,
    nowMs,
    answers: existingAnswers.map((a) => ({
      questionId: a.question_id,
      answerId: a.answer_id,
      isCorrect: a.is_correct,
    })),
    forceFinish: finish,
  });

  if (finalEval.finished) {
    await db
      .update(exam_attempts)
      .set({
        finished_at: nowMs,
        correct: finalEval.correct,
        wrong: finalEval.wrong,
        passed: finalEval.passed,
      })
      .where(eq(exam_attempts.id, attemptId));
  } else {
    await db
      .update(exam_attempts)
      .set({
        correct: finalEval.correct,
        wrong: finalEval.wrong,
      })
      .where(eq(exam_attempts.id, attemptId));
  }

  // IMPORTANT: Never send is_correct or correct/wrong breakdown while exam is in_progress
  return NextResponse.json({
    attemptId,
    finished: finalEval.finished,
    reason: finalEval.reason,
    answeredCount: finalEval.answeredCount,
    remainingSeconds: finalEval.remainingSeconds,
  });
}
