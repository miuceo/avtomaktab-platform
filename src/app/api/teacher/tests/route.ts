import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { deleteTest, saveTest, TestInputSchema } from "@/lib/test-service";

function errorStatus(error: string): number {
  if (error === "forbidden") return 403;
  if (error === "notFound") return 404;
  return 400;
}

/** Create or update a test (admin: any test, teacher: only own tests). */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = TestInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  const result = await saveTest(user, parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: errorStatus(result.error) });
  }
  return NextResponse.json({ ok: true, id: result.id });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ id: z.number().int().positive() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalidInput" }, { status: 400 });
  }

  const result = await deleteTest(user, parsed.data.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: errorStatus(result.error) });
  }
  return NextResponse.json({ ok: true });
}
