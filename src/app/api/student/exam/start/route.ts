import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { db } from "@/db";
import { questions, answers, exam_attempts } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { sanitizeQuestionForClientExam } from "@/lib/exam-logic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "student" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const appSettings = await getAppSettings();
  const allPublished = await db
    .select()
    .from(questions)
    .where(eq(questions.status, "published"));

  if (allPublished.length === 0) {
    return NextResponse.json({ error: "Savollar topilmadi" }, { status: 400 });
  }

  // Shuffle published questions
  const shuffled = [...allPublished].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(appSettings.exam_question_count, shuffled.length));
  const selectedIds = selected.map((q) => q.id);

  const allAnswers = await db
    .select()
    .from(answers)
    .where(inArray(answers.question_id, selectedIds));

  const questionsWithAnswers = selected.map((q) => {
    const qAnswers = allAnswers
      .filter((a) => a.question_id === q.id)
      .sort((a, b) => a.sort - b.sort);
    return sanitizeQuestionForClientExam({
      ...q,
      answers: qAnswers,
    });
  });

  const startedAt = Date.now();
  const inserted = await db
    .insert(exam_attempts)
    .values({
      student_id: user.id,
      mode: "exam",
      question_ids_json: JSON.stringify(selectedIds),
      started_at: startedAt,
      correct: 0,
      wrong: 0,
      passed: false,
    })
    .returning();

  const attempt = inserted[0];

  return NextResponse.json({
    attemptId: attempt.id,
    startedAt,
    durationMinutes: appSettings.exam_minutes,
    maxWrong: appSettings.exam_max_wrong,
    totalQuestions: questionsWithAnswers.length,
    questions: questionsWithAnswers,
  });
}
