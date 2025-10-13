import { describe, it, expect, beforeEach } from "vitest";
import { Trie } from "../../data-structures/trie/trie-core";

describe("Trie Basic Functionality", () => {
  let trie: Trie;

  beforeEach(() => {
    trie = new Trie();
  });

  describe("Core Operations", () => {
    it("should insert and search words", () => {
      trie.insert("hello");
      trie.insert("world");
      
      expect(trie.search("hello").found).toBe(true);
      expect(trie.search("world").found).toBe(true);
      expect(trie.search("test").found).toBe(false);
    });

    it("should find words with prefix", () => {
      trie.insert("hello");
      trie.insert("help");
      trie.insert("world");
      
      const result = trie.findWordsWithPrefix("hel");
      expect(result.words).toContain("hello");
      expect(result.words).toContain("help");
      expect(result.words).not.toContain("world");
    });

    it("should provide autocomplete suggestions", () => {
      trie.insert("hello");
      trie.insert("help");
      trie.insert("world");
      
      const suggestions = trie.autocomplete("hel", 5);
      expect(suggestions.suggestions.length).toBeGreaterThan(0);
      expect(suggestions.suggestions.some(s => s.word === "hello")).toBe(true);
    });

    it("should track size correctly", () => {
      expect(trie.size()).toBe(0);
      expect(trie.isEmpty()).toBe(true);
      
      trie.insert("hello");
      expect(trie.size()).toBe(1);
      expect(trie.isEmpty()).toBe(false);
    });

    it("should clear all words", () => {
      trie.insert("hello");
      trie.insert("world");
      expect(trie.size()).toBe(2);
      
      trie.clear();
      expect(trie.size()).toBe(0);
      expect(trie.isEmpty()).toBe(true);
    });
  });

  describe("Batch Operations", () => {
    it("should insert multiple words in batch", () => {
      const words = ["hello", "world", "test", "example"];
      const result = trie.insertBatch(words);
      
      expect(result.successful).toBe(4);
      expect(result.failed).toBe(0);
      expect(trie.size()).toBe(4);
    });
  });

  describe("Configuration", () => {
    it("should respect case sensitivity", () => {
      const caseSensitiveTrie = new Trie({
        config: { caseSensitive: true }
      });
      
      caseSensitiveTrie.insert("Hello");
      expect(caseSensitiveTrie.search("hello").found).toBe(false);
      expect(caseSensitiveTrie.search("Hello").found).toBe(true);
    });
  });
});
