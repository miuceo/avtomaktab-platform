import { redirect } from "next/navigation";
import { getLang } from "@/lib/auth";
import { hasAdmin } from "@/lib/setup";
import { SetupForm } from "./SetupForm";

export default async function SetupPage() {
  // Once any admin exists the setup page is no longer reachable.
  if (await hasAdmin()) {
    redirect("/login");
  }
  const lang = await getLang();

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8">
      <SetupForm lang={lang} />
    </div>
  );
}
