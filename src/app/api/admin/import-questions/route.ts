import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { importQuestionsFromJson } from "@/lib/import-questions";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = await importQuestionsFromJson(body);
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    console.error("Import questions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid JSON format" },
      { status: 400 }
    );
  }
}
