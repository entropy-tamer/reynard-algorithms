/**
 * Memory Pool Core Implementation
 *
 * A high-performance object pooling system that reuses objects to reduce
 * garbage collection pressure and improve performance for high-frequency operations.
 *
 * @module algorithms/performance/memoryPoolCore
 */

export interface PooledObject {
  reset(): void;
}

export interface PerformanceMemoryPoolConfig {
  initialSize?: number;
  maxSize?: number;
  growthFactor?: number;
  enableStats?: boolean;
}

export interface PerformanceMemoryPoolStats {
  created: number;
  acquired: number;
  released: number;
  poolSize: number;
  peakPoolSize: number;
  hitRate: number;
}

/**
 * Reuses objects implementing `reset()` to reduce allocations in hot paths.
 *
 * Idle objects are kept in a stack, capped by `maxSize`, and each acquire resets the object
 * before handing it out.
 */
export class MemoryPool<T extends PooledObject> {
  private pool: T[] = [];
  private createFn: () => T;
  private config: Required<PerformanceMemoryPoolConfig>;
  private stats: PerformanceMemoryPoolStats;

  /**
   * Creates a pool with a factory and optional sizing settings, pre-allocating `initialSize` objects.
   *
   * @param createFn Factory used for every new object.
   * @param config Overrides for initial size, maximum size, growth factor, and statistics.
   */
  constructor(createFn: () => T, config: PerformanceMemoryPoolConfig = {}) {
    this.createFn = createFn;
    this.config = {
      initialSize: 10,
      maxSize: 1000,
      growthFactor: 1.5,
      enableStats: true,
      ...config,
    };

    this.stats = {
      created: 0,
      acquired: 0,
      released: 0,
      poolSize: 0,
      peakPoolSize: 0,
      hitRate: 0,
    };

    this.initializePool();
  }

  /**
   * Pre-allocates `initialSize` objects and seeds the created and pool-size counters.
   */
  private initializePool(): void {
    for (let i = 0; i < this.config.initialSize; i++) {
      this.pool.push(this.createFn());
      this.stats.created++;
    }
    this.stats.poolSize = this.pool.length;
    this.stats.peakPoolSize = this.pool.length;
  }

  /**
   * Returns a reset object from the pool, or allocates a new one when no idle objects remain.
   *
   * @returns A ready-to-use object.
   */
  acquire(): T {
    this.stats.acquired++;

    if (this.pool.length > 0) {
      const obj = this.pool.pop()!;
      obj.reset();
      this.stats.poolSize = this.pool.length;
      this.updateHitRate();
      return obj;
    }

    // Pool is empty, create new object
    const obj = this.createFn();
    this.stats.created++;
    this.updateHitRate();
    return obj;
  }

  /**
   * Returns an object to the idle pool, discarding it when `maxSize` objects are already held.
   *
   * @param obj Object being returned; its state is reset on the next acquire.
   */
  release(obj: T): void {
    if (this.pool.length >= this.config.maxSize) {
      // Pool is full, discard object
      return;
    }

    this.pool.push(obj);
    this.stats.released++;
    this.stats.poolSize = this.pool.length;
    this.stats.peakPoolSize = Math.max(this.stats.peakPoolSize, this.pool.length);
  }

  /**
   * Recomputes the fraction of acquisitions that were served from the idle pool.
   */
  private updateHitRate(): void {
    if (this.stats.acquired > 0) {
      this.stats.hitRate = (this.stats.acquired - (this.stats.created - this.config.initialSize)) / this.stats.acquired;
    }
  }

  /**
   * Returns a copy of the pool's created/acquired/released counters, sizes, and hit rate.
   *
   * @returns Snapshot of current statistics.
   */
  getStats(): PerformanceMemoryPoolStats {
    return { ...this.stats };
  }

  /**
   * Drops all idle objects and resets the reported pool size to zero.
   */
  clear(): void {
    this.pool.length = 0;
    this.stats.poolSize = 0;
  }

  /**
   * Adjusts the idle pool to exactly `newSize` objects, creating or discarding as needed.
   *
   * @param newSize Target number of idle objects.
   */
  resize(newSize: number): void {
    if (newSize < this.pool.length) {
      this.pool.length = newSize;
    } else if (newSize > this.pool.length) {
      const needed = newSize - this.pool.length;
      for (let i = 0; i < needed; i++) {
        this.pool.push(this.createFn());
        this.stats.created++;
      }
    }
    this.stats.poolSize = this.pool.length;
  }
}
