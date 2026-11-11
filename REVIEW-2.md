# Code review 2 — fix all items, then run `npm test` and `npm run build`

1. **Looking up answers during an exam** — a student can open practice in another tab during an exam and see which answer is correct. While the student has an unfinished `exam` attempt that has not timed out (`started_at + exam_minutes` in the future), `POST /api/student/practice` must return 423 with an Uzbek/Russian message, and the student practice pages (tickets, topics, mistakes, knowledge) must show a notice "Imtihon davom etmoqda" with a link back to `/student/exam/run` instead of the content. Put the "active exam" check in one helper in `src/lib/` and reuse it. Add a vitest test.
2. **Login page leaks demo accounts** — the login placeholder shows "admin / teacher / student1". Change it to a neutral "Login" (uz) / "Логин" (ru).
3. Teacher student page shows the raw mode "EXAM"; translate attempt modes via messages (uz: Imtihon, Bilet, Mavzu, Xatolar; ru: Экзамен, Билет, Тема, Ошибки).

Do not change anything else. Do not ask questions.
