/**
 * Trie (Prefix Tree) Data Structure Core Implementation
 *
 * Implementation of the Trie (Prefix Tree) data structure with comprehensive
 * features including prefix search, autocomplete, fuzzy matching, and wildcard
 * support.
 *
 * Mathematical Theory:
 * A Trie is a tree data structure where each node represents a character
 * in a string. The path from root to any node represents a prefix of one
 * or more strings. This allows for efficient:
 * - Insertion: O(m) where m is string length
 * - Search: O(m) where m is string length
 * - Prefix search: O(m + k) where k is number of results
 * - Deletion: O(m) where m is string length
 *
 * Space Complexity: O(ALPHABET_SIZE * N * M) where N is number of strings
 * and M is average string length.
 *
 * @module algorithms/data-structures/trie
 */

import type {
  TrieNode,
  TrieConfig,
  TrieSearchResult,
  TriePrefixResult,
  TrieAutocompleteResult,
  TrieStats,
  TrieEvent,
  TrieEventHandler,
  TrieOptions,
  TriePerformanceMetrics,
  FuzzyMatchResult,
  WildcardMatchResult,
  TraversalOptions,
  TraversalResult,
  BatchOperationResult,
  TrieSerialization,
} from "./trie-types";

import { DEFAULT_TRIE_CONFIG, DEFAULT_TRIE_OPTIONS, TrieEventType } from "./trie-types";

/**
 * Trie (Prefix Tree) Data Structure Implementation
 *
 * Provides efficient string storage and retrieval with support for prefix
 * search, autocomplete, fuzzy matching, and wildcard operations.
 */
export class Trie {
  private root: TrieNode;
  private config: TrieConfig;
  private eventHandlers: TrieEventHandler[];
  private enableStats: boolean;
  private enableDebug: boolean;
  private stats: TrieStats;

