import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import "./globals.css";
import { getCurrentUser, getLang, THEME_COOKIE_NAME } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { hasAdmin } from "@/lib/setup";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Avtomaktab — YHQ o'quv va imtihon platformasi",
  description: "Avtomaktab o'quv markazi uchun YHQ nazariy bilimlar va imtihon platformasi",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Clean install: until the first admin exists, every page except /setup goes to /setup.
  const pathname = (await headers()).get("x-pathname") || "";
  if (!pathname.startsWith("/setup") && !(await hasAdmin())) {
    redirect("/setup");
  }

  const [user, lang, settings, cookieStore] = await Promise.all([
    getCurrentUser(),
    getLang(),
    getAppSettings(),
    cookies(),
  ]);

  const rawTheme = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const initialTheme: "light" | "dark" | "system" =
    rawTheme === "dark" || rawTheme === "light" ? rawTheme : "system";

  return (
    <html
      lang={lang}
      className={initialTheme === "dark" ? "dark" : ""}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        <Header
          user={user}
          lang={lang}
          initialTheme={initialTheme}
          centerName={settings.center_name}
          logoPath={settings.logo_path}
        />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5">
          {children}
        </main>
      </body>
    </html>
  );
}
