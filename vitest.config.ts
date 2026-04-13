import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    pool: "forks",
    maxConcurrency: 2,
    // Exclude performance and benchmark tests by default
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
      "**/*performance*.test.ts",
      "**/*benchmark*.test.ts",
      "**/readme-benchmarks.test.ts",
      "**/paw-optimization-benchmark.test.ts",
      "**/paw-debug.test.ts",
      // Exclude the heaviest tests that consume too much memory
      "**/spatial-structures/rtree.test.ts",
      "**/geometry/algorithms/delaunay.test.ts",
      "**/data-structures/bloom-filter.test.ts",
      "**/data-structures/interval-tree.test.ts",
      "**/data-structures/lru-cache*.test.ts",
      "**/optimization/adapters/optimized-collision-adapter-extended.test.ts",
      // Exclude tests that hang or OOM the worker (run separately: vitest run priority-queue.test.ts)
      "**/data-structures/priority-queue.test.ts",
      "**/data-structures/fenwick-tree.test.ts",
    ],
    // Environment for tests
    environment: "happy-dom",
    // Test timeout (increased for complex data structure tests)
    testTimeout: 10000,
    // Hook timeout
    hookTimeout: 5000,
  },
});
