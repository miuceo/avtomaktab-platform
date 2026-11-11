import { redirect } from "next/navigation";
import { getCurrentUser, getDefaultRouteForRole } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  redirect(getDefaultRouteForRole(user.role));
}
