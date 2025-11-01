/**
 * Trie (Prefix Tree) Data Structure Types
 *
 * Comprehensive type definitions for the Trie (Prefix Tree) data structure.
 * A Trie is a tree-like data structure that stores strings in a way that
 * allows for efficient prefix-based operations like searching, insertion,
 * and deletion.
 *
 * @module algorithms/data-structures/trie
 */

/**
 * Represents a node in the Trie
 */
export interface TrieNode {
  /** Character stored in this node */
  char: string;
  /** Whether this node represents the end of a word */
  isEndOfWord: boolean;
  /** Child nodes mapped by character */
  children: Map<string, TrieNode>;
  /** Parent node reference */
  parent: TrieNode | null;
  /** Additional data associated with this node */
  data?: any;
  /** Frequency count for this word (useful for autocomplete) */
  frequency: number;
  /** Depth of this node from root */
  depth: number;
}

/**
 * Configuration options for Trie
 */
export interface TrieConfig {
  /** Whether to be case-sensitive */
  caseSensitive: boolean;
  /** Whether to allow empty strings */
  allowEmptyStrings: boolean;
  /** Maximum depth of the trie */
  maxDepth: number;
  /** Whether to use compression for memory optimization */
  useCompression: boolean;
  /** Whether to track frequency for autocomplete */
  trackFrequency: boolean;
  /** Whether to enable wildcard matching */
  enableWildcards: boolean;
  /** Wildcard character */
  wildcardChar: string;
  /** Whether to enable fuzzy matching */
  enableFuzzyMatching: boolean;
  /** Maximum edit distance for fuzzy matching */
  maxEditDistance: number;
}

/**
 * Result of Trie search operations
 */
export interface TrieSearchResult {
  /** Whether the search was successful */
  found: boolean;
  /** The found word (if any) */
  word: string | null;
  /** Additional data associated with the word */
  data: any;
  /** Frequency of the word */
  frequency: number;
  /** Search execution time in milliseconds */
  executionTime: number;
  /** Number of nodes traversed */
  nodesTraversed: number;
}

/**
 * Result of Trie prefix search
 */
export interface TriePrefixResult {
  /** Array of words with the given prefix */
  words: string[];
  /** Array of data associated with the words */
  data: any[];
  /** Total number of words found */
  count: number;
  /** Search execution time in milliseconds */
  executionTime: number;
  /** Number of nodes traversed */
  nodesTraversed: number;
}

/**
 * Result of Trie autocomplete operation
 */
export interface TrieAutocompleteResult {
  /** Array of autocomplete suggestions */
  suggestions: Array<{
    word: string;
    data: any;
    frequency: number;
    score: number;
  }>;
  /** Total number of suggestions */
  count: number;
  /** Search execution time in milliseconds */
  executionTime: number;
  /** Number of nodes traversed */
  nodesTraversed: number;
}

/**
 * Statistics for Trie performance
 */
export interface TrieStats {
  /** Total number of words stored */
  totalWords: number;
  /** Total number of nodes in the trie */
  totalNodes: number;
  /** Average word length */
  averageWordLength: number;
  /** Maximum depth reached */
  maxDepth: number;
  /** Total number of search operations */
  totalSearches: number;
  /** Total number of insert operations */
  totalInserts: number;
  /** Total number of delete operations */
  totalDeletes: number;
  /** Average search time */
  averageSearchTime: number;
  /** Memory usage in bytes */
  memoryUsage: number;
}

/**
 * Event types for Trie operations
 */
export enum TrieEventType {
  WORD_INSERTED = "word_inserted",
  WORD_DELETED = "word_deleted",
  WORD_SEARCHED = "word_searched",
  PREFIX_SEARCHED = "prefix_searched",
  AUTCOMPLETE_PERFORMED = "autocomplete_performed",
  NODE_CREATED = "node_created",
  NODE_DELETED = "node_deleted",
  COMPRESSION_PERFORMED = "compression_performed",
  CLEAR_PERFORMED = "clear_performed",
}

/**
 * Event data for Trie events
 */
export interface TrieEvent {
  /** Event type */
  type: TrieEventType;
  /** Timestamp of the event */
  timestamp: number;
  /** Additional event data */
  data?: any;
}

/**
 * Event handler function type
 */
export type TrieEventHandler = (event: TrieEvent) => void;

/**
 * Options for Trie initialization
 */
export interface TrieOptions {
  /** Configuration settings */
  config: Partial<TrieConfig>;
  /** Event handlers */
  eventHandlers?: TrieEventHandler[];
  /** Whether to enable statistics collection */
  enableStats: boolean;
  /** Whether to enable debugging */
  enableDebug: boolean;
  /** Initial words to insert */
  initialWords?: string[];
}

