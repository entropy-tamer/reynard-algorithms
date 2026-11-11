/**
 * Types for the density-of-gas terminal fire simulation.
 *
 * @module algorithms/algorithms/rendering/terminal-fire/terminal-fire-types
 */

/** How many sub-cells per terminal cell (density-of-gas resolution) */
export const SUB_CELLS_PER_CELL = 8;

/** Fire buffer: 1-D array of sub-cell brightness values (0–63). */
export interface FireBuffer {
    /** number of terminal cells wide */
    cols: number;
    /** number of terminal cells tall */
    rows: number;
    /** flat Uint8Array of sub-cell brightnesses (0–63), length cols*rows*8 */
    buf: Uint8Array;
    /** PRNG seed used for warm-starting */
    seed: number;
    /** number of stepFire() calls made so far */
    stepCount: number;
}
