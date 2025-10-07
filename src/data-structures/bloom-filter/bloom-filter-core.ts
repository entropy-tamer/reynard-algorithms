/**
 * Bloom Filter Data Structure Core Implementation
 *
 * Implementation of the Bloom Filter data structure with comprehensive
 * features including configurable hash functions, statistics tracking,
 * and serialization support.
 * 
 * Mathematical Theory:
 * A Bloom Filter is a space-efficient probabilistic data structure
 * designed to test whether an element is a member of a set. It can
 * have false positives but never false negatives.
 * 
 * Key formulas:
 * - Optimal bit array size: m = -(n * ln(p)) / (ln(2)^2)
 * - Optimal number of hash functions: k = (m/n) * ln(2)
 * - False positive rate: (1 - e^(-kn/m))^k
 * 
 * Where:
 * - n = expected number of elements
 * - p = desired false positive rate
 * - m = bit array size
 * - k = number of hash functions
 *
 * @module algorithms/data-structures/bloom-filter
 */

import type {
  HashFunction,
  BloomFilterConfig,
  BloomFilterResult,
  BloomFilterMembershipResult,
  BloomFilterStats,
  BloomFilterEvent,
  BloomFilterEventType,
  BloomFilterEventHandler,
  BloomFilterOptions,
  BloomFilterPerformanceMetrics,
  BatchOperationResult,
  BloomFilterSerialization,
  HashFunctionGeneratorOptions,
} from './bloom-filter-types';

/**
 * Bloom Filter Data Structure Implementation
 * 
 * Provides efficient probabilistic membership testing with configurable
 * false positive rates and hash functions.
 */
export class BloomFilter {
  private bitArray: Uint8Array;
  private hashFunctions: HashFunction[];
  private config: BloomFilterConfig;
  private eventHandlers: BloomFilterEventHandler[];
  private enableStats: boolean;
  private enableDebug: boolean;
  private stats: BloomFilterStats;

  constructor(options: Partial<BloomFilterOptions> = {}) {
    const opts = { ...DEFAULT_BLOOM_FILTER_OPTIONS, ...options };
    
    this.config = { ...DEFAULT_BLOOM_FILTER_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableStats = opts.enableStats;
    this.enableDebug = opts.enableDebug;
    
    // Calculate optimal parameters if not provided
    this.calculateOptimalParameters();
    
    // Initialize bit array
    this.bitArray = new Uint8Array(Math.ceil(this.config.bitArraySize! / 8));
    
    // Initialize hash functions
    this.hashFunctions = this.initializeHashFunctions();
    
    this.stats = {
      totalElements: 0,
      bitArraySize: this.config.bitArraySize!,
      hashFunctions: this.config.hashFunctions!,
      bitsSet: 0,
      currentFalsePositiveRate: 0,
      theoreticalFalsePositiveRate: this.calculateTheoreticalFalsePositiveRate(),
      totalTests: 0,
      positiveTests: 0,
      negativeTests: 0,
      averageTestTime: 0,
      memoryUsage: this.bitArray.length,
    };
    
    // Insert initial elements if provided
    if (opts.initialElements && opts.initialElements.length > 0) {
      this.insertBatch(opts.initialElements);
    }
  }

  /**
   * Insert an element into the Bloom Filter
   * 
   * @param element The element to insert
   * @returns Result of the insertion operation
   */
  insert(element: string): BloomFilterResult {
    const startTime = performance.now();
    
    try {
      if (!element || typeof element !== 'string') {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          hashFunctionsUsed: 0,
          metadata: { error: 'Invalid element' },
        };
      }
      
      const indices = this.getHashIndices(element);
      let newBitsSet = 0;
      
      for (const index of indices) {
        if (!this.isBitSet(index)) {
          this.setBit(index);
          newBitsSet++;
        }
      }
      
      // Update statistics
      this.stats.totalElements++;
      this.stats.bitsSet += newBitsSet;
      this.stats.currentFalsePositiveRate = this.calculateCurrentFalsePositiveRate();
      this.stats.memoryUsage = this.bitArray.length;
      
      this.emitEvent(BloomFilterEventType.ELEMENT_INSERTED, { element, indices });
      
      return {
        success: true,
        executionTime: performance.now() - startTime,
        hashFunctionsUsed: indices.length,
        metadata: { indices, newBitsSet },
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        hashFunctionsUsed: 0,
        metadata: { error: error.message },
      };
    }
  }

