"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import { Edit2, Plus, Trash2 } from "lucide-react";

interface UserRow {
  id: number;
  login: string;
  full_name: string;
  role: "admin" | "teacher" | "student";
  created_at: number;
}

export function AdminUsersClient({
  lang,
  currentUserId,
  users,
}: {
  lang: Lang;
  currentUserId: number;
  users: UserRow[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "teacher" | "student">("student");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "user",
        payload: {
          id: editingId,
          login,
          password: password || undefined,
          full_name: fullName,
          role,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Xatolik");
      return;
    }

    setEditingId(undefined);
    setLogin("");
    setPassword("");
    setFullName("");
    router.refresh();
  }

  async function handleDelete(id: number) {
    await fetch("/api/admin/entities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: "user", id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-enter">
      <h1 className="text-2xl font-bold">{t(lang, "nav.adminUsers")}</h1>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-300 text-sm font-bold">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-bold mb-1">To&apos;liq ismi *</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">{t(lang, "auth.login")} *</label>
          <input
            type="text"
            required
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">
            {t(lang, "auth.password")} {editingId ? "(ixtiyoriy)" : "*"}
          </label>
          <input
            type="text"
            required={!editingId}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "teacher" | "student")}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
          >
            <option value="student">{t(lang, "roles.student")}</option>
            <option value="teacher">{t(lang, "roles.teacher")}</option>
            <option value="admin">{t(lang, "roles.admin")}</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-800 text-white text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            {editingId ? t(lang, "app.save") : t(lang, "app.add")}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(undefined);
                setLogin("");
                setPassword("");
                setFullName("");
              }}
              className="px-3 py-2 rounded-xl border text-xs"
            >
              {t(lang, "app.cancel")}
            </button>
          )}
        </div>
      </form>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">F.I.Sh</th>
              <th className="py-3 px-4">{t(lang, "auth.login")}</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4 text-right">{t(lang, "app.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-slate-100 dark:border-slate-800/60"
              >
                <td className="py-3 px-4 font-mono text-xs">{u.id}</td>
                <td className="py-3 px-4 font-bold">{u.full_name}</td>
                <td className="py-3 px-4 font-mono">{u.login}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {t(lang, `roles.${u.role}`)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(u.id);
                        setLogin(u.login);
                        setFullName(u.full_name);
                        setRole(u.role);
                        setPassword("");
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {u.id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
