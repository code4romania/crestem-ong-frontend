import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Unit tests for the parts of the frontend that are plain logic — no Next
 * runtime, no rendering. `environment: "node"` is the default; a file that
 * needs a DOM opts in with a `// @vitest-environment jsdom` docblock.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["{app,components,lib}/**/*.test.ts"],
  },
});
