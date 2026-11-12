# Architectural & Implementation Decisions (`DECISIONS.md`)

1. **Database & Migration Strategy (`@libsql/client` + Drizzle ORM):**
   - Configured `@libsql/client` in `src/db/index.ts` to default to `file:./data/app.db` (automatically creating `./data/` when using local file SQLite) while seamlessly supporting remote `libsql://` URLs with `DATABASE_AUTH_TOKEN` for Turso cloud deployments.
   - Added an idempotent programmatic SQL migration runner in `src/db/migrate.ts` (`CREATE TABLE IF NOT EXISTS ...`) so `npm run db:migrate` works reliably on offline Windows servers without requiring external CLI compilation steps.

2. **Server-Side Exam Integrity & Early Termination:**
   - Added `question_ids_json` and `topic_id` columns to `exam_attempts` so the exact randomized question set of an exam is persisted on the server when the exam starts.
   - Created a pure, unit-tested exam evaluation engine (`src/lib/exam-logic.ts`) used by the server route (`/api/student/exam/answer`).
   - Stripped `is_correct` and explanations from exam questions sent to the client (`sanitizeQuestionForClientExam`). During an active exam (`mode = "exam"`), the server validates every submitted answer, never returns `is_correct` while in progress, and immediately marks the attempt as finished and failed (`passed = false`) as soon as `wrong > exam_max_wrong` (default 2, i.e. on the 3rd mistake) or when the countdown timer expires.

3. **Mistakes Queue ("Xatolar ustida ishlash"):**
   - A question is included in a student's Mistakes queue if the student's **most recent** `attempt_answers` entry for that question has `is_correct = false`. Once the student answers that question correctly in Mistakes (or any practice) mode, a new `attempt_answers` row with `is_correct = true` becomes the latest record, automatically clearing it from the Mistakes queue.

4. **Bilingual Content & Translation Review Queue ("Tarjimani tekshirish"):**
   - Added `ru_reviewed` boolean columns across translatable content tables (`questions`, `topics`, `chapters`, `road_signs`, `videos`).
   - Built a unified `localizedText(lang, uz, ru)` helper in `src/lib/i18n.ts` that falls back to Uzbek (`*_uz`) whenever Russian (`*_ru`) is empty.
   - Seeded a few records with `ru_reviewed = false` so the Admin Translation Review Queue (`/admin/translations`) immediately showcases items ready to edit and approve.

5. **Offline-First Operation & YouTube Embeds:**
   - Used a pure system font stack in `src/app/globals.css` with zero external font or CDN requests so the app loads instantaneously on an air-gapped LAN.
   - Generated 30 self-contained SVG road signs (`public/seed/signs/*.svg`), 4 traffic intersection SVG diagrams (`public/seed/diagrams/*.svg`), and a center logo (`public/seed/logo.svg`) during `npm run db:seed`.
   - Built `src/components/YouTubeEmbed.tsx` to detect offline/unreachable YouTube status via `navigator.onLine` and a lightweight image probe, displaying the explicit Uzbek offline notice `"Video uchun internet kerak"` when internet is unavailable.

6. **Classroom Monitor (1366×768) Ergonomics & Keyboard Shortcuts:**
   - Hid the global navigation header on `/student/exam/run` for a distraction-free GAI exam layout that fits within a 1366×768 viewport without vertical scrolling.
   - Implemented `1`–`5`, `F1`–`F5`, and `ArrowLeft`/`ArrowRight` keyboard shortcuts in both the GAI exam runner and practice runner.

7. **Clean Install & First Admin Setup Guard (`/setup`):**
   - Deleted all mock seed data, files, and the `db:seed` script. Added `npm run setup` (`tsx src/db/migrate.ts`) for clean idempotent migration.
   - Configured root layout and setup routes so that when no administrator exists in the database, every page redirects to `/setup`.
   - Implemented a race-condition-safe atomic SQL insert (`WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin')`) in `src/lib/setup.ts`. Once an admin exists, `/setup` redirects to `/login` and `/api/setup` returns 404. Last admin deletion/demotion is strictly prevented.

8. **Fixed 3-Hour Absolute Session Lifetime:**
   - Set session duration to exactly 3 hours absolute from login (`SESSION_DURATION_MS = 3 * 60 * 60 * 1000`). Session expiry is never refreshed or extended by user activity.
   - Cookie max-age is set to expire at the exact same moment. Upon expiration, users are redirected to `/login`.
   - Test and exam answers are persisted per question server-side, enabling students to re-login within the 3-hour window and continue unfinished attempts.

9. **Role-Based Group Management & Bulk Student Generation:**
   - Built `/admin/groups` so only administrators can create, rename, or delete groups and assign exactly one teacher to each group. Teachers only view and manage their assigned groups with server-side ownership checks.
   - Implemented bulk student creation from pasted full name lists (up to 100 names per batch) with transliterated surname+name lowercase Latin logins and collision-handling numeric suffixes. Passwords are generated as 8-character strings excluding ambiguous characters (`0, O, o, 1, l, I`).
   - Provided a printable credentials table with `@media print` styling, along with one-time single student password reset dialogs.

10. **Test Engine Architecture (Live & Open Tests):**
    - Created dedicated database tables (`tests`, `test_questions`, `test_assignments`, `test_attempts`, `test_attempt_answers`).
    - Built a pure, unit-tested test evaluation engine (`src/lib/test-logic.ts`) where server time is the single source of truth:
      - **Live Tests (Umumiy test):** Teacher/admin sets `started_at = now` and `ends_at = now + duration`. Late students receive only remaining time (`deadline = ends_at`). Answers after `ends_at` are rejected and attempts auto-finalized. Students who never start before `ends_at` are classified as **Kelmadi** (score 0). Practice/knowledge pages are blocked during active live tests.
      - **Open Tests (Ixtiyoriy test):** Available indefinitely with unlimited attempts, each timed from its own start time.
      - Server stores both randomized question order and randomized answer option orders per student attempt. Full question review with explanations is presented upon completion.
