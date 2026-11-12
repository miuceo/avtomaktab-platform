import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { getActiveBlock } from "@/lib/active-exam";
import { ActiveExamNotice } from "@/components/ActiveExamNotice";
import { t } from "@/lib/i18n";
import { db } from "@/db";
import { exam_attempts, attempt_answers, questions, answers } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { PracticeRunner } from "@/components/PracticeRunner";

export default async function StudentMistakesPage() {
  const [user, lang] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
  ]);

  const activeExam = await getActiveBlock(user.id);
  if (activeExam) {
    return <ActiveExamNotice lang={lang} block={activeExam} />;
  }

  // Fetch all answers by this student ordered from newest to oldest
  const historyRows = await db
    .select({
      questionId: attempt_answers.question_id,
      isCorrect: attempt_answers.is_correct,
      id: attempt_answers.id,
    })
    .from(attempt_answers)
    .innerJoin(exam_attempts, eq(attempt_answers.attempt_id, exam_attempts.id))
    .where(eq(exam_attempts.student_id, user.id))
    .orderBy(desc(attempt_answers.id));

  // Keep only the latest status for each question; if latest is false, it's in mistakes queue
  const latestMap = new Map<number, boolean>();
  for (const row of historyRows) {
    if (!latestMap.has(row.questionId)) {
      latestMap.set(row.questionId, row.isCorrect);
    }
  }

  const mistakeQuestionIds = Array.from(latestMap.entries())
    .filter(([, isCorrect]) => !isCorrect)
    .map(([qId]) => qId);

  const questionRows =
    mistakeQuestionIds.length > 0
      ? await db
          .select()
          .from(questions)
          .where(inArray(questions.id, mistakeQuestionIds))
      : [];

  const answerRows =
    mistakeQuestionIds.length > 0
      ? await db
          .select()
          .from(answers)
          .where(inArray(answers.question_id, mistakeQuestionIds))
      : [];

  const questionsWithAnswers = questionRows.map((q) => ({
    ...q,
    answers: answerRows
      .filter((a) => a.question_id === q.id)
      .sort((a, b) => a.sort - b.sort),
  }));

  return (
    <PracticeRunner
      lang={lang}
      mode="mistakes"
      title={t(lang, "nav.mistakes")}
      backHref="/student"
      questions={questionsWithAnswers}
    />
  );
}
