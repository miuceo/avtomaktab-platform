import React from "react";
import { notFound } from "next/navigation";
import { requireRole, getLang } from "@/lib/auth";
import { getActiveBlock } from "@/lib/active-exam";
import { ActiveExamNotice } from "@/components/ActiveExamNotice";
import { localizedText } from "@/lib/i18n";
import { db } from "@/db";
import { topics, questions, answers } from "@/db/schema";
import { eq, and, inArray, asc } from "drizzle-orm";
import { PracticeRunner } from "@/components/PracticeRunner";

export default async function StudentTopicPracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, lang, resolvedParams] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
    params,
  ]);

  const activeExam = await getActiveBlock(user.id);
  if (activeExam) {
    return <ActiveExamNotice lang={lang} block={activeExam} />;
  }

  const topicId = Number(resolvedParams.id);
  if (!topicId) notFound();

  const topicRows = await db
    .select()
    .from(topics)
    .where(eq(topics.id, topicId))
    .limit(1);

  if (topicRows.length === 0) notFound();
  const topic = topicRows[0];

  const questionRows = await db
    .select()
    .from(questions)
    .where(and(eq(questions.topic_id, topicId), eq(questions.status, "published")))
    .orderBy(asc(questions.id));

  const qIds = questionRows.map((q) => q.id);
  const answerRows =
    qIds.length > 0
      ? await db.select().from(answers).where(inArray(answers.question_id, qIds))
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
      mode="topic"
      title={localizedText(lang, topic.name_uz, topic.name_ru)}
      backHref="/student/topics"
      topicId={topic.id}
      questions={questionsWithAnswers}
    />
  );
}
