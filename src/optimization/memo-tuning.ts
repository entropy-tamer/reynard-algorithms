/**
 * @file Memo tuning system
 *
 * Provides memoization tuning analysis and policy recommendations based on
 * performance snapshots. Used for adaptive memoization optimization.
 */

/**
 * Memo tuning snapshot for a function
 */
export interface MemoTuningSnapshot {
  functionName: string;
  hitRate: number;
  avgFnMs: number;
  avgOverheadMs: number;
  enabled: boolean;
}

/**
 * Memo tuning policy configuration
 */
export interface MemoTuningPolicy {
  name?: string; // Optional name for the policy
  minHitRate: number;
  overheadBudgetMs: number;
  minSamples: number;
  windowSize: number;
  maxSize?: number; // Optional max size
}

/**
 * Analyze memo statistics and generate policy recommendations
 *
 * @param snapshots - Array of memo performance snapshots
 * @param policy - Current memo tuning policy
 * @returns Array of recommendations for each function
 * @example
 */
export function analyzeMemoStats(
  snapshots: MemoTuningSnapshot[],
  policy: MemoTuningPolicy
): Array<{ functionName: string; recommendation: string; newPolicy?: Partial<MemoTuningPolicy> }> {
  // PAW analyzer: evaluate snapshots and adjust policies
  const results: Array<{ functionName: string; recommendation: string; newPolicy?: Partial<MemoTuningPolicy> }> = [];

  for (const snapshot of snapshots) {
    let recommendation = "no_change";
    let newPolicy: Partial<MemoTuningPolicy> | undefined;

    if (snapshot.hitRate < policy.minHitRate) {
      recommendation = "disable_or_reduce_cache";
      newPolicy = { maxSize: Math.floor(snapshot.hitRate * 1000) };
    } else if (snapshot.avgOverheadMs > policy.overheadBudgetMs) {
      recommendation = "increase_hit_threshold";
      newPolicy = { minHitRate: Math.min(0.9, snapshot.hitRate + 0.1) };
    } else if (snapshot.hitRate > 0.8 && snapshot.avgOverheadMs < policy.overheadBudgetMs * 0.5) {
      recommendation = "increase_cache_size";
      newPolicy = { maxSize: Math.min(8192, 2048 * 2) };
    }

    results.push({ functionName: snapshot.functionName, recommendation, newPolicy });
  }

  return results;
}
