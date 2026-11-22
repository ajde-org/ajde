import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // Tests run outside React Server Components, where `server-only` would throw on import.
      "server-only": fileURLToPath(new URL("node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  // tests/live calls the real OpenAI API and runs separately via `npm run test:live`.
  test: { exclude: [...configDefaults.exclude, "tests/live/**"] },
});
