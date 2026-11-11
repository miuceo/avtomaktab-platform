import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { db } from "@/db";
import { users, groups, group_members } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const CreateStudentSchema = z.object({
  groupId: z.number().int().positive(),
  fullName: z.string().min(2).max(120),
  customLogin: z.string().optional(),
  customPassword: z.string().optional(),
});

const ResetPasswordSchema = z.object({
  studentId: z.number().int().positive(),
  newPassword: z.string().optional(),
});

const DeleteStudentSchema = z.object({
  studentId: z.number().int().positive(),
  groupId: z.number().int().positive(),
});

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10) || "student";
}

function generateReadablePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri" }, { status: 400 });
  }

  const { groupId, fullName, customLogin, customPassword } = parsed.data;

  // Verify group ownership
  const groupRows = await db
    .select()
    .from(groups)
    .where(
      user.role === "admin"
        ? eq(groups.id, groupId)
        : and(eq(groups.id, groupId), eq(groups.teacher_id, user.id))
    )
    .limit(1);

  if (groupRows.length === 0) {
    return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });
  }

  let login = customLogin?.trim() || "";
  if (!login) {
    const base = slugifyName(fullName);
    const suffix = Math.floor(100 + Math.random() * 900);
    login = `${base}${suffix}`;
  }

  // Ensure login is unique
  const existing = await db.select().from(users).where(eq(users.login, login)).limit(1);
  if (existing.length > 0) {
    login = `${login}${Math.floor(10 + Math.random() * 89)}`;
  }

  const plainPassword = customPassword?.trim() || generateReadablePassword();
  const passwordHash = await hashPassword(plainPassword);

  const inserted = await db
    .insert(users)
    .values({
      login,
      password_hash: passwordHash,
      full_name: fullName.trim(),
      role: "student",
      created_at: Date.now(),
    })
    .returning();

  const student = inserted[0];

  await db.insert(group_members).values({
    group_id: groupId,
    student_id: student.id,
  });

  return NextResponse.json({
    ok: true,
    student: {
      id: student.id,
      full_name: student.full_name,
      login: student.login,
      plainPassword,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri" }, { status: 400 });
  }

  if (user.role === "teacher") {
    const ownedMembership = await db
      .select({ studentId: group_members.student_id })
      .from(group_members)
      .innerJoin(groups, eq(group_members.group_id, groups.id))
      .where(
        and(
          eq(group_members.student_id, parsed.data.studentId),
          eq(groups.teacher_id, user.id)
        )
      )
      .limit(1);

    if (ownedMembership.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const targetStudent = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, parsed.data.studentId), eq(users.role, "student")))
    .limit(1);

  if (targetStudent.length === 0) {
    return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
  }

  const plainPassword = parsed.data.newPassword?.trim() || generateReadablePassword();
  const passwordHash = await hashPassword(plainPassword);

  await db
    .update(users)
    .set({ password_hash: passwordHash })
    .where(and(eq(users.id, parsed.data.studentId), eq(users.role, "student")));

  return NextResponse.json({
    ok: true,
    plainPassword,
  });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = DeleteStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ma'lumot noto'g'ri" }, { status: 400 });
  }

  if (user.role === "teacher") {
    const ownedGroupMember = await db
      .select({ groupId: groups.id })
      .from(groups)
      .innerJoin(group_members, eq(groups.id, group_members.group_id))
      .where(
        and(
          eq(groups.id, parsed.data.groupId),
          eq(groups.teacher_id, user.id),
          eq(group_members.student_id, parsed.data.studentId)
        )
      )
      .limit(1);

    if (ownedGroupMember.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await db
    .delete(group_members)
    .where(
      and(
        eq(group_members.group_id, parsed.data.groupId),
        eq(group_members.student_id, parsed.data.studentId)
      )
    );

  return NextResponse.json({ ok: true });
}
