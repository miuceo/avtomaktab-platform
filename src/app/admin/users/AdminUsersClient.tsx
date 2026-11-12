"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import { Edit2, KeyRound, Plus, Trash2, X } from "lucide-react";
import { PrintButton } from "@/components/PrintButton";

interface UserRow {
  id: number;
  login: string;
  full_name: string;
  role: "admin" | "teacher" | "student";
  created_at: number;
}

type Role = UserRow["role"];

interface Issued {
  fullName: string;
  login: string;
  password: string;
}

const inputClass =
  "w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm";

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
  // Create form
  const [surname, setSurname] = useState("");
  const [name, setName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [role, setRole] = useState<Role>("teacher");
  // Edit form
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editPassword, setEditPassword] = useState("");

  const [issued, setIssued] = useState<Issued | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(payload: Record<string, unknown>) {
    setError(null);
    const res = await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: "user", payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || t(lang, "users.error"));
      return null;
    }
    return data as { login?: string; password?: string };
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const fullName = [surname, name, patronymic].map((p) => p.trim()).filter(Boolean).join(" ");
    const data = await send({ full_name: fullName, role });
    if (!data?.login || !data.password) return;
    setIssued({ fullName, login: data.login, password: data.password });
    setSurname("");
    setName("");
    setPatronymic("");
    router.refresh();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const data = await send({
      id: editing.id,
      login: editing.login,
      full_name: editing.full_name,
      role: editing.role,
      password: editPassword || undefined,
    });
    if (!data) return;
    setEditing(null);
    setEditPassword("");
    router.refresh();
  }

  async function handleResetPassword(u: UserRow) {
    if (!confirm(t(lang, "users.resetConfirm").replace("{name}", u.full_name))) return;
    const data = await send({ id: u.id, full_name: u.full_name, role: u.role, resetPassword: true });
    if (data?.password) setIssued({ fullName: u.full_name, login: u.login, password: data.password });
  }

  async function handleDelete(u: UserRow) {
    if (!confirm(t(lang, "users.deleteConfirm").replace("{name}", u.full_name))) return;
    await fetch("/api/admin/entities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: "user", id: u.id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-enter">
      <div>
        <h1 className="text-2xl font-bold">{t(lang, "nav.adminUsers")}</h1>
        <p className="text-sm text-slate-500">{t(lang, "users.hint")}</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-300 text-sm font-bold">
          {error}
        </div>
      )}

      {issued && (
        <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-emerald-800 dark:text-emerald-300">{t(lang, "users.issuedTitle")}</h2>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">{t(lang, "users.issuedWarning")}</p>
            </div>
            <div className="flex items-center gap-2 no-print">
              <PrintButton label={t(lang, "users.print")} />
              <button type="button" onClick={() => setIssued(null)} aria-label={t(lang, "app.cancel")} className="p-1.5 text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-slate-500">{t(lang, "users.fullName")}</dt>
            <dd className="font-bold">{issued.fullName}</dd>
            <dt className="text-slate-500">{t(lang, "auth.login")}</dt>
            <dd className="font-mono font-bold text-lg">{issued.login}</dd>
            <dt className="text-slate-500">{t(lang, "auth.password")}</dt>
            <dd className="font-mono font-bold text-lg">{issued.password}</dd>
          </dl>
        </div>
      )}

      {editing ? (
        <form
          onSubmit={handleEdit}
          className="no-print bg-white dark:bg-slate-900 rounded-2xl border border-blue-400 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-bold mb-1">{t(lang, "users.fullName")} *</label>
            <input
              required
              value={editing.full_name}
              onChange={(e) => setEditing({ ...editing, full_name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">{t(lang, "auth.login")} *</label>
            <input
              required
              value={editing.login}
              onChange={(e) => setEditing({ ...editing, login: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">{t(lang, "users.newPassword")}</label>
            <input
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder={t(lang, "users.keepPassword")}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">{t(lang, "users.role")}</label>
            <select
              value={editing.role}
              onChange={(e) => setEditing({ ...editing, role: e.target.value as Role })}
              className={inputClass}
            >
              <option value="student">{t(lang, "roles.student")}</option>
              <option value="teacher">{t(lang, "roles.teacher")}</option>
              <option value="admin">{t(lang, "roles.admin")}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-800 text-white text-sm font-bold">
              {t(lang, "app.save")}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setEditPassword("");
              }}
              className="px-3 py-2 rounded-xl border text-xs"
            >
              {t(lang, "app.cancel")}
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleCreate}
          className="no-print bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-bold mb-1">{t(lang, "users.surname")} *</label>
            <input required value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Aliyev" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">{t(lang, "users.name")} *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jasur" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">{t(lang, "users.patronymic")}</label>
            <input value={patronymic} onChange={(e) => setPatronymic(e.target.value)} placeholder="Komilovich" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">{t(lang, "users.role")}</label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputClass}>
              <option value="teacher">{t(lang, "roles.teacher")}</option>
              <option value="admin">{t(lang, "roles.admin")}</option>
              <option value="student">{t(lang, "roles.student")}</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-800 text-white text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            {t(lang, "app.add")}
          </button>
          <p className="sm:col-span-2 lg:col-span-5 text-xs text-slate-500">{t(lang, "users.autoHint")}</p>
        </form>
      )}

      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">{t(lang, "users.fullName")}</th>
              <th className="py-3 px-4">{t(lang, "auth.login")}</th>
              <th className="py-3 px-4">{t(lang, "users.role")}</th>
              <th className="py-3 px-4 text-right">{t(lang, "app.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/60">
                <td className="py-3 px-4 font-mono text-xs">{u.id}</td>
                <td className="py-3 px-4 font-bold">{u.full_name}</td>
                <td className="py-3 px-4 font-mono">{u.login}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {t(lang, `roles.${u.role}`)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      type="button"
                      title={t(lang, "users.resetPassword")}
                      aria-label={t(lang, "users.resetPassword")}
                      onClick={() => handleResetPassword(u)}
                      className="p-1.5 text-slate-500 hover:text-amber-600"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title={t(lang, "app.edit")}
                      aria-label={t(lang, "app.edit")}
                      onClick={() => {
                        setEditing(u);
                        setEditPassword("");
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {u.id !== currentUserId && (
                      <button
                        type="button"
                        title={t(lang, "app.delete")}
                        aria-label={t(lang, "app.delete")}
                        onClick={() => handleDelete(u)}
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
