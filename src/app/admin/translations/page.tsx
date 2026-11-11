import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { db } from "@/db";
import {
  questions,
  answers,
  topics,
  chapters,
  road_signs,
  videos,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { AdminTranslationsClient } from "./AdminTranslationsClient";

export default async function AdminTranslationsPage() {
  const [, lang] = await Promise.all([requireRole(["admin"]), getLang()]);

  const [
    unreviewedQuestions,
    allAnswers,
    unreviewedTopics,
    unreviewedChapters,
    unreviewedSigns,
    unreviewedVideos,
  ] = await Promise.all([
    db.select().from(questions).where(eq(questions.ru_reviewed, false)),
    db.select().from(answers).orderBy(asc(answers.sort)),
    db.select().from(topics).where(eq(topics.ru_reviewed, false)),
    db.select().from(chapters).where(eq(chapters.ru_reviewed, false)),
    db.select().from(road_signs).where(eq(road_signs.ru_reviewed, false)),
    db.select().from(videos).where(eq(videos.ru_reviewed, false)),
  ]);

  const enrichedQuestions = unreviewedQuestions.map((q) => ({
    ...q,
    answers: allAnswers.filter((a) => a.question_id === q.id),
  }));

  return (
    <AdminTranslationsClient
      lang={lang}
      questions={enrichedQuestions}
      topics={unreviewedTopics}
      chapters={unreviewedChapters}
      signs={unreviewedSigns}
      videos={unreviewedVideos}
    />
  );
}
