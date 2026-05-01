import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/shared/tests/**/*.test.ts"],
    exclude: ["e2e/**", "**/node_modules/**", "**/dist/**", "**/.next/**"]
  }
});
