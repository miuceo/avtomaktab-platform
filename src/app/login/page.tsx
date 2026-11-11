import { redirect } from "next/navigation";
import { getCurrentUser, getDefaultRouteForRole, getLang } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const [user, lang, settings] = await Promise.all([
    getCurrentUser(),
    getLang(),
    getAppSettings(),
  ]);

  if (user) {
    redirect(getDefaultRouteForRole(user.role));
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8">
      <LoginForm
        lang={lang}
        centerName={settings.center_name}
        logoPath={settings.logo_path}
      />
    </div>
  );
}
