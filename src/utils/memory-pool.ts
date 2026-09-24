/**
 * Standalone Object Pool Utilities
 *
 * Extracted from PAW optimization framework. Provides simple, direct object pooling
 * for high-frequency allocations without indirection layers.
 *
 * @module algorithms/utils/memory-pool
 */

import { SpatialHash } from "../data-structures/spatial/spatial-hash/spatial-hash-core";
import { UnionFind } from "../data-structures/basic/union-find/union-find-core";
import type { CollisionPair } from "../algorithms/collision/narrow-phase/aabb/aabb-types";

/**
 * Generic object pool with factory and reset functions
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;
  public hits = 0;
  public misses = 0;

  constructor(factory: () => T, reset: (obj: T) => void, maxSize: number = 100) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  /** Acquire an object from the pool or create a new one */
  acquire(): T {
    const obj = this.pool.pop();
    if (obj) {
      this.hits++;
      this.reset(obj);
      return obj;
    }
    this.misses++;
    return this.factory();
  }

  /** Return an object to the pool */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
    // If pool is full, let GC handle it
  }

  /** Get pool statistics */
  getStats(): { hits: number; misses: number; hitRate: number; poolSize: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      poolSize: this.pool.length,
    };
  }

  /** Clear the pool */
  clear(): void {
    this.pool = [];
  }

  /** Pre-warm the pool with n objects */
  warm(count: number): void {
    for (let i = 0; i < count; i++) {
      this.pool.push(this.factory());
    }
  }
}

/** Pre-configured pool for SpatialHash instances */
export const spatialHashPool = new ObjectPool<SpatialHash>(
  () => new SpatialHash({ cellSize: 100 }),
  (h) => h.clear(),
  50
);

/** Pre-configured pool for collision arrays */
export const collisionArrayPool = new ObjectPool<CollisionPair[]>(
  () => [],
  (a) => { a.length = 0; },
  200
);

/** Pre-configured pool for processed sets */
export const processedSetPool = new ObjectPool<Set<number>>(
  () => new Set<number>(),
  (s) => s.clear(),
  50
);

/** UnionFind pools keyed by size */
const unionFindPools = new Map<number, ObjectPool<UnionFind>>();

/** Get or create a UnionFind pool for a specific size */
export function getUnionFindPool(size: number): ObjectPool<UnionFind> {
  let pool = unionFindPools.get(size);
  if (!pool) {
    pool = new ObjectPool<UnionFind>(
      () => new UnionFind(size),
      (uf) => { /* UnionFind is recreated on acquire */ },
      50
    );
    unionFindPools.set(size, pool);
  }
  return pool;
}

/** Acquire a UnionFind of the given size */
export function acquireUnionFind(size: number): UnionFind {
  return getUnionFindPool(size).acquire();
}

/** Release a UnionFind back to its size-specific pool */
export function releaseUnionFind(uf: UnionFind, size: number): void {
  getUnionFindPool(size).release(uf);
}

/** Get combined statistics for all UnionFind pools */
export function getUnionFindPoolStats(): Map<number, { hits: number; misses: number; hitRate: number; poolSize: number }> {
  const stats = new Map();
  for (const [size, pool] of unionFindPools) {
    stats.set(size, pool.getStats());
  }
  return stats;
}

/** Clear all UnionFind pools */
export function clearUnionFindPools(): void {
  unionFindPools.clear();
}

/**
 * Scoped pool usage helper — automatically releases on scope exit
 * @example
 * ```typescript
 * const collisions = withPooled(collisionArrayPool, (arr) => {
 *   // use arr
 *   return [...arr]; // return copy
 * });
 * ```
 */
export function withPooled<T, R>(pool: ObjectPool<T>, fn: (obj: T) => R): R {
  const obj = pool.acquire();
  try {
    return fn(obj);
  } finally {
    pool.release(obj);
  }
}