import React from "react";
import Link from "next/link";
import { requireRole, getLang } from "@/lib/auth";
import { getActiveBlock } from "@/lib/active-exam";
import { ActiveExamNotice } from "@/components/ActiveExamNotice";
import { t } from "@/lib/i18n";
import { db } from "@/db";
import { tickets, ticket_questions, exam_attempts } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { CheckCircle2, ListChecks, XCircle } from "lucide-react";

export default async function StudentTicketsPage() {
  const [user, lang] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
  ]);

  const activeExam = await getActiveBlock(user.id);
  if (activeExam) {
    return <ActiveExamNotice lang={lang} block={activeExam} />;
  }

  const [allTickets, allTicketQuestions, userTicketAttempts] = await Promise.all([
    db.select().from(tickets).orderBy(asc(tickets.number)),
    db.select().from(ticket_questions),
    db
      .select()
      .from(exam_attempts)
      .where(and(eq(exam_attempts.student_id, user.id), eq(exam_attempts.mode, "ticket"))),
  ]);

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <ListChecks className="w-7 h-7 text-blue-800 dark:text-blue-400" />
            {t(lang, "nav.tickets")}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t(lang, "student.keyboardHint")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allTickets.map((ticket) => {
          const qCount = allTicketQuestions.filter((tq) => tq.ticket_id === ticket.id).length;
          const attemptsForTicket = userTicketAttempts.filter((a) => a.ticket_id === ticket.id);
          const passed = attemptsForTicket.some((a) => a.passed);
          const lastAttempt = attemptsForTicket[attemptsForTicket.length - 1];

          return (
            <Link
              key={ticket.id}
              href={`/student/tickets/${ticket.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-700 dark:hover:border-blue-500 transition-all flex flex-col justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {t(lang, "student.ticketNum", { num: ticket.number })}
                </span>
                {passed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : lastAttempt ? (
                  <XCircle className="w-6 h-6 text-amber-500" />
                ) : null}
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>{t(lang, "student.questionsCount", { count: qCount })}</span>
                {lastAttempt && (
                  <span className="font-semibold">
                    +{lastAttempt.correct} / -{lastAttempt.wrong}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
