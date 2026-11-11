import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { ExamRunnerClient } from "./ExamRunnerClient";

export default async function StudentExamRunPage() {
  const [, lang] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
  ]);

  return <ExamRunnerClient lang={lang} />;
}
