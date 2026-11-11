import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { db } from "@/db";
import { questions, answers, topics } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { AdminQuestionsClient } from "./AdminQuestionsClient";

export default async function AdminQuestionsPage() {
  const [, lang] = await Promise.all([requireRole(["admin"]), getLang()]);

  const [allTopics, allQuestions, allAnswers] = await Promise.all([
    db.select().from(topics).orderBy(asc(topics.id)),
    db.select().from(questions).orderBy(desc(questions.id)),
    db.select().from(answers).orderBy(asc(answers.sort)),
  ]);

  const enriched = allQuestions.map((q) => ({
    ...q,
    answers: allAnswers.filter((a) => a.question_id === q.id),
  }));

  return (
    <AdminQuestionsClient
      lang={lang}
      topics={allTopics}
      questions={enriched}
    />
  );
}
