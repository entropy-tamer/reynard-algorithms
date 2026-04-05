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
import type { BloomFilterConfig, BloomFilterResult, BloomFilterMembershipResult, BloomFilterStats, BloomFilterEventHandler, BloomFilterOptions, BloomFilterPerformanceMetrics, BatchOperationResult, BloomFilterSerialization } from "./bloom-filter-types";
/**
 * Bloom Filter Data Structure Implementation
 *
 * Provides efficient probabilistic membership testing with configurable
 * false positive rates and hash functions.
 */
export declare class BloomFilter {
    private bitArray;
    private hashFunctions;
    private config;
    private eventHandlers;
    private enableDebug;
    private stats;
    /**
     *
     * @param options
     * @example
     */
    constructor(options?: Partial<BloomFilterOptions>);
    /**
     * Insert an element into the Bloom Filter
     *
     * @param element The element to insert
     * @returns Result of the insertion operation
     * @example
     */
    insert(element: string): BloomFilterResult;
    /**
     * Test if an element is possibly in the set
     *
     * @param element The element to test
     * @returns Membership test result
     * @example
     */
    test(element: string): BloomFilterMembershipResult;
    /**
     * Clear all elements from the Bloom Filter
     *
     * @returns Result of the clear operation
     * @example
     */
    clear(): BloomFilterResult;
    /**
     * Insert multiple elements in batch
     *
     * @param elements Array of elements to insert
     * @returns Batch operation result
     * @example
     */
    insertBatch(elements: string[]): BatchOperationResult;
    /**
     * Test multiple elements in batch
     *
     * @param elements Array of elements to test
     * @returns Array of membership test results
     * @example
     */
    testBatch(elements: string[]): BloomFilterMembershipResult[];
    /**
     * Get the current false positive rate
     *
     * @returns Current false positive rate
     * @example
     */
    getFalsePositiveRate(): number;
    /**
     * Get the theoretical false positive rate
     *
     * @returns Theoretical false positive rate
     * @example
     */
    getTheoreticalFalsePositiveRate(): number;
    /**
     * Get the number of elements inserted
     *
     * @returns Number of elements
     * @example
     */
    size(): number;
    /**
     * Check if the filter is empty
     *
     * @returns True if no elements have been inserted
     * @example
     */
    isEmpty(): boolean;
    /**
     * Get the number of bits set in the array
     *
     * @returns Number of bits set to 1
     * @example
     */
    getBitsSet(): number;
    /**
     * Get the fill ratio of the bit array
     *
     * @returns Ratio of bits set to total bits
     * @example
     */
    getFillRatio(): number;
    /**
     * Serialize the Bloom Filter to a JSON format
     *
     * @returns Serialized filter data
     * @example
     */
    serialize(): BloomFilterSerialization;
    /**
     * Deserialize a Bloom Filter from JSON format
     *
     * @param serialized Serialized filter data
     * @returns True if deserialization was successful
     * @example
     */
    deserialize(serialized: BloomFilterSerialization): boolean;
    /**
     * Add event handler
     * @param handler
     * @example
     */
    addEventHandler(handler: BloomFilterEventHandler): void;
    /**
     * Remove event handler
     * @param handler
     * @example
     */
    removeEventHandler(handler: BloomFilterEventHandler): void;
    /**
     * Get current statistics
     * @example
     */
    getStats(): BloomFilterStats;
    /**
     * Get performance metrics
     * @example
     */
    getPerformanceMetrics(): BloomFilterPerformanceMetrics;
    /**
     * Update configuration
     * @param newConfig
     * @example
     */
    updateConfig(newConfig: Partial<BloomFilterConfig>): void;
    /**
     * Calculate optimal parameters for the Bloom Filter
     * @example
     */
    private calculateOptimalParameters;
    /**
     * Initialize hash functions
     * @example
     */
    private initializeHashFunctions;
    /**
     * Create a hash function with a specific index
     * @param index
     * @example
     */
    private createHashFunction;
    /**
     * Create a seeded hash function
     * @param seed
     * @example
     */
    private createSeededHashFunction;
    /**
     * Get hash indices for an element
     * @param element
     * @example
     */
    private getHashIndices;
    /**
     * Check if a bit is set
     * @param index
     * @example
     */
    private isBitSet;
    /**
     * Set a bit
     * @param index
     * @example
     */
    private setBit;
    /**
     * Calculate current false positive rate
     * @example
     */
    private calculateCurrentFalsePositiveRate;
    /**
     * Calculate theoretical false positive rate
     * @example
     */
    private calculateTheoreticalFalsePositiveRate;
    /**
     * Convert bit array to base64 string
     * @param bitArray
     * @example
     */
    private bitArrayToBase64;
    /**
     * Convert base64 string to bit array
     * @param base64
     * @example
     */
    private base64ToBitArray;
    /**
     * Emit event to registered handlers
     * @param type
     * @param data
     * @example
     */
    private emitEvent;
}
//# sourceMappingURL=bloom-filter-core.d.ts.map