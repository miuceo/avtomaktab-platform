import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, getLang } from "@/lib/auth";
import { getActiveExamAttempt } from "@/lib/active-exam";
import { ActiveExamNotice } from "@/components/ActiveExamNotice";
import { localizedText, t } from "@/lib/i18n";
import { db } from "@/db";
import { chapters, videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default async function StudentChapterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, lang, resolvedParams] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
    params,
  ]);

  const activeExam = await getActiveExamAttempt(user.id);
  if (activeExam) {
    return <ActiveExamNotice lang={lang} />;
  }

  const chapterId = Number(resolvedParams.id);
  if (!chapterId) notFound();

  const chapterRows = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, chapterId))
    .limit(1);

  if (chapterRows.length === 0) notFound();
  const chapter = chapterRows[0];

  const chapterVideos = await db
    .select()
    .from(videos)
    .where(eq(videos.chapter_id, chapter.id));

  const title = localizedText(lang, chapter.title_uz, chapter.title_ru);
  const body = localizedText(lang, chapter.body_uz, chapter.body_ru);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-enter">
      <div className="flex items-center justify-between">
        <Link
          href="/student/knowledge"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          {t(lang, "app.back")}
        </Link>
      </div>

      <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
          {title}
        </h1>

        <MarkdownRenderer content={body} />

        {chapterVideos.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold">Video darslar</h3>
            <div className="space-y-4">
              {chapterVideos.map((v) => (
                <YouTubeEmbed
                  key={v.id}
                  title={localizedText(lang, v.title_uz, v.title_ru)}
                  youtubeUrl={v.youtube_url}
                  offlineNotice={t(lang, "student.offlineVideoNotice")}
                />
              ))}
            </div>
          </div>
        )}

        {/* "Mavzu bo'yicha test" button at bottom */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <Link
            href={
              chapter.topic_id
                ? `/student/topics/${chapter.topic_id}`
                : "/student/topics"
            }
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold shadow-sm transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Mavzu bo&apos;yicha test</span>
          </Link>
        </div>
      </article>
    </div>
  );
}
