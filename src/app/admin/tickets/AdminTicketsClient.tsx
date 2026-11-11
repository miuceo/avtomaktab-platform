"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import { Edit2, Plus, Sparkles, Trash2 } from "lucide-react";

interface TicketItem {
  id: number;
  number: number;
  questionIds: number[];
}

export function AdminTicketsClient({
  lang,
  tickets,
  publishedQuestions,
}: {
  lang: Lang;
  tickets: TicketItem[];
  publishedQuestions: Array<{ id: number; text_uz: string }>;
}) {
  const router = useRouter();
  const [showManual, setShowManual] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [ticketNumber, setTicketNumber] = useState<number>(tickets.length + 1);
  const [selectedQIds, setSelectedQIds] = useState<number[]>([]);

  async function handleAutoGenerate() {
    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "ticket",
        action: "autoGenerate",
        payload: {},
      }),
    });
    router.refresh();
  }

  async function handleSaveManual(e: React.FormEvent) {
    e.preventDefault();
    if (selectedQIds.length === 0) return;

    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "ticket",
        payload: {
          id: editingId,
          number: Number(ticketNumber),
          question_ids: selectedQIds,
        },
      }),
    });
    setShowManual(false);
    router.refresh();
  }

  async function handleDelete(id: number) {
    await fetch("/api/admin/entities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: "ticket", id }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t(lang, "nav.adminTickets")}</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoGenerate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold"
          >
            <Sparkles className="w-4 h-4" />
            {t(lang, "admin.autoGenerateTickets")}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingId(undefined);
              setTicketNumber(tickets.length + 1);
              setSelectedQIds(publishedQuestions.slice(0, 20).map((q) => q.id));
              setShowManual(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-800 text-white text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            Qo&apos;lda bilet yaratish
          </button>
        </div>
      </div>

      {showManual && (
        <form
          onSubmit={handleSaveManual}
          className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-700 p-5 space-y-4"
        >
          <div className="flex items-center gap-4">
            <label className="text-sm font-bold">Bilet raqami:</label>
            <input
              type="number"
              min={1}
              required
              value={ticketNumber}
              onChange={(e) => setTicketNumber(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
            />
            <span className="text-xs text-slate-500">
              Tanlangan savollar: {selectedQIds.length} ta
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-1.5">
            {publishedQuestions.map((q) => {
              const checked = selectedQIds.includes(q.id);
              return (
                <label
                  key={q.id}
                  className="flex items-center gap-2.5 text-xs p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQIds([...selectedQIds, q.id]);
                      } else {
                        setSelectedQIds(selectedQIds.filter((id) => id !== q.id));
                      }
                    }}
                  />
                  <span className="font-mono font-bold">#{q.id}</span>
                  <span className="truncate">{q.text_uz}</span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="px-4 py-2 rounded-xl border text-sm"
            >
              {t(lang, "app.cancel")}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-800 text-white text-sm font-bold"
            >
              {t(lang, "app.save")}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tickets.map((tk) => (
          <div
            key={tk.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between"
          >
            <div>
              <div className="text-lg font-bold">
                {t(lang, "student.ticketNum", { num: tk.number })}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {tk.questionIds.length} ta savol
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingId(tk.id);
                  setTicketNumber(tk.number);
                  setSelectedQIds(tk.questionIds);
                  setShowManual(true);
                }}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(tk.id)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
