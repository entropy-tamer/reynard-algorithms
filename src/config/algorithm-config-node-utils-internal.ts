/**
 * @file Internal Node.js environment utilities implementation.
 *
 * All three helpers (getFs, getPath, getOs) return null when running outside
 * real Node.js — this includes vitest/rolldown bundler environments where the
 * __require shim exists but does not actually work with Node built-in modules.
 */

// Avoid top-level Node imports so this module is safe to import from browser builds.

/**
 * Check if running in a real Node.js environment (not browser, not bundler).
 */
export function isNodeEnvironment(): boolean {
  if (typeof process === "undefined") return false;
  const proc = process as { versions?: { node?: string } };
  if (!proc.versions?.node) return false;
  if (typeof window !== "undefined") return false;
  return true;
}

/** Filesystem module interface */
export type FSLike = {
  readFileSync: (path: string, enc: string) => string;
  writeFileSync: (path: string, data: string) => void;
  existsSync: (path: string) => boolean;
  mkdirSync: (path: string, opts?: { recursive?: boolean }) => void;
};

/** Path module interface */
export type PathLike = {
  join: (...parts: string[]) => string;
  dirname: (p: string) => string;
};

/** OS module interface */
export type OSLike = {
  cpus: () => Array<{ model?: string }>;
  totalmem: () => number;
  arch: () => string;
  platform: () => string;
};

let nodeRequire: ((id: string) => unknown) | null = null;

/**
 * Safely require a Node.js module. Returns null if not available or under a bundler shim.
 */
function safeRequire<T>(id: string): T | null {
  // Skip non-Node environments entirely.
  if (!isNodeEnvironment()) return null;
  // Bail out of rolled-up/rolldown bundles — their __require shim crashes on Node built-ins.
  const g = globalThis as unknown as { __require?: unknown };
  if (typeof g.__require !== "undefined") return null;
  try {
    return ((globalThis as unknown as { require: typeof import("node:fs")["default"] }).require(id) ?? null) as T | null;
  } catch {
    return null;
  }
}

/**
 * Get filesystem module. Returns null in browser or bundled ESM environments.
 */
export function getFs(): FSLike | null {
  if (!isNodeEnvironment()) return null;
  if (nodeRequire !== null) {
    try { return nodeRequire("fs") as unknown as FSLike; } catch {}
  } else {
    const m = safeRequire<FSLike>("fs");
    if (m) {
      // Cache the require function for future calls.
      nodeRequire = ((id: string) => globalThis.require(id)) as never;
    }
    return m;
  }
  return null;
}

/**
 * Get path module. Returns null in browser or bundled ESM environments.
 */
export function getPath(): PathLike | null {
  if (!isNodeEnvironment()) return null;
  if (nodeRequire !== null) {
    try { return nodeRequire("path") as unknown as PathLike; } catch {}
  } else {
    const m = safeRequire<PathLike>("path");
    if (m) {
      nodeRequire = ((id: string) => globalThis.require(id)) as never;
    }
    return m;
  }
  return null;
}

/**
 * Get OS module. Returns null in browser or bundled ESM environments.
 */
export function getOs(): OSLike | null {
  if (!isNodeEnvironment()) return null;
  if (nodeRequire !== null) {
    try { return nodeRequire("node:os") as unknown as OSLike; } catch {}
  } else {
    const m = safeRequire<OSLike>("node:os");
    if (m) {
      nodeRequire = ((id: string) => globalThis.require(id)) as never;
    }
    return m;
  }
  return null;
}
