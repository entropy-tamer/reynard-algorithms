/**
 * @file Bloom Filter tests
 */
/* eslint-disable max-lines, max-lines-per-function */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BloomFilter } from "../../data-structures/bloom-filter/bloom-filter-core";

describe("Bloom Filter Data Structure", () => {
  let bloomFilter: BloomFilter;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    bloomFilter = new BloomFilter();
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      expect(bloomFilter).toBeInstanceOf(BloomFilter);
      expect(bloomFilter.isEmpty()).toBe(true);
      expect(bloomFilter.size()).toBe(0);
    });

    it("should initialize with custom configuration", () => {
      const customFilter = new BloomFilter({
        config: {
          expectedElements: 100,
          falsePositiveRate: 0.05,
          hashFunctions: 3,
        },
        enableStats: true,
        enableDebug: true,
      });
      expect(customFilter).toBeInstanceOf(BloomFilter);
    });

    it("should initialize with initial elements", () => {
      const initialElements = ["hello", "world", "test"];
      const filterWithElements = new BloomFilter({ initialElements });
      expect(filterWithElements.size()).toBe(3);
    });

    it("should calculate optimal parameters automatically", () => {
      const filter = new BloomFilter({
        config: {
          expectedElements: 1000,
          falsePositiveRate: 0.01,
        },
      });

      // Should have calculated bit array size and hash functions
      expect(filter.getStats().bitArraySize).toBeGreaterThan(0);
      expect(filter.getStats().hashFunctions).toBeGreaterThan(0);
    });
  });

  describe("Basic Operations", () => {
    it("should insert an element successfully", () => {
      const result = bloomFilter.insert("hello");
      expect(result.success).toBe(true);
      expect(result.hashFunctionsUsed).toBeGreaterThan(0);
      expect(bloomFilter.size()).toBe(1);
      expect(bloomFilter.isEmpty()).toBe(false);
    });

    it("should insert an element with data", () => {
      const result = bloomFilter.insert("test");
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
    });

    it("should reject invalid elements", () => {
      const result1 = bloomFilter.insert("");
      const result2 = bloomFilter.insert(null as any);
      const result3 = bloomFilter.insert(undefined as any);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(false);
      expect(bloomFilter.size()).toBe(0);
    });

    it("should test for element membership", () => {
      bloomFilter.insert("hello");

      const result = bloomFilter.test("hello");
      expect(result.possiblyPresent).toBe(true);
      expect(result.hashFunctionsUsed).toBeGreaterThan(0);
      expect(result.checkedIndices.length).toBeGreaterThan(0);
    });

    it("should return false for non-inserted elements", () => {
      bloomFilter.insert("hello");

      const result = bloomFilter.test("world");
      // This might be true due to false positives, but we can't guarantee it
      expect(result.possiblyPresent).toBeDefined();
    });

    it("should handle empty string elements", () => {
      const result = bloomFilter.insert("");
      expect(result.success).toBe(false);
    });
  });

  describe("False Positive Rate", () => {
    it("should have a theoretical false positive rate", () => {
      const filter = new BloomFilter({
        config: {
          expectedElements: 100,
          falsePositiveRate: 0.01,
        },
      });

      const theoreticalRate = filter.getTheoreticalFalsePositiveRate();
      expect(theoreticalRate).toBeGreaterThan(0);
      expect(theoreticalRate).toBeLessThan(1);
    });

    it("should calculate current false positive rate", () => {
      const filter = new BloomFilter({
        config: {
          expectedElements: 100,
          falsePositiveRate: 0.01,
        },
      });

      // Initially should be 0
      expect(filter.getFalsePositiveRate()).toBe(0);

      // After inserting elements, should have a rate
      filter.insert("test1");
      filter.insert("test2");
      filter.insert("test3");

      const currentRate = filter.getFalsePositiveRate();
      expect(currentRate).toBeGreaterThanOrEqual(0);
      expect(currentRate).toBeLessThan(1);
    });

    it("should respect configured false positive rate", () => {
      const filter = new BloomFilter({
        config: {
          expectedElements: 1000,
          falsePositiveRate: 0.05,
        },
      });

      const theoreticalRate = filter.getTheoreticalFalsePositiveRate();
      expect(theoreticalRate).toBeCloseTo(0.05, 1);
    });
  });

  describe("Hash Functions", () => {
    it("should use multiple hash functions", () => {
      const filter = new BloomFilter({
        config: {
          expectedElements: 100,
          falsePositiveRate: 0.01,
          hashFunctions: 3,
        },
      });

      const stats = filter.getStats();
      expect(stats.hashFunctions).toBe(3);
    });

    it("should use custom hash functions", () => {
      const customHash1 = (value: string) => value.length * 2;
      const customHash2 = (value: string) => value.length * 3;

      const filter = new BloomFilter({
        config: {
          expectedElements: 100,
          falsePositiveRate: 0.01,
          customHashFunctions: [customHash1, customHash2],
        },
      });

      const stats = filter.getStats();
      expect(stats.hashFunctions).toBe(2);
    });

    it("should generate different hash indices for different elements", () => {
      const filter = new BloomFilter({
        config: {
          expectedElements: 100,
          falsePositiveRate: 0.01,
          hashFunctions: 3,
        },
      });

      const result1 = filter.insert("hello");
      const result2 = filter.insert("world");

      expect(result1.metadata.indices).toBeDefined();
      expect(result2.metadata.indices).toBeDefined();
      // Indices should be different for different elements
      expect(result1.metadata.indices).not.toEqual(result2.metadata.indices);
    });
  });

  describe("Batch Operations", () => {
    it("should insert multiple elements in batch", () => {
      const elements = ["hello", "world", "test", "batch"];
      const result = bloomFilter.insertBatch(elements);

      expect(result.successful).toBe(4);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(bloomFilter.size()).toBe(4);
    });

    it("should handle batch insert errors", () => {
      const elements = ["hello", "", "test"]; // Empty string should fail
      const result = bloomFilter.insertBatch(elements);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
    });

    it("should test multiple elements in batch", () => {
      bloomFilter.insert("hello");
      bloomFilter.insert("world");

      const elements = ["hello", "world", "test"];
      const results = bloomFilter.testBatch(elements);

      expect(results.length).toBe(3);
      expect(results[0].possiblyPresent).toBe(true);
      expect(results[1].possiblyPresent).toBe(true);
      // Third element might be true due to false positives
      expect(results[2].possiblyPresent).toBeDefined();
    });
  });

  describe("Statistics and Performance", () => {
    beforeEach(() => {
      const statsFilter = new BloomFilter({ enableStats: true });
      bloomFilter = statsFilter;

      bloomFilter.insert("hello");
      bloomFilter.insert("world");
      bloomFilter.insert("test");
    });

    it("should track statistics", () => {
      const stats = bloomFilter.getStats();

      expect(stats.totalElements).toBe(3);
      expect(stats.bitArraySize).toBeGreaterThan(0);
      expect(stats.hashFunctions).toBeGreaterThan(0);
      expect(stats.bitsSet).toBeGreaterThan(0);
      expect(stats.currentFalsePositiveRate).toBeGreaterThanOrEqual(0);
      expect(stats.theoreticalFalsePositiveRate).toBeGreaterThan(0);
      expect(stats.totalTests).toBe(0);
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });

    it("should provide performance metrics", () => {
      const metrics = bloomFilter.getPerformanceMetrics();

      expect(metrics).toHaveProperty("memoryUsage");
      expect(metrics).toHaveProperty("averageTestTime");
      expect(metrics).toHaveProperty("performanceScore");
      expect(metrics).toHaveProperty("spaceEfficiency");
      expect(metrics).toHaveProperty("hashEfficiency");
      expect(metrics.performanceScore).toBeGreaterThanOrEqual(0);
      expect(metrics.performanceScore).toBeLessThanOrEqual(100);
    });

    it("should update statistics on operations", () => {
      const initialStats = bloomFilter.getStats();

      bloomFilter.test("hello");
      bloomFilter.test("world");
      bloomFilter.test("nonexistent");

      const updatedStats = bloomFilter.getStats();
      expect(updatedStats.totalTests).toBe(initialStats.totalTests + 3);
      expect(updatedStats.positiveTests).toBeGreaterThan(0);
      expect(updatedStats.negativeTests).toBeGreaterThan(0);
    });

    it("should track bits set correctly", () => {
      const initialBitsSet = bloomFilter.getBitsSet();

      bloomFilter.insert("new_element");

      const updatedBitsSet = bloomFilter.getBitsSet();
      expect(updatedBitsSet).toBeGreaterThanOrEqual(initialBitsSet);
    });

    it("should calculate fill ratio", () => {
      const fillRatio = bloomFilter.getFillRatio();
      expect(fillRatio).toBeGreaterThanOrEqual(0);
      expect(fillRatio).toBeLessThanOrEqual(1);
    });
  });

  describe("Event Handling", () => {
    it("should handle events when debug is enabled", () => {
      const eventHandler = vi.fn();
      const debugFilter = new BloomFilter({
        enableDebug: true,
        eventHandlers: [eventHandler],
      });

      debugFilter.insert("test");
      debugFilter.test("test");

      expect(eventHandler).toHaveBeenCalled();
    });

    it("should not handle events when debug is disabled", () => {
      const eventHandler = vi.fn();
      const debugFilter = new BloomFilter({
        enableDebug: false,
        eventHandlers: [eventHandler],
      });

      debugFilter.insert("test");
      debugFilter.test("test");

      expect(eventHandler).not.toHaveBeenCalled();
    });

    it("should add and remove event handlers", () => {
      const eventHandler = vi.fn();
      const debugFilter = new BloomFilter({ enableDebug: true });

      debugFilter.addEventHandler(eventHandler);
      debugFilter.insert("test");
      expect(eventHandler).toHaveBeenCalled();

      debugFilter.removeEventHandler(eventHandler);
      debugFilter.insert("test2");
      expect(eventHandler).toHaveBeenCalledTimes(1); // Only called once
    });
  });

  describe("Serialization", () => {
    beforeEach(() => {
      bloomFilter.insert("hello");
      bloomFilter.insert("world");
      bloomFilter.insert("test");
    });

    it("should serialize the filter", () => {
      const serialized = bloomFilter.serialize();

      expect(serialized).toHaveProperty("version");
      expect(serialized).toHaveProperty("config");
      expect(serialized).toHaveProperty("bitArray");
      expect(serialized).toHaveProperty("metadata");
      expect(serialized.metadata.totalElements).toBe(3);
      expect(serialized.metadata.bitsSet).toBeGreaterThan(0);
    });

    it("should deserialize the filter", () => {
      const serialized = bloomFilter.serialize();
      const newFilter = new BloomFilter();

      const result = newFilter.deserialize(serialized);
      expect(result).toBe(true);
      expect(newFilter.size()).toBe(3);

      // Test that deserialized filter works correctly
      const testResult = newFilter.test("hello");
      expect(testResult.possiblyPresent).toBe(true);
    });

    it("should handle deserialization errors", () => {
      const invalidSerialized = {
        version: "1.0",
        config: {},
        bitArray: "invalid_base64",
        metadata: { totalElements: 0, bitsSet: 0, createdAt: Date.now() },
      };

      const newFilter = new BloomFilter();
      const result = newFilter.deserialize(invalidSerialized as any);
      expect(result).toBe(false);
    });
  });

  describe("Configuration", () => {
    it("should update configuration", () => {
      bloomFilter.updateConfig({ expectedElements: 2000 });

      // Configuration should be updated
      const stats = bloomFilter.getStats();
      expect(stats.bitArraySize).toBeGreaterThan(0);
    });

    it("should respect bit array size configuration", () => {
      const customFilter = new BloomFilter({
        config: {
          expectedElements: 100,
          falsePositiveRate: 0.01,
          bitArraySize: 1000,
        },
      });

      const stats = customFilter.getStats();
      expect(stats.bitArraySize).toBe(1000);
    });

    it("should respect hash functions configuration", () => {
      const customFilter = new BloomFilter({
        config: {
          expectedElements: 100,
          falsePositiveRate: 0.01,
          hashFunctions: 5,
        },
      });

      const stats = customFilter.getStats();
      expect(stats.hashFunctions).toBe(5);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty filter operations", () => {
      expect(bloomFilter.test("anything").possiblyPresent).toBe(false);
      expect(bloomFilter.getFalsePositiveRate()).toBe(0);
      expect(bloomFilter.getBitsSet()).toBe(0);
      expect(bloomFilter.getFillRatio()).toBe(0);
    });

    it("should handle single element", () => {
      bloomFilter.insert("single");

      expect(bloomFilter.size()).toBe(1);
      expect(bloomFilter.test("single").possiblyPresent).toBe(true);
      expect(bloomFilter.getBitsSet()).toBeGreaterThan(0);
    });

    it("should handle duplicate insertions", () => {
      bloomFilter.insert("duplicate");
      bloomFilter.insert("duplicate");

      expect(bloomFilter.size()).toBe(2);
      expect(bloomFilter.test("duplicate").possiblyPresent).toBe(true);
    });

    it("should clear the filter", () => {
      bloomFilter.insert("hello");
      bloomFilter.insert("world");
      expect(bloomFilter.size()).toBe(2);

      const result = bloomFilter.clear();
      expect(result.success).toBe(true);
      expect(bloomFilter.size()).toBe(0);
      expect(bloomFilter.isEmpty()).toBe(true);
      expect(bloomFilter.getBitsSet()).toBe(0);
    });

    it("should handle very long strings", () => {
      const longString = "a".repeat(1000);
      const result = bloomFilter.insert(longString);

      expect(result.success).toBe(true);
      expect(bloomFilter.test(longString).possiblyPresent).toBe(true);
    });

    it("should handle special characters", () => {
      const specialString = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
      const result = bloomFilter.insert(specialString);

      expect(result.success).toBe(true);
      expect(bloomFilter.test(specialString).possiblyPresent).toBe(true);
    });

    it("should handle unicode characters", () => {
      const unicodeString = "你好世界🌍";
      const result = bloomFilter.insert(unicodeString);

      expect(result.success).toBe(true);
      expect(bloomFilter.test(unicodeString).possiblyPresent).toBe(true);
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (
      description: string,
      elementCount: number,
      operation: (filter: BloomFilter, elements: string[]) => void
    ) => {
      it(`should perform ${description} with ${elementCount} elements`, () => {
        const benchmarkFilter = new BloomFilter({
          enableStats: true,
          config: {
            expectedElements: elementCount,
            falsePositiveRate: 0.01,
          },
        });
        const elements: string[] = [];

        // Generate test elements
        for (let i = 0; i < elementCount; i++) {
          elements.push(`element_${i}`);
        }

        const startTime = performance.now();
        operation(benchmarkFilter, elements);
        const endTime = performance.now();

        const executionTime = endTime - startTime;
        expect(executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - Elements: ${elementCount}`);
        // console.log(`  Execution Time: ${executionTime.toFixed(3)} ms`);
        // console.log(`  Stats:`, benchmarkFilter.getStats());
      });
    };

    runBenchmark("insertion", 100, (filter, elements) => {
      elements.forEach(element => filter.insert(element));
    });

    runBenchmark("membership testing", 100, (filter, elements) => {
      // First insert some elements
      elements.slice(0, 50).forEach(element => filter.insert(element));
      // Then test all elements
      elements.forEach(element => filter.test(element));
    });

    runBenchmark("batch insertion", 100, (filter, elements) => {
      filter.insertBatch(elements);
    });

    runBenchmark("batch testing", 100, (filter, elements) => {
      // First insert some elements
      elements.slice(0, 50).forEach(element => filter.insert(element));
      // Then test all elements in batch
      filter.testBatch(elements);
    });

    runBenchmark("large dataset insertion", 200, (filter, elements) => {
      elements.forEach(element => filter.insert(element));
    });

    runBenchmark("large dataset testing", 200, (filter, elements) => {
      // First insert some elements
      elements.slice(0, 100).forEach(element => filter.insert(element));
      // Then test all elements
      elements.forEach(element => filter.test(element));
    });
  });
});
