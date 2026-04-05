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
import type { TrieConfig, TrieSearchResult, TriePrefixResult, TrieAutocompleteResult, TrieStats, TrieEventHandler, TrieOptions, TriePerformanceMetrics, FuzzyMatchResult, WildcardMatchResult, TraversalOptions, TraversalResult, BatchOperationResult, TrieSerialization } from "./trie-types";
/**
 * Trie (Prefix Tree) Data Structure Implementation
 *
 * Provides efficient string storage and retrieval with support for prefix
 * search, autocomplete, fuzzy matching, and wildcard operations.
 */
export declare class Trie {
    private root;
    private config;
    private eventHandlers;
    private enableStats;
    private enableDebug;
    private stats;
    /**
     *
     * @param options
     * @example
     */
    constructor(options?: Partial<TrieOptions>);
    /**
     * Insert a word into the trie
     *
     * @param word The word to insert
     * @param data Optional data associated with the word
     * @returns True if insertion was successful
     * @example
     */
    insert(word: string, data?: any): boolean;
    /**
     * Search for a word in the trie
     *
     * @param word The word to search for
     * @returns Search result
     * @example
     */
    search(word: string): TrieSearchResult;
    /**
     * Delete a word from the trie
     *
     * @param word The word to delete
     * @returns True if deletion was successful
     * @example
     */
    delete(word: string): boolean;
    /**
     * Find all words with a given prefix
     *
     * @param prefix The prefix to search for
     * @returns Prefix search result
     * @example
     */
    findWordsWithPrefix(prefix: string): TriePrefixResult;
    /**
     * Get autocomplete suggestions for a prefix
     *
     * @param prefix The prefix to autocomplete
     * @param maxSuggestions Maximum number of suggestions
     * @returns Autocomplete result
     * @example
     */
    autocomplete(prefix: string, maxSuggestions?: number): TrieAutocompleteResult;
    /**
     * Find fuzzy matches for a word
     *
     * @param word The word to find fuzzy matches for
     * @param maxDistance Maximum edit distance
     * @returns Array of fuzzy match results
     * @example
     */
    findFuzzyMatches(word: string, maxDistance?: number): FuzzyMatchResult[];
    /**
     * Find wildcard matches for a pattern
     *
     * @param pattern The pattern to match (with wildcards)
     * @returns Array of wildcard match results
     * @example
     */
    findWildcardMatches(pattern: string): WildcardMatchResult[];
    /**
     * Get all words in the trie
     *
     * @returns Array of all words
     * @example
     */
    getAllWords(): string[];
    /**
     * Get the size of the trie (number of words)
     *
     * @returns Number of words in the trie
     * @example
     */
    size(): number;
    /**
     * Check if the trie is empty
     *
     * @returns True if the trie is empty
     * @example
     */
    isEmpty(): boolean;
    /**
     * Clear all words from the trie
     * @example
     */
    clear(): void;
    /**
     * Insert multiple words in batch
     *
     * @param words Array of words to insert
     * @returns Batch operation result
     * @example
     */
    insertBatch(words: string[]): BatchOperationResult;
    /**
     * Traverse the trie with custom options
     *
     * @param options Traversal options
     * @returns Traversal result
     * @example
     */
    traverse(options?: Partial<TraversalOptions>): TraversalResult;
    /**
     * Serialize the trie to a JSON format
     *
     * @returns Serialized trie data
     * @example
     */
    serialize(): TrieSerialization;
    /**
     * Deserialize a trie from JSON format
     *
     * @param serialized Serialized trie data
     * @returns True if deserialization was successful
     * @example
     */
    deserialize(serialized: TrieSerialization): boolean;
    /**
     * Add event handler
     * @param handler
     * @example
     */
    addEventHandler(handler: TrieEventHandler): void;
    /**
     * Remove event handler
     * @param handler
     * @example
     */
    removeEventHandler(handler: TrieEventHandler): void;
    /**
     * Get current statistics
     * @example
     */
    getStats(): TrieStats;
    /**
     * Get performance metrics
     * @example
     */
    getPerformanceMetrics(): TriePerformanceMetrics;
    /**
     * Update configuration
     * @param newConfig
     * @example
     */
    updateConfig(newConfig: Partial<TrieConfig>): void;
    /**
     * Create a new trie node
     * @param char
     * @param parent
     * @example
     */
    private createNode;
    /**
     * Normalize a word based on configuration
     * @param word
     * @example
     */
    private normalizeWord;
    /**
     * Recursive delete helper
     * @param node
     * @param word
     * @param index
     * @example
     */
    private deleteRecursive;
    /**
     * Collect all words from a node
     * @param node
     * @param prefix
     * @param words
     * @param data
     * @param nodesTraversed
     * @example
     */
    private collectWords;
    /**
     * Collect autocomplete suggestions
     * @param node
     * @param prefix
     * @param suggestions
     * @param maxSuggestions
     * @param nodesTraversed
     * @example
     */
    private collectAutocompleteSuggestions;
    /**
     * Calculate autocomplete score
     * @param word
     * @param frequency
     * @example
     */
    private calculateAutocompleteScore;
    /**
     * Find fuzzy matches recursively
     * @param node
     * @param currentWord
     * @param targetWord
     * @param maxDistance
     * @param matches
     * @example
     */
    private findFuzzyMatchesRecursive;
    /**
     * Find wildcard matches recursively
     * @param node
     * @param currentWord
     * @param pattern
     * @param patternIndex
     * @param matches
     * @example
     */
    private findWildcardMatchesRecursive;
    /**
     * Calculate edit distance between two strings
     * @param str1
     * @param str2
     * @example
     */
    private calculateEditDistance;
    /**
     * Count total nodes in the trie
     * @example
     */
    private countNodes;
    /**
     * Recursively count nodes
     * @param node
     * @param count
     * @param count.value
     * @example
     */
    private countNodesRecursive;
    /**
     * Calculate average word length
     * @example
     */
    private calculateAverageWordLength;
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
    private traverseRecursive;
    /**
     * Serialize a node to JSON
     * @param node
     * @example
     */
    private serializeNode;
    /**
     * Deserialize a node from JSON
     * @param node
     * @param data
     * @example
     */
    private deserializeNode;
    /**
     * Emit event to registered handlers
     * @param type
     * @param data
     * @example
     */
    private emitEvent;
}
//# sourceMappingURL=trie-core.d.ts.map