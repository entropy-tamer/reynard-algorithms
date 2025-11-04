import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReynardAlgorithms",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      // Externalize Node.js built-ins to prevent bundling issues in browser environments
      external: ["fs", "path", "os", "node:os", "module", "node:module"],
      output: {
        globals: {
          fs: "fs",
          path: "path",
          os: "os",
          module: "module",
        },
      },
    },
  },
});
