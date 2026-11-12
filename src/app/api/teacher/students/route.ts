import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { group_members } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { MAX_BULK_STUDENTS, parseNameList } from "@/lib/credentials";
import {
  canManageStudent,
  createStudentsInGroup,
  getManagedGroup,
  resetStudentPassword,
} from "@/lib/students";

const BulkCreateSchema = z.object({
  groupId: z.number().int().positive(),
  namesText: z.string().max(20000),
});

const ResetPasswordSchema = z.object({
  studentId: z.number().int().positive(),
});

const RemoveStudentSchema = z.object({
  studentId: z.number().int().positive(),
  groupId: z.number().int().positive(),
});

/** Bulk-creates students from a pasted list of full names (one per line, max 100). */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = BulkCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  // Ownership check: a teacher can only add students to their own groups.
  const group = await getManagedGroup(user, parsed.data.groupId);
  if (!group) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const names = parseNameList(parsed.data.namesText);
  if (names.length === 0) {
    return NextResponse.json({ error: "emptyList" }, { status: 400 });
  }
  if (names.length > MAX_BULK_STUDENTS) {
    return NextResponse.json({ error: "tooMany", max: MAX_BULK_STUDENTS }, { status: 400 });
  }
  if (names.some((n) => n.length < 2 || n.length > 120)) {
    return NextResponse.json({ error: "invalidName" }, { status: 400 });
  }

  const students = await createStudentsInGroup(group.id, names);

  return NextResponse.json({
    ok: true,
    groupName: group.name,
    students: students.map((s) => ({
      id: s.id,
      full_name: s.full_name,
      login: s.login,
      password: s.password,
    })),
  });
}

/** Resets one student's password to a new random one (returned once). */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  if (!(await canManageStudent(user, parsed.data.studentId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const plainPassword = await resetStudentPassword(parsed.data.studentId);
  return NextResponse.json({ ok: true, plainPassword });
}

/** Removes a student from a group (the account itself stays). */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = RemoveStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  const group = await getManagedGroup(user, parsed.data.groupId);
  if (!group) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db
    .delete(group_members)
    .where(
      and(
        eq(group_members.group_id, group.id),
        eq(group_members.student_id, parsed.data.studentId)
      )
    );

  return NextResponse.json({ ok: true });
}
