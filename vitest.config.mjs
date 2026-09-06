import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    include: ["**/*.test.{js,jsx}"],
    exclude: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/**",
      "prisma/**",
    ],
    css: false,
  },
  resolve: {
    alias: {
      "@": import.meta.dirname,
    },
  },
});