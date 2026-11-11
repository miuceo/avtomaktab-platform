import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const dbUrl = process.env.DATABASE_URL || "file:./data/app.db";

if (dbUrl.startsWith("file:")) {
  const filePath = dbUrl.replace(/^file:/, "");
  const dir = path.dirname(path.resolve(process.cwd(), filePath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export const client = createClient({
  url: dbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
