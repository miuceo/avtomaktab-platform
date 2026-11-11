import { describe, it, expect, vi, beforeAll } from "vitest";
import { NextRequest } from "next/server";

let mockSessionToken = "";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "avtomaktab_session" && mockSessionToken
        ? { value: mockSessionToken }
        : undefined,
    set: () => {},
    delete: () => {},
  }),
}));

import { db } from "@/db";
import { runMigrations } from "@/db/migrate";
import {
  users,
  sessions,
  groups,
  group_members,
  questions,
  answers,
  topics,
  exam_attempts,
  attempt_answers,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./auth";
import {
  evaluateExamState,
  calculateWeakTopics,
  sanitizeQuestionForClientExam,
} from "./exam-logic";
import { POST as examAnswerPOST } from "@/app/api/student/exam/answer/route";
import { POST as practicePOST } from "@/app/api/student/practice/route";
import { getActiveExamAttempt } from "@/lib/active-exam";
import {
  PATCH as teacherStudentsPATCH,
  DELETE as teacherStudentsDELETE,
} from "@/app/api/teacher/students/route";

async function setSessionForUser(userId: number) {
  const token = `test_tok_${userId}_${Date.now()}_${Math.random()}`;
  await db.insert(sessions).values({
    user_id: userId,
    token,
    expires_at: Date.now() + 3600_000,
    created_at: Date.now(),
  });
  mockSessionToken = token;
}

describe("End-to-End Platform Flow & Security Review Fixes", () => {
  beforeAll(async () => {
    await runMigrations();
  });

  it("verifies seeded accounts, teacher student creation, student exam flow, and weak topics calculation", async () => {
    const [adminUser] = await db.select().from(users).where(eq(users.login, "admin")).limit(1);
    expect(adminUser).toBeDefined();
    expect(adminUser.role).toBe("admin");
    expect(await verifyPassword("admin123", adminUser.password_hash)).toBe(true);

    const [teacherUser] = await db.select().from(users).where(eq(users.login, "teacher")).limit(1);
    expect(teacherUser).toBeDefined();
    expect(teacherUser.role).toBe("teacher");
    expect(await verifyPassword("teacher123", teacherUser.password_hash)).toBe(true);

    const [teacherGroup] = await db
      .select()
      .from(groups)
      .where(eq(groups.teacher_id, teacherUser.id))
      .limit(1);
    expect(teacherGroup).toBeDefined();

    const testLogin = `test_student_${Date.now()}`;
    const testPassHash = await hashPassword("pass1234");
    const [createdStudent] = await db
      .insert(users)
      .values({
        login: testLogin,
        password_hash: testPassHash,
        full_name: "Test O'quvchi",
        role: "student",
        created_at: Date.now(),
      })
      .returning();

    await db.insert(group_members).values({
      group_id: teacherGroup.id,
      student_id: createdStudent.id,
    });

    expect(await verifyPassword("pass1234", createdStudent.password_hash)).toBe(true);

    const publishedQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.status, "published"));
    expect(publishedQuestions.length).toBeGreaterThanOrEqual(40);

    const examQuestions = publishedQuestions.slice(0, 20);
    const examQIds = examQuestions.map((q) => q.id);
    const examAnswers = await db
      .select()
      .from(answers)
      .where(inArray(answers.question_id, examQIds));

    const clientQuestion = sanitizeQuestionForClientExam({
      ...examQuestions[0],
      answers: examAnswers.filter((a) => a.question_id === examQuestions[0].id),
    });
    expect("is_correct" in clientQuestion.answers[0]).toBe(false);

    const startedAt = Date.now();
    const [attempt] = await db
      .insert(exam_attempts)
      .values({
        student_id: createdStudent.id,
        mode: "exam",
        question_ids_json: JSON.stringify(examQIds),
        started_at: startedAt,
        correct: 0,
        wrong: 0,
        passed: false,
      })
      .returning();

    const recordedAnswers = [];
    for (let i = 0; i < examQuestions.length; i++) {
      const q = examQuestions[i];
      const qAns = examAnswers.filter((a) => a.question_id === q.id);
      const chosen = i === 0 ? qAns.find((a) => !a.is_correct)! : qAns.find((a) => a.is_correct)!;

      await db.insert(attempt_answers).values({
        attempt_id: attempt.id,
        question_id: q.id,
        answer_id: chosen.id,
        is_correct: chosen.is_correct,
      });

      recordedAnswers.push({
        questionId: q.id,
        answerId: chosen.id,
        isCorrect: chosen.is_correct,
      });
    }

    const evalState = evaluateExamState({
      totalQuestions: 20,
      maxWrong: 2,
      durationMinutes: 25,
      startedAtMs: startedAt,
      nowMs: startedAt + 8 * 60 * 1000,
      answers: recordedAnswers,
    });

    expect(evalState.finished).toBe(true);
    expect(evalState.passed).toBe(true);
    expect(evalState.correct).toBe(19);
    expect(evalState.wrong).toBe(1);

    await db
      .update(exam_attempts)
      .set({
        finished_at: startedAt + 8 * 60 * 1000,
        correct: evalState.correct,
        wrong: evalState.wrong,
        passed: evalState.passed,
      })
      .where(eq(exam_attempts.id, attempt.id));

    const studentTopicStats = await db
      .select({
        topicId: topics.id,
        topicNameUz: topics.name_uz,
        topicNameRu: topics.name_ru,
        isCorrect: attempt_answers.is_correct,
      })
      .from(attempt_answers)
      .innerJoin(exam_attempts, eq(attempt_answers.attempt_id, exam_attempts.id))
      .innerJoin(questions, eq(attempt_answers.question_id, questions.id))
      .innerJoin(topics, eq(questions.topic_id, topics.id))
      .where(eq(exam_attempts.student_id, createdStudent.id));

    const weakTopics = calculateWeakTopics(studentTopicStats);
    expect(weakTopics.length).toBeGreaterThan(0);
    expect(weakTopics[0].wrong).toBe(1);
    expect(weakTopics[0].errorRate).toBeGreaterThan(0);

    await db.delete(users).where(eq(users.id, createdStudent.id));
  });

  it("Item 1: rejects exam answers for questions not in question_ids_json or when mode !== 'exam'", async () => {
    const [student] = await db.select().from(users).where(eq(users.login, "student1")).limit(1);
    await setSessionForUser(student.id);

    const allQuestions = await db.select().from(questions).limit(5);
    const allowedQ = allQuestions[0];
    const outsideQ = allQuestions[1];
    const outsideAnswers = await db
      .select()
      .from(answers)
      .where(eq(answers.question_id, outsideQ.id));

    const [examAttempt] = await db
      .insert(exam_attempts)
      .values({
        student_id: student.id,
        mode: "exam",
        question_ids_json: JSON.stringify([allowedQ.id]),
        started_at: Date.now(),
      })
      .returning();

    // Submit answer for outsideQ (not in question_ids_json) -> 400
    const resOutside = await examAnswerPOST(
      new NextRequest("http://localhost:3000/api/student/exam/answer", {
        method: "POST",
        body: JSON.stringify({
          attemptId: examAttempt.id,
          questionId: outsideQ.id,
          answerId: outsideAnswers[0].id,
        }),
      })
    );
    expect(resOutside.status).toBe(400);

    // Create a non-exam (ticket) attempt and try calling exam/answer -> 400
    const [ticketAttempt] = await db
      .insert(exam_attempts)
      .values({
        student_id: student.id,
        mode: "ticket",
        question_ids_json: JSON.stringify([allowedQ.id]),
        started_at: Date.now(),
      })
      .returning();

    const resWrongMode = await examAnswerPOST(
      new NextRequest("http://localhost:3000/api/student/exam/answer", {
        method: "POST",
        body: JSON.stringify({
          attemptId: ticketAttempt.id,
          questionId: allowedQ.id,
          answerId: outsideAnswers[0].id,
        }),
      })
    );
    expect(resWrongMode.status).toBe(400);

    await db.delete(exam_attempts).where(eq(exam_attempts.id, examAttempt.id));
    await db.delete(exam_attempts).where(eq(exam_attempts.id, ticketAttempt.id));
  });

  it("Item 2: prevents exam answer leak, cross-user writes, unpublished questionIds, and out-of-set answers in practice route", async () => {
    const [student1] = await db.select().from(users).where(eq(users.login, "student1")).limit(1);
    const [student2] = await db.select().from(users).where(eq(users.login, "student2")).limit(1);

    const allQuestions = await db.select().from(questions).limit(3);
    const q1 = allQuestions[0];
    const q2 = allQuestions[1];
    const q1Answers = await db.select().from(answers).where(eq(answers.question_id, q1.id));
    const q2Answers = await db.select().from(answers).where(eq(answers.question_id, q2.id));

    // 1. student1 has an exam-mode attempt; trying to submit to it via /api/student/practice must return 400
    const [examAttempt] = await db
      .insert(exam_attempts)
      .values({
        student_id: student1.id,
        mode: "exam",
        question_ids_json: JSON.stringify([q1.id]),
        started_at: Date.now() - 60 * 60 * 1000,
      })
      .returning();

    await setSessionForUser(student1.id);
    const leakRes = await practicePOST(
      new NextRequest("http://localhost:3000/api/student/practice", {
        method: "POST",
        body: JSON.stringify({
          attemptId: examAttempt.id,
          mode: "ticket",
          questionId: q1.id,
          answerId: q1Answers[0].id,
        }),
      })
    );
    expect(leakRes.status).toBe(400);

    // 2. Cross-user write: student2 tries to write to student1's practice attempt -> 403
    const [s1PracticeAttempt] = await db
      .insert(exam_attempts)
      .values({
        student_id: student1.id,
        mode: "ticket",
        question_ids_json: JSON.stringify([q1.id]),
        started_at: Date.now(),
      })
      .returning();

    await setSessionForUser(student2.id);
    const crossUserRes = await practicePOST(
      new NextRequest("http://localhost:3000/api/student/practice", {
        method: "POST",
        body: JSON.stringify({
          attemptId: s1PracticeAttempt.id,
          mode: "ticket",
          questionId: q1.id,
          answerId: q1Answers[0].id,
        }),
      })
    );
    expect(crossUserRes.status).toBe(403);

    // 3. Out-of-set questionId on practice attempt -> 400
    await setSessionForUser(student1.id);
    const outOfSetRes = await practicePOST(
      new NextRequest("http://localhost:3000/api/student/practice", {
        method: "POST",
        body: JSON.stringify({
          attemptId: s1PracticeAttempt.id,
          mode: "ticket",
          questionId: q2.id,
          answerId: q2Answers[0].id,
        }),
      })
    );
    expect(outOfSetRes.status).toBe(400);

    // 4. Draft question filtered out when creating new practice attempt
    const [draftQ] = await db
      .insert(questions)
      .values({
        topic_id: q1.topic_id,
        text_uz: "Draft savol",
        text_ru: "",
        status: "draft",
      })
      .returning();

    const newPracticeRes = await practicePOST(
      new NextRequest("http://localhost:3000/api/student/practice", {
        method: "POST",
        body: JSON.stringify({
          mode: "topic",
          questionIds: [q1.id, draftQ.id],
          questionId: q1.id,
          answerId: q1Answers[0].id,
        }),
      })
    );
    expect(newPracticeRes.status).toBe(200);
    const newPracticeData = await newPracticeRes.json();
    const [createdPracticeAttempt] = await db
      .select()
      .from(exam_attempts)
      .where(eq(exam_attempts.id, newPracticeData.attemptId));
    expect(JSON.parse(createdPracticeAttempt.question_ids_json)).toEqual([q1.id]);

    // Cleanup
    await db.delete(questions).where(eq(questions.id, draftQ.id));
    await db.delete(exam_attempts).where(eq(exam_attempts.id, examAttempt.id));
    await db.delete(exam_attempts).where(eq(exam_attempts.id, s1PracticeAttempt.id));
    await db.delete(exam_attempts).where(eq(exam_attempts.id, createdPracticeAttempt.id));
  });

  it("Item 3: prevents a teacher from resetting password or deleting a student not in their own groups", async () => {
    const [student1] = await db.select().from(users).where(eq(users.login, "student1")).limit(1);
    const [teacher1Group] = await db.select().from(groups).limit(1);

    // Create a second teacher with no groups containing student1
    const [otherTeacher] = await db
      .insert(users)
      .values({
        login: `other_teacher_${Date.now()}`,
        password_hash: await hashPassword("teacher123"),
        full_name: "Boshqa O'qituvchi",
        role: "teacher",
        created_at: Date.now(),
      })
      .returning();

    await setSessionForUser(otherTeacher.id);

    // otherTeacher tries to PATCH reset student1's password -> 403
    const patchRes = await teacherStudentsPATCH(
      new NextRequest("http://localhost:3000/api/teacher/students", {
        method: "PATCH",
        body: JSON.stringify({ studentId: student1.id }),
      })
    );
    expect(patchRes.status).toBe(403);

    // otherTeacher tries to DELETE student1 from teacher1Group -> 403
    const deleteRes = await teacherStudentsDELETE(
      new NextRequest("http://localhost:3000/api/teacher/students", {
        method: "DELETE",
        body: JSON.stringify({
          studentId: student1.id,
          groupId: teacher1Group.id,
        }),
      })
    );
    expect(deleteRes.status).toBe(403);

    await db.delete(users).where(eq(users.id, otherTeacher.id));
  });

  it("Review 2 Item 1: blocks POST /api/student/practice with 423 while student has an unfinished non-expired exam attempt", async () => {
    const [student1] = await db.select().from(users).where(eq(users.login, "student1")).limit(1);
    const [q1] = await db.select().from(questions).limit(1);
    const q1Answers = await db.select().from(answers).where(eq(answers.question_id, q1.id));

    await setSessionForUser(student1.id);

    // Create an active, non-expired exam attempt
    const [activeExam] = await db
      .insert(exam_attempts)
      .values({
        student_id: student1.id,
        mode: "exam",
        question_ids_json: JSON.stringify([q1.id]),
        started_at: Date.now(),
      })
      .returning();

    const foundActive = await getActiveExamAttempt(student1.id);
    expect(foundActive).not.toBeNull();
    expect(foundActive?.id).toBe(activeExam.id);

    // Calling POST /api/student/practice must return 423 while exam is active
    const lockedRes = await practicePOST(
      new NextRequest("http://localhost:3000/api/student/practice", {
        method: "POST",
        body: JSON.stringify({
          mode: "ticket",
          questionIds: [q1.id],
          questionId: q1.id,
          answerId: q1Answers[0].id,
        }),
      })
    );
    expect(lockedRes.status).toBe(423);
    const lockedData = await lockedRes.json();
    expect(lockedData.error).toContain("Imtihon davom etmoqda");

    // Once the exam attempt has timed out, getActiveExamAttempt returns null
    await db
      .update(exam_attempts)
      .set({ started_at: Date.now() - 60 * 60 * 1000 })
      .where(eq(exam_attempts.id, activeExam.id));

    expect(await getActiveExamAttempt(student1.id)).toBeNull();

    // Clean up
    await db.delete(exam_attempts).where(eq(exam_attempts.id, activeExam.id));
  });
});
