# Code review 1 — fix all items, then run `npm test` and `npm run build`

1. **Exam cheat** — `src/app/api/student/exam/answer/route.ts`: accept an answer only if `questionId` is in the attempt's `question_ids_json`; otherwise 400. Also reject when `attempt.mode !== "exam"`.
2. **Exam answer leak + cross-user write** — `src/app/api/student/practice/route.ts`: when `attemptId` is supplied, load it and require `student_id === user.id`, `mode !== "exam"`, and `finished_at` is null; otherwise 403/400. Do this BEFORE inserting into `attempt_answers`. When creating a new attempt, if `questionIds` is given, keep only ids that are published questions. Accept an answer only if `questionId` is in the attempt's question set (when the set is non-empty).
3. **Teacher can reset/delete ANY student** — `src/app/api/teacher/students/route.ts` PATCH and DELETE: for role `teacher`, require the student to be a member of a group whose `teacher_id === user.id` (admin bypasses). DELETE: also require the group to belong to the teacher.
4. **Teacher can view any student** — `src/app/teacher/students/[id]/page.tsx` (and `/teacher/results` if it takes ids): same ownership rule; show notFound() otherwise.
5. Add a unique index on `attempt_answers(attempt_id, question_id)` in the schema and in `src/db/migrate.ts` (`CREATE UNIQUE INDEX IF NOT EXISTS`).
6. Add vitest tests for items 1–3 (extend `src/lib/e2e-flow.test.ts` or a new test file, using the same approach that file already uses).

Do not change anything else. Do not ask questions.
