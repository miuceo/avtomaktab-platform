import React from "react";
import Link from "next/link";
import { Lang, t } from "@/lib/i18n";
import { GraduationCap, ShieldAlert } from "lucide-react";

export function ActiveExamNotice({ lang }: { lang: Lang }) {
  return (
    <div className="max-w-2xl mx-auto my-8 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700 rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-enter">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Imtihon davom etmoqda
      </h1>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {t(lang, "student.examInProgressDesc")}
      </p>
      <div className="pt-2">
        <Link
          href="/student/exam/run"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold shadow-sm transition-all"
        >
          <GraduationCap className="w-5 h-5" />
          <span>{t(lang, "student.returnToExam")}</span>
        </Link>
      </div>
    </div>
  );
}
