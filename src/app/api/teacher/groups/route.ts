import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { groups } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const CreateGroupSchema = z.object({
  name: z.string().min(2).max(100),
});

const UpdateGroupSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2).max(100),
});

const DeleteGroupSchema = z.object({
  id: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Guruh nomi noto'g'ri" }, { status: 400 });
  }

  const inserted = await db
    .insert(groups)
    .values({
      name: parsed.data.name.trim(),
      teacher_id: user.id,
      created_at: Date.now(),
    })
    .returning();

  return NextResponse.json({ ok: true, group: inserted[0] });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri" }, { status: 400 });
  }

  const whereClause =
    user.role === "admin"
      ? eq(groups.id, parsed.data.id)
      : and(eq(groups.id, parsed.data.id), eq(groups.teacher_id, user.id));

  await db
    .update(groups)
    .set({ name: parsed.data.name.trim() })
    .where(whereClause);

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = DeleteGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri" }, { status: 400 });
  }

  const whereClause =
    user.role === "admin"
      ? eq(groups.id, parsed.data.id)
      : and(eq(groups.id, parsed.data.id), eq(groups.teacher_id, user.id));

  await db.delete(groups).where(whereClause);
  return NextResponse.json({ ok: true });
}
