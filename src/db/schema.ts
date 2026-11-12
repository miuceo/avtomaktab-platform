import { sqliteTable, text, integer, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  login: text("login").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  full_name: text("full_name").notNull(),
  role: text("role", { enum: ["admin", "teacher", "student"] }).notNull(),
  created_at: integer("created_at").notNull(), // unix ms
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expires_at: integer("expires_at").notNull(), // unix ms
  created_at: integer("created_at").notNull(),
});

export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  teacher_id: integer("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: integer("created_at").notNull(),
});

export const group_members = sqliteTable(
  "group_members",
  {
    group_id: integer("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    student_id: integer("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joined_at: integer("joined_at").notNull().default(0), // unix ms
  },
  (table) => ({
    pk: primaryKey({ columns: [table.group_id, table.student_id] }),
  })
);

export const topics = sqliteTable("topics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name_uz: text("name_uz").notNull(),
  name_ru: text("name_ru").notNull().default(""),
  ru_reviewed: integer("ru_reviewed", { mode: "boolean" }).notNull().default(false),
});

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  topic_id: integer("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  text_uz: text("text_uz").notNull(),
  text_ru: text("text_ru").notNull().default(""),
  image_path: text("image_path"),
  explanation_uz: text("explanation_uz").notNull().default(""),
  explanation_ru: text("explanation_ru").notNull().default(""),
  ru_reviewed: integer("ru_reviewed", { mode: "boolean" }).notNull().default(false),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("published"),
});

export const answers = sqliteTable("answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question_id: integer("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  text_uz: text("text_uz").notNull(),
  text_ru: text("text_ru").notNull().default(""),
  is_correct: integer("is_correct", { mode: "boolean" }).notNull().default(false),
  sort: integer("sort").notNull().default(1),
});

export const tickets = sqliteTable("tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: integer("number").notNull().unique(),
});

export const ticket_questions = sqliteTable(
  "ticket_questions",
  {
    ticket_id: integer("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    question_id: integer("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    sort: integer("sort").notNull().default(1),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.ticket_id, table.question_id] }),
  })
);

export const exam_attempts = sqliteTable("exam_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  student_id: integer("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mode: text("mode", { enum: ["exam", "ticket", "topic", "mistakes"] }).notNull(),
  ticket_id: integer("ticket_id").references(() => tickets.id, { onDelete: "set null" }),
  topic_id: integer("topic_id").references(() => topics.id, { onDelete: "set null" }),
  question_ids_json: text("question_ids_json").notNull().default("[]"),
  started_at: integer("started_at").notNull(),
  finished_at: integer("finished_at"),
  correct: integer("correct").notNull().default(0),
  wrong: integer("wrong").notNull().default(0),
  passed: integer("passed", { mode: "boolean" }).notNull().default(false),
});

export const attempt_answers = sqliteTable(
  "attempt_answers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    attempt_id: integer("attempt_id")
      .notNull()
      .references(() => exam_attempts.id, { onDelete: "cascade" }),
    question_id: integer("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    answer_id: integer("answer_id")
      .notNull()
      .references(() => answers.id, { onDelete: "cascade" }),
    is_correct: integer("is_correct", { mode: "boolean" }).notNull(),
  },
  (table) => ({
    attemptQuestionUnique: uniqueIndex("attempt_answers_attempt_id_question_id_unique").on(
      table.attempt_id,
      table.question_id
    ),
  })
);

export const chapters = sqliteTable("chapters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sort: integer("sort").notNull().default(1),
  title_uz: text("title_uz").notNull(),
  title_ru: text("title_ru").notNull().default(""),
  body_uz: text("body_uz").notNull(),
  body_ru: text("body_ru").notNull().default(""),
  topic_id: integer("topic_id").references(() => topics.id, { onDelete: "set null" }),
  ru_reviewed: integer("ru_reviewed", { mode: "boolean" }).notNull().default(false),
});

export const road_signs = sqliteTable("road_signs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  group_uz: text("group_uz").notNull(),
  group_ru: text("group_ru").notNull().default(""),
  name_uz: text("name_uz").notNull(),
  name_ru: text("name_ru").notNull().default(""),
  description_uz: text("description_uz").notNull().default(""),
  description_ru: text("description_ru").notNull().default(""),
  image_path: text("image_path").notNull(),
  ru_reviewed: integer("ru_reviewed", { mode: "boolean" }).notNull().default(false),
});

export const videos = sqliteTable("videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chapter_id: integer("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
  title_uz: text("title_uz").notNull(),
  title_ru: text("title_ru").notNull().default(""),
  youtube_url: text("youtube_url").notNull(),
  ru_reviewed: integer("ru_reviewed", { mode: "boolean" }).notNull().default(false),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ---------------------------------------------------------------------------
// Tests (separate from tickets / practice / GAI exam simulator)
// ---------------------------------------------------------------------------

export const tests = sqliteTable("tests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  duration_minutes: integer("duration_minutes").notNull(),
  created_by: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: integer("created_at").notNull(),
});

export const test_questions = sqliteTable(
  "test_questions",
  {
    test_id: integer("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "cascade" }),
    question_id: integer("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    sort: integer("sort").notNull().default(1),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.test_id, table.question_id] }),
  })
);

export const test_assignments = sqliteTable("test_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  test_id: integer("test_id")
    .notNull()
    .references(() => tests.id, { onDelete: "cascade" }),
  group_id: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["live", "open"] }).notNull(),
  started_at: integer("started_at"), // live only
  ends_at: integer("ends_at"), // live only
  closed_at: integer("closed_at"), // open only: set when the teacher closes it
  created_by: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: integer("created_at").notNull(),
});

export const test_attempts = sqliteTable(
  "test_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    assignment_id: integer("assignment_id")
      .notNull()
      .references(() => test_assignments.id, { onDelete: "cascade" }),
    student_id: integer("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    attempt_no: integer("attempt_no").notNull().default(1),
    question_order_json: text("question_order_json").notNull().default("[]"),
    answer_order_json: text("answer_order_json").notNull().default("{}"),
    started_at: integer("started_at").notNull(),
    deadline_at: integer("deadline_at").notNull(),
    finished_at: integer("finished_at"),
    correct: integer("correct").notNull().default(0),
    total: integer("total").notNull().default(0),
  },
  (table) => ({
    attemptNoUnique: uniqueIndex("test_attempts_assignment_student_no_unique").on(
      table.assignment_id,
      table.student_id,
      table.attempt_no
    ),
  })
);

export const test_attempt_answers = sqliteTable(
  "test_attempt_answers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    attempt_id: integer("attempt_id")
      .notNull()
      .references(() => test_attempts.id, { onDelete: "cascade" }),
    question_id: integer("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    answer_id: integer("answer_id")
      .notNull()
      .references(() => answers.id, { onDelete: "cascade" }),
    is_correct: integer("is_correct", { mode: "boolean" }).notNull(),
  },
  (table) => ({
    attemptQuestionUnique: uniqueIndex("test_attempt_answers_attempt_question_unique").on(
      table.attempt_id,
      table.question_id
    ),
  })
);
