import React from "react";
import Link from "next/link";
import { requireRole, getLang } from "@/lib/auth";
import { getActiveBlock } from "@/lib/active-exam";
import { ActiveExamNotice } from "@/components/ActiveExamNotice";
import { localizedText, t } from "@/lib/i18n";
import { db } from "@/db";
import { chapters } from "@/db/schema";
import { asc } from "drizzle-orm";
import { BookOpen, ChevronRight } from "lucide-react";

export default async function StudentKnowledgeListPage() {
  const [user, lang] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
  ]);

  const activeExam = await getActiveBlock(user.id);
  if (activeExam) {
    return <ActiveExamNotice lang={lang} block={activeExam} />;
  }

  const allChapters = await db.select().from(chapters).orderBy(asc(chapters.sort));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-enter">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-blue-800 dark:text-blue-400" />
          {t(lang, "nav.knowledge")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          O&apos;zbekiston Respublikasi Yo&apos;l harakati qoidalari bo&apos;yicha o&apos;quv qo&apos;llanma
        </p>
      </div>

      <div className="space-y-3">
        {allChapters.map((ch) => (
          <Link
            key={ch.id}
            href={`/student/knowledge/${ch.id}`}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-700 transition-all flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                {ch.sort}
              </span>
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                {localizedText(lang, ch.title_uz, ch.title_ru)}
              </h2>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
