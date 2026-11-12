import React from "react";
import Link from "next/link";
import { requireRole, getLang } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { db } from "@/db";
import { groups, group_members, tests, test_assignments } from "@/db/schema";
import { and, desc, eq, gt, inArray, isNull, or } from "drizzle-orm";
import { ClipboardCheck, FileSpreadsheet, PlayCircle, Plus, Radio, UserPlus, Users } from "lucide-react";

export default async function TeacherDashboardPage() {
  const [user, lang] = await Promise.all([requireRole(["teacher", "admin"]), getLang()]);
  const isAdmin = user.role === "admin";
  const now = Date.now();

  const myGroups = isAdmin
    ? await db.select().from(groups)
    : await db.select().from(groups).where(eq(groups.teacher_id, user.id));
  const groupIds = myGroups.map((g) => g.id);

  const [members, myTests, active] = await Promise.all([
    groupIds.length
      ? db.select({ id: group_members.student_id }).from(group_members).where(inArray(group_members.group_id, groupIds))
      : Promise.resolve([]),
    isAdmin ? db.select({ id: tests.id }).from(tests) : db.select({ id: tests.id }).from(tests).where(eq(tests.created_by, user.id)),
    groupIds.length
      ? db
          .select({ assignment: test_assignments, title: tests.title, groupName: groups.name })
          .from(test_assignments)
          .innerJoin(tests, eq(test_assignments.test_id, tests.id))
          .innerJoin(groups, eq(test_assignments.group_id, groups.id))
          .where(
            and(
              inArray(test_assignments.group_id, groupIds),
              or(
                and(eq(test_assignments.kind, "live"), gt(test_assignments.ends_at, now)),
                and(eq(test_assignments.kind, "open"), isNull(test_assignments.closed_at))
              )
            )
          )
          .orderBy(desc(test_assignments.created_at))
      : Promise.resolve([]),
  ]);

  const studentCount = new Set(members.map((m) => m.id)).size;
  const liveCount = active.filter((a) => a.assignment.kind === "live").length;

  const cards = [
    { href: "/teacher/groups", title: t(lang, "teacherHome.groups"), count: myGroups.length, icon: <Users className="w-6 h-6 text-indigo-600" /> },
    { href: "/teacher/groups", title: t(lang, "teacherHome.students"), count: studentCount, icon: <UserPlus className="w-6 h-6 text-sky-600" /> },
    { href: "/teacher/tests", title: t(lang, "teacherHome.tests"), count: myTests.length, icon: <ClipboardCheck className="w-6 h-6 text-emerald-600" /> },
    { href: "/teacher/tests", title: t(lang, "teacherHome.active"), count: active.length, icon: <Radio className="w-6 h-6 text-rose-600" /> },
  ];

  const actions = [
    { href: "/teacher/tests", label: t(lang, "teacherHome.newTest"), icon: <Plus className="w-4 h-4" /> },
    { href: "/teacher/groups", label: t(lang, "teacherHome.addStudents"), icon: <UserPlus className="w-4 h-4" /> },
    { href: "/teacher/results", label: t(lang, "nav.results"), icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t(lang, "teacherHome.title")}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t(lang, "teacherHome.greeting").replace("{name}", user.full_name)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {a.icon}
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-700 transition-all flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{c.title}</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{c.count}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800">{c.icon}</div>
          </Link>
        ))}
      </div>

      <section className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-rose-600" />
            {t(lang, "teacherHome.activeTitle")}
            {liveCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs">
                {t(lang, "teacherHome.liveNow").replace("{n}", String(liveCount))}
              </span>
            )}
          </h2>
          <Link href="/teacher/tests" className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline">
            {t(lang, "teacherHome.allTests")} →
          </Link>
        </div>

        {active.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">{t(lang, "teacherHome.noActive")}</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {active.map(({ assignment: a, title, groupName }) => {
              const live = a.kind === "live";
              const minutesLeft = live && a.ends_at ? Math.max(0, Math.ceil((a.ends_at - now) / 60000)) : null;
              return (
                <li key={a.id}>
                  <Link
                    href={`/teacher/assignments/${a.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 px-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <div>
                      <div className="font-bold">{title}</div>
                      <div className="text-xs text-slate-500">{groupName}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      {live ? (
                        <>
                          <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            {t(lang, "teacherHome.kindLive")}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300">
                            {t(lang, "teacherHome.minutesLeft").replace("{n}", String(minutesLeft))}
                          </span>
                        </>
                      ) : (
                        <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {t(lang, "teacherHome.kindOpen")}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
