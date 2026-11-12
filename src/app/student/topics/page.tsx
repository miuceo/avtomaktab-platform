import React from "react";
import Link from "next/link";
import { requireRole, getLang } from "@/lib/auth";
import { getActiveBlock } from "@/lib/active-exam";
import { ActiveExamNotice } from "@/components/ActiveExamNotice";
import { localizedText, t } from "@/lib/i18n";
import { db } from "@/db";
import { topics, questions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { BookOpen } from "lucide-react";

export default async function StudentTopicsPage() {
  const [user, lang] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
  ]);

  const activeExam = await getActiveBlock(user.id);
  if (activeExam) {
    return <ActiveExamNotice lang={lang} block={activeExam} />;
  }

  const [allTopics, publishedQuestions] = await Promise.all([
    db.select().from(topics).orderBy(asc(topics.id)),
    db.select().from(questions).where(eq(questions.status, "published")),
  ]);

  return (
    <div className="space-y-6 animate-enter">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-blue-800 dark:text-blue-400" />
          {t(lang, "nav.topics")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t(lang, "student.practiceTopics")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allTopics.map((topic, idx) => {
          const count = publishedQuestions.filter((q) => q.topic_id === topic.id).length;
          return (
            <Link
              key={topic.id}
              href={`/student/topics/${topic.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-700 transition-all flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    {localizedText(lang, topic.name_uz, topic.name_ru)}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t(lang, "student.questionsCount", { count })}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-blue-700 dark:text-blue-400 shrink-0">
                Boshlash →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
