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
      external: ["fs", "path", "os", "node:os"],
      output: {
        globals: {
          fs: "fs",
          path: "path",
          os: "os"
        },
      },
    },
  },
});
