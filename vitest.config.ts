import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Tests write fixtures; keep them out of the real app database.
    env: { DATABASE_URL: "file:./data/test.db" },
    // One shared SQLite file: run test files one after another.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
