/** Simple memoization test */
import { adaptiveMemo } from "../memo/adaptive-memo";
import { memoRegistry } from "../memo-registry";

/**
 *
 * @example
 */
function testMemoization() {
  console.log("=== SIMPLE MEMOIZATION TEST ===\n");

  // Create a simple memoized function
  const testFn = adaptiveMemo(
    (x: number, y: number) => x + y,
    { name: "testFunction", maxSize: 100, minHitRate: 0.5 },
    (x: number, y: number) => `${x}|${y}`
  );

  // Call it a few times
  for (let i = 0; i < 10; i++) {
    testFn(i, i * 2);
  }

  // Check registry
  console.log("Registered functions:", memoRegistry.listEntries());

  // Get stats
  const stats = memoRegistry.getStats("testFunction");
  if (stats) {
    console.log("Test function stats:", stats);
  } else {
    console.log("No stats found for testFunction");
  }

  // Get all stats
  const allStats = memoRegistry.getAllStats();
  console.log("All stats:", Object.keys(allStats));
}

// Only run when explicitly executed
if (typeof process !== "undefined" && process.env.RUN_MEMO_BENCH === "1") {
  testMemoization();
}
