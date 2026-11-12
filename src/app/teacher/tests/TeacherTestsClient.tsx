"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lang, localizedText, t } from "@/lib/i18n";
import {
  CheckCircle2,
  Clock,
  Edit2,
  FileSpreadsheet,
  HelpCircle,
  Play,
  Plus,
  Radio,
  Search,
  StopCircle,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

interface TestItem {
  id: number;
  title: string;
  duration_minutes: number;
  created_by: number;
  created_at: number;
  creator_name: string;
  questionIds: number[];
  questionCount: number;
  canEdit: boolean;
}

interface AssignmentItem {
  id: number;
  test_id: number;
  test_title: string;
  group_id: number;
  group_name: string;
  kind: "live" | "open";
  started_at: number | null;
  ends_at: number | null;
  closed_at: number | null;
  created_at: number;
  duration_minutes: number;
}

interface GroupOption {
  id: number;
  name: string;
}

interface TopicOption {
  id: number;
  name_uz: string;
  name_ru: string;
}

interface QuestionOption {
  id: number;
  topic_id: number;
  text_uz: string;
  text_ru: string;
}

interface TeacherTestsClientProps {
  lang: Lang;
  userId: number;
  userRole: string;
  tests: TestItem[];
  assignments: AssignmentItem[];
  groups: GroupOption[];
  topics: TopicOption[];
  questions: QuestionOption[];
}

export function TeacherTestsClient({
  lang,
  userId,
  userRole,
  tests,
  assignments,
  groups,
  topics,
  questions,
}: TeacherTestsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"assignments" | "tests">("assignments");

  // Create/Edit Test Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestItem | null>(null);
  const [testTitle, setTestTitle] = useState("");
  const [testDuration, setTestDuration] = useState<number>(20);
  const [selectedQIds, setSelectedQIds] = useState<Set<number>>(new Set());
  const [qSearch, setQSearch] = useState("");
  const [qTopicFilter, setQTopicFilter] = useState<number | "all">("all");
  const [testSaving, setTestSaving] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  // Assign Test Modal (Live or Open)
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTestId, setAssignTestId] = useState<number>(tests[0]?.id ?? 0);
  const [assignGroupId, setAssignGroupId] = useState<number>(groups[0]?.id ?? 0);
  const [assignKind, setAssignKind] = useState<"live" | "open">("live");
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Teacher Add Question Modal
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [newQTopicId, setNewQTopicId] = useState<number>(topics[0]?.id ?? 0);
  const [newQTextUz, setNewQTextUz] = useState("");
  const [newQTextRu, setNewQTextRu] = useState("");
  const [newQImagePath, setNewQImagePath] = useState("");
  const [newQExplanationUz, setNewQExplanationUz] = useState("");
  const [newQExplanationRu, setNewQExplanationRu] = useState("");
  const [newQAnswers, setNewQAnswers] = useState<
    Array<{ text_uz: string; text_ru: string; is_correct: boolean }>
  >([
    { text_uz: "", text_ru: "", is_correct: true },
    { text_uz: "", text_ru: "", is_correct: false },
    { text_uz: "", text_ru: "", is_correct: false },
    { text_uz: "", text_ru: "", is_correct: false },
  ]);
  const [newQSaving, setNewQSaving] = useState(false);
  const [newQError, setNewQError] = useState<string | null>(null);

  // Filtered questions for the test picker
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (qTopicFilter !== "all" && q.topic_id !== qTopicFilter) return false;
      if (qSearch.trim()) {
        const text = `${q.text_uz} ${q.text_ru}`.toLowerCase();
        if (!text.includes(qSearch.toLowerCase())) return false;
      }
      return true;
    });
  }, [questions, qSearch, qTopicFilter]);

  function openCreateTest() {
    setEditingTest(null);
    setTestTitle("");
    setTestDuration(20);
    setSelectedQIds(new Set());
    setQSearch("");
    setQTopicFilter("all");
    setTestError(null);
    setTestModalOpen(true);
  }

  function openEditTest(t: TestItem) {
    setEditingTest(t);
    setTestTitle(t.title);
    setTestDuration(t.duration_minutes);
    setSelectedQIds(new Set(t.questionIds));
    setQSearch("");
    setQTopicFilter("all");
    setTestError(null);
    setTestModalOpen(true);
  }

  async function handleTestSave(e: React.FormEvent) {
    e.preventDefault();
    setTestError(null);
    if (!testTitle.trim() || testDuration < 1) return;
    if (selectedQIds.size === 0) {
      setTestError("Kamida 1 ta savol tanlang");
      return;
    }
    setTestSaving(true);

    try {
      const res = await fetch("/api/teacher/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTest?.id,
          title: testTitle.trim(),
          durationMinutes: Number(testDuration),
          questionIds: Array.from(selectedQIds),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestError(data.error || "Xatolik yuz berdi");
        setTestSaving(false);
        return;
      }
      setTestModalOpen(false);
      router.refresh();
    } catch {
      setTestError("Xatolik yuz berdi");
    } finally {
      setTestSaving(false);
    }
  }

  async function handleDeleteTest(t: TestItem) {
    if (!window.confirm(`"${t.title}" testini o'chirishni tasdiqlaysizmi?`)) return;

    try {
      const res = await fetch("/api/teacher/tests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: t.id }),
      });
      if (!res.ok) {
        alert("O'chirishda xatolik");
        return;
      }
      router.refresh();
    } catch {
      alert("Xatolik yuz berdi");
    }
  }

  async function handleAssignSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAssignError(null);
    if (!assignTestId || !assignGroupId) return;
    setAssignSaving(true);

    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: assignTestId,
          groupId: assignGroupId,
          kind: assignKind,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAssignError(
          data.error === "emptyTest"
            ? "Testda savollar mavjud emas"
            : "Xatolik yuz berdi"
        );
        setAssignSaving(false);
        return;
      }
      setAssignModalOpen(false);
      setActiveTab("assignments");
      router.refresh();
    } catch {
      setAssignError("Xatolik yuz berdi");
    } finally {
      setAssignSaving(false);
    }
  }

  async function handleCloseAssignment(id: number) {
    if (!window.confirm("Ushbu ochiq testni yopishni tasdiqlaysizmi?")) return;

    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        alert("Yopishda xatolik");
        return;
      }
      router.refresh();
    } catch {
      alert("Xatolik yuz berdi");
    }
  }

  async function handleDeleteAssignment(id: number) {
    if (!window.confirm("Ushbu test topshirig'ini o'chirishni tasdiqlaysizmi?")) return;

    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        alert("O'chirishda xatolik");
        return;
      }
      router.refresh();
    } catch {
      alert("Xatolik yuz berdi");
    }
  }

  async function handleAddQuestionSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNewQError(null);
    if (!newQTextUz.trim()) {
      setNewQError("Savol matnini kiriting");
      return;
    }
    const filledAnswers = newQAnswers.filter((a) => a.text_uz.trim());
    if (filledAnswers.length < 2) {
      setNewQError("Kamida 2 ta javob varianti kiritilishi shart");
      return;
    }
    const correctCount = filledAnswers.filter((a) => a.is_correct).length;
    if (correctCount !== 1) {
      setNewQError("Aynan 1 ta to'g'ri javob belgilanishi shart");
      return;
    }

    setNewQSaving(true);
    try {
      const res = await fetch("/api/teacher/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic_id: newQTopicId,
          text_uz: newQTextUz.trim(),
          text_ru: newQTextRu.trim(),
          image_path: newQImagePath.trim() || null,
          explanation_uz: newQExplanationUz.trim(),
          explanation_ru: newQExplanationRu.trim(),
          answers: filledAnswers.map((a) => ({
            text_uz: a.text_uz.trim(),
            text_ru: a.text_ru.trim(),
            is_correct: a.is_correct,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNewQError(data.error || "Savol saqlashda xatolik");
        setNewQSaving(false);
        return;
      }
      setQuestionModalOpen(false);
      setNewQTextUz("");
      setNewQTextRu("");
      setNewQImagePath("");
      setNewQExplanationUz("");
      setNewQExplanationRu("");
      router.refresh();
    } catch {
      setNewQError("Xatolik yuz berdi");
    } finally {
      setNewQSaving(false);
    }
  }

  async function handleImageUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setNewQImagePath(data.url);
      } else {
        alert("Rasm yuklashda xatolik");
      }
    } catch {
      alert("Rasm yuklashda xatolik");
    }
  }

  const now = Date.now();

  return (
    <div className="space-y-6 animate-enter">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Radio className="w-7 h-7 text-blue-800 dark:text-blue-400" />
            {t(lang, "tests.title")}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Jonli umumiy testlar, guruh topshiriqlari va savollar banki
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setQuestionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>{t(lang, "tests.addQuestion")}</span>
          </button>

          <button
            type="button"
            onClick={openCreateTest}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold text-sm hover:bg-blue-100 shadow-sm"
          >
            <Plus className="w-4 h-4 text-blue-800 dark:text-blue-300" />
            <span>{t(lang, "tests.createTest")}</span>
          </button>

          {tests.length > 0 && groups.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setAssignTestId(tests[0].id);
                setAssignGroupId(groups[0].id);
                setAssignKind("live");
                setAssignError(null);
                setAssignModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              <Play className="w-4 h-4" />
              <span>{t(lang, "tests.startLive")} / {t(lang, "tests.openTest")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("assignments")}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "assignments"
              ? "bg-blue-800 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Tayinlangan testlar ({assignments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tests")}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === "tests"
              ? "bg-blue-800 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{t(lang, "tests.myTests")} ({tests.length})</span>
        </button>
      </div>

      {/* TAB 1: Assignments */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 shadow-sm">
              <Play className="w-12 h-12 text-slate-400 mx-auto" />
              <h2 className="text-lg font-bold">{t(lang, "tests.noTests")}</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Guruh uchun jonli (umumiy) test boshlang yoki o&apos;quvchilar ixtiyoriy topshirishi uchun ochiq test yarating.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((a) => {
                const isLive = a.kind === "live";
                const isRunningLive = isLive && a.ends_at != null && a.ends_at > now;
                const isEndedLive = isLive && a.ends_at != null && a.ends_at <= now;
                const isOpenRunning = !isLive && a.closed_at == null;
                const isOpenClosed = !isLive && a.closed_at != null;

                return (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isLive
                              ? isRunningLive
                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              : isOpenRunning
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {isLive ? "Jonli test" : "Ochiq test"}
                        </span>

                        <span className="text-xs text-slate-500">
                          {isLive
                            ? isRunningLive
                              ? "Faol (Jonli)"
                              : "Yakunlangan"
                            : isOpenRunning
                              ? "Ochiq"
                              : "Yopilgan"}
                        </span>
                      </div>

                      <h2 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                        {a.test_title}
                      </h2>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Guruh: <strong className="text-slate-900 dark:text-white">{a.group_name}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Davomiyligi: {a.duration_minutes} daqiqa</span>
                        </div>
                        {isLive && a.ends_at && (
                          <div className="text-xs font-mono text-slate-500">
                            Tugash vaqti: {new Date(a.ends_at).toLocaleTimeString(lang === "ru" ? "ru-RU" : "uz-UZ")}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <Link
                        href={`/teacher/assignments/${a.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 font-bold text-xs hover:bg-blue-200 transition-all"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>{t(lang, "tests.results")}</span>
                      </Link>

                      <div className="flex items-center gap-1">
                        {isOpenRunning && (
                          <button
                            type="button"
                            onClick={() => void handleCloseAssignment(a.id)}
                            title={t(lang, "tests.closeTest")}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs"
                          >
                            <StopCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleDeleteAssignment(a.id)}
                          title={t(lang, "app.delete")}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Tests Bank */}
      {activeTab === "tests" && (
        <div className="space-y-4">
          {tests.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 shadow-sm">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
              <h2 className="text-lg font-bold">Hozircha testlar yaratilmagan</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Savollar bankidan savollarni tanlab yangi test shablonini yarating.
              </p>
              <button
                type="button"
                onClick={openCreateTest}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800 text-white font-bold text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{t(lang, "tests.createTest")}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                        {t.questionCount} ta savol
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {t.duration_minutes} daqiqa
                      </span>
                    </div>

                    <h2 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {t.title}
                    </h2>

                    <div className="text-xs text-slate-500">
                      Muallif: {t.creator_name}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {groups.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setAssignTestId(t.id);
                          setAssignGroupId(groups[0].id);
                          setAssignKind("live");
                          setAssignError(null);
                          setAssignModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Tayinlash</span>
                      </button>
                    )}

                    {t.canEdit && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => openEditTest(t)}
                          title="Tahrirlash"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteTest(t)}
                          title="O'chirish"
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE/EDIT TEST MODAL */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-enter">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingTest ? t(lang, "tests.editTest") : t(lang, "tests.createTest")}
              </h2>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTestSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {testError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 text-red-700 dark:text-red-300 text-xs font-semibold">
                  {testError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    {t(lang, "tests.testTitle")}
                  </label>
                  <input
                    type="text"
                    required
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder="Masalan: 1-oraliq nazorat testi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    {t(lang, "tests.duration")}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={300}
                    value={testDuration}
                    onChange={(e) => setTestDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm"
                  />
                </div>
              </div>

              {/* Questions Picker Header */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Savollarni tanlash ({selectedQIds.size} ta tanlandi)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Set(selectedQIds);
                        for (const q of filteredQuestions) next.add(q.id);
                        setSelectedQIds(next);
                      }}
                      className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      Barchasini tanlash
                    </button>
                    <span className="text-slate-400">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Set(selectedQIds);
                        for (const q of filteredQuestions) next.delete(q.id);
                        setSelectedQIds(next);
                      }}
                      className="text-xs font-semibold text-slate-500 hover:underline"
                    >
                      Tozalash
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={qSearch}
                      onChange={(e) => setQSearch(e.target.value)}
                      placeholder={t(lang, "app.search")}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <select
                    value={qTopicFilter}
                    onChange={(e) =>
                      setQTopicFilter(e.target.value === "all" ? "all" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="all">Barcha mavzular</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {localizedText(lang, t.name_uz, t.name_ru)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Questions Checklist */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                  {filteredQuestions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Savollar topilmadi
                    </div>
                  ) : (
                    filteredQuestions.map((q) => {
                      const isChecked = selectedQIds.has(q.id);
                      return (
                        <label
                          key={q.id}
                          className={`flex items-start gap-3 p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                            isChecked ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const next = new Set(selectedQIds);
                              if (e.target.checked) next.add(q.id);
                              else next.delete(q.id);
                              setSelectedQIds(next);
                            }}
                            className="mt-0.5 rounded text-blue-800"
                          />
                          <div className="flex-1">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              #{q.id}: {localizedText(lang, q.text_uz, q.text_ru)}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100"
                >
                  {t(lang, "app.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={testSaving || selectedQIds.size === 0 || !testTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-50 transition-all"
                >
                  {testSaving ? t(lang, "app.loading") : t(lang, "app.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TEST MODAL (Start Live or Open Test) */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-enter">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-800" />
                Testni guruhga tayinlash
              </h2>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-4 sm:p-6 space-y-4">
              {assignError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 text-red-700 dark:text-red-300 text-xs font-semibold">
                  {assignError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Testni tanlang:
                </label>
                <select
                  required
                  value={assignTestId}
                  onChange={(e) => setAssignTestId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm"
                >
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.questionCount} ta savol, {t.duration_minutes} daq.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Guruhni tanlang:
                </label>
                <select
                  required
                  value={assignGroupId}
                  onChange={(e) => setAssignGroupId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Test turi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignKind("live")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      assignKind === "live"
                        ? "border-blue-800 bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-100 font-bold"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold">Jonli test (Umumiy)</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      Barcha uchun bir xil vaqtda boshlanadi va tugaydi
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignKind("open")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      assignKind === "open"
                        ? "border-blue-800 bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-100 font-bold"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold">Ochiq test (Ixtiyoriy)</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      O&apos;quvchilar xohlagan paytda qayta topshirishi mumkin
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100"
                >
                  {t(lang, "app.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={assignSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>
                    {assignSaving
                      ? t(lang, "app.loading")
                      : assignKind === "live"
                        ? "Boshlash"
                        : "Ochish"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER ADD QUESTION MODAL */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-enter">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                {t(lang, "tests.addQuestion")}
              </h2>
              <button
                type="button"
                onClick={() => setQuestionModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestionSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {newQError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 text-red-700 dark:text-red-300 text-xs font-semibold">
                  {newQError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Mavzuni tanlang:
                </label>
                <select
                  required
                  value={newQTopicId}
                  onChange={(e) => setNewQTopicId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {localizedText(lang, t.name_uz, t.name_ru)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Savol matni (O&apos;zbekcha):
                </label>
                <textarea
                  required
                  rows={2}
                  value={newQTextUz}
                  onChange={(e) => setNewQTextUz(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Savol matni (Ruscha - ixtiyoriy):
                </label>
                <textarea
                  rows={2}
                  value={newQTextRu}
                  onChange={(e) => setNewQTextRu(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Rasm (ixtiyoriy):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newQImagePath}
                    onChange={(e) => setNewQImagePath(e.target.value)}
                    placeholder="/uploads/..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer hover:bg-slate-200 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Fayl tanlash</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleImageUpload(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Javob variantlari (To&apos;g&apos;ri javobni tanlang):
                </label>
                {newQAnswers.map((ans, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <input
                      type="radio"
                      name="correct-answer"
                      checked={ans.is_correct}
                      onChange={() => {
                        setNewQAnswers((prev) =>
                          prev.map((a, i) => ({ ...a, is_correct: i === idx }))
                        );
                      }}
                      className="text-blue-800"
                    />
                    <input
                      type="text"
                      placeholder={`Variant #${idx + 1} (O'zbekcha)`}
                      value={ans.text_uz}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewQAnswers((prev) =>
                          prev.map((a, i) => (i === idx ? { ...a, text_uz: val } : a))
                        );
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                    <input
                      type="text"
                      placeholder={`(Ruscha)`}
                      value={ans.text_ru}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewQAnswers((prev) =>
                          prev.map((a, i) => (i === idx ? { ...a, text_ru: val } : a))
                        );
                      }}
                      className="w-1/3 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100"
                >
                  {t(lang, "app.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={newQSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-50 transition-all"
                >
                  {newQSaving ? t(lang, "app.loading") : t(lang, "app.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
