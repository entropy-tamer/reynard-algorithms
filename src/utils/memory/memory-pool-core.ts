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
 *
 */
export class MemoryPool<T extends PooledObject> {
  private pool: T[] = [];
  private createFn: () => T;
  private config: Required<PerformanceMemoryPoolConfig>;
  private stats: PerformanceMemoryPoolStats;

  /**
   *
   * @param createFn
   * @param config
   * @example
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
   *
   * @example
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
   *
   * @example
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
   *
   * @param obj
   * @example
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
   *
   * @example
   */
  private updateHitRate(): void {
    if (this.stats.acquired > 0) {
      this.stats.hitRate = (this.stats.acquired - (this.stats.created - this.config.initialSize)) / this.stats.acquired;
    }
  }

  /**
   *
   * @example
   */
  getStats(): PerformanceMemoryPoolStats {
    return { ...this.stats };
  }

  /**
   *
   * @example
   */
  clear(): void {
    this.pool.length = 0;
    this.stats.poolSize = 0;
  }

  /**
   *
   * @param newSize
   * @example
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
