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
        entry: {
          index: resolve(import.meta.dirname, "src/index.ts"),
          optimized: resolve(import.meta.dirname, "src/optimized.ts"),
          noise2d: resolve(import.meta.dirname, "src/noise2d.ts"),
        },
        name: "ReynardAlgorithms",
        fileName: (_format, entryName) => `${entryName}.${isCjsBuild ? "cjs" : "js"}`,
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
          /**
           * The ESM build is one file per source module, not one bundle.
           *
           * A consumer that imports three exported functions from a bundled
           * `dist/index.js` inherits everything the analysis cannot prove dead:
           * a bare `Math.sqrt(2) / 2;`, class fields that call the memoizers, and
           * the config-listener registration in `optimized.ts`. That was 75% of
           * the /start chunk on sly.so -- 56.4 KiB of 75.0 to ship `MarkovChain`,
           * `SimplexNoise` and `createSeededRandom`.
           *
           * With one file per module and `"sideEffects": false` in package.json,
           * the consumer's bundler can drop a module nobody imported, which is the
           * only granularity a bundled library cannot offer. Measured on sly.so:
           * 76.0 -> 35.4 KiB, 25.6 -> 12.0 KiB gzipped.
           *
           * CJS stays bundled: `preserveModules` with CJS output produces a shape
           * node's resolver is not asked to walk, and the CommonJS entry exists for
           * tooling rather than for a payload.
           */
          ...(isCjsBuild
            ? {}
            : { preserveModules: true, preserveModulesRoot: resolve(import.meta.dirname, "src") }),
        },
      },
    },
  };
});
