/**
 * @file Node.js environment utilities for algorithm configuration system
 *
 * Provides runtime detection and lazy loading of Node.js modules for
 * browser-safe operation.
 */

export { isNodeEnvironment } from "./algorithm-config-node-utils-internal";

export type { FSLike, OSLike, PathLike } from "./algorithm-config-node-utils-internal";

export { getFs, getOs, getPath } from "./algorithm-config-node-utils-internal";
