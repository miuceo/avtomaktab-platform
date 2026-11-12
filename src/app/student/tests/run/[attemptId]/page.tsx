import React from "react";
import { notFound, redirect } from "next/navigation";
import { requireRole, getLang } from "@/lib/auth";
import { getOwnAttempt, loadAttemptRunData, finalizeAttempt } from "@/lib/test-service";
import { isAttemptOver } from "@/lib/test-logic";
import { TestRunnerClient } from "./TestRunnerClient";

export default async function TestRunPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const [user, lang] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
  ]);

  const { attemptId: rawId } = await params;
  const attemptId = parseInt(rawId, 10);
  if (isNaN(attemptId)) notFound();

  const own = await getOwnAttempt(user.id, attemptId);
  if (!own) notFound();

  const { attempt, test } = own;
  const nowMs = Date.now();

  if (isAttemptOver(nowMs, attempt.deadline_at, attempt.finished_at)) {
    if (attempt.finished_at == null) {
      await finalizeAttempt(attempt.id, attempt.deadline_at);
    }
    redirect(`/student/tests/result/${attempt.id}`);
  }

  const { questions, selected } = await loadAttemptRunData(attempt);

  return (
    <div className="py-2">
      <TestRunnerClient
        lang={lang}
        attemptId={attempt.id}
        title={test.title}
        questions={questions}
        initialSelected={selected}
        serverNow={nowMs}
        deadlineAt={attempt.deadline_at}
      />
    </div>
  );
}
