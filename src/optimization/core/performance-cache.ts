/**
 * Performance Caching System
 * 
 * Implements comprehensive caching for PAW optimization:
 * - Grid classification result caching
 * - Complexity calculation memoization
 * - Algorithm result caching
 * - LRU cache with size limits
 * - Performance tracking
 */

import type { AlgorithmSelection } from "./algorithm-selector-types";

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  currentSize: number;
  maxSize: number;
  hitRate: number;
  memoryUsage: number;
}

export interface ClassificationCacheKey {
  objectCount: number;
  gridSize?: number;
  density?: number;
  complexity?: number;
}

export interface ComplexityCacheKey {
  algorithm: string;
  inputSize: number;
  characteristics: string;
  parameters?: string;
}

export interface AlgorithmCacheKey {
  algorithm: string;
  workloadType: string;
  objectCount: number;
  gridSize: number;
  timestamp?: number;
}

/**
 * LRU Cache implementation with performance tracking
 */
export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];
  private maxSize: number;
  private maxMemory: number;
  private currentMemory: number = 0;
  private stats: CacheStats;

  constructor(maxSize: number = 100, maxMemory: number = 50 * 1024 * 1024) { // 50MB default
    this.maxSize = maxSize;
    this.maxMemory = maxMemory;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      currentSize: 0,
      maxSize,
      hitRate: 0,
      memoryUsage: 0,
    };
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (entry) {
      // Update access information
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      
      // Move to end of access order
      this.moveToEnd(key);
      
      this.stats.hits++;
      this.updateHitRate();
      return entry.data;
    }
    
    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  set(key: string, data: T, size: number = this.estimateSize(data)): void {
    // Check if we need to evict entries
    while (this.shouldEvict(size)) {
      this.evictLeastRecentlyUsed();
    }

    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.remove(key);
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      size,
    };

    this.cache.set(key, entry);
    this.accessOrder.push(key);
    this.currentMemory += size;
    
    this.updateStats();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  remove(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.currentMemory -= entry.size;
      
      const index = this.accessOrder.indexOf(key);
      if (index !== -1) {
        this.accessOrder.splice(index, 1);
      }
      
      this.updateStats();
      return true;
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.length = 0;
    this.currentMemory = 0;
    this.updateStats();
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private moveToEnd(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(key);
    }
  }

  private shouldEvict(newEntrySize: number): boolean {
    return (
      this.cache.size >= this.maxSize ||
      this.currentMemory + newEntrySize > this.maxMemory
    );
  }

  private evictLeastRecentlyUsed(): void {
    if (this.accessOrder.length === 0) return;

    const lruKey = this.accessOrder.shift()!;
    const entry = this.cache.get(lruKey);
    
    if (entry) {
      this.cache.delete(lruKey);
      this.currentMemory -= entry.size;
      this.stats.evictions++;
    }
  }

  private estimateSize(data: any): number {
    // Rough estimation of object size in bytes
    if (data === null || data === undefined) return 0;
    
    if (typeof data === 'string') return data.length * 2;
    if (typeof data === 'number') return 8;
    if (typeof data === 'boolean') return 4;
    if (typeof data === 'object') {
      return JSON.stringify(data).length * 2;
    }
    
    return 16; // Default estimation
  }

  private updateStats(): void {
    this.stats.currentSize = this.cache.size;
    this.stats.memoryUsage = this.currentMemory;
    this.updateHitRate();
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

/**
 * Grid Classification Cache
 */
export class GridClassificationCache {
  private cache = new LRUCache<string>(50, 10 * 1024 * 1024); // 10MB

  getClassification(key: ClassificationCacheKey): string | null {
    const cacheKey = this.createKey(key);
    return this.cache.get(cacheKey);
  }

  setClassification(key: ClassificationCacheKey, classification: string): void {
    const cacheKey = this.createKey(key);
    this.cache.set(cacheKey, classification);
  }

  getStats(): CacheStats {
    return this.cache.getStats();
  }

  clear(): void {
    this.cache.clear();
  }

  private createKey(key: ClassificationCacheKey): string {
    return `grid:${key.objectCount}:${key.gridSize || 0}:${key.density || 0}:${key.complexity || 0}`;
  }
}

/**
 * Complexity Calculation Cache
 */
export class ComplexityCalculationCache {
  private cache = new LRUCache<number>(100, 5 * 1024 * 1024); // 5MB

  getComplexity(key: ComplexityCacheKey): number | null {
    const cacheKey = this.createKey(key);
    return this.cache.get(cacheKey);
  }

  setComplexity(key: ComplexityCacheKey, complexity: number): void {
    const cacheKey = this.createKey(key);
    this.cache.set(cacheKey, complexity);
  }

  getStats(): CacheStats {
    return this.cache.getStats();
  }

  clear(): void {
    this.cache.clear();
  }

  private createKey(key: ComplexityCacheKey): string {
    return `complexity:${key.algorithm}:${key.inputSize}:${key.characteristics}:${key.parameters || ''}`;
  }
}

/**
 * Algorithm Result Cache
 */
export class AlgorithmResultCache {
  private cache = new LRUCache<AlgorithmSelection>(75, 20 * 1024 * 1024); // 20MB
  private maxAge: number = 5 * 60 * 1000; // 5 minutes

  getAlgorithmResult(key: AlgorithmCacheKey): AlgorithmSelection | null {
    const cacheKey = this.createKey(key);
    const result = this.cache.get(cacheKey);
    
    if (result && this.isResultValid(result, key)) {
      return result;
    }
    
    // Remove stale result
    if (result) {
      this.cache.remove(cacheKey);
    }
    
    return null;
  }

  setAlgorithmResult(key: AlgorithmCacheKey, result: AlgorithmSelection): void {
    const cacheKey = this.createKey(key);
    this.cache.set(cacheKey, result);
  }

  getStats(): CacheStats {
    return this.cache.getStats();
  }

  clear(): void {
    this.cache.clear();
  }

  private createKey(key: AlgorithmCacheKey): string {
    return `algorithm:${key.algorithm}:${key.workloadType}:${key.objectCount}:${key.gridSize}:${key.timestamp || 0}`;
  }

  private isResultValid(_result: AlgorithmSelection, key: AlgorithmCacheKey): boolean {
    // Check if result is still valid based on age
    const age = Date.now() - (key.timestamp || 0);
    return age < this.maxAge;
  }
}

/**
 * Performance Caching Manager
 * 
 * Centralized cache management for all PAW optimization components
 */
export class PerformanceCacheManager {
  private gridClassificationCache: GridClassificationCache;
  private complexityCache: ComplexityCalculationCache;
  private algorithmCache: AlgorithmResultCache;
  private enabled: boolean = true;

  constructor() {
    this.gridClassificationCache = new GridClassificationCache();
    this.complexityCache = new ComplexityCalculationCache();
    this.algorithmCache = new AlgorithmResultCache();
  }

  /**
   * Get cached grid classification
   */
  getGridClassification(key: ClassificationCacheKey): string | null {
    if (!this.enabled) return null;
    return this.gridClassificationCache.getClassification(key);
  }

  /**
   * Cache grid classification result
   */
  setGridClassification(key: ClassificationCacheKey, classification: string): void {
    if (!this.enabled) return;
    this.gridClassificationCache.setClassification(key, classification);
  }

  /**
   * Get cached complexity calculation
   */
  getComplexity(key: ComplexityCacheKey): number | null {
    if (!this.enabled) return null;
    return this.complexityCache.getComplexity(key);
  }

  /**
   * Cache complexity calculation result
   */
  setComplexity(key: ComplexityCacheKey, complexity: number): void {
    if (!this.enabled) return;
    this.complexityCache.setComplexity(key, complexity);
  }

  /**
   * Get cached algorithm result
   */
  getAlgorithmResult(key: AlgorithmCacheKey): AlgorithmSelection | null {
    if (!this.enabled) return null;
    return this.algorithmCache.getAlgorithmResult(key);
  }

  /**
   * Cache algorithm result
   */
  setAlgorithmResult(key: AlgorithmCacheKey, result: AlgorithmSelection): void {
    if (!this.enabled) return;
    this.algorithmCache.setAlgorithmResult(key, result);
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(): {
    gridClassification: CacheStats;
    complexity: CacheStats;
    algorithm: CacheStats;
    overall: {
      totalHits: number;
      totalMisses: number;
      overallHitRate: number;
      totalMemoryUsage: number;
    };
  } {
    const gridStats = this.gridClassificationCache.getStats();
    const complexityStats = this.complexityCache.getStats();
    const algorithmStats = this.algorithmCache.getStats();

    const totalHits = gridStats.hits + complexityStats.hits + algorithmStats.hits;
    const totalMisses = gridStats.misses + complexityStats.misses + algorithmStats.misses;
    const totalMemory = gridStats.memoryUsage + complexityStats.memoryUsage + algorithmStats.memoryUsage;

    return {
      gridClassification: gridStats,
      complexity: complexityStats,
      algorithm: algorithmStats,
      overall: {
        totalHits,
        totalMisses,
        overallHitRate: totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0,
        totalMemoryUsage: totalMemory,
      },
    };
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.gridClassificationCache.clear();
    this.complexityCache.clear();
    this.algorithmCache.clear();
  }

  /**
   * Enable/disable caching
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if caching is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Warm up caches with common patterns
   */
  async warmUp(): Promise<void> {
    // Pre-populate caches with common patterns
    // This would be implemented based on typical usage patterns
    console.log('Warming up performance caches...');
    
    // Example: Common grid classifications
    const commonGrids = [
      { objectCount: 100, gridSize: 10 },
      { objectCount: 500, gridSize: 22 },
      { objectCount: 1000, gridSize: 32 },
      { objectCount: 2000, gridSize: 45 },
    ];

    for (const grid of commonGrids) {
      this.setGridClassification(grid, this.calculateClassification(grid));
    }

    console.log('Cache warm-up completed');
  }

  private calculateClassification(grid: ClassificationCacheKey): string {
    const { gridSize = Math.sqrt(grid.objectCount) } = grid;
    return gridSize < 50 ? 'small' : gridSize < 100 ? 'medium' : 'large';
  }
}

// Global cache manager instance
export const performanceCache = new PerformanceCacheManager();
