import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const isCjsBuild = mode === "cjs";
  return {
    define: isCjsBuild ? { "import.meta": "{}" } : undefined,
    build: {
      outDir: "dist",
      minify: false,
      emptyOutDir: !isCjsBuild,
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "ReynardAlgorithms",
        fileName: "index",
        formats: isCjsBuild ? ["cjs"] : ["es"],
      },
      target: "node20",
      rollupOptions: {
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
  };
});