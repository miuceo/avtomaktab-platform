import React from "react";
import Link from "next/link";
import { requireRole, getLang } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { db } from "@/db";
import { groups, group_members, users, exam_attempts } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { CheckCircle2, Eye, FileSpreadsheet, XCircle } from "lucide-react";

export default async function TeacherResultsPage() {
  const [user, lang] = await Promise.all([
    requireRole(["teacher", "admin"]),
    getLang(),
  ]);

  const teacherGroups =
    user.role === "admin"
      ? await db.select().from(groups)
      : await db.select().from(groups).where(eq(groups.teacher_id, user.id));

  const groupIds = teacherGroups.map((g) => g.id);
  const memberRows =
    groupIds.length > 0
      ? await db
          .select({
            groupId: group_members.group_id,
            studentId: users.id,
            login: users.login,
            fullName: users.full_name,
          })
          .from(group_members)
          .innerJoin(users, eq(group_members.student_id, users.id))
          .where(inArray(group_members.group_id, groupIds))
      : [];

  const studentIds = Array.from(new Set(memberRows.map((m) => m.studentId)));
  const attemptsRows =
    studentIds.length > 0
      ? await db
          .select()
          .from(exam_attempts)
          .where(inArray(exam_attempts.student_id, studentIds))
          .orderBy(desc(exam_attempts.started_at))
      : [];

  return (
    <div className="space-y-6 animate-enter">
      <h1 className="text-2xl font-bold flex items-center gap-2.5">
        <FileSpreadsheet className="w-7 h-7 text-blue-800 dark:text-blue-400" />
        {t(lang, "nav.results")}
      </h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <th className="py-3 px-3">Guruh</th>
              <th className="py-3 px-3">{t(lang, "teacher.studentName")}</th>
              <th className="py-3 px-3">{t(lang, "teacher.attemptsCount")}</th>
              <th className="py-3 px-3">{t(lang, "teacher.bestExam")}</th>
              <th className="py-3 px-3">{t(lang, "student.lastExam")}</th>
              <th className="py-3 px-3">{t(lang, "student.passRate")}</th>
              <th className="py-3 px-3 text-right">{t(lang, "app.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {memberRows.map((m) => {
              const grp = teacherGroups.find((g) => g.id === m.groupId);
              const sAttempts = attemptsRows.filter((a) => a.student_id === m.studentId);
              const examOnly = sAttempts.filter((a) => a.mode === "exam" && a.finished_at);
              const passedCount = examOnly.filter((a) => a.passed).length;
              const passRate =
                examOnly.length > 0 ? Math.round((passedCount / examOnly.length) * 100) : 0;
              const lastExam = examOnly[0] || null;
              const bestExam =
                examOnly.length > 0
                  ? [...examOnly].sort((a, b) => b.correct - a.correct)[0]
                  : null;

              return (
                <tr
                  key={`${m.groupId}-${m.studentId}`}
                  className="border-b border-slate-100 dark:border-slate-800/60"
                >
                  <td className="py-3 px-3 font-medium">{grp?.name}</td>
                  <td className="py-3 px-3 font-bold">{m.fullName}</td>
                  <td className="py-3 px-3">{sAttempts.length}</td>
                  <td className="py-3 px-3">
                    {bestExam ? `+${bestExam.correct} / -${bestExam.wrong}` : "—"}
                  </td>
                  <td className="py-3 px-3">
                    {lastExam ? (
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          lastExam.passed ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {lastExam.passed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        +{lastExam.correct} / -{lastExam.wrong}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold">{passRate}%</td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/teacher/students/${m.studentId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-800 text-white text-xs font-bold hover:bg-blue-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t(lang, "teacher.studentDetails")}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
