/**
 * @module algorithms/data-structures/bloom-filter
 * @description Provides the Bloom Filter data structure and related utilities.
 */

export { BloomFilter } from "./bloom-filter-core";
export type {
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
} from "./bloom-filter-types";

