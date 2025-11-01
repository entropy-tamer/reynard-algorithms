/**
 * Internal Node.js environment utilities implementation
 * 
 * @file
 */

// NOTE: This module is used in both Node and browser contexts. Avoid top-level Node imports.
// Gate all filesystem and OS usage behind runtime checks to keep browser bundles clean.

/**
 * Check if running in Node.js environment
 * 
 * @returns True if running in Node.js, false otherwise
 */
export function isNodeEnvironment(): boolean {
  if (typeof process === 'undefined') {
    return false;
  }
  const proc = process as { versions?: { node?: string } };
  return typeof proc.versions?.node === 'string';
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
 * Get filesystem module (Node.js only)
 * 
 * @returns Filesystem module or null if not in Node.js
 */
export function getFs(): FSLike | null {
  if (!isNodeEnvironment()) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs');
  return fs as FSLike;
}

/**
 * Get path module (Node.js only)
 * 
 * @returns Path module or null if not in Node.js
 */
export function getPath(): PathLike | null {
  if (!isNodeEnvironment()) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('path');
  return path as PathLike;
}

/**
 * Get OS module (Node.js only)
 * 
 * @returns OS module or null if not in Node.js
 */
export function getOs(): OSLike | null {
  if (!isNodeEnvironment()) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const os = require('node:os');
  return os as unknown as OSLike;
}


