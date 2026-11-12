import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { groups, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const CreateGroupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  teacherId: z.number().int().positive(),
});

const UpdateGroupSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(2).max(100).optional(),
  teacherId: z.number().int().positive().optional(),
});

const DeleteGroupSchema = z.object({
  id: z.number().int().positive(),
});

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

async function teacherExists(teacherId: number) {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, teacherId), eq(users.role, "teacher")))
    .limit(1);
  return rows.length > 0;
}

/** Admin only: create a group with exactly one teacher. */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }
  if (!(await teacherExists(parsed.data.teacherId))) {
    return NextResponse.json({ error: "teacherNotFound" }, { status: 400 });
  }

  const inserted = await db
    .insert(groups)
    .values({
      name: parsed.data.name,
      teacher_id: parsed.data.teacherId,
      created_at: Date.now(),
    })
    .returning();

  return NextResponse.json({ ok: true, group: inserted[0] });
}

/** Admin only: rename a group and/or assign another teacher. */
export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  const patch: { name?: string; teacher_id?: number } = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.teacherId !== undefined) {
    if (!(await teacherExists(parsed.data.teacherId))) {
      return NextResponse.json({ error: "teacherNotFound" }, { status: 400 });
    }
    patch.teacher_id = parsed.data.teacherId;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  await db.update(groups).set(patch).where(eq(groups.id, parsed.data.id));
  return NextResponse.json({ ok: true });
}

/** Admin only: delete a group (members' accounts stay, memberships are removed). */
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = DeleteGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  await db.delete(groups).where(eq(groups.id, parsed.data.id));
  return NextResponse.json({ ok: true });
}