  /**
   *
   * @param options
   * @example
   */
  constructor(options: Partial<TrieOptions> = {}) {
    const opts = { ...DEFAULT_TRIE_OPTIONS, ...options };

    this.config = { ...DEFAULT_TRIE_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableStats = opts.enableStats ?? true;
    this.enableDebug = opts.enableDebug ?? false;

    // Initialize root node
    this.root = this.createNode("", null);
    this.root.isEndOfWord = false;

    this.stats = {
      totalWords: 0,
      totalNodes: 1, // Root node
      averageWordLength: 0,
      maxDepth: 0,
      totalSearches: 0,
      totalInserts: 0,
      totalDeletes: 0,
      averageSearchTime: 0,
      memoryUsage: 0,
    };

    // Insert initial words if provided
    if (opts.initialWords && opts.initialWords.length > 0) {
      this.insertBatch(opts.initialWords);
    }
  }

  /**
   * Insert a word into the trie
   *
   * @param word The word to insert
   * @param data Optional data associated with the word
   * @returns True if insertion was successful
   * @example
   */
  insert(word: string, data?: any): boolean {
    const startTime = performance.now();

    try {
      const normalizedWord = this.normalizeWord(word);

      if (!this.config.allowEmptyStrings && normalizedWord.length === 0) {
        return false;
      }

      if (normalizedWord.length > this.config.maxDepth) {
        return false;
      }

      let currentNode = this.root;

      for (let i = 0; i < normalizedWord.length; i++) {
        const char = normalizedWord[i];

        if (!currentNode.children.has(char)) {
          const newNode = this.createNode(char, currentNode);
          currentNode.children.set(char, newNode);
          this.emitEvent(TrieEventType.NODE_CREATED, { node: newNode, char });
        }

        currentNode = currentNode.children.get(char)!;
      }

      // Mark as end of word and update data
      const wasAlreadyWord = currentNode.isEndOfWord;
      currentNode.isEndOfWord = true;
      currentNode.data = data;
      currentNode.frequency++;

      // Update statistics (only increment totalWords if it's a new word)
      if (!wasAlreadyWord) {
        this.stats.totalWords++;
      }
      this.stats.totalNodes = this.countNodes();
      this.stats.averageWordLength = this.calculateAverageWordLength();
      this.stats.maxDepth = Math.max(this.stats.maxDepth, normalizedWord.length);
      this.stats.totalInserts++;

      this.emitEvent(TrieEventType.WORD_INSERTED, { word: normalizedWord, data });

      return true;
    } catch (error) {
      return false;
    } finally {
      if (this.enableStats) {
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime =
          (this.stats.averageSearchTime * (this.stats.totalInserts - 1) + executionTime) / this.stats.totalInserts;
      }
    }
  }

  /**
   * Search for a word in the trie
   *
   * @param word The word to search for
   * @returns Search result
   * @example
   */
  search(word: string): TrieSearchResult {
    const startTime = performance.now();
    let nodesTraversed = 0;

    try {
      const normalizedWord = this.normalizeWord(word);

      if (!this.config.allowEmptyStrings && normalizedWord.length === 0) {
        return {
          found: false,
          word: null,
          data: null,
          frequency: 0,
          executionTime: performance.now() - startTime,
          nodesTraversed: 0,
        };
      }

      let currentNode = this.root;
      nodesTraversed++;

      for (let i = 0; i < normalizedWord.length; i++) {
        const char = normalizedWord[i];

        if (!currentNode.children.has(char)) {
          return {
            found: false,
            word: null,
            data: null,
            frequency: 0,
            executionTime: performance.now() - startTime,
            nodesTraversed,
          };
        }

        currentNode = currentNode.children.get(char)!;
        nodesTraversed++;
      }

      const found = currentNode.isEndOfWord;

      if (this.enableStats) {
        this.stats.totalSearches++;
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime =
          (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + executionTime) / this.stats.totalSearches;
      }

      this.emitEvent(TrieEventType.WORD_SEARCHED, { word: normalizedWord, found });

      return {
        found,
        word: found ? normalizedWord : null,
        data: found ? currentNode.data : null,
        frequency: found ? currentNode.frequency : 0,
        executionTime: performance.now() - startTime,
        nodesTraversed,
      };
    } catch (error) {
      return {
        found: false,
        word: null,
        data: null,
        frequency: 0,
        executionTime: performance.now() - startTime,
        nodesTraversed,
      };
    }
  }

  /**
   * Delete a word from the trie
   *
   * @param word The word to delete
   * @returns True if deletion was successful
   * @example
   */
  delete(word: string): boolean {
    const startTime = performance.now();

    try {
      const normalizedWord = this.normalizeWord(word);

      if (!this.config.allowEmptyStrings && normalizedWord.length === 0) {
        return false;
      }

      const result = this.deleteRecursive(this.root, normalizedWord, 0);

      // If deletion was successful (word was found and deleted)
      if (result.deleted) {
        this.stats.totalWords--;
        this.stats.totalNodes = this.countNodes();
        this.stats.averageWordLength = this.calculateAverageWordLength();
        this.stats.totalDeletes++;

        this.emitEvent(TrieEventType.WORD_DELETED, { word: normalizedWord });
        return true;
      }

      return false;
    } catch (error) {
      return false;
    } finally {
      if (this.enableStats) {
        const executionTime = performance.now() - startTime;
        this.stats.averageSearchTime =
          (this.stats.averageSearchTime * (this.stats.totalDeletes - 1) + executionTime) / this.stats.totalDeletes;
      }
    }
  }

  /**
   * Find all words with a given prefix
   *
   * @param prefix The prefix to search for
   * @returns Prefix search result
   * @example
   */
  findWordsWithPrefix(prefix: string): TriePrefixResult {
    const startTime = performance.now();
    let nodesTraversed = 0;

    try {
      const normalizedPrefix = this.normalizeWord(prefix);
      const words: string[] = [];
      const data: any[] = [];

      // Find the node corresponding to the prefix
      let currentNode = this.root;
      nodesTraversed++;

      for (let i = 0; i < normalizedPrefix.length; i++) {
        const char = normalizedPrefix[i];

        if (!currentNode.children.has(char)) {
          return {
            words: [],
            data: [],
            count: 0,
            executionTime: performance.now() - startTime,
            nodesTraversed,
          };
        }

        currentNode = currentNode.children.get(char)!;
        nodesTraversed++;
      }

      // Collect all words from this node
      this.collectWords(currentNode, normalizedPrefix, words, data, nodesTraversed);

      this.emitEvent(TrieEventType.PREFIX_SEARCHED, { prefix: normalizedPrefix, count: words.length });

      return {
        words,
        data,
        count: words.length,
        executionTime: performance.now() - startTime,
        nodesTraversed,
      };
    } catch (error) {
      return {
        words: [],
        data: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesTraversed,
      };
    }
  }

  /**
   * Get autocomplete suggestions for a prefix
   *
   * @param prefix The prefix to autocomplete
   * @param maxSuggestions Maximum number of suggestions
   * @returns Autocomplete result
   * @example
   */
  autocomplete(prefix: string, maxSuggestions: number = 10): TrieAutocompleteResult {
    const startTime = performance.now();
    let nodesTraversed = 0;

    try {
      const normalizedPrefix = this.normalizeWord(prefix);
      const suggestions: Array<{ word: string; data: any; frequency: number; score: number }> = [];

      // Find the node corresponding to the prefix
      let currentNode = this.root;
      nodesTraversed++;

      for (let i = 0; i < normalizedPrefix.length; i++) {
        const char = normalizedPrefix[i];

        if (!currentNode.children.has(char)) {
          return {
            suggestions: [],
            count: 0,
            executionTime: performance.now() - startTime,
            nodesTraversed,
          };
        }

        currentNode = currentNode.children.get(char)!;
        nodesTraversed++;
      }

      // Collect suggestions with scoring
      this.collectAutocompleteSuggestions(currentNode, normalizedPrefix, suggestions, maxSuggestions, nodesTraversed);

      // Sort by score (frequency + length bonus)
      suggestions.sort((a, b) => b.score - a.score);

      this.emitEvent(TrieEventType.AUTCOMPLETE_PERFORMED, { prefix: normalizedPrefix, count: suggestions.length });

      return {
        suggestions: suggestions.slice(0, maxSuggestions),
        count: suggestions.length,
        executionTime: performance.now() - startTime,
        nodesTraversed,
      };
    } catch (error) {
      return {
        suggestions: [],
        count: 0,
        executionTime: performance.now() - startTime,
        nodesTraversed,
      };
    }
  }

  /**
   * Find fuzzy matches for a word
   *
   * @param word The word to find fuzzy matches for
   * @param maxDistance Maximum edit distance
   * @returns Array of fuzzy match results
   * @example
   */
  findFuzzyMatches(word: string, maxDistance?: number): FuzzyMatchResult[] {
    if (!this.config.enableFuzzyMatching) {
      return [];
    }

    const normalizedWord = this.normalizeWord(word);
    const maxEditDistance = maxDistance !== undefined ? maxDistance : this.config.maxEditDistance;
    const matches: FuzzyMatchResult[] = [];

    this.findFuzzyMatchesRecursive(this.root, "", normalizedWord, maxEditDistance, matches);

    // Sort by similarity score
    matches.sort((a, b) => b.similarity - a.similarity);

    return matches;
  }

  /**
   * Find wildcard matches for a pattern
   *
   * @param pattern The pattern to match (with wildcards)
   * @returns Array of wildcard match results
   * @example
   */
  findWildcardMatches(pattern: string): WildcardMatchResult[] {
    if (!this.config.enableWildcards) {
      return [];
    }

    const normalizedPattern = this.normalizeWord(pattern);
    const matches: WildcardMatchResult[] = [];

    this.findWildcardMatchesRecursive(this.root, "", normalizedPattern, 0, matches);

    return matches;
  }

  /**
   * Get all words in the trie
   *
   * @returns Array of all words
   * @example
   */
  getAllWords(): string[] {
    const words: string[] = [];
    const data: any[] = [];

    this.collectWords(this.root, "", words, data, 0);

    return words;
  }

  /**
   * Get the size of the trie (number of words)
   *
   * @returns Number of words in the trie
   * @example
   */
  size(): number {
    return this.stats.totalWords;
  }

  /**
   * Check if the trie is empty
   *
   * @returns True if the trie is empty
   * @example
   */
  isEmpty(): boolean {
    return this.stats.totalWords === 0;
  }

  /**
   * Clear all words from the trie
   * @example
   */
  clear(): void {
    this.root.children.clear();
    this.root.isEndOfWord = false;
    this.root.data = null;
    this.root.frequency = 0;

    this.stats = {
      totalWords: 0,
      totalNodes: 1,
      averageWordLength: 0,
      maxDepth: 0,
      totalSearches: 0,
      totalInserts: 0,
      totalDeletes: 0,
      averageSearchTime: 0,
      memoryUsage: 0,
    };

    this.emitEvent(TrieEventType.CLEAR_PERFORMED, {});
  }

  /**
   * Insert multiple words in batch
   *
   * @param words Array of words to insert
   * @returns Batch operation result
   * @example
   */
  insertBatch(words: string[]): BatchOperationResult {
    const startTime = performance.now();
    const results: boolean[] = [];
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    for (const word of words) {
      try {
        const result = this.insert(word);
        results.push(result);
        if (result) {
          successful++;
        } else {
          failed++;
          errors.push(`Failed to insert word: ${word}`);
        }
      } catch (error) {
        results.push(false);
        failed++;
        errors.push(`Error inserting word ${word}: ${error}`);
      }
    }

    return {
      success: failed === 0,
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results,
    };
  }

  /**
   * Traverse the trie with custom options
   *
   * @param options Traversal options
   * @returns Traversal result
   * @example
   */
  traverse(options: Partial<TraversalOptions> = {}): TraversalResult {
    const startTime = performance.now();
    const opts: TraversalOptions = {
      includeIntermediate: false,
      maxDepth: this.config.maxDepth,
      sorted: true,
      ...options,
    };

    const nodes: TrieNode[] = [];
    const words: string[] = [];
    const nodesVisited = { value: 0 };

    this.traverseRecursive(this.root, "", nodes, words, nodesVisited, opts);

    return {
      nodes,
      words,
      nodesVisited: nodesVisited.value,
      executionTime: performance.now() - startTime,
    };
  }

  /**
   * Serialize the trie to a JSON format
   *
   * @returns Serialized trie data
   * @example
   */
  serialize(): TrieSerialization {
    const data = this.serializeNode(this.root);

    return {
      version: "1.0",
      config: this.config,
      data,
      metadata: {
        totalWords: this.stats.totalWords,
        totalNodes: this.stats.totalNodes,
        maxDepth: this.stats.maxDepth,
        createdAt: Date.now(),
      },
    };
  }

  /**
   * Deserialize a trie from JSON format
   *
   * @param serialized Serialized trie data
   * @returns True if deserialization was successful
   * @example
   */
  deserialize(serialized: TrieSerialization): boolean {
    try {
      this.clear();
      this.config = serialized.config;
      this.deserializeNode(this.root, serialized.data);

      // Recalculate statistics
      this.stats.totalWords = serialized.metadata.totalWords;
      this.stats.totalNodes = serialized.metadata.totalNodes;
      this.stats.maxDepth = serialized.metadata.maxDepth;

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Add event handler
   * @param handler
   * @example
   */
  addEventHandler(handler: TrieEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   * @param handler
   * @example
   */
  removeEventHandler(handler: TrieEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Get current statistics
   * @example
   */
  getStats(): TrieStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   * @example
   */
  getPerformanceMetrics(): TriePerformanceMetrics {
    const performanceScore = Math.min(
      100,
      Math.max(
        0,
        Math.max(0, 1 - this.stats.averageSearchTime / 10) * 40 +
          Math.max(0, 1 - this.stats.totalNodes / 10000) * 30 +
          Math.max(0, 1 - this.stats.memoryUsage / 1000000) * 30
      )
    );

    return {
      memoryUsage: this.stats.memoryUsage,
      averageSearchTime: this.stats.averageSearchTime,
      averageInsertTime: this.stats.averageSearchTime, // Using same value for now
      averageDeleteTime: this.stats.averageSearchTime, // Using same value for now
      performanceScore,
      compressionRatio: 0, // TODO: Implement compression ratio calculation
    };
  }

  /**
   * Update configuration
   * @param newConfig
   * @example
   */
  updateConfig(newConfig: Partial<TrieConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Private helper methods

  /**
   * Create a new trie node
   * @param char
   * @param parent
   * @example
   */
  private createNode(char: string, parent: TrieNode | null): TrieNode {
    return {
      char,
      isEndOfWord: false,
      children: new Map(),
      parent,
      data: null,
      frequency: 0,
      depth: parent ? parent.depth + 1 : 0,
    };
  }

  /**
   * Normalize a word based on configuration
   * @param word
   * @example
   */
  private normalizeWord(word: string): string {
    if (!this.config.caseSensitive) {
      return word.toLowerCase();
    }
    return word;
  }

  /**
   * Recursive delete helper
   * @param node
   * @param word
   * @param index
   * @example
   */
  private deleteRecursive(node: TrieNode, word: string, index: number): { deleted: boolean; shouldCleanup: boolean } {
    if (index === word.length) {
      if (!node.isEndOfWord) {
        return { deleted: false, shouldCleanup: false }; // Word not found
      }

      // Mark word as deleted
      node.isEndOfWord = false;
      node.data = null;
      node.frequency = 0;

      // Clean up node if it has no children (and is not root)
      const shouldDeleteNode = node.children.size === 0 && node !== this.root;
      return { deleted: true, shouldCleanup: shouldDeleteNode };
    }

    const char = word[index];
    const child = node.children.get(char);

    if (!child) {
      return { deleted: false, shouldCleanup: false }; // Word not found
    }

    const result = this.deleteRecursive(child, word, index + 1);

    // If word was found and deleted, clean up the child node if needed
    if (result.deleted && result.shouldCleanup) {
      node.children.delete(char);
      this.emitEvent(TrieEventType.NODE_DELETED, { node: child, char });

      // If current node is not end of word and has no children, it can also be deleted
      return {
        deleted: true,
        shouldCleanup: !node.isEndOfWord && node.children.size === 0 && node !== this.root,
      };
    }

    // Return deletion result (even if cleanup not needed)
    return result;
  }

  /**
   * Collect all words from a node
   * @param node
   * @param prefix
   * @param words
   * @param data
   * @param nodesTraversed
   * @example
   */
  private collectWords(node: TrieNode, prefix: string, words: string[], data: any[], nodesTraversed: number): void {
    if (node.isEndOfWord) {
      words.push(prefix);
      data.push(node.data);
    }

    const children = Array.from(node.children.entries());
    if (this.config.trackFrequency) {
      children.sort((a, b) => b[1].frequency - a[1].frequency);
    }

    for (const [char, child] of children) {
      this.collectWords(child, prefix + char, words, data, nodesTraversed + 1);
    }
  }

  /**
   * Collect autocomplete suggestions
   * @param node
   * @param prefix
   * @param suggestions
   * @param maxSuggestions
   * @param nodesTraversed
   * @example
   */
  private collectAutocompleteSuggestions(
    node: TrieNode,
    prefix: string,
    suggestions: Array<{ word: string; data: any; frequency: number; score: number }>,
    maxSuggestions: number,
    nodesTraversed: number
  ): void {
    if (suggestions.length >= maxSuggestions) {
      return;
    }

    if (node.isEndOfWord) {
      const score = this.calculateAutocompleteScore(prefix, node.frequency);
      suggestions.push({
        word: prefix,
        data: node.data,
        frequency: node.frequency,
        score,
      });
    }

    const children = Array.from(node.children.entries());
    if (this.config.trackFrequency) {
      children.sort((a, b) => b[1].frequency - a[1].frequency);
    }

    for (const [char, child] of children) {
      this.collectAutocompleteSuggestions(child, prefix + char, suggestions, maxSuggestions, nodesTraversed + 1);
    }
  }

  /**
   * Calculate autocomplete score
   * @param word
   * @param frequency
   * @example
   */
  private calculateAutocompleteScore(word: string, frequency: number): number {
    // Base score from frequency
    let score = frequency;

    // Bonus for shorter words (more likely to be what user wants)
    score += Math.max(0, 10 - word.length);

    // Bonus for exact prefix matches
    score += 5;

    return score;
  }

  /**
   * Find fuzzy matches recursively
   * @param node
   * @param currentWord
   * @param targetWord
   * @param maxDistance
   * @param matches
   * @example
   */
  private findFuzzyMatchesRecursive(
    node: TrieNode,
    currentWord: string,
    targetWord: string,
    maxDistance: number,
    matches: FuzzyMatchResult[]
  ): void {
    if (node.isEndOfWord) {
      const editDistance = this.calculateEditDistance(currentWord, targetWord);
      if (editDistance <= maxDistance) {
        const similarity = 1 - editDistance / Math.max(currentWord.length, targetWord.length);
        matches.push({
          word: currentWord,
          editDistance,
          similarity,
          data: node.data,
        });
      }
    }

    for (const [char, child] of node.children.entries()) {
      this.findFuzzyMatchesRecursive(child, currentWord + char, targetWord, maxDistance, matches);
    }
  }

  /**
   * Find wildcard matches recursively
   * @param node
   * @param currentWord
   * @param pattern
   * @param patternIndex
   * @param matches
   * @example
   */
  private findWildcardMatchesRecursive(
    node: TrieNode,
    currentWord: string,
    pattern: string,
    patternIndex: number,
    matches: WildcardMatchResult[]
  ): void {
    if (patternIndex === pattern.length) {
      if (node.isEndOfWord) {
        matches.push({
          word: currentWord,
          pattern,
          data: node.data,
        });
      }
      return;
    }

    const currentChar = pattern[patternIndex];

    if (currentChar === this.config.wildcardChar) {
      // Wildcard matches any character
      for (const [char, child] of node.children.entries()) {
        this.findWildcardMatchesRecursive(child, currentWord + char, pattern, patternIndex + 1, matches);
      }
    } else {
      // Regular character
      const child = node.children.get(currentChar);
      if (child) {
        this.findWildcardMatchesRecursive(child, currentWord + currentChar, pattern, patternIndex + 1, matches);
      }
    }
  }

  /**
   * Calculate edit distance between two strings
   * @param str1
   * @param str2
   * @example
   */
  private calculateEditDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
    }

    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Count total nodes in the trie
   * @example
   */
  private countNodes(): number {
    const count = { value: 0 };
    this.countNodesRecursive(this.root, count);
    return count.value;
  }

  /**
   * Recursively count nodes
   * @param node
   * @param count
   * @param count.value
   * @example
   */
  private countNodesRecursive(node: TrieNode, count: { value: number }): void {
    count.value++;
    for (const child of node.children.values()) {
      this.countNodesRecursive(child, count);
    }
  }

  /**
   * Calculate average word length
   * @example
   */
  private calculateAverageWordLength(): number {
    const words = this.getAllWords();
    if (words.length === 0) return 0;

    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return totalLength / words.length;
  }

  /**
   * Traverse recursively
   * @param node
   * @param currentWord
   * @param nodes
   * @param words
   * @param nodesVisited
   * @param nodesVisited.value
   * @param options
   * @example
   */
  private traverseRecursive(
    node: TrieNode,
    currentWord: string,
    nodes: TrieNode[],
    words: string[],
    nodesVisited: { value: number },
    options: TraversalOptions
  ): void {
    nodesVisited.value++;

    if (options.includeIntermediate || node.isEndOfWord) {
      nodes.push(node);
    }

    if (node.isEndOfWord) {
      words.push(currentWord);
    }

    const children = Array.from(node.children.entries());
    if (options.sorted) {
      children.sort((a, b) => a[0].localeCompare(b[0]));
    }

    for (const [char, child] of children) {
      if (child.depth <= options.maxDepth) {
        this.traverseRecursive(child, currentWord + char, nodes, words, nodesVisited, options);
      }
    }
  }

  /**
   * Serialize a node to JSON
   * @param node
   * @example
   */
  private serializeNode(node: TrieNode): any {
    const serialized: any = {
      char: node.char,
      isEndOfWord: node.isEndOfWord,
      data: node.data,
      frequency: node.frequency,
      children: {},
    };

    for (const [char, child] of node.children.entries()) {
      serialized.children[char] = this.serializeNode(child);
    }

    return serialized;
  }

  /**
   * Deserialize a node from JSON
   * @param node
   * @param data
   * @example
   */
  private deserializeNode(node: TrieNode, data: any): void {
    node.char = data.char;
    node.isEndOfWord = data.isEndOfWord;
    node.data = data.data;
    node.frequency = data.frequency;

    node.children.clear();
    for (const [char, childData] of Object.entries(data.children)) {
      const child = this.createNode(char, node);
      this.deserializeNode(child, childData);
      node.children.set(char, child);
    }
  }

  /**
   * Emit event to registered handlers
   * @param type
   * @param data
   * @example
   */
  private emitEvent(type: TrieEventType, data?: any): void {
    if (!this.enableDebug) return;

    const event: TrieEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in Trie event handler:", error);
      }
    }
  }
}
