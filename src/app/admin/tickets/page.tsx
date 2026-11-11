import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { db } from "@/db";
import { tickets, ticket_questions, questions } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { AdminTicketsClient } from "./AdminTicketsClient";

export default async function AdminTicketsPage() {
  const [, lang] = await Promise.all([requireRole(["admin"]), getLang()]);

  const [allTickets, allTq, publishedQuestions] = await Promise.all([
    db.select().from(tickets).orderBy(asc(tickets.number)),
    db.select().from(ticket_questions).orderBy(asc(ticket_questions.sort)),
    db
      .select({ id: questions.id, text_uz: questions.text_uz })
      .from(questions)
      .where(eq(questions.status, "published"))
      .orderBy(asc(questions.id)),
  ]);

  const enriched = allTickets.map((t) => ({
    ...t,
    questionIds: allTq.filter((x) => x.ticket_id === t.id).map((x) => x.question_id),
  }));

  return (
    <AdminTicketsClient
      lang={lang}
      tickets={enriched}
      publishedQuestions={publishedQuestions}
    />
  );
}
