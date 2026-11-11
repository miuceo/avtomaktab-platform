import React from "react";
import { notFound } from "next/navigation";
import { requireRole, getLang } from "@/lib/auth";
import { getActiveExamAttempt } from "@/lib/active-exam";
import { ActiveExamNotice } from "@/components/ActiveExamNotice";
import { t } from "@/lib/i18n";
import { db } from "@/db";
import { tickets, ticket_questions, questions, answers } from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { PracticeRunner } from "@/components/PracticeRunner";

export default async function StudentTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, lang, resolvedParams] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
    params,
  ]);

  const activeExam = await getActiveExamAttempt(user.id);
  if (activeExam) {
    return <ActiveExamNotice lang={lang} />;
  }

  const ticketId = Number(resolvedParams.id);
  if (!ticketId) notFound();

  const ticketRows = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .limit(1);

  if (ticketRows.length === 0) notFound();
  const ticket = ticketRows[0];

  const tqRows = await db
    .select()
    .from(ticket_questions)
    .where(eq(ticket_questions.ticket_id, ticketId))
    .orderBy(asc(ticket_questions.sort));

  const qIds = tqRows.map((r) => r.question_id);
  const questionRows =
    qIds.length > 0
      ? await db.select().from(questions).where(inArray(questions.id, qIds))
      : [];

  const answerRows =
    qIds.length > 0
      ? await db.select().from(answers).where(inArray(answers.question_id, qIds))
      : [];

  const orderedQuestions = tqRows
    .map((tq) => {
      const q = questionRows.find((row) => row.id === tq.question_id);
      if (!q) return null;
      const qAnswers = answerRows
        .filter((a) => a.question_id === q.id)
        .sort((a, b) => a.sort - b.sort);
      return {
        ...q,
        answers: qAnswers,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <PracticeRunner
      lang={lang}
      mode="ticket"
      title={t(lang, "student.ticketNum", { num: ticket.number })}
      backHref="/student/tickets"
      ticketId={ticket.id}
      questions={orderedQuestions}
    />
  );
}
