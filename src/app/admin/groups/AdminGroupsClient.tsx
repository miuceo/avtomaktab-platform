"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import {
  CheckCircle2,
  Copy,
  Edit2,
  KeyRound,
  Plus,
  Printer,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import type { StudentItem } from "@/app/teacher/TeacherGroupsClient";

interface TeacherOption {
  id: number;
  full_name: string;
  login: string;
}

interface AdminGroupItem {
  id: number;
  name: string;
  teacher_id: number;
  teacher_name: string;
  students: StudentItem[];
}

interface AdminGroupsClientProps {
  lang: Lang;
  teachers: TeacherOption[];
  groups: AdminGroupItem[];
}

interface CreatedStudentCred {
  id: number;
  full_name: string;
  login: string;
  password: string;
}

export function AdminGroupsClient({
  lang,
  teachers,
  groups,
}: AdminGroupsClientProps) {
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(
    groups[0]?.id ?? null
  );

  // Group Create/Edit Modal state
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AdminGroupItem | null>(null);
  const [groupName, setGroupName] = useState("");
  const [teacherId, setTeacherId] = useState<number>(teachers[0]?.id ?? 0);
  const [groupSaving, setGroupSaving] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);

  // Bulk add modal state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkGroupId, setBulkGroupId] = useState<number | null>(null);
  const [bulkNamesText, setBulkNamesText] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Created credentials modal state
  const [credentialsModal, setCredentialsModal] = useState<{
    groupName: string;
    students: CreatedStudentCred[];
  } | null>(null);

  // Single reset password modal state
  const [newPasswordNotice, setNewPasswordNotice] = useState<{
    studentName: string;
    plainPassword: string;
  } | null>(null);

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || groups[0] || null;

  function openCreateModal() {
    setEditingGroup(null);
    setGroupName("");
    setTeacherId(teachers[0]?.id ?? 0);
    setGroupError(null);
    setGroupModalOpen(true);
  }

  function openEditModal(g: AdminGroupItem) {
    setEditingGroup(g);
    setGroupName(g.name);
    setTeacherId(g.teacher_id);
    setGroupError(null);
    setGroupModalOpen(true);
  }

  async function handleGroupSave(e: React.FormEvent) {
    e.preventDefault();
    setGroupError(null);
    if (!groupName.trim() || !teacherId) return;
    setGroupSaving(true);

    try {
      if (editingGroup) {
        const res = await fetch("/api/admin/groups", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingGroup.id,
            name: groupName.trim(),
            teacherId,
          }),
        });
        if (!res.ok) {
          setGroupError("Guruhni saqlashda xatolik yuz berdi");
          setGroupSaving(false);
          return;
        }
      } else {
        const res = await fetch("/api/admin/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: groupName.trim(),
            teacherId,
          }),
        });
        if (!res.ok) {
          setGroupError("Guruh yaratishda xatolik yuz berdi");
          setGroupSaving(false);
          return;
        }
      }

      setGroupModalOpen(false);
      router.refresh();
    } catch {
      setGroupError("Xatolik yuz berdi");
    } finally {
      setGroupSaving(false);
    }
  }

  async function handleDeleteGroup(group: AdminGroupItem) {
    if (
      !window.confirm(
        `"${group.name}" guruhini o'chirishni tasdiqlaysizmi? (O'quvchilar hisoblari saqlanib qoladi)`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/admin/groups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: group.id }),
      });
      if (!res.ok) {
        alert("Guruhni o'chirishda xatolik");
        return;
      }
      router.refresh();
    } catch {
      alert("Xatolik yuz berdi");
    }
  }

  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkGroupId) return;
    setBulkError(null);
    setBulkLoading(true);

    try {
      const res = await fetch("/api/teacher/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: bulkGroupId, namesText: bulkNamesText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBulkError(
          data.error === "emptyList"
            ? "O'quvchilar ro'yxati bo'sh"
            : data.error === "tooMany"
              ? `Maksimal ${data.max || 100} ta o'quvchi kiritish mumkin`
              : "Ma'lumotlar noto'g'ri kiritildi"
        );
        setBulkLoading(false);
        return;
      }

      setBulkModalOpen(false);
      setBulkNamesText("");
      setCredentialsModal({
        groupName: data.groupName || activeGroup?.name || "",
        students: data.students || [],
      });
      router.refresh();
    } catch {
      setBulkError("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleResetPassword(student: StudentItem) {
    if (!window.confirm(t(lang, "groups.resetConfirm"))) return;

    try {
      const res = await fetch("/api/teacher/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Parolni yangilashda xatolik");
        return;
      }
      setNewPasswordNotice({
        studentName: student.full_name,
        plainPassword: data.plainPassword,
      });
    } catch {
      alert("Xatolik yuz berdi");
    }
  }

  async function handleRemoveStudent(groupId: number, studentId: number) {
    if (!window.confirm(t(lang, "groups.removeStudentConfirm"))) return;

    try {
      const res = await fetch("/api/teacher/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, studentId }),
      });
      if (!res.ok) {
        alert("O'quvchini chiqarishda xatolik");
        return;
      }
      router.refresh();
    } catch {
      alert("Xatolik yuz berdi");
    }
  }

  return (
    <div className="space-y-6 animate-enter">
      {/* Header & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-800 dark:text-blue-400" />
            {t(lang, "groups.title")}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Guruhlar yaratish, o&apos;qituvchi biriktirish va o&apos;quvchilarni boshqarish
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeGroup && (
            <button
              type="button"
              onClick={() => {
                setBulkGroupId(activeGroup.id);
                setBulkModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>{t(lang, "groups.bulkAddStudents")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t(lang, "groups.createGroup")}</span>
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold">Hozircha guruhlar yaratilmagan</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            O&apos;quv jarayonini tashkil etish uchun yangi guruh yarating va unga o&apos;qituvchi biriktiring.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800 text-white font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t(lang, "groups.createGroup")}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group Navigation Cards/Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {groups.map((g) => {
              const isSelected = activeGroup?.id === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGroupId(g.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2.5 border ${
                    isSelected
                      ? "bg-blue-800 text-white border-blue-800 shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{g.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isSelected
                        ? "bg-blue-700 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {g.students.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Group Details & Students */}
          {activeGroup && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeGroup.name}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                      O&apos;qituvchi: {activeGroup.teacher_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Jami {activeGroup.students.length} ta o&apos;quvchi
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(activeGroup)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t(lang, "app.edit")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteGroup(activeGroup)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-50 dark:hover:bg-red-950/60"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t(lang, "app.delete")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkGroupId(activeGroup.id);
                      setBulkModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-800 text-white font-bold text-xs hover:bg-blue-700"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t(lang, "groups.bulkAddStudents")}</span>
                  </button>
                </div>
              </div>

              {activeGroup.students.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <p className="text-sm text-slate-500">Ushbu guruhda o&apos;quvchilar yo&apos;q</p>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkGroupId(activeGroup.id);
                      setBulkModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-800 text-white text-xs font-bold"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t(lang, "groups.bulkAddStudents")}</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-800/50 text-xs">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">{t(lang, "teacher.studentName")}</th>
                        <th className="py-3 px-4">Login</th>
                        <th className="py-3 px-4">{t(lang, "teacher.attemptsCount")}</th>
                        <th className="py-3 px-4">{t(lang, "student.passRate")}</th>
                        <th className="py-3 px-4">{t(lang, "student.lastExam")}</th>
                        <th className="py-3 px-4 text-right">{t(lang, "app.actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {activeGroup.students.map((s, idx) => (
                        <tr
                          key={s.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            <Link
                              href={`/teacher/students/${s.id}`}
                              className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                            >
                              {s.full_name}
                            </Link>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                            {s.login}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {s.attemptsCount}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                            {s.examAttemptsCount > 0 ? `${s.passRate}%` : "—"}
                          </td>
                          <td className="py-3 px-4">
                            {s.lastExam ? (
                              <span
                                className={`inline-flex items-center gap-1 font-bold text-xs ${
                                  s.lastExam.passed ? "text-emerald-600" : "text-red-600"
                                }`}
                              >
                                {s.lastExam.passed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                                +{s.lastExam.correct} / -{s.lastExam.wrong}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => void handleResetPassword(s)}
                                title={t(lang, "teacher.resetPassword")}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleRemoveStudent(activeGroup.id, s.id)}
                                title={t(lang, "app.delete")}
                                className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Group Create/Edit Modal */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-enter">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingGroup ? t(lang, "groups.editGroup") : t(lang, "groups.createGroup")}
              </h2>
              <button
                type="button"
                onClick={() => setGroupModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGroupSave} className="p-4 sm:p-6 space-y-4">
              {groupError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 text-red-700 dark:text-red-300 text-xs font-semibold">
                  {groupError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t(lang, "groups.groupName")}
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Masalan: 101-guruh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t(lang, "groups.selectTeacher")}
                </label>
                {teachers.length === 0 ? (
                  <p className="text-xs text-red-500 font-medium">
                    Tizimda o&apos;qituvchilar yo&apos;q. Avval &quot;Foydalanuvchilar&quot; bo&apos;limidan o&apos;qituvchi hisobini yarating.
                  </p>
                ) : (
                  <select
                    required
                    value={teacherId}
                    onChange={(e) => setTeacherId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.login})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGroupModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t(lang, "app.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={groupSaving || teachers.length === 0 || !groupName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-50 transition-all"
                >
                  {groupSaving ? t(lang, "app.loading") : t(lang, "app.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Students Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-enter">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-800" />
                {t(lang, "groups.bulkAddStudents")}
              </h2>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-4 sm:p-6 space-y-4">
              {bulkError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 text-red-700 dark:text-red-300 text-xs font-semibold">
                  {bulkError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  F.I.Sh ro&apos;yxati (har bir qatorda bitta ism, maksimal 100 ta):
                </label>
                <textarea
                  required
                  rows={8}
                  value={bulkNamesText}
                  onChange={(e) => setBulkNamesText(e.target.value)}
                  placeholder={t(lang, "groups.bulkPlaceholder")}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t(lang, "app.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={bulkLoading || !bulkNamesText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-50 transition-all"
                >
                  {bulkLoading ? t(lang, "app.loading") : t(lang, "groups.bulkAddSubmit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Credentials Printable Modal */}
      {credentialsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-enter">
            <div className="no-print p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {credentialsModal.groupName} — {t(lang, "teacher.generatedCredentials")}
                </h2>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                  {t(lang, "groups.credentialsNotice")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t(lang, "app.print")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCredentialsModal(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 print:p-0">
              <div className="mb-4 hidden print:block text-center border-b pb-3">
                <h1 className="text-xl font-bold">{credentialsModal.groupName}</h1>
                <p className="text-xs text-slate-500">O&apos;quvchilar login va parollari ro&apos;yxati</p>
              </div>

              <table className="w-full text-sm text-left border border-slate-300 dark:border-slate-700 border-collapse print:border-black">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border-b border-slate-300 dark:border-slate-700 print:bg-slate-200 print:text-black">
                    <th className="py-2.5 px-3 w-12 text-center border-r border-slate-300">#</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">{t(lang, "teacher.studentName")}</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 font-mono">Login</th>
                    <th className="py-2.5 px-3 font-mono">Parol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-black">
                  {credentialsModal.students.map((s, idx) => (
                    <tr key={s.id} className="text-xs">
                      <td className="py-2.5 px-3 text-center text-slate-400 border-r border-slate-300 font-mono print:text-black">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white border-r border-slate-300 print:text-black">
                        {s.full_name}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900 dark:text-blue-300 border-r border-slate-300 print:text-black">
                        {s.login}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 print:bg-transparent print:text-black">
                        {s.password}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="no-print p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setCredentialsModal(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-800 text-white font-bold text-sm"
              >
                {t(lang, "app.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Reset Password Modal Notice */}
      {newPasswordNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4 animate-enter">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              {t(lang, "groups.newPasswordGenerated")}
            </h2>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-2">
              <div className="text-xs text-slate-500 font-medium">
                {newPasswordNotice.studentName}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">
                  {newPasswordNotice.plainPassword}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(newPasswordNotice.plainPassword);
                    alert("Nusxalandi!");
                  }}
                  className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              {t(lang, "groups.credentialsNotice")}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setNewPasswordNotice(null)}
                className="px-5 py-2 rounded-xl bg-blue-800 text-white font-bold text-sm"
              >
                {t(lang, "app.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}