  /**
   * Test if an element is possibly in the set
   * 
   * @param element The element to test
   * @returns Membership test result
   */
  test(element: string): BloomFilterMembershipResult {
    const startTime = performance.now();
    
    try {
      if (!element || typeof element !== 'string') {
        return {
          possiblyPresent: false,
          executionTime: performance.now() - startTime,
          hashFunctionsUsed: 0,
          checkedIndices: [],
        };
      }
      
      const indices = this.getHashIndices(element);
      let possiblyPresent = true;
      
      for (const index of indices) {
        if (!this.isBitSet(index)) {
          possiblyPresent = false;
          break;
        }
      }
      
      // Update statistics
      this.stats.totalTests++;
      if (possiblyPresent) {
        this.stats.positiveTests++;
      } else {
        this.stats.negativeTests++;
      }
      
      const executionTime = performance.now() - startTime;
      this.stats.averageTestTime = (this.stats.averageTestTime * (this.stats.totalTests - 1) + executionTime) / this.stats.totalTests;
      
      this.emitEvent(BloomFilterEventType.ELEMENT_TESTED, { element, possiblyPresent, indices });
      
      return {
        possiblyPresent,
        executionTime,
        hashFunctionsUsed: indices.length,
        checkedIndices: indices,
      };
    } catch (error) {
      return {
        possiblyPresent: false,
        executionTime: performance.now() - startTime,
        hashFunctionsUsed: 0,
        checkedIndices: [],
      };
    }
  }

  /**
   * Clear all elements from the Bloom Filter
   * 
   * @returns Result of the clear operation
   */
  clear(): BloomFilterResult {
    const startTime = performance.now();
    
    try {
      this.bitArray.fill(0);
      
      // Reset statistics
      this.stats.totalElements = 0;
      this.stats.bitsSet = 0;
      this.stats.currentFalsePositiveRate = 0;
      this.stats.totalTests = 0;
      this.stats.positiveTests = 0;
      this.stats.negativeTests = 0;
      this.stats.averageTestTime = 0;
      
      this.emitEvent(BloomFilterEventType.FILTER_CLEARED, {});
      
      return {
        success: true,
        executionTime: performance.now() - startTime,
        hashFunctionsUsed: 0,
        metadata: { cleared: true },
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        hashFunctionsUsed: 0,
        metadata: { error: error.message },
      };
    }
  }

  /**
   * Insert multiple elements in batch
   * 
   * @param elements Array of elements to insert
   * @returns Batch operation result
   */
  insertBatch(elements: string[]): BatchOperationResult {
    const startTime = performance.now();
    const results: boolean[] = [];
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;
    
    for (const element of elements) {
      try {
        const result = this.insert(element);
        results.push(result.success);
        if (result.success) {
          successful++;
        } else {
          failed++;
          errors.push(`Failed to insert element: ${element}`);
        }
      } catch (error) {
        results.push(false);
        failed++;
        errors.push(`Error inserting element ${element}: ${error}`);
      }
    }
    
    return {
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results,
    };
  }

  /**
   * Test multiple elements in batch
   * 
   * @param elements Array of elements to test
   * @returns Array of membership test results
   */
  testBatch(elements: string[]): BloomFilterMembershipResult[] {
    return elements.map(element => this.test(element));
  }

  /**
   * Get the current false positive rate
   * 
   * @returns Current false positive rate
   */
  getFalsePositiveRate(): number {
    return this.stats.currentFalsePositiveRate;
  }

  /**
   * Get the theoretical false positive rate
   * 
   * @returns Theoretical false positive rate
   */
  getTheoreticalFalsePositiveRate(): number {
    return this.stats.theoreticalFalsePositiveRate;
  }

