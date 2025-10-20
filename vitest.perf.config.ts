import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Include only performance and benchmark tests
    include: [
      "**/*performance*.test.ts",
      "**/*benchmark*.test.ts",
      "**/readme-benchmarks.test.ts",
      "**/paw-optimization-benchmark.test.ts",
      "**/paw-debug.test.ts",
    ],
    // Exclude everything else
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
    ],
    // Environment for tests
    environment: "happy-dom",
    // Longer timeout for performance tests
    testTimeout: 30000,
    // Hook timeout
    hookTimeout: 10000,
  },
});
