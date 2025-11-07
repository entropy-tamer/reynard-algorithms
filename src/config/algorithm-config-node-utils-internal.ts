/**
 * @file Internal Node.js environment utilities implementation
 */

// NOTE: This module is used in both Node and browser contexts. Avoid top-level Node imports.
// Gate all filesystem and OS usage behind runtime checks to keep browser bundles clean.

/**
 * Check if running in Node.js environment
 *
 * @returns True if running in Node.js, false otherwise
 * @example
 */
export function isNodeEnvironment(): boolean {
  if (typeof process === "undefined") {
    return false;
  }
  const proc = process as { versions?: { node?: string } };
  return typeof proc.versions?.node === "string";
}

/**
 * Filesystem module interface
 */
export type FSLike = {
  readFileSync: (path: string, enc: string) => string;
  writeFileSync: (path: string, data: string) => void;
  existsSync: (path: string) => boolean;
  mkdirSync: (path: string, opts?: { recursive?: boolean }) => void;
};

/**
 * Path module interface
 */
export type PathLike = {
  join: (...parts: string[]) => string;
  dirname: (p: string) => string;
};

/**
 * OS module interface
 */
export type OSLike = {
  cpus: () => Array<{ model?: string }>;
  totalmem: () => number;
  arch: () => string;
  platform: () => string;
};

/**
 * Cached require function for ES module compatibility
 * Uses createRequire when in ES module context, falls back to global require
 */
let nodeRequire: ((id: string) => unknown) | null = null;
let requireInitPromise: Promise<void> | null = null;

/**
 * Initialize require function using createRequire for ES module compatibility
 * This function safely handles both Node.js and browser environments
 * @example
 */
function initRequire(): Promise<void> {
  if (nodeRequire) return Promise.resolve();
  if (requireInitPromise) return requireInitPromise;

  requireInitPromise = (async () => {
    // Early return for browser environments
    if (!isNodeEnvironment()) return;

    // Check for browser-specific globals that indicate we're not in Node.js
    if (typeof window !== "undefined" || typeof navigator !== "undefined") {
      // In browser environment, Node.js modules are not available
      return;
    }

    try {
      if (typeof import.meta !== "undefined" && import.meta.url) {
        // In ES modules (Node.js), use createRequire
        // Only import "module" in Node.js environment - it will fail gracefully in browsers
        try {
          const modulePackage = await import("module");
          nodeRequire = modulePackage.createRequire(import.meta.url);
          return;
        } catch {
          // "module" package not available (e.g., in browser or bundled environment)
          // Fall through to CommonJS require fallback
        }
      }

      // Fallback to global require in CommonJS or if module import failed
      if (typeof require !== "undefined") {
        nodeRequire = require;
      }
    } catch (error) {
      // All initialization attempts failed - this is expected in browser environments
      // nodeRequire will remain null, and getFs/getPath/getOs will return null
    }
  })();

  return requireInitPromise;
}

/**
 * Get filesystem module (Node.js only)
 * Returns null in browser environments
 * Note: First call may be slower due to async initialization in ES modules
 *
 * @returns Filesystem module or null if not in Node.js
 * @example
 */
export function getFs(): FSLike | null {
  // Early return for browser environments
  if (!isNodeEnvironment()) return null;
  if (typeof window !== "undefined") return null; // Browser environment

  // If not initialized, try to use global require synchronously (CommonJS)
  if (!nodeRequire) {
    if (typeof require !== "undefined") {
      // CommonJS environment - use global require directly
      try {
        nodeRequire = require;
        const fs = nodeRequire("fs");
        return fs as FSLike;
      } catch {
        return null;
      }
    } else {
      // ES module environment - initialize asynchronously in background
      // Return null on first call, subsequent calls will have nodeRequire initialized
      initRequire().catch(() => {
        // Ignore initialization errors (expected in browsers)
      });
      return null;
    }
  }

  try {
    const fs = nodeRequire("fs");
    return fs as FSLike;
  } catch {
    return null;
  }
}

/**
 * Get path module (Node.js only)
 * Returns null in browser environments
 * Note: First call may be slower due to async initialization in ES modules
 *
 * @returns Path module or null if not in Node.js
 * @example
 */
export function getPath(): PathLike | null {
  // Early return for browser environments
  if (!isNodeEnvironment()) return null;
  if (typeof window !== "undefined") return null; // Browser environment

  // If not initialized, try to use global require synchronously (CommonJS)
  if (!nodeRequire) {
    if (typeof require !== "undefined") {
      // CommonJS environment - use global require directly
      try {
        nodeRequire = require;
        const path = nodeRequire("path");
        return path as PathLike;
      } catch {
        return null;
      }
    } else {
      // ES module environment - initialize asynchronously in background
      // Return null on first call, subsequent calls will have nodeRequire initialized
      initRequire().catch(() => {
        // Ignore initialization errors (expected in browsers)
      });
      return null;
    }
  }

  try {
    const path = nodeRequire("path");
    return path as PathLike;
  } catch {
    return null;
  }
}

/**
 * Get OS module (Node.js only)
 * Returns null in browser environments
 * Note: First call may be slower due to async initialization in ES modules
 *
 * @returns OS module or null if not in Node.js
 * @example
 */
export function getOs(): OSLike | null {
  // Early return for browser environments
  if (!isNodeEnvironment()) return null;
  if (typeof window !== "undefined") return null; // Browser environment

  // If not initialized, try to use global require synchronously (CommonJS)
  if (!nodeRequire) {
    if (typeof require !== "undefined") {
      // CommonJS environment - use global require directly
      try {
        nodeRequire = require;
        const os = nodeRequire("node:os");
        return os as unknown as OSLike;
      } catch {
        return null;
      }
    } else {
      // ES module environment - initialize asynchronously in background
      // Return null on first call, subsequent calls will have nodeRequire initialized
      initRequire().catch(() => {
        // Ignore initialization errors (expected in browsers)
      });
      return null;
    }
  }

  try {
    const os = nodeRequire("node:os");
    return os as unknown as OSLike;
  } catch {
    return null;
  }
}
