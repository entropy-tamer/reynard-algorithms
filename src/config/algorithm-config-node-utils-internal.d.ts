/**
 * @file Internal Node.js environment utilities implementation
 */
/**
 * Check if running in Node.js environment
 *
 * @returns True if running in Node.js, false otherwise
 * @example
 */
export declare function isNodeEnvironment(): boolean;
/**
 * Filesystem module interface
 */
export type FSLike = {
    readFileSync: (path: string, enc: string) => string;
    writeFileSync: (path: string, data: string) => void;
    existsSync: (path: string) => boolean;
    mkdirSync: (path: string, opts?: {
        recursive?: boolean;
    }) => void;
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
    cpus: () => Array<{
        model?: string;
    }>;
    totalmem: () => number;
    arch: () => string;
    platform: () => string;
};
/**
 * Get filesystem module (Node.js only)
 * Returns null in browser environments
 * Note: First call may be slower due to async initialization in ES modules
 *
 * @returns Filesystem module or null if not in Node.js
 * @example
 */
export declare function getFs(): FSLike | null;
/**
 * Get path module (Node.js only)
 * Returns null in browser environments
 * Note: First call may be slower due to async initialization in ES modules
 *
 * @returns Path module or null if not in Node.js
 * @example
 */
export declare function getPath(): PathLike | null;
/**
 * Get OS module (Node.js only)
 * Returns null in browser environments
 * Note: First call may be slower due to async initialization in ES modules
 *
 * @returns OS module or null if not in Node.js
 * @example
 */
export declare function getOs(): OSLike | null;
//# sourceMappingURL=algorithm-config-node-utils-internal.d.ts.map