  /**
   * Get the number of elements inserted
   * 
   * @returns Number of elements
   */
  size(): number {
    return this.stats.totalElements;
  }

  /**
   * Check if the filter is empty
   * 
   * @returns True if no elements have been inserted
   */
  isEmpty(): boolean {
    return this.stats.totalElements === 0;
  }

  /**
   * Get the number of bits set in the array
   * 
   * @returns Number of bits set to 1
   */
  getBitsSet(): number {
    return this.stats.bitsSet;
  }

  /**
   * Get the fill ratio of the bit array
   * 
   * @returns Ratio of bits set to total bits
   */
  getFillRatio(): number {
    return this.stats.bitsSet / this.stats.bitArraySize;
  }

  /**
   * Serialize the Bloom Filter to a JSON format
   * 
   * @returns Serialized filter data
   */
  serialize(): BloomFilterSerialization {
    const bitArrayString = this.bitArrayToBase64(this.bitArray);
    
    return {
      version: '1.0',
      config: this.config,
      bitArray: bitArrayString,
      metadata: {
        totalElements: this.stats.totalElements,
        bitsSet: this.stats.bitsSet,
        createdAt: Date.now(),
      },
    };
  }

  /**
   * Deserialize a Bloom Filter from JSON format
   * 
   * @param serialized Serialized filter data
   * @returns True if deserialization was successful
   */
  deserialize(serialized: BloomFilterSerialization): boolean {
    try {
      this.config = serialized.config;
      this.bitArray = this.base64ToBitArray(serialized.bitArray);
      this.hashFunctions = this.initializeHashFunctions();
      
      // Recalculate statistics
      this.stats.totalElements = serialized.metadata.totalElements;
      this.stats.bitsSet = serialized.metadata.bitsSet;
      this.stats.bitArraySize = this.config.bitArraySize!;
      this.stats.hashFunctions = this.config.hashFunctions!;
      this.stats.currentFalsePositiveRate = this.calculateCurrentFalsePositiveRate();
      this.stats.theoreticalFalsePositiveRate = this.calculateTheoreticalFalsePositiveRate();
      this.stats.memoryUsage = this.bitArray.length;
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Add event handler
   */
  addEventHandler(handler: BloomFilterEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  removeEventHandler(handler: BloomFilterEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Get current statistics
   */
  getStats(): BloomFilterStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): BloomFilterPerformanceMetrics {
    const performanceScore = Math.min(100, Math.max(0,
      (Math.max(0, 1 - this.stats.averageTestTime / 10) * 40) +
      (Math.max(0, 1 - this.stats.memoryUsage / 1000000) * 30) +
      (Math.max(0, 1 - this.stats.currentFalsePositiveRate) * 30)
    ));
    
    const spaceEfficiency = this.stats.totalElements / this.stats.bitArraySize;
    const hashEfficiency = this.stats.hashFunctions / this.stats.totalElements;
    
    return {
      memoryUsage: this.stats.memoryUsage,
      averageTestTime: this.stats.averageTestTime,
      averageInsertTime: this.stats.averageTestTime, // Using same value for now
      performanceScore,
      spaceEfficiency,
      hashEfficiency,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BloomFilterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.calculateOptimalParameters();
    this.hashFunctions = this.initializeHashFunctions();
  }

  // Private helper methods

  /**
   * Calculate optimal parameters for the Bloom Filter
   */
  private calculateOptimalParameters(): void {
    const n = this.config.expectedElements!;
    const p = this.config.falsePositiveRate!;
    
    // Calculate optimal bit array size
    if (!this.config.bitArraySize) {
      this.config.bitArraySize = Math.ceil(-(n * Math.log(p)) / (Math.log(2) * Math.log(2)));
    }
    
    // Calculate optimal number of hash functions
    if (!this.config.hashFunctions) {
      this.config.hashFunctions = Math.ceil((this.config.bitArraySize / n) * Math.log(2));
    }
    
    // Ensure we have at least 1 hash function
    this.config.hashFunctions = Math.max(1, this.config.hashFunctions);
  }

  /**
   * Initialize hash functions
   */
  private initializeHashFunctions(): HashFunction[] {
    if (this.config.customHashFunctions) {
      return this.config.customHashFunctions;
    }
    
    const functions: HashFunction[] = [];
    const count = this.config.hashFunctions!;
    
    if (this.config.useMultipleHashFunctions) {
      // Use different hash functions
      for (let i = 0; i < count; i++) {
        functions.push(this.createHashFunction(i));
      }
    } else {
      // Use single hash function with different seeds
      for (let i = 0; i < count; i++) {
        functions.push(this.createSeededHashFunction(i));
      }
    }
    
    return functions;
  }

  /**
   * Create a hash function with a specific index
   */
  private createHashFunction(index: number): HashFunction {
    const seed = this.config.seed! + index;
    
    return (value: string): number => {
      let hash = seed;
      for (let i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash + value.charCodeAt(i)) & 0xffffffff;
        hash = hash ^ (hash >>> 16);
      }
      return Math.abs(hash) % this.config.bitArraySize!;
    };
  }

  /**
   * Create a seeded hash function
   */
  private createSeededHashFunction(seed: number): HashFunction {
    return (value: string): number => {
      let hash = seed;
      for (let i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash + value.charCodeAt(i)) & 0xffffffff;
        hash = hash ^ (hash >>> 16);
      }
      return Math.abs(hash) % this.config.bitArraySize!;
    };
  }

  /**
   * Get hash indices for an element
   */
  private getHashIndices(element: string): number[] {
    return this.hashFunctions.map(hashFn => hashFn(element));
  }

  /**
   * Check if a bit is set
   */
  private isBitSet(index: number): boolean {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    return (this.bitArray[byteIndex] & (1 << bitIndex)) !== 0;
  }

  /**
   * Set a bit
   */
  private setBit(index: number): void {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    this.bitArray[byteIndex] |= (1 << bitIndex);
  }

  /**
   * Calculate current false positive rate
   */
  private calculateCurrentFalsePositiveRate(): number {
    if (this.stats.totalElements === 0) {
      return 0;
    }
    
    const m = this.stats.bitArraySize;
    const n = this.stats.totalElements;
    const k = this.stats.hashFunctions;
    
    // Current false positive rate based on actual bits set
    const bitsSetRatio = this.stats.bitsSet / m;
    return Math.pow(bitsSetRatio, k);
  }

  /**
   * Calculate theoretical false positive rate
   */
  private calculateTheoreticalFalsePositiveRate(): number {
    const m = this.config.bitArraySize!;
    const n = this.config.expectedElements!;
    const k = this.config.hashFunctions!;
    
    // Theoretical false positive rate
    return Math.pow(1 - Math.exp(-k * n / m), k);
  }

  /**
   * Convert bit array to base64 string
   */
  private bitArrayToBase64(bitArray: Uint8Array): string {
    const binaryString = Array.from(bitArray)
      .map(byte => byte.toString(2).padStart(8, '0'))
      .join('');
    
    // Convert binary string to base64
    const base64 = btoa(binaryString);
    return base64;
  }

  /**
   * Convert base64 string to bit array
   */
  private base64ToBitArray(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bitArray = new Uint8Array(Math.ceil(binaryString.length / 8));
    
    for (let i = 0; i < binaryString.length; i += 8) {
      const byteString = binaryString.substr(i, 8).padEnd(8, '0');
      bitArray[Math.floor(i / 8)] = parseInt(byteString, 2);
    }
    
    return bitArray;
  }

  /**
   * Emit event to registered handlers
   */
  private emitEvent(type: BloomFilterEventType, data?: any): void {
    if (!this.enableDebug) return;
    
    const event: BloomFilterEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in BloomFilter event handler:', error);
      }
    }
  }
}

// Import default options
import { DEFAULT_BLOOM_FILTER_OPTIONS } from './bloom-filter-types';
