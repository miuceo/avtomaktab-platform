import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { LANG_COOKIE_NAME, THEME_COOKIE_NAME } from "@/lib/auth";

const PrefSchema = z.object({
  lang: z.enum(["uz", "ru"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = PrefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid preferences" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  if (parsed.data.lang) {
    cookieStore.set(LANG_COOKIE_NAME, parsed.data.lang, {
      path: "/",
      sameSite: "lax",
      expires,
    });
  }

  if (parsed.data.theme) {
    cookieStore.set(THEME_COOKIE_NAME, parsed.data.theme, {
      path: "/",
      sameSite: "lax",
      expires,
    });
  }

  return NextResponse.json({ ok: true });
}
