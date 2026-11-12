import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { db } from "@/db";
import {
  tests,
  test_questions,
  test_assignments,
  groups,
  topics,
  questions,
  users,
} from "@/db/schema";
import { eq, desc, asc, inArray } from "drizzle-orm";
import { TeacherTestsClient } from "./TeacherTestsClient";

export default async function TeacherTestsPage() {
  const [user, lang] = await Promise.all([
    requireRole(["teacher", "admin"]),
    getLang(),
  ]);

  // Fetch tests
  const allTests = await db
    .select({
      id: tests.id,
      title: tests.title,
      duration_minutes: tests.duration_minutes,
      created_by: tests.created_by,
      created_at: tests.created_at,
      creator_name: users.full_name,
    })
    .from(tests)
    .innerJoin(users, eq(tests.created_by, users.id))
    .orderBy(desc(tests.created_at));

  const allTestQuestions = await db
    .select()
    .from(test_questions)
    .orderBy(asc(test_questions.sort));

  // Groups managed by actor
  const managedGroups =
    user.role === "admin"
      ? await db.select().from(groups).orderBy(asc(groups.name))
      : await db
          .select()
          .from(groups)
          .where(eq(groups.teacher_id, user.id))
          .orderBy(asc(groups.name));

  const managedGroupIds = managedGroups.map((g) => g.id);

  // Assignments for managed groups
  const assignmentRows =
    managedGroupIds.length > 0
      ? await db
          .select({
            assignment: test_assignments,
            test: tests,
            group: groups,
          })
          .from(test_assignments)
          .innerJoin(tests, eq(test_assignments.test_id, tests.id))
          .innerJoin(groups, eq(test_assignments.group_id, groups.id))
          .where(inArray(test_assignments.group_id, managedGroupIds))
          .orderBy(desc(test_assignments.created_at))
      : [];

  // Topics and published questions for test builder
  const [allTopics, publishedQuestions] = await Promise.all([
    db.select().from(topics).orderBy(asc(topics.name_uz)),
    db
      .select({
        id: questions.id,
        topic_id: questions.topic_id,
        text_uz: questions.text_uz,
        text_ru: questions.text_ru,
      })
      .from(questions)
      .where(eq(questions.status, "published"))
      .orderBy(asc(questions.id)),
  ]);

  const testList = allTests.map((t) => {
    const qIds = allTestQuestions
      .filter((tq) => tq.test_id === t.id)
      .map((tq) => tq.question_id);
    return {
      ...t,
      questionIds: qIds,
      questionCount: qIds.length,
      canEdit: user.role === "admin" || t.created_by === user.id,
    };
  });

  const assignmentList = assignmentRows.map((r) => ({
    id: r.assignment.id,
    test_id: r.test.id,
    test_title: r.test.title,
    group_id: r.group.id,
    group_name: r.group.name,
    kind: r.assignment.kind,
    started_at: r.assignment.started_at,
    ends_at: r.assignment.ends_at,
    closed_at: r.assignment.closed_at,
    created_at: r.assignment.created_at,
    duration_minutes: r.test.duration_minutes,
  }));

  return (
    <TeacherTestsClient
      lang={lang}
      userId={user.id}
      userRole={user.role}
      tests={testList}
      assignments={assignmentList}
      groups={managedGroups}
      topics={allTopics}
      questions={publishedQuestions}
    />
  );
}
