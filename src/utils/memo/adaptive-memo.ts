/**
 * Adaptive Memoization Controller
 *
 * Provides a hybrid memoization wrapper with runtime tuning based on
 * observed hit rate and overhead. Falls back to pass-through if memo
 * benefit is not realized over sliding windows.
 */

import { LRUCache } from "../../data-structures/basic/lru-cache";

export interface MemoTuningPolicy {
  name?: string; // Optional name for the policy
  minHitRate: number; // e.g., 0.6
  overheadBudgetMs: number; // allowed avg overhead per call
  minSamples: number; // samples before making decisions
  windowSize: number; // sliding window length
  maxSize: number; // LRU size
  ttlMs: number; // TTL for entries
  enabled: boolean;
}

export interface AdaptiveStats {
  calls: number;
  hits: number;
  misses: number;
  hitRate: number;
  avgFnMs: number;
  avgOverheadMs: number;
  enabled: boolean;
}

const DEFAULT_POLICY: MemoTuningPolicy = {
  minHitRate: 0.7,
  overheadBudgetMs: 0.02,
  minSamples: 200,
  windowSize: 500,
  maxSize: 1024,
  ttlMs: 0,
  enabled: true,
};

/**
 * Memoization controller that tunes itself from sliding-window hit rate and overhead.
 *
 * When caching shows no benefit after enough samples, it switches to pass-through until
 * re-enabled externally.
 */
export class AdaptiveMemoController<TArgs extends any[], TResult> {
  private cache: LRUCache<string, TResult>;
  private policy: MemoTuningPolicy;
  private keygen: (...args: TArgs) => string;
  private enabled: boolean;

  // telemetry
  private winCalls = 0;
  private winHits = 0;
  private winMisses = 0;
  private winExecMs = 0;
  private winOverheadMs = 0;

  /**
   * Creates a controller with the merged tuning policy, a key generator, and a backing LRU cache.
   *
   * `ALG_MEMO_ON=0` forces pass-through mode regardless of the policy's `enabled` flag. The
   * default key generator is `JSON.stringify` over the argument list.
   *
   * @param policy Partial tuning overrides.
   * @param keygen Function producing a cache key from call arguments.
   */
  constructor(policy?: Partial<MemoTuningPolicy>, keygen?: (...args: TArgs) => string) {
    this.policy = { ...DEFAULT_POLICY, ...policy };
    const memoEnv = typeof process !== "undefined" && process?.env ? process.env["ALG_MEMO_ON"] : undefined;
    this.enabled = this.policy.enabled && (memoEnv ?? "1") !== "0";
    this.keygen = keygen ?? ((...args: TArgs) => JSON.stringify(args));
    this.cache = new LRUCache<string, TResult>({
      maxSize: this.policy.maxSize,
      ttl: this.policy.ttlMs,
      enableCleanup: this.policy.ttlMs > 0,
      enableStats: false,
    });
  }

  /**
   * Returns a memoized wrapper that caches results by generated key and records each call.
   *
   * In pass-through mode the wrapped function runs uncached but telemetry is still recorded.
   *
   * @param fn Function to memoize.
   * @returns A function with the same signature that consults the cache.
   */
  wrap(fn: (...a: TArgs) => TResult): (...a: TArgs) => TResult {
    return (...a: TArgs) => {
      const startWall = performance.now();
      if (!this.enabled) {
        const res = fn(...a);
        this.record(false, performance.now() - startWall, 0);
        return res;
      }

      const key = this.keygen(...a);
      const hit = this.cache.get(key);
      if (hit !== undefined) {
        const overhead = performance.now() - startWall;
        this.record(true, 0, overhead);
        return hit;
      }

      const execStart = performance.now();
      const res = fn(...a);
      const execMs = performance.now() - execStart;
      this.cache.set(key, res);
      const overhead = performance.now() - startWall - execMs;
      this.record(false, execMs, overhead);
      return res;
    };
  }

  /**
   * Accumulates one call's telemetry and, at each window boundary, disables caching when the
   * hit rate or average overhead misses the policy targets.
   *
   * @param hit Whether the call was served from the cache.
   * @param execMs Time spent executing the wrapped function, zero on a hit.
   * @param overheadMs Time spent on memoization machinery.
   */
  private record(hit: boolean, execMs: number, overheadMs: number) {
    this.winCalls++;
    if (hit) this.winHits++;
    else this.winMisses++;
    this.winExecMs += execMs;
    this.winOverheadMs += overheadMs;

    if (this.winCalls >= this.policy.windowSize) {
      const hitRate = this.winHits / this.winCalls;
      const avgOv = this.winOverheadMs / this.winCalls;
      if (this.winCalls >= this.policy.minSamples) {
        if (hitRate < this.policy.minHitRate || avgOv > this.policy.overheadBudgetMs) {
          this.enabled = false; // auto-disable until externally re-enabled
        }
      }
      this.winCalls = this.winHits = this.winMisses = 0;
      this.winExecMs = this.winOverheadMs = 0;
    }
  }

  /**
   * Merges new tuning values into the active policy.
   *
   * Cache sizing and TTL from the original policy are not rebuilt; re-enable explicitly if the
   * controller has already switched to pass-through.
   *
   * @param policy Partial policy values to update.
   */
  setPolicy(policy: Partial<MemoTuningPolicy>) {
    this.policy = { ...this.policy, ...policy };
  }

  /**
   * Returns telemetry for the current sliding window plus the enabled state.
   *
   * @returns Call counts, hit rate, and mean function and overhead times.
   */
  getStats(): AdaptiveStats {
    const calls = this.winCalls;
    const hits = this.winHits;
    const misses = this.winMisses;
    const hitRate = calls > 0 ? hits / calls : 0;
    const avgFnMs = this.winMisses > 0 ? this.winExecMs / this.winMisses : 0;
    const avgOverheadMs = calls > 0 ? this.winOverheadMs / calls : 0;
    return { calls, hits, misses, hitRate, avgFnMs, avgOverheadMs, enabled: this.enabled };
  }
}

/**
 * Creates an adaptive memoization controller for `fn` and returns its memoized wrapper.
 *
 * When a policy name is supplied, the controller is registered with the memo registry outside
 * the browser on a best-effort basis.
 *
 * @param fn Function to memoize.
 * @param policy Partial tuning overrides, including an optional registry name.
 * @param keygen Function producing a cache key from call arguments.
 * @returns A function with the same signature that consults the cache.
 */
export function adaptiveMemo<TArgs extends any[], TResult>(
  fn: (...a: TArgs) => TResult,
  policy?: Partial<MemoTuningPolicy>,
  keygen?: (...args: TArgs) => string
): (...a: TArgs) => TResult {
  const ctl = new AdaptiveMemoController<TArgs, TResult>(policy, keygen);

  // Auto-register with memo registry if name is provided
  if (policy?.name && typeof window === "undefined") {
    // Use dynamic import for ES module compatibility (fire-and-forget)
    import("../memo-registry")
      .then(memoModule => {
        if (memoModule.memoRegistry) {
          memoModule.memoRegistry.register(policy.name!, ctl);
        }
      })
      .catch(() => {
        // Ignore if registry not available
      });
  }

  return ctl.wrap(fn);
}
