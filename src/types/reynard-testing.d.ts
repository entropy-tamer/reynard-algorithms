/**
 * Type declarations for @entropy-tamer/reynard-testing
 * Temporary declaration until the package is built with types
 */

declare module "@entropy-tamer/reynard-testing" {
  /**
   * Setup for core packages (reynard-core, etc.)
   * Includes browser APIs, storage, and common utilities
   */
  export function setupCoreTest(): void;

  // Re-export other commonly used exports
  export * from "@entropy-tamer/reynard-testing/setup";
}
