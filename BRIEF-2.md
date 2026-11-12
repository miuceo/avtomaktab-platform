# Brief 2 — clean install, groups, tests

Extend the existing app (read BRIEF.md, DECISIONS.md and the code first). Keep the stack, structure, styles, i18n (`messages/uz.json`, `messages/ru.json`; every new UI string in both), light/dark theme and security rules already in place. Do not ask questions; record decisions in DECISIONS.md.

## 1. Clean install — empty database
- `npm run db:seed` must create NO content: no topics, questions, answers, tickets, chapters, road signs, videos, users, groups. Delete `src/db/seed-data.ts`, `src/db/seed-assets.ts`, the generated `public/seed/` images and any other demo content. Keep `db:seed` only if it still does something useful (e.g. default settings); otherwise remove the script and update README.
- Delete the folders `content/` and `scripts/` (old generated question bank — not wanted).
- Add `npm run setup` = migrate (idempotent). README (Uzbek) must describe a fresh clone: `npm install`, `npm run setup`, `npm run build`, `npm start`, open `http://<server-LAN-IP>:3000`.

## 2. First admin
- When the `users` table has no admin, every page except `/setup` and static assets redirects to `/setup`.
- `/setup` shows a form: full name, login, password (min 8), repeat password → creates the admin, logs them in, redirects to `/admin`.
- Once any admin exists `/setup` (page and its API) returns 404/redirect to `/login`. Guard the API against races (check inside the insert, e.g. transaction or count check right before insert).

## 3. Sessions — 3 hours absolute
- Session lifetime = 3 hours from login, NOT extended by activity. Cookies expire at the same moment. After expiry the next request goes to `/login`.
- Exam/test answers are saved server-side per answer, so a student who logs in again continues the same unfinished attempt.

## 4. One login page
Keep the single `/login`; after login redirect by role (already done). Remove any remaining demo-account hints.

## 5. Groups and students
- Only the **admin** creates/renames/deletes groups and assigns exactly one teacher to a group (admin page `/admin/groups`). Teachers no longer create or delete groups; they see only their own groups.
- Admin creates teacher accounts (existing `/admin/users`).
- **Bulk students:** on a group page, admin or that group's teacher pastes a list of full names (one per line, blank lines ignored, max 100). The server creates a student for each name with an auto login (transliterated surname+name style, lowercase latin, unique — add a number if taken) and a random 8-character password (no ambiguous chars like 0/O/1/l), adds them to the group, and returns the list once. The UI shows a printable table (Name | Login | Password) with a "Chop etish" (print) button and a print-friendly CSS. Passwords are shown only at creation; later a teacher/admin can reset a single student's password (shows the new one once).
- Teacher can only manage students of their own groups (ownership check on every API).

## 6. Tests (new feature, separate from tickets/practice/GAI exam simulator — keep those as they are)
### Data
- `tests`: id, title, duration_minutes, created_by, created_at.
- `test_questions`: test_id, question_id, sort.
- `test_assignments`: id, test_id, group_id, kind (`live` | `open`), started_at (live only), ends_at (live only), created_by, created_at.
- `test_attempts` (or reuse `exam_attempts` with mode `test` + assignment_id — your choice, record it): student, assignment, question order json, answer order json, started_at, finished_at, correct, total.
- Answers saved per question, unique (attempt, question), only for questions of that attempt.

### Building a test
- Admin and teachers create tests: title, duration (minutes), questions picked manually from the question bank (filter by topic, search by text, only `published` questions). Teachers can edit/delete only their own tests; admin all.
- Teachers can also add questions to the question bank (same form as admin, published directly); topics stay admin-only.

### Live test (umumiy test)
- Teacher (of the group) or admin picks test + group, presses "Boshlash". Server sets `started_at = now`, `ends_at = now + duration`. Same end time for everybody.
- Students of that group see the active live test on their dashboard and can enter any time before `ends_at`. A late student gets only the remaining time. One attempt per student per assignment.
- Every student gets the questions AND the answer options in a different random order (stored in the attempt).
- Timer counts down to `ends_at` (server time is the truth; answers after `ends_at` are rejected; the attempt is auto-finished at `ends_at`, also when the student never pressed finish).
- On finish the student sees score (correct/total, %) and every question with their answer and the correct answer.
- While a live test is running for a student, practice/knowledge pages are blocked the same way as during the GAI exam (reuse the existing active-exam helper/notice).
- Teacher results page per assignment: every group member with status — finished (score, %), in progress, **Kelmadi** (did not start before `ends_at`, score 0). Students who join the group later are not counted.

### Open test (ixtiyoriy test)
- Teacher/admin opens a test for a group (kind `open`); it stays open until they close it.
- Students of the group take it any time, unlimited attempts, each attempt has the test's duration from its own start, random question/answer order, full review after finishing.
- Teacher sees every attempt per student and the best score.

### Student UI
- Dashboard: section "Testlar" with active live tests (with remaining time) and open tests; history of own test results.

## 7. Tests and checks
- Vitest: login generation (transliteration + uniqueness), live-test timing (late join gets remaining time, answer after ends_at rejected, absent = Kelmadi), setup guard (no second admin), session expiry 3h.
- Fresh-clone check: delete `data/app.db`, run `npm run setup`, `npm run build`, `npm test` — all green, app opens at `/setup`.

Definition of done: all of the above works end to end; `npm run build` and `npm test` pass; README and DECISIONS.md updated.
