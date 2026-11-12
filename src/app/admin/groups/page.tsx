import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { db } from "@/db";
import { groups, group_members, users, exam_attempts } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { AdminGroupsClient } from "./AdminGroupsClient";

export default async function AdminGroupsPage() {
  const [, lang] = await Promise.all([requireRole(["admin"]), getLang()]);

  const [allGroups, teachers] = await Promise.all([
    db.select().from(groups).orderBy(desc(groups.created_at)),
    db
      .select({ id: users.id, full_name: users.full_name, login: users.login })
      .from(users)
      .where(eq(users.role, "teacher"))
      .orderBy(users.full_name),
  ]);

  const groupIds = allGroups.map((g) => g.id);

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

  const teacherMap = new Map(teachers.map((t) => [t.id, t.full_name]));

  const groupsData = allGroups.map((g) => {
    const members = memberRows
      .filter((m) => m.groupId === g.id)
      .map((m) => {
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

        return {
          id: m.studentId,
          login: m.login,
          full_name: m.fullName,
          attemptsCount: sAttempts.length,
          examAttemptsCount: examOnly.length,
          passRate,
          lastExam: lastExam
            ? {
                id: lastExam.id,
                correct: lastExam.correct,
                wrong: lastExam.wrong,
                passed: lastExam.passed,
              }
            : null,
          bestExam: bestExam
            ? {
                id: bestExam.id,
                correct: bestExam.correct,
                wrong: bestExam.wrong,
                passed: bestExam.passed,
              }
            : null,
        };
      });

    return {
      id: g.id,
      name: g.name,
      teacher_id: g.teacher_id,
      teacher_name: teacherMap.get(g.teacher_id) || "—",
      students: members,
    };
  });

  return (
    <AdminGroupsClient
      lang={lang}
      teachers={teachers}
      groups={groupsData}
    />
  );
}
