/**
 * Terminal fire simulation module.
 *
 * Re-exports the density-of-gas fire model primitives (types, PRNG and step)
 * from the algorithms package so that downstream packages (splash, coding-agent)
 * can depend on `@entropy-tamer/reynard-algorithms` rather than duplicating the
 * algorithm.
 *
 * @module algorithms/algorithms/rendering/terminal-fire
 */
export { createHeatBuffer, stepFire } from "./terminal-fire-core";
export { SUB_CELLS_PER_CELL } from "./terminal-fire-types";
export type { FireBuffer } from "./terminal-fire-types";
export { rowToBraille } from "./terminal-fire-core";
export { brailleGlyph } from "./terminal-fire-core";
