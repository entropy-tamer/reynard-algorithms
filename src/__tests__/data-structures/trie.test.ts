/**
 * @file Trie tests
 */
/* eslint-disable max-lines, max-lines-per-function */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Trie } from "../../data-structures/basic/trie/trie-core";

describe("Trie (Prefix Tree) Data Structure", () => {
  let trie: Trie;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    trie = new Trie();
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      expect(trie).toBeInstanceOf(Trie);
      expect(trie.isEmpty()).toBe(true);
      expect(trie.size()).toBe(0);
    });

    it("should initialize with custom configuration", () => {
      const customTrie = new Trie({
        config: {
          caseSensitive: true,
          maxDepth: 50,
          enableFuzzyMatching: true,
        },
        enableStats: true,
        enableDebug: true,
      });
      expect(customTrie).toBeInstanceOf(Trie);
    });

    it("should initialize with initial words", () => {
      const initialWords = ["hello", "world", "test"];
      const trieWithWords = new Trie({ initialWords });
      expect(trieWithWords.size()).toBe(3);
      expect(trieWithWords.search("hello").found).toBe(true);
      expect(trieWithWords.search("world").found).toBe(true);
      expect(trieWithWords.search("test").found).toBe(true);
    });
  });

  describe("Basic Operations", () => {
    it("should insert a word successfully", () => {
      const result = trie.insert("hello");
      expect(result).toBe(true);
      expect(trie.size()).toBe(1);
      expect(trie.isEmpty()).toBe(false);
    });

    it("should insert a word with data", () => {
      const data = { id: 1, type: "greeting" };
      const result = trie.insert("hello", data);
      expect(result).toBe(true);

      const searchResult = trie.search("hello");
      expect(searchResult.found).toBe(true);
      expect(searchResult.data).toEqual(data);
    });

    it("should search for an existing word", () => {
      trie.insert("hello");
      const result = trie.search("hello");

      expect(result.found).toBe(true);
      expect(result.word).toBe("hello");
      expect(result.frequency).toBe(1);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should search for a non-existing word", () => {
      trie.insert("hello");
      const result = trie.search("world");

      expect(result.found).toBe(false);
      expect(result.word).toBeNull();
      expect(result.data).toBeNull();
      expect(result.frequency).toBe(0);
    });

    it("should delete an existing word", () => {
      trie.insert("hello");
      expect(trie.size()).toBe(1);

      const result = trie.delete("hello");
      expect(result).toBe(true);
      expect(trie.size()).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });

    it("should delete a non-existing word", () => {
      trie.insert("hello");
      const result = trie.delete("world");
      expect(result).toBe(false);
      expect(trie.size()).toBe(1);
    });

    it("should handle case sensitivity", () => {
      const caseSensitiveTrie = new Trie({
        config: { caseSensitive: true },
      });

      caseSensitiveTrie.insert("Hello");
      expect(caseSensitiveTrie.search("hello").found).toBe(false);
      expect(caseSensitiveTrie.search("Hello").found).toBe(true);
    });

    it("should handle case insensitivity by default", () => {
      trie.insert("Hello");
      expect(trie.search("hello").found).toBe(true);
      expect(trie.search("HELLO").found).toBe(true);
      expect(trie.search("HeLlO").found).toBe(true);
    });
  });

  describe("Prefix Search", () => {
    beforeEach(() => {
      trie.insert("hello");
      trie.insert("help");
      trie.insert("helicopter");
      trie.insert("world");
      trie.insert("work");
      trie.insert("worker");
    });

    it("should find words with a given prefix", () => {
      const result = trie.findWordsWithPrefix("hel");

      expect(result.words).toContain("hello");
      expect(result.words).toContain("help");
      expect(result.words).toContain("helicopter");
      expect(result.words).not.toContain("world");
      expect(result.count).toBe(3);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should return empty result for non-existing prefix", () => {
      const result = trie.findWordsWithPrefix("xyz");

      expect(result.words).toEqual([]);
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("should return all words for empty prefix", () => {
      const result = trie.findWordsWithPrefix("");

      expect(result.words).toContain("hello");
      expect(result.words).toContain("help");
      expect(result.words).toContain("helicopter");
      expect(result.words).toContain("world");
      expect(result.words).toContain("work");
      expect(result.words).toContain("worker");
      expect(result.count).toBe(6);
    });

    it("should include data with prefix search results", () => {
      trie.insert("test", { id: 1 });
      trie.insert("testing", { id: 2 });

      const result = trie.findWordsWithPrefix("test");

      expect(result.words).toContain("test");
      expect(result.words).toContain("testing");
      expect(result.data).toContainEqual({ id: 1 });
      expect(result.data).toContainEqual({ id: 2 });
    });
  });

  describe("Autocomplete", () => {
    beforeEach(() => {
      trie.insert("hello", { frequency: 5 });
      trie.insert("help", { frequency: 3 });
      trie.insert("helicopter", { frequency: 1 });
      trie.insert("world", { frequency: 2 });
      trie.insert("work", { frequency: 4 });
      trie.insert("worker", { frequency: 2 });
    });

    it("should provide autocomplete suggestions", () => {
      const result = trie.autocomplete("hel", 5);

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeLessThanOrEqual(5);
      expect(result.count).toBeGreaterThan(0);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should limit suggestions to maxSuggestions", () => {
      const result = trie.autocomplete("", 3);

      expect(result.suggestions.length).toBeLessThanOrEqual(3);
    });

    it("should return empty suggestions for non-existing prefix", () => {
      const result = trie.autocomplete("xyz", 5);

      expect(result.suggestions).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("should include frequency and score in suggestions", () => {
      const result = trie.autocomplete("hel", 5);

      if (result.suggestions.length > 0) {
        const suggestion = result.suggestions[0];
        expect(suggestion).toHaveProperty("word");
        expect(suggestion).toHaveProperty("frequency");
        expect(suggestion).toHaveProperty("score");
        expect(suggestion).toHaveProperty("data");
      }
    });
  });

  describe("Fuzzy Matching", () => {
    beforeEach(() => {
      const fuzzyTrie = new Trie({
        config: { enableFuzzyMatching: true, maxEditDistance: 2 },
      });
      trie = fuzzyTrie;

      trie.insert("hello");
      trie.insert("help");
      trie.insert("world");
      trie.insert("work");
    });

    it("should find fuzzy matches", () => {
      const matches = trie.findFuzzyMatches("helo", 1);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toHaveProperty("word");
      expect(matches[0]).toHaveProperty("editDistance");
      expect(matches[0]).toHaveProperty("similarity");
      expect(matches[0].editDistance).toBeLessThanOrEqual(1);
    });

    it("should respect max distance parameter", () => {
      const matches = trie.findFuzzyMatches("helo", 0);

      expect(matches.length).toBe(0);
    });

    it("should return matches sorted by similarity", () => {
      const matches = trie.findFuzzyMatches("helo", 2);

      if (matches.length > 1) {
        expect(matches[0].similarity).toBeGreaterThanOrEqual(matches[1].similarity);
      }
    });
  });

  describe("Wildcard Matching", () => {
    beforeEach(() => {
      const wildcardTrie = new Trie({
        config: { enableWildcards: true, wildcardChar: "*" },
      });
      trie = wildcardTrie;

      trie.insert("hello");
      trie.insert("help");
      trie.insert("world");
      trie.insert("work");
    });

    it("should find wildcard matches", () => {
      const matches = trie.findWildcardMatches("hel*");

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toHaveProperty("word");
      expect(matches[0]).toHaveProperty("pattern");
      expect(matches[0].pattern).toBe("hel*");
    });

    it("should handle multiple wildcards", () => {
      const matches = trie.findWildcardMatches("h*l*");

      expect(matches.length).toBeGreaterThan(0);
      matches.forEach(match => {
        expect(match.word).toMatch(/^h.*l.*$/);
      });
    });
  });

  describe("Batch Operations", () => {
    it("should insert multiple words in batch", () => {
      const words = ["hello", "world", "test", "batch"];
      const result = trie.insertBatch(words);

      expect(result.successful).toBe(4);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(trie.size()).toBe(4);
    });

    it("should handle batch insert errors", () => {
      const words = ["hello", "", "test"]; // Empty string should fail
      const result = trie.insertBatch(words);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });

  describe("Traversal", () => {
    beforeEach(() => {
      trie.insert("hello");
      trie.insert("help");
      trie.insert("world");
    });

    it("should traverse all nodes", () => {
      const result = trie.traverse();

      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.words.length).toBe(3);
      expect(result.nodesVisited).toBeGreaterThan(0);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should traverse with custom options", () => {
      const result = trie.traverse({
        includeIntermediate: true,
        maxDepth: 5,
        sorted: true,
      });

      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.words.length).toBe(3);
    });

    it("should get all words", () => {
      const words = trie.getAllWords();

      expect(words).toContain("hello");
      expect(words).toContain("help");
      expect(words).toContain("world");
      expect(words.length).toBe(3);
    });
  });

  describe("Serialization", () => {
    beforeEach(() => {
      trie.insert("hello", { id: 1 });
      trie.insert("world", { id: 2 });
    });

    it("should serialize the trie", () => {
      const serialized = trie.serialize();

      expect(serialized).toHaveProperty("version");
      expect(serialized).toHaveProperty("config");
      expect(serialized).toHaveProperty("data");
      expect(serialized).toHaveProperty("metadata");
      expect(serialized.metadata.totalWords).toBe(2);
    });

    it("should deserialize the trie", () => {
      const serialized = trie.serialize();
      const newTrie = new Trie();

      const result = newTrie.deserialize(serialized);
      expect(result).toBe(true);
      expect(newTrie.size()).toBe(2);
      expect(newTrie.search("hello").found).toBe(true);
      expect(newTrie.search("world").found).toBe(true);
    });
  });

  describe("Statistics and Performance", () => {
    beforeEach(() => {
      const statsTrie = new Trie({ enableStats: true });
      trie = statsTrie;

      trie.insert("hello");
      trie.insert("help");
      trie.insert("world");
    });

    it("should track statistics", () => {
      const stats = trie.getStats();

      expect(stats.totalWords).toBe(3);
      expect(stats.totalNodes).toBeGreaterThan(0);
      expect(stats.averageWordLength).toBeGreaterThan(0);
      expect(stats.maxDepth).toBeGreaterThan(0);
      expect(stats.totalInserts).toBe(3);
    });

    it("should provide performance metrics", () => {
      const metrics = trie.getPerformanceMetrics();

      expect(metrics).toHaveProperty("memoryUsage");
      expect(metrics).toHaveProperty("averageSearchTime");
      expect(metrics).toHaveProperty("performanceScore");
      expect(metrics.performanceScore).toBeGreaterThanOrEqual(0);
      expect(metrics.performanceScore).toBeLessThanOrEqual(100);
    });

    it("should update statistics on operations", () => {
      const initialStats = trie.getStats();

      trie.search("hello");
      trie.delete("help");

      const updatedStats = trie.getStats();
      expect(updatedStats.totalSearches).toBe(initialStats.totalSearches + 1);
      expect(updatedStats.totalDeletes).toBe(initialStats.totalDeletes + 1);
      expect(updatedStats.totalWords).toBe(initialStats.totalWords - 1);
    });
  });

  describe("Event Handling", () => {
    it("should handle events when debug is enabled", () => {
      const eventHandler = vi.fn();
      const debugTrie = new Trie({
        enableDebug: true,
        eventHandlers: [eventHandler],
      });

      debugTrie.insert("test");
      debugTrie.search("test");

      expect(eventHandler).toHaveBeenCalled();
    });

    it("should not handle events when debug is disabled", () => {
      const eventHandler = vi.fn();
      const debugTrie = new Trie({
        enableDebug: false,
        eventHandlers: [eventHandler],
      });

      debugTrie.insert("test");
      debugTrie.search("test");

      expect(eventHandler).not.toHaveBeenCalled();
    });

    it("should add and remove event handlers", () => {
      const eventHandler = vi.fn();
      const debugTrie = new Trie({ enableDebug: true });

      debugTrie.addEventHandler(eventHandler);
      debugTrie.insert("test");
      const firstCallCount = eventHandler.mock.calls.length;
      expect(firstCallCount).toBeGreaterThan(0); // Should be called (NODE_CREATED events + WORD_INSERTED)

      debugTrie.removeEventHandler(eventHandler);
      debugTrie.insert("test2");
      // Handler should not be called after removal
      expect(eventHandler).toHaveBeenCalledTimes(firstCallCount); // Same number of calls as before removal
    });
  });

  describe("Configuration", () => {
    it("should update configuration", () => {
      trie.updateConfig({ caseSensitive: true });

      trie.insert("Hello");
      expect(trie.search("hello").found).toBe(false);
      expect(trie.search("Hello").found).toBe(true);
    });

    it("should respect max depth configuration", () => {
      const limitedTrie = new Trie({
        config: { maxDepth: 3 },
      });

      expect(limitedTrie.insert("abc")).toBe(true); // 3 chars (at max depth)
      expect(limitedTrie.insert("hello")).toBe(false); // 5 chars (exceeds max depth)
      expect(limitedTrie.insert("a".repeat(10))).toBe(false); // 10 chars (exceeds max depth)
    });

    it("should respect empty string configuration", () => {
      const noEmptyTrie = new Trie({
        config: { allowEmptyStrings: false },
      });

      expect(noEmptyTrie.insert("")).toBe(false);
      expect(noEmptyTrie.search("").found).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty trie operations", () => {
      expect(trie.search("anything").found).toBe(false);
      expect(trie.delete("anything")).toBe(false);
      expect(trie.findWordsWithPrefix("any").count).toBe(0);
      expect(trie.autocomplete("any", 5).count).toBe(0);
    });

    it("should handle single character words", () => {
      trie.insert("a");
      trie.insert("b");

      expect(trie.search("a").found).toBe(true);
      expect(trie.search("b").found).toBe(true);
      expect(trie.size()).toBe(2);
    });

    it("should handle duplicate insertions", () => {
      trie.insert("hello");
      trie.insert("hello");

      expect(trie.size()).toBe(1);
      expect(trie.search("hello").frequency).toBe(2);
    });

    it("should clear the trie", () => {
      trie.insert("hello");
      trie.insert("world");
      expect(trie.size()).toBe(2);

      trie.clear();
      expect(trie.size()).toBe(0);
      expect(trie.isEmpty()).toBe(true);
      expect(trie.search("hello").found).toBe(false);
    });

    it("should handle very long words", () => {
      const longWord = "a".repeat(1000);
      const result = trie.insert(longWord);

      expect(result).toBe(true);
      expect(trie.search(longWord).found).toBe(true);
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (
      description: string,
      wordCount: number,
      wordLength: number,
      operation: (trie: Trie, words: string[]) => void
    ) => {
      it(`should perform ${description} with ${wordCount} words of length ${wordLength}`, () => {
        const benchmarkTrie = new Trie({ enableStats: true });
        const words: string[] = [];

        // Generate test words
        for (let i = 0; i < wordCount; i++) {
          const word = Math.random()
            .toString(36)
            .substring(2, 2 + wordLength);
          words.push(word);
          benchmarkTrie.insert(word);
        }

        const startTime = performance.now();
        operation(benchmarkTrie, words);
        const endTime = performance.now();

        const executionTime = endTime - startTime;
        expect(executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - Words: ${wordCount}, Length: ${wordLength}`);
        // console.log(`  Execution Time: ${executionTime.toFixed(3)} ms`);
        // console.log(`  Stats:`, benchmarkTrie.getStats());
      });
    };

    runBenchmark("insertion", 100, 5, (trie, words) => {
      words.forEach(word => trie.insert(word + "_new"));
    });

    runBenchmark("search", 100, 5, (trie, words) => {
      words.forEach(word => trie.search(word));
    });

    runBenchmark("prefix search", 100, 5, (trie, words) => {
      words.forEach(word => trie.findWordsWithPrefix(word.substring(0, 2)));
    });

    runBenchmark("autocomplete", 100, 5, (trie, words) => {
      words.forEach(word => trie.autocomplete(word.substring(0, 2), 5));
    });

    // Reduced dataset size to prevent memory issues
    runBenchmark("medium dataset insertion", 200, 8, (trie, words) => {
      words.forEach(word => trie.insert(word + "_medium"));
    });

    runBenchmark("medium dataset search", 200, 8, (trie, words) => {
      words.forEach(word => trie.search(word));
    });
  });
});