/**
 * Performance metrics for Trie
 */
export interface TriePerformanceMetrics {
  /** Current memory usage */
  memoryUsage: number;
  /** Average search time */
  averageSearchTime: number;
  /** Average insert time */
  averageInsertTime: number;
  /** Average delete time */
  averageDeleteTime: number;
  /** Performance score (0-100) */
  performanceScore: number;
  /** Compression ratio (0-1) */
  compressionRatio: number;
}

/**
 * Fuzzy match result
 */
export interface FuzzyMatchResult {
  /** The matched word */
  word: string;
  /** Edit distance to the query */
  editDistance: number;
  /** Similarity score (0-1) */
  similarity: number;
  /** Data associated with the word */
  data: any;
}

/**
 * Wildcard match result
 */
export interface WildcardMatchResult {
  /** The matched word */
  word: string;
  /** The pattern that matched */
  pattern: string;
  /** Data associated with the word */
  data: any;
}

/**
 * Trie traversal options
 */
export interface TraversalOptions {
  /** Whether to include intermediate nodes */
  includeIntermediate: boolean;
  /** Maximum depth to traverse */
  maxDepth: number;
  /** Filter function for nodes */
  filter?: (node: TrieNode) => boolean;
  /** Whether to traverse in sorted order */
  sorted: boolean;
}

/**
 * Trie traversal result
 */
export interface TraversalResult {
  /** Array of visited nodes */
  nodes: TrieNode[];
  /** Array of words found during traversal */
  words: string[];
  /** Total nodes visited */
  nodesVisited: number;
  /** Traversal execution time */
  executionTime: number;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  /** Whether the batch operation was successful overall */
  success: boolean;
  /** Number of successful operations */
  successful: number;
  /** Number of failed operations */
  failed: number;
  /** Array of errors encountered */
  errors: string[];
  /** Total execution time */
  executionTime: number;
  /** Results of individual operations */
  results: any[];
}

/**
 * Trie serialization format
 */
export interface TrieSerialization {
  /** Version of the serialization format */
  version: string;
  /** Configuration used */
  config: TrieConfig;
  /** Serialized data */
  data: any;
  /** Metadata */
  metadata: {
    totalWords: number;
    totalNodes: number;
    maxDepth: number;
    createdAt: number;
  };
}

/**
 * Default configuration for Trie
 */
export const DEFAULT_TRIE_CONFIG: TrieConfig = {
  caseSensitive: false,
  allowEmptyStrings: false,
  maxDepth: 1000,
  useCompression: false,
  trackFrequency: true,
  enableWildcards: true,
  wildcardChar: "*",
  enableFuzzyMatching: false,
  maxEditDistance: 2,
};

/**
 * Default options for Trie
 */
export const DEFAULT_TRIE_OPTIONS: TrieOptions = {
  config: DEFAULT_TRIE_CONFIG,
  enableStats: true,
  enableDebug: false,
  initialWords: [],
};

/**
 * Common word sets for testing
 */
export const COMMON_WORD_SETS = {
  /** Common English words */
  ENGLISH_WORDS: [
    "hello",
    "world",
    "test",
    "example",
    "algorithm",
    "data",
    "structure",
    "tree",
    "node",
    "search",
    "insert",
    "delete",
    "find",
    "prefix",
    "suffix",
    "match",
    "pattern",
    "string",
    "character",
    "word",
  ],

  /** Programming keywords */
  PROGRAMMING_KEYWORDS: [
    "function",
    "variable",
    "class",
    "method",
    "interface",
    "type",
    "const",
    "let",
    "var",
    "if",
    "else",
    "for",
    "while",
    "return",
    "import",
    "export",
    "async",
    "await",
    "promise",
    "callback",
  ],

  /** Short words for testing */
  SHORT_WORDS: [
    "a",
    "an",
    "at",
    "be",
    "by",
    "do",
    "go",
    "he",
    "in",
    "is",
    "it",
    "me",
    "my",
    "no",
    "of",
    "on",
    "or",
    "so",
    "to",
    "up",
  ],

  /** Long words for testing */
  LONG_WORDS: [
    "antidisestablishmentarianism",
    "pneumonoultramicroscopicsilicovolcanoconiosis",
    "supercalifragilisticexpialidocious",
    "pseudopseudohypoparathyroidism",
    "floccinaucinihilipilification",
    "hippopotomonstrosesquippedaliophobia",
  ],
};
