"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, t } from "@/lib/i18n";
import { Edit2, FileJson, Plus, Trash2, Upload } from "lucide-react";

interface TopicRow {
  id: number;
  name_uz: string;
  name_ru: string;
}

interface AnswerDraft {
  text_uz: string;
  text_ru: string;
  is_correct: boolean;
}

interface QuestionRow {
  id: number;
  topic_id: number;
  text_uz: string;
  text_ru: string;
  image_path: string | null;
  explanation_uz: string;
  explanation_ru: string;
  ru_reviewed: boolean;
  status: "draft" | "published";
  answers: Array<{
    id: number;
    text_uz: string;
    text_ru: string;
    is_correct: boolean;
    sort: number;
  }>;
}

export function AdminQuestionsClient({
  lang,
  topics,
  questions,
}: {
  lang: Lang;
  topics: TopicRow[];
  questions: QuestionRow[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [topicId, setTopicId] = useState<number>(topics[0]?.id || 1);
  const [textUz, setTextUz] = useState("");
  const [textRu, setTextRu] = useState("");
  const [imagePath, setImagePath] = useState<string>("");
  const [explanationUz, setExplanationUz] = useState("");
  const [explanationRu, setExplanationRu] = useState("");
  const [ruReviewed, setRuReviewed] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [answersList, setAnswersList] = useState<AnswerDraft[]>([
    { text_uz: "", text_ru: "", is_correct: true },
    { text_uz: "", text_ru: "", is_correct: false },
    { text_uz: "", text_ru: "", is_correct: false },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [showImport, setShowImport] = useState(false);

  function openCreate() {
    setEditingId(undefined);
    setTopicId(topics[0]?.id || 1);
    setTextUz("");
    setTextRu("");
    setImagePath("");
    setExplanationUz("");
    setExplanationRu("");
    setRuReviewed(false);
    setStatus("published");
    setAnswersList([
      { text_uz: "", text_ru: "", is_correct: true },
      { text_uz: "", text_ru: "", is_correct: false },
      { text_uz: "", text_ru: "", is_correct: false },
    ]);
    setError(null);
    setShowForm(true);
  }

  function openEdit(q: QuestionRow) {
    setEditingId(q.id);
    setTopicId(q.topic_id);
    setTextUz(q.text_uz);
    setTextRu(q.text_ru);
    setImagePath(q.image_path || "");
    setExplanationUz(q.explanation_uz);
    setExplanationRu(q.explanation_ru);
    setRuReviewed(q.ru_reviewed);
    setStatus(q.status);
    setAnswersList(
      q.answers.map((a) => ({
        text_uz: a.text_uz,
        text_ru: a.text_ru,
        is_correct: a.is_correct,
      }))
    );
    setError(null);
    setShowForm(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data.path) {
      setImagePath(data.path);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "question",
        payload: {
          id: editingId,
          topic_id: Number(topicId),
          text_uz: textUz,
          text_ru: textRu,
          image_path: imagePath.trim() || null,
          explanation_uz: explanationUz,
          explanation_ru: explanationRu,
          ru_reviewed: ruReviewed,
          status,
          answers: answersList,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Saqlashda xato");
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  async function handleToggleStatus(q: QuestionRow) {
    const nextStatus = q.status === "published" ? "draft" : "published";
    await fetch("/api/admin/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "question",
        action: "toggleStatus",
        payload: { id: q.id, status: nextStatus },
      }),
    });
    router.refresh();
  }

  async function handleDelete(id: number) {
    await fetch("/api/admin/entities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: "question", id }),
    });
    router.refresh();
  }

  async function handleJsonImport(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch("/api/admin/import-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import error");
        return;
      }
      setShowImport(false);
      setJsonInput("");
      router.refresh();
    } catch {
      setError("JSON formatda xatolik bor");
    }
  }

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">
          {t(lang, "nav.adminQuestions")} ({questions.length})
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImport(!showImport)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileJson className="w-4 h-4" />
            {t(lang, "admin.importQuestions")}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-800 text-white text-sm font-bold hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {t(lang, "app.add")}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 text-red-700 dark:text-red-300 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* JSON Import Modal / Box */}
      {showImport && (
        <form
          onSubmit={handleJsonImport}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
        >
          <h2 className="font-bold text-lg">{t(lang, "admin.importQuestions")}</h2>
          <textarea
            rows={6}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"questions": [{"text_uz": "...", "answers": [{"text_uz": "A", "is_correct": true}, {"text_uz": "B", "is_correct": false}]}]}'
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowImport(false)}
              className="px-4 py-2 rounded-xl border text-sm font-semibold"
            >
              {t(lang, "app.cancel")}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-800 text-white text-sm font-bold"
            >
              Yuklash
            </button>
          </div>
        </form>
      )}

      {/* Create / Edit Question Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-700 p-6 space-y-4 shadow-md"
        >
          <h2 className="text-lg font-bold">
            {editingId ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Mavzu</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {topics.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.name_uz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Holati (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option value="published">{t(lang, "admin.published")}</option>
                <option value="draft">{t(lang, "admin.draft")}</option>
              </select>
            </div>

            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruReviewed}
                  onChange={(e) => setRuReviewed(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Ruscha tarjima tekshirilgan (`ru_reviewed`)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Savol matni (O&apos;zbek lotin) *</label>
              <textarea
                required
                rows={2}
                value={textUz}
                onChange={(e) => setTextUz(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Текст вопроса (Русский)</label>
              <textarea
                rows={2}
                value={textRu}
                onChange={(e) => setTextRu(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold mb-1">Rasm manzili (ixtiyoriy)</label>
              <input
                type="text"
                value={imagePath}
                onChange={(e) => setImagePath(e.target.value)}
                placeholder="/uploads/... yoki /seed/signs/2.1.svg"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-bold cursor-pointer mt-4">
              <Upload className="w-4 h-4" />
              <span>Rasm yuklash</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Izoh (O&apos;zbek)</label>
              <textarea
                rows={2}
                value={explanationUz}
                onChange={(e) => setExplanationUz(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Пояснение (Русский)</label>
              <textarea
                rows={2}
                value={explanationRu}
                onChange={(e) => setExplanationRu(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          {/* Answers (2..5, exactly 1 correct) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">
                Javob variantlari (2–5 ta, aynan 1 ta to&apos;g&apos;ri javobni belgilang)
              </span>
              {answersList.length < 5 && (
                <button
                  type="button"
                  onClick={() =>
                    setAnswersList([
                      ...answersList,
                      { text_uz: "", text_ru: "", is_correct: false },
                    ])
                  }
                  className="text-xs font-bold text-blue-700 dark:text-blue-400"
                >
                  + Variant qo&apos;shish
                </button>
              )}
            </div>

            {answersList.map((ans, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={ans.is_correct}
                  onChange={() =>
                    setAnswersList(
                      answersList.map((a, i) => ({
                        ...a,
                        is_correct: i === idx,
                      }))
                    )
                  }
                  title="To'g'ri javob"
                  className="w-5 h-5 accent-emerald-600"
                />
                <input
                  type="text"
                  required
                  placeholder={`F${idx + 1} javob (UZ)`}
                  value={ans.text_uz}
                  onChange={(e) =>
                    setAnswersList(
                      answersList.map((a, i) =>
                        i === idx ? { ...a, text_uz: e.target.value } : a
                      )
                    )
                  }
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
                <input
                  type="text"
                  placeholder={`F${idx + 1} ответ (RU)`}
                  value={ans.text_ru}
                  onChange={(e) =>
                    setAnswersList(
                      answersList.map((a, i) =>
                        i === idx ? { ...a, text_ru: e.target.value } : a
                      )
                    )
                  }
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
                {answersList.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      const filtered = answersList.filter((_, i) => i !== idx);
                      if (!filtered.some((x) => x.is_correct)) {
                        filtered[0].is_correct = true;
                      }
                      setAnswersList(filtered);
                    }}
                    className="p-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border text-sm font-semibold"
            >
              {t(lang, "app.cancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-800 text-white text-sm font-bold"
            >
              {t(lang, "app.save")}
            </button>
          </div>
        </form>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((q) => {
          const tp = topics.find((x) => x.id === q.topic_id);
          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-slate-500">#{q.id}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                    {tp?.name_uz}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(q)}
                    className={`px-2 py-0.5 rounded font-bold ${
                      q.status === "published"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {q.status === "published" ? t(lang, "admin.published") : t(lang, "admin.draft")}
                  </button>
                  {!q.ru_reviewed && (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                      RU tekshirilmagan
                    </span>
                  )}
                </div>
                <div className="font-bold text-base">{q.text_uz}</div>
                {q.text_ru && <div className="text-xs text-slate-500">{q.text_ru}</div>}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(q)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(q.id)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
