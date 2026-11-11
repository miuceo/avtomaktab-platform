"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import {
  CheckCircle2,
  Edit2,
  Eye,
  KeyRound,
  Plus,
  Printer,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

interface StudentSummary {
  id: number;
  login: string;
  full_name: string;
  attemptsCount: number;
  examAttemptsCount: number;
  passRate: number;
  lastExam: { id: number; correct: number; wrong: number; passed: boolean } | null;
  bestExam: { id: number; correct: number; wrong: number; passed: boolean } | null;
}

interface GroupItem {
  id: number;
  name: string;
  students: StudentSummary[];
}

interface GeneratedCredential {
  full_name: string;
  login: string;
  plainPassword: string;
  groupName: string;
}

export function TeacherGroupsClient({
  lang,
  groups,
}: {
  lang: Lang;
  groups: GroupItem[];
}) {
  const router = useRouter();
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [studentNameByGroup, setStudentNameByGroup] = useState<Record<number, string>>({});
  const [credentialsList, setCredentialsList] = useState<GeneratedCredential[]>([]);
  const [latestCredential, setLatestCredential] = useState<GeneratedCredential | null>(null);

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    await fetch("/api/teacher/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName.trim() }),
    });
    setNewGroupName("");
    router.refresh();
  }

  async function handleUpdateGroup(id: number) {
    if (!editingGroupName.trim()) return;
    await fetch("/api/teacher/groups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editingGroupName.trim() }),
    });
    setEditingGroupId(null);
    router.refresh();
  }

  async function handleDeleteGroup(id: number) {
    await fetch("/api/teacher/groups", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  async function handleAddStudent(group: GroupItem, e: React.FormEvent) {
    e.preventDefault();
    const fullName = (studentNameByGroup[group.id] || "").trim();
    if (!fullName) return;

    const res = await fetch("/api/teacher/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: group.id, fullName }),
    });
    const data = await res.json();
    if (res.ok && data.student) {
      const cred: GeneratedCredential = {
        full_name: data.student.full_name,
        login: data.student.login,
        plainPassword: data.student.plainPassword,
        groupName: group.name,
      };
      setLatestCredential(cred);
      setCredentialsList((prev) => [cred, ...prev]);
      setStudentNameByGroup((prev) => ({ ...prev, [group.id]: "" }));
      router.refresh();
    }
  }

  async function handleResetPassword(student: StudentSummary, groupName: string) {
    const res = await fetch("/api/teacher/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id }),
    });
    const data = await res.json();
    if (res.ok && data.plainPassword) {
      const cred: GeneratedCredential = {
        full_name: student.full_name,
        login: student.login,
        plainPassword: data.plainPassword,
        groupName,
      };
      setLatestCredential(cred);
      setCredentialsList((prev) => [cred, ...prev]);
    }
  }

  async function handleRemoveStudent(groupId: number, studentId: number) {
    await fetch("/api/teacher/students", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, studentId }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-enter">
      {/* Top Bar: Create Group */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-800 dark:text-blue-400" />
            {t(lang, "teacher.myGroups")}
          </h1>
        </div>

        <form onSubmit={handleCreateGroup} className="flex items-center gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder={t(lang, "teacher.groupName")}
            required
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-sm font-bold shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t(lang, "teacher.createGroup")}
          </button>
        </form>
      </div>

      {/* One-time generated credentials alert + Printable List */}
      {credentialsList.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-700 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-amber-900 dark:text-amber-200 text-lg">
                {t(lang, "teacher.generatedCredentials")}
              </h2>
              {latestCredential && (
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">
                  Oxirgi yaratilgan: {latestCredential.full_name} — Login:{" "}
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border">
                    {latestCredential.login}
                  </span>{" "}
                  | Parol:{" "}
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border">
                    {latestCredential.plainPassword}
                  </span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:opacity-90"
            >
              <Printer className="w-4 h-4" />
              {t(lang, "teacher.printableList")} ({t(lang, "app.print")})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-amber-300 dark:border-amber-800">
                  <th className="py-2 px-3">Guruh</th>
                  <th className="py-2 px-3">{t(lang, "teacher.studentName")}</th>
                  <th className="py-2 px-3">{t(lang, "auth.login")}</th>
                  <th className="py-2 px-3">{t(lang, "auth.password")}</th>
                </tr>
              </thead>
              <tbody>
                {credentialsList.map((c, idx) => (
                  <tr key={idx} className="border-b border-amber-200/60 dark:border-amber-900/50">
                    <td className="py-2 px-3 font-medium">{c.groupName}</td>
                    <td className="py-2 px-3 font-bold">{c.full_name}</td>
                    <td className="py-2 px-3 font-mono font-bold">{c.login}</td>
                    <td className="py-2 px-3 font-mono font-bold">{c.plainPassword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Groups List */}
      <div className="space-y-6 no-print">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              {editingGroupId === group.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingGroupName}
                    onChange={(e) => setEditingGroupName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateGroup(group.id)}
                    className="px-3 py-1.5 rounded-lg bg-blue-800 text-white text-xs font-bold"
                  >
                    {t(lang, "app.save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingGroupId(null)}
                    className="px-3 py-1.5 rounded-lg border text-xs"
                  >
                    {t(lang, "app.cancel")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {group.name}
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {group.students.length} o&apos;quvchi
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGroupId(group.id);
                      setEditingGroupName(group.name);
                    }}
                    aria-label="Edit group"
                    className="p-1.5 text-slate-400 hover:text-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(group.id)}
                    aria-label="Delete group"
                    className="p-1.5 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Add Student Form */}
              <form
                onSubmit={(e) => handleAddStudent(group, e)}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  type="text"
                  required
                  value={studentNameByGroup[group.id] || ""}
                  onChange={(e) =>
                    setStudentNameByGroup((prev) => ({
                      ...prev,
                      [group.id]: e.target.value,
                    }))
                  }
                  placeholder={t(lang, "teacher.studentName")}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold"
                >
                  <UserPlus className="w-4 h-4" />
                  {t(lang, "teacher.addStudent")}
                </button>
              </form>
            </div>

            {/* Group Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-3">{t(lang, "teacher.studentName")}</th>
                    <th className="py-2.5 px-3">{t(lang, "auth.login")}</th>
                    <th className="py-2.5 px-3">{t(lang, "teacher.attemptsCount")}</th>
                    <th className="py-2.5 px-3">{t(lang, "teacher.bestExam")}</th>
                    <th className="py-2.5 px-3">{t(lang, "student.lastExam")}</th>
                    <th className="py-2.5 px-3">{t(lang, "student.passRate")}</th>
                    <th className="py-2.5 px-3 text-right">{t(lang, "app.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {group.students.map((st) => (
                    <tr
                      key={st.id}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        <Link
                          href={`/teacher/students/${st.id}`}
                          className="hover:text-blue-700 hover:underline"
                        >
                          {st.full_name}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs">{st.login}</td>
                      <td className="py-3 px-3">{st.attemptsCount}</td>
                      <td className="py-3 px-3">
                        {st.bestExam ? (
                          <span className="font-semibold text-emerald-600">
                            +{st.bestExam.correct} / -{st.bestExam.wrong}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {st.lastExam ? (
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              st.lastExam.passed ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {st.lastExam.passed ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            +{st.lastExam.correct} / -{st.lastExam.wrong}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold">{st.passRate}%</td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/teacher/students/${st.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold hover:bg-blue-100"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Natija
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleResetPassword(st, group.name)}
                            title={t(lang, "teacher.resetPassword")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Parol
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(group.id, st.id)}
                            title={t(lang, "app.delete")}
                            className="p-1.5 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
