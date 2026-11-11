import React from "react";
import { requireRole, getLang } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { asc } from "drizzle-orm";
import { AdminUsersClient } from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const [currentUser, lang] = await Promise.all([
    requireRole(["admin"]),
    getLang(),
  ]);

  const allUsers = await db
    .select({
      id: users.id,
      login: users.login,
      full_name: users.full_name,
      role: users.role,
      created_at: users.created_at,
    })
    .from(users)
    .orderBy(asc(users.id));

  return (
    <AdminUsersClient
      lang={lang}
      currentUserId={currentUser.id}
      users={allUsers}
    />
  );
}
