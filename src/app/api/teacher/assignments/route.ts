import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { closeOpenAssignment, createAssignment, deleteAssignment } from "@/lib/test-service";

const CreateSchema = z.object({
  testId: z.number().int().positive(),
  groupId: z.number().int().positive(),
  kind: z.enum(["live", "open"]),
});

const IdSchema = z.object({ id: z.number().int().positive() });

function errorStatus(error: string): number {
  if (error === "forbidden") return 403;
  if (error === "testNotFound") return 404;
  return 400;
}

/** "Boshlash": start a live test (server sets started_at/ends_at) or open an open test. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  const result = await createAssignment(user, parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: errorStatus(result.error) });
  }
  return NextResponse.json({
    ok: true,
    id: result.id,
    startedAt: result.startedAt,
    endsAt: result.endsAt,
  });
}

/** Close an open test. */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = IdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  const result = await closeOpenAssignment(user, parsed.data.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: errorStatus(result.error) });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = IdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  const result = await deleteAssignment(user, parsed.data.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
