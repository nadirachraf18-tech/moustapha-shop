import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Test-only Vite config. Mirrors the `@` and `declarations` aliases from
 * `vite.config.js` so component tests resolve the same modules the app does,
 * without pulling in the environment plugin (which needs a real build env).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    globals: false,
    // The sandbox reports a constrained CPU count; the default fork pool then
    // derives conflicting min/max thread counts. A single fork is plenty for
    // this suite and keeps the run deterministic.
    pool: "forks",
    poolOptions: {
      forks: { minForks: 1, maxForks: 1 },
    },
  },
});
