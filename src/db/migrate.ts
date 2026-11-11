import { client } from "./index";

export async function runMigrations() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS group_members (
      group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (group_id, student_id)
    );`,
    `CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_uz TEXT NOT NULL,
      name_ru TEXT NOT NULL DEFAULT '',
      ru_reviewed INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      text_uz TEXT NOT NULL,
      text_ru TEXT NOT NULL DEFAULT '',
      image_path TEXT,
      explanation_uz TEXT NOT NULL DEFAULT '',
      explanation_ru TEXT NOT NULL DEFAULT '',
      ru_reviewed INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published'
    );`,
    `CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      text_uz TEXT NOT NULL,
      text_ru TEXT NOT NULL DEFAULT '',
      is_correct INTEGER NOT NULL DEFAULT 0,
      sort INTEGER NOT NULL DEFAULT 1
    );`,
    `CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER NOT NULL UNIQUE
    );`,
    `CREATE TABLE IF NOT EXISTS ticket_questions (
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      sort INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (ticket_id, question_id)
    );`,
    `CREATE TABLE IF NOT EXISTS exam_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mode TEXT NOT NULL,
      ticket_id INTEGER REFERENCES tickets(id) ON DELETE SET NULL,
      topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
      question_ids_json TEXT NOT NULL DEFAULT '[]',
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      correct INTEGER NOT NULL DEFAULT 0,
      wrong INTEGER NOT NULL DEFAULT 0,
      passed INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS attempt_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      answer_id INTEGER NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
      is_correct INTEGER NOT NULL
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS attempt_answers_attempt_id_question_id_unique ON attempt_answers(attempt_id, question_id);`,
    `CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort INTEGER NOT NULL DEFAULT 1,
      title_uz TEXT NOT NULL,
      title_ru TEXT NOT NULL DEFAULT '',
      body_uz TEXT NOT NULL,
      body_ru TEXT NOT NULL DEFAULT '',
      topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
      ru_reviewed INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS road_signs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      group_uz TEXT NOT NULL,
      group_ru TEXT NOT NULL DEFAULT '',
      name_uz TEXT NOT NULL,
      name_ru TEXT NOT NULL DEFAULT '',
      description_uz TEXT NOT NULL DEFAULT '',
      description_ru TEXT NOT NULL DEFAULT '',
      image_path TEXT NOT NULL,
      ru_reviewed INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
      title_uz TEXT NOT NULL,
      title_ru TEXT NOT NULL DEFAULT '',
      youtube_url TEXT NOT NULL,
      ru_reviewed INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );`,
  ];

  for (const sql of statements) {
    await client.execute(sql);
  }
}

if (require.main === module || process.argv[1]?.endsWith("migrate.ts")) {
  runMigrations()
    .then(() => {
      console.log("Database migrations applied successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration error:", err);
      process.exit(1);
    });
}
