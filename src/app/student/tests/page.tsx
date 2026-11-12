import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { getStudentTestOverview } from "@/lib/test-service";
import { StudentTestsClient } from "./StudentTestsClient";

export default async function StudentTestsPage() {
  const [user, lang] = await Promise.all([
    requireRole(["student", "admin"]),
    getLang(),
  ]);

  const serverNow = Date.now();
  const overview = await getStudentTestOverview(user.id, serverNow);

  return (
    <StudentTestsClient
      lang={lang}
      live={overview.live}
      open={overview.open}
      history={overview.history}
      serverNow={serverNow}
    />
  );
}
