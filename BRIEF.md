# Avtomaktab platform — build brief (phase 1)

Driving-school (avtomaktab) learning + exam platform for one training center with 10+ computers.
It must run on a local Windows server in the center's LAN **with no internet**, and the same code must also deploy to a free cloud (Vercel).
Build it today, complete and working. Do NOT build payments, CRM, sync, or a 3D driving simulator.

## Stack (fixed — do not change)
- Next.js (App Router, latest stable) + TypeScript, `src/` dir, npm.
- Tailwind CSS. shadcn/ui is allowed. No other UI kits.
- DB: SQLite through `@libsql/client` + Drizzle ORM. Env `DATABASE_URL` (default `file:./data/app.db`), optional `DATABASE_AUTH_TOKEN` (Turso in cloud).
- Auth: own implementation — bcryptjs password hashes, random session token stored in `sessions` table, httpOnly cookie. No NextAuth, no external providers (must work offline).
- No external fonts/CDNs at runtime (offline!). Use `next/font/local` or system font stack.
- Uploaded images: save under `public/uploads/` via one `src/lib/storage.ts` module (single place to swap to Vercel Blob later).
- Tests: vitest for pure logic.

## Roles
- `admin`: manages everything (questions, topics, tickets, chapters, road signs, videos, users, settings).
- `teacher`: creates groups, creates student accounts (login + password) in their groups, resets passwords, sees results.
- `student`: practices, takes exams, reads knowledge base.
No self-registration. Seed creates one admin: login `admin`, password from env `ADMIN_PASSWORD` (default `admin123`, print a warning to change it).

## Languages
UI and content in **Uzbek Latin (default) and Russian**. Language switcher in header, stored in cookie.
- UI strings: `messages/uz.json`, `messages/ru.json` (simple own `t()` helper; no heavy i18n lib needed).
- Content tables have `*_uz` and `*_ru` columns. If `*_ru` is empty, fall back to `*_uz`.
- Each translatable record has `ru_reviewed boolean` — admin sees a "Tarjimani tekshirish" queue to edit/approve Russian text.

## Data model (minimum)
users(id, login unique, password_hash, full_name, role, created_at) · sessions · groups(id, name, teacher_id) · group_members(group_id, student_id)
topics(id, name_uz, name_ru) · questions(id, topic_id, text_uz, text_ru, image_path, explanation_uz, explanation_ru, ru_reviewed, status: draft|published)
answers(id, question_id, text_uz, text_ru, is_correct, sort) · tickets(id, number) · ticket_questions(ticket_id, question_id, sort)
exam_attempts(id, student_id, mode: exam|ticket|topic|mistakes, ticket_id?, started_at, finished_at, correct, wrong, passed)
attempt_answers(attempt_id, question_id, answer_id, is_correct)
chapters(id, sort, title_uz, title_ru, body_uz, body_ru (markdown), topic_id?) · road_signs(id, code e.g. "2.1", group_uz/ru, name_uz/ru, description_uz/ru, image_path)
videos(id, chapter_id?, title_uz, title_ru, youtube_url) · settings(key, value) — center_name, logo_path, exam_question_count=20, exam_minutes=25, exam_max_wrong=2

## Student features
1. Dashboard: progress (tickets solved, last exam results, weakest topics).
2. **Ticket practice** (Biletlar): grid of tickets; inside: one question per screen, image on top, answers as large buttons (F1–F5 / 1–5 keyboard shortcuts), instant correct/wrong highlight + explanation, question navigator.
3. **Topic practice**: same UI, questions of one topic.
4. **Exam simulator** (GAI format): random N questions (settings), countdown timer, navigator showing answered states, NO feedback during exam; exam ends immediately as failed when wrong > max_wrong, or on timeout, or when all answered. Result screen: passed/failed, time, every question with the student's answer vs correct one.
5. **Mistakes**: practice questions the student got wrong last time until answered correctly.
6. **Knowledge base**: chapters list → chapter page (markdown, images, embedded YouTube videos with an offline notice "Video uchun internet kerak" when not loadable, "Mavzu bo'yicha test" button at bottom). Road signs catalog: grouped grid, search by code/name.

## Teacher features
Groups CRUD; add students (generate login + password, show once, printable list); reset password; group results table (each student: attempts, best/last exam, pass rate); student detail: exam history + weakest topics (error rate per topic).

## Admin features
CRUD with image upload for: topics, questions+answers (exactly one correct, 2–5 answers), tickets (auto-generate tickets of 20 from published questions, or edit manually), chapters, road signs, videos, users (any role), settings (center name, logo, exam params). Draft/publish status for questions. Translation review queue. JSON import endpoint/script: `npm run import:questions -- file.json` (format documented in `docs/import-format.md`) — the PDF import will produce this JSON later.

## Seed
`npm run db:seed`: admin user, 1 teacher (`teacher`/`teacher123`), 1 group, 2 students (`student1`,`student2` / `student123`), 8 topics, **40 realistic sample Uzbek traffic-rule questions** with Russian translations and explanations (write them yourself, based on general Uzbekistan YHQ rules; image-based ones may use simple SVG diagrams you create in `public/seed/`), 2 tickets, 5 chapters, 30 road signs (SVG drawings you create), 3 videos (placeholder YouTube URLs). Center name placeholder: "Avtomaktab".

## Design
Clean, modern, calm. Light + dark theme (toggle + system). Large readable type (base 17–18px), high contrast, big click targets — old classroom monitors at 1366×768 must fit the exam screen without scrolling. Exam screen is distraction-free (no nav, only timer, question, answers, navigator). Primary color: deep blue; success green, error red. Responsive down to phone width. Accessible: focus rings, aria labels, keyboard navigation in exam.

## Security
Route protection by role in middleware + server-side checks in every server action/route. Validate all input with zod. Never send `is_correct` to the client during exam mode (check answers server-side). Rate-limit login attempts in memory.

## Scripts / docs
`npm run dev`, `build`, `start` (binds 0.0.0.0 so LAN computers can connect), `db:migrate`, `db:seed`, `test`.
`README.md` in Uzbek: how to install on the center's Windows server (Node install, `npm ci`, migrate, seed, `npm run build`, `npm start`, find LAN IP with `ipconfig`, open `http://<IP>:3000` on student PCs, run as a service with `pm2` or NSSM), and how to deploy to Vercel + Turso.

## Definition of done
`npm run build` passes with no type errors, `npm test` passes (exam scoring: timeout, wrong-limit fail, pass), seed works, and this flow works in a browser: admin logs in → teacher creates a student → student logs in → takes exam → teacher sees result and weak topics. Language and theme switch work.
