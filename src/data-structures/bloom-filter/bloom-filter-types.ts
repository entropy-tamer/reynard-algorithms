/**
 * @module algorithms/data-structures/bloom-filter/types
 * @description Defines the types and interfaces for the Bloom Filter data structure.
 */

/**
 * Hash function type for Bloom Filter.
 */
export type HashFunction = (value: string) => number;

/**
 * Configuration options for the Bloom Filter.
 */
export interface BloomFilterConfig {
  /**
   * Expected number of elements to be inserted.
   * @default 1000
   */
  expectedElements?: number;
  /**
   * Desired false positive rate (0.0 to 1.0).
   * @default 0.01
   */
  falsePositiveRate?: number;
  /**
   * Number of hash functions to use.
   * If not provided, will be calculated based on expectedElements and falsePositiveRate.
   */
  hashFunctions?: number;
  /**
   * Size of the bit array.
   * If not provided, will be calculated based on expectedElements and falsePositiveRate.
   */
  bitArraySize?: number;
  /**
   * Custom hash functions to use.
   * If not provided, will use built-in hash functions.
   */
  customHashFunctions?: HashFunction[];
  /**
   * Whether to use multiple hash functions or a single hash function with different seeds.
   * @default true
   */
  useMultipleHashFunctions?: boolean;
  /**
   * Seed for hash function generation.
   * @default 0
   */
  seed?: number;
}

/**
 * Result of a Bloom Filter operation.
 */
export interface BloomFilterResult {
  /**
   * Whether the operation was successful.
   */
  success: boolean;
  /**
   * Time taken for the operation in milliseconds.
   */
  executionTime: number;
  /**
   * Number of hash functions used.
   */
  hashFunctionsUsed: number;
  /**
   * Additional metadata about the operation.
   */
  metadata?: any;
}

/**
 * Result of a Bloom Filter membership test.
 */
export interface BloomFilterMembershipResult {
  /**
   * Whether the element is possibly in the set (true) or definitely not in the set (false).
   */
  possiblyPresent: boolean;
  /**
   * Time taken for the test in milliseconds.
   */
  executionTime: number;
  /**
   * Number of hash functions used.
   */
  hashFunctionsUsed: number;
  /**
   * Indices that were checked in the bit array.
   */
  checkedIndices: number[];
}

/**
 * Statistics about the Bloom Filter.
 */
export interface BloomFilterStats {
  /**
   * Total number of elements inserted.
   */
  totalElements: number;
  /**
   * Size of the bit array.
   */
  bitArraySize: number;
  /**
   * Number of hash functions used.
   */
  hashFunctions: number;
  /**
   * Number of bits set to 1 in the array.
   */
  bitsSet: number;
  /**
   * Current false positive rate (estimated).
   */
  currentFalsePositiveRate: number;
  /**
   * Theoretical false positive rate.
   */
  theoreticalFalsePositiveRate: number;
  /**
   * Number of membership tests performed.
   */
  totalTests: number;
  /**
   * Number of positive tests (possibly present).
   */
  positiveTests: number;
  /**
   * Number of negative tests (definitely not present).
   */
  negativeTests: number;
  /**
   * Average test time in milliseconds.
   */
  averageTestTime: number;
  /**
   * Memory usage in bytes.
   */
  memoryUsage: number;
}

/**
 * Performance metrics for the Bloom Filter.
 */
export interface BloomFilterPerformanceMetrics {
  /**
   * Memory usage in bytes.
   */
  memoryUsage: number;
  /**
   * Average test time in milliseconds.
   */
  averageTestTime: number;
  /**
   * Average insert time in milliseconds.
   */
  averageInsertTime: number;
  /**
   * Performance score (0-100).
   */
  performanceScore: number;
  /**
   * Space efficiency ratio.
   */
  spaceEfficiency: number;
  /**
   * Hash function efficiency.
   */
  hashEfficiency: number;
}

/**
 * Options for Bloom Filter operations.
 */
export interface BloomFilterOptions {
  /**
   * Configuration for the Bloom Filter.
   */
  config?: Partial<BloomFilterConfig>;
  /**
   * Whether to enable statistics tracking.
   * @default false
   */
  enableStats?: boolean;
  /**
   * Whether to enable debug logging.
   * @default false
   */
  enableDebug?: boolean;
  /**
   * Initial elements to insert.
   */
  initialElements?: string[];
  /**
   * Event handlers for monitoring operations.
   */
  eventHandlers?: BloomFilterEventHandler[];
}

/**
 * Event types for Bloom Filter operations.
 */
export enum BloomFilterEventType {
  ELEMENT_INSERTED = "element_inserted",
  ELEMENT_TESTED = "element_tested",
  FILTER_CLEARED = "filter_cleared",
  STATS_UPDATED = "stats_updated",
}

/**
 * Event data for Bloom Filter operations.
 */
export interface BloomFilterEvent {
  type: BloomFilterEventType;
  timestamp: number;
  data?: any;
}

/**
 * Event handler function type.
 */
export type BloomFilterEventHandler = (event: BloomFilterEvent) => void;

/**
 * Result of a batch operation.
 */
export interface BatchOperationResult {
  /**
   * Number of successful operations.
   */
  successful: number;
  /**
   * Number of failed operations.
   */
  failed: number;
  /**
   * Array of error messages.
   */
  errors: string[];
  /**
   * Time taken for the batch operation in milliseconds.
   */
  executionTime: number;
  /**
   * Array of operation results.
   */
  results: boolean[];
}

/**
 * Serialization format for the Bloom Filter.
 */
export interface BloomFilterSerialization {
  /**
   * Version of the serialization format.
   */
  version: string;
  /**
   * Configuration of the filter.
   */
  config: BloomFilterConfig;
  /**
   * Serialized bit array data.
   */
  bitArray: string; // Base64 encoded bit array
  /**
   * Metadata about the filter.
   */
  metadata: {
    totalElements: number;
    bitsSet: number;
    createdAt: number;
  };
}

/**
 * Hash function generator options.
 */
export interface HashFunctionGeneratorOptions {
  /**
   * Number of hash functions to generate.
   */
  count: number;
  /**
   * Seed for hash function generation.
   */
  seed?: number;
  /**
   * Maximum value for hash functions.
   */
  maxValue?: number;
}

/**
 * Default configuration for the Bloom Filter.
 */
export const DEFAULT_BLOOM_FILTER_CONFIG: BloomFilterConfig = {
  expectedElements: 1000,
  falsePositiveRate: 0.01,
  useMultipleHashFunctions: true,
  seed: 0,
};

/**
 * Default options for the Bloom Filter.
 */
export const DEFAULT_BLOOM_FILTER_OPTIONS: BloomFilterOptions = {
  config: DEFAULT_BLOOM_FILTER_CONFIG,
  enableStats: false,
  enableDebug: false,
  initialElements: [],
};
