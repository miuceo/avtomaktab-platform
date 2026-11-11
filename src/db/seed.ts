import { db } from "./index";
import {
  users,
  groups,
  group_members,
  topics,
  questions,
  answers,
  tickets,
  ticket_questions,
  chapters,
  road_signs,
  videos,
  settings,
  exam_attempts,
  attempt_answers,
} from "./schema";
import { runMigrations } from "./migrate";
import { generateSeedAssets } from "./seed-assets";
import {
  SEED_TOPICS,
  SEED_ROAD_SIGNS,
  SEED_QUESTIONS,
  SEED_CHAPTERS,
  SEED_VIDEOS,
} from "./seed-data";
import bcrypt from "bcryptjs";

export async function runSeed() {
  console.log("Running database migrations...");
  await runMigrations();

  console.log("Generating SVG seed assets in public/seed/...");
  await generateSeedAssets();

  const adminPass = process.env.ADMIN_PASSWORD || "admin123";
  if (!process.env.ADMIN_PASSWORD || adminPass === "admin123") {
    console.warn(
      "⚠️  DIQQAT / WARNING: Standart ADMIN_PASSWORD ('admin123') ishlatilmoqda! Ishga tushirishdan oldin ADMIN_PASSWORD muhit o'zgaruvchisini yoki admin parolini o'zgartiring!"
    );
  }

  // Clear existing data so seed is idempotent
  await db.delete(attempt_answers);
  await db.delete(exam_attempts);
  await db.delete(ticket_questions);
  await db.delete(tickets);
  await db.delete(answers);
  await db.delete(questions);
  await db.delete(videos);
  await db.delete(chapters);
  await db.delete(road_signs);
  await db.delete(topics);
  await db.delete(group_members);
  await db.delete(groups);
  await db.delete(users);
  await db.delete(settings);

  const now = Date.now();
  const adminHash = await bcrypt.hash(adminPass, 10);
  const teacherHash = await bcrypt.hash("teacher123", 10);
  const studentHash = await bcrypt.hash("student123", 10);

  // 1. Users
  const [, teacherRes, student1Res, student2Res] = await Promise.all([
    db
      .insert(users)
      .values({
        login: "admin",
        password_hash: adminHash,
        full_name: "Tizim Administratori",
        role: "admin",
        created_at: now,
      })
      .returning(),
    db
      .insert(users)
      .values({
        login: "teacher",
        password_hash: teacherHash,
        full_name: "Karimov Rustam (O'qituvchi)",
        role: "teacher",
        created_at: now,
      })
      .returning(),
    db
      .insert(users)
      .values({
        login: "student1",
        password_hash: studentHash,
        full_name: "Aliyev Jasur",
        role: "student",
        created_at: now,
      })
      .returning(),
    db
      .insert(users)
      .values({
        login: "student2",
        password_hash: studentHash,
        full_name: "Usmonova Dilnoza",
        role: "student",
        created_at: now,
      })
      .returning(),
  ]);

  const teacherId = teacherRes[0].id;
  const student1Id = student1Res[0].id;
  const student2Id = student2Res[0].id;

  // 2. Group & group members
  const groupRes = await db
    .insert(groups)
    .values({
      name: "BC-101 guruh",
      teacher_id: teacherId,
      created_at: now,
    })
    .returning();

  const groupId = groupRes[0].id;
  await db.insert(group_members).values([
    { group_id: groupId, student_id: student1Id },
    { group_id: groupId, student_id: student2Id },
  ]);

  // 3. 8 Topics
  const insertedTopics = await db.insert(topics).values(SEED_TOPICS).returning();

  // 4. 40 Questions & Answers
  const insertedQuestionIds: number[] = [];
  for (const q of SEED_QUESTIONS) {
    const topicId = insertedTopics[q.topicIndex]?.id || insertedTopics[0].id;
    const qRes = await db
      .insert(questions)
      .values({
        topic_id: topicId,
        text_uz: q.text_uz,
        text_ru: q.text_ru,
        image_path: q.image_path,
        explanation_uz: q.explanation_uz,
        explanation_ru: q.explanation_ru,
        ru_reviewed: q.ru_reviewed,
        status: "published",
      })
      .returning();

    const questionId = qRes[0].id;
    insertedQuestionIds.push(questionId);

    await db.insert(answers).values(
      q.answers.map((a, idx) => ({
        question_id: questionId,
        text_uz: a.text_uz,
        text_ru: a.text_ru,
        is_correct: a.is_correct,
        sort: idx + 1,
      }))
    );
  }

  // 5. 2 Tickets (20 questions each)
  for (let tNum = 1; tNum <= 2; tNum++) {
    const tRes = await db.insert(tickets).values({ number: tNum }).returning();
    const ticketId = tRes[0].id;
    const slice = insertedQuestionIds.slice((tNum - 1) * 20, tNum * 20);
    await db.insert(ticket_questions).values(
      slice.map((qId, idx) => ({
        ticket_id: ticketId,
        question_id: qId,
        sort: idx + 1,
      }))
    );
  }

  // 6. 5 Chapters
  const insertedChapters = [];
  for (const ch of SEED_CHAPTERS) {
    const topicId = insertedTopics[ch.topicIndex]?.id ?? null;
    const chRes = await db
      .insert(chapters)
      .values({
        sort: ch.sort,
        title_uz: ch.title_uz,
        title_ru: ch.title_ru,
        body_uz: ch.body_uz,
        body_ru: ch.body_ru,
        topic_id: topicId,
        ru_reviewed: ch.ru_reviewed,
      })
      .returning();
    insertedChapters.push(chRes[0]);
  }

  // 7. 30 Road signs
  await db.insert(road_signs).values(
    SEED_ROAD_SIGNS.map((s) => ({
      code: s.code,
      group_uz: s.group_uz,
      group_ru: s.group_ru,
      name_uz: s.name_uz,
      name_ru: s.name_ru,
      description_uz: s.description_uz,
      description_ru: s.description_ru,
      image_path: `/seed/signs/${s.code}.svg`,
      ru_reviewed: s.ru_reviewed,
    }))
  );

  // 8. 3 Videos
  for (const v of SEED_VIDEOS) {
    const matchingChapter = insertedChapters.find((c) => c.sort === v.chapterSort);
    await db.insert(videos).values({
      chapter_id: matchingChapter?.id ?? null,
      title_uz: v.title_uz,
      title_ru: v.title_ru,
      youtube_url: v.youtube_url,
      ru_reviewed: v.ru_reviewed,
    });
  }

  // 9. Settings
  await db.insert(settings).values([
    { key: "center_name", value: "Avtomaktab" },
    { key: "logo_path", value: "/seed/logo.svg" },
    { key: "exam_question_count", value: "20" },
    { key: "exam_minutes", value: "25" },
    { key: "exam_max_wrong", value: "2" },
  ]);

  console.log(
    `✅ Seed completed: 1 admin, 1 teacher, 1 group, 2 students, ${insertedTopics.length} topics, ${insertedQuestionIds.length} questions, 2 tickets, ${insertedChapters.length} chapters, ${SEED_ROAD_SIGNS.length} road signs, ${SEED_VIDEOS.length} videos.`
  );
}

if (require.main === module || process.argv[1]?.endsWith("seed.ts")) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}
