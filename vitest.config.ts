import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, ".")
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["app/page.tsx", "components/**/*.tsx", "lib/**/*.ts"],
      exclude: [
        "app/layout.tsx",
        "lib/runtime/repository.ts",
        "lib/domain/types.ts",
        "lib/**/*.d.ts",
        "lib/**/index.ts",
        "tests/**",
        "e2e/**",
        "*.config.*"
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100
      }
    }
  }
});
