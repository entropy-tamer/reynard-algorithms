/**
 * Terminal fire simulation core.
 *
 * Provides createHeatBuffer and stepFire — the density-of-gas fire model
 * used by the splash screen and kept in sync with coding-agent's fire.ts.
 *
 * The algorithm lives in algorithms re-export (via @entropy-tamer/reynard-algorithms)
 * so that splash and coding-agent share the same deterministic engine.
 *
 * @module algorithms/algorithms/rendering/fox-fire/fire
 */

import { mulberry32 } from "../../../utils/prng/mulberry32";
import type { FireBuffer } from "./fire-types";


/** How many sub-cells per cell (used for internal resolution & array indices) */
const SUB_CELLS_PER_CELL = 8;

/**
 * Heat a parcel loses on the way up one row.
 *
 * The flame's height is the fuel bed's heat divided by this: a bed of 63 with
 * a loss of 4 burns about fifteen rows, which is a fire and not a smudge on
 * the floor. A loss of 1 would burn the whole buffer and a loss of 8 would
 * burn eight rows.
 */
const COOLING = 4;

/**
 * How much of a cell's heat comes from its sideways neighbours.
 *
 * A fire that only rises settles into a still picture: the rise is a linear
 * map with a fixed input, so the flame stops moving. A quarter of the
 * difference to each neighbour is enough to keep the noise travelling
 * sideways and upward, and small enough that the flame still reads as a
 * column rather than as a cloud.
 */
const LATERAL = 0.25;

/** Create a heat buffer with randomised interior and dark edges. Runs 4
 * warm-up steps so that cell colours propagate before the buffer is handed
 * to the consumer. */
export function createHeatBuffer(cols: number, rows: number, seed: number): FireBuffer {
    const buf = new Uint8Array(cols * rows * SUB_CELLS_PER_CELL);

    // Edge cells stay dark (0); interior seeded with mulberry32.
    for (let cell = 0; cell < cols * rows; cell++) {
        const base = cell * SUB_CELLS_PER_CELL;
        if (isEdge(cols, cell)) {
            buf[base + 1] = 0;
            buf[base + 2] = 0;
            buf[base + 3] = 0;
            buf[base + 4] = 0;
            buf[base + 5] = 0;
            buf[base + 6] = 0;
            buf[base + 7] = 0;
        } else {
            // Warm-start: each sub-cell gets a random 0–63 value.
            const rng = mulberry32(seed + cell);
            for (let s = 1; s < SUB_CELLS_PER_CELL; s++) {
                buf[base + s] = (rng() * 64) | 0;
            }
        }
    }

    // Warm-up: diffuse 4 steps so interior heat propagates outward.
    for (let step = 0; step < 4; step++) {
        stepFire(buf, cols, rows);
    }

    return { cols, rows, buf, seed, stepCount: 4 };
}

/** One step of the density-of-gas fire diffusion.
 *
 * Bottom row = fuel bed (deterministic flicker). Heat rises: each cell takes
 * the mean of the 7 sub-cells of the cell below. Each propagation step sheds
 * one level so flames naturally die upward. Turbulence nudges a few cells.
 *
 * After every step the buffer length is unchanged; consumers may slice the
 * first row (the "top flame") for braille rendering.
 *
 * @param buf - the current heat buffer (mutated in place)
 * @param cols - terminal width in cells
 * @param rows - terminal height in cells
 */
export function stepFire(buf: Uint8Array, cols: number, rows: number): void {
    const newBuf = new Uint8Array(buf.length);

    for (let cell = 0; cell < cols * rows; cell++) {
        const base = cell * SUB_CELLS_PER_CELL;
        const row = (cell / cols) | 0;

        // Deterministic per-cell hash; mixes the cell's own current brightness so
        // the turbulence pattern evolves (and stays seed-dependent) over time.
        const h = (Math.imul(cell + 1, 0x9e3779b1) ^ Math.imul(buf[base + 1] + 1, 0x85ebca6b)) >>> 0;

        // Sub‑cell 0 (top‑left) = open field = 0
        newBuf[base + 0] = 0;

        if (row === rows - 1) {
            // Fuel bed — always hot, with a deterministic flicker so the flame
            // never looks static.
            newBuf[base + 1] = 63 - (h % 4);
        } else {
            // Heat rises: the cell takes the heat of the cell below and loses
            // a little on the way up.
            //
            // The heat that rises is the cell's own (sub-cell 1), not the mean
            // of its dimmed mirrors. The mirrors exist to shade the glyph --
            // half, quarter -- and averaging them into the propagation made
            // every row keep two thirds of the heat below it, so the flame
            // was six rows tall and looked like a fire on the floor rather
            // than a fire. Cooling by a fixed amount per row is what makes
            // the flame's height a ratio of the fuel bed's heat, which is
            // the knob the lock screen's advective model has.
            const belowBase = (cell + cols) * SUB_CELLS_PER_CELL;
            let heat = buf[belowBase + 1] - COOLING;

            // Lateral mixing, and the reason the fire is a fire rather than a
            // still picture. A pure rise is a linear map with a fixed input,
            // so it settles: the flame stops moving a second after it starts.
            // Each cell leans on its neighbours, and the noise that was
            // seeded in the buffer keeps travelling sideways and upward
            // instead of freezing into a shape.
            const column = cell % cols;
            if (column > 0) {
                const left = buf[base - SUB_CELLS_PER_CELL + 1];
                heat += (left - heat) * LATERAL;
            }
            if (column < cols - 1) {
                const right = buf[base + SUB_CELLS_PER_CELL + 1];
                heat += (right - heat) * LATERAL;
            }

            // Turbulence: ~2% of cells get nudged up or down one level.
            if (h % 50 === 0) heat += (h & 0x100) !== 0 ? 1 : -1;

            newBuf[base + 1] = heat > 63 ? 63 : heat < 0 ? 0 : heat;
        }

        // Mirror the clamped top sub-cell to 4-7 so each cell has 8
        // braille-representable levels.
        const clamped = newBuf[base + 1];
        newBuf[base + 2] = clamped;
        newBuf[base + 3] = clamped;
        newBuf[base + 4] = clamped >>> 1;
        newBuf[base + 5] = clamped >>> 1;
        newBuf[base + 6] = clamped >>> 1;
        newBuf[base + 7] = clamped >>> 1;
    }

    buf.set(newBuf);
}

/** Convert a single row of fire-buffer sub-cells into a string of braille glyphs.
 * One braille character per column; each character packs the 8 sub-cells of that
 * column into a 6-dot braille pattern (U+2800 ... U+283F).
 * @param buf - the current heat buffer
 * @param cols - terminal width in cells
 * @param row - row index
 * @returns string of length cols, each character a braille pattern
 */
export function rowToBraille(buf: Uint8Array, cols: number, row: number): string {
    const rowBase = row * cols * SUB_CELLS_PER_CELL;
    let result = "";
    for (let x = 0; x < cols; x++) {
        const base = rowBase + x * SUB_CELLS_PER_CELL;
        // Pack the 6 sub-cell nibbles into a 6-dot braille pattern (bits 0-5).
        //
        // The dots read sub-cells 1 to 6, not 0 to 5: sub-cell 0 is the open
        // field and is always zero, so reading it would spend the top dot on a
        // cell that is never lit and lose the hottest sub-row to the edge.
        let pattern = 0;
        for (let s = 0; s < 6; s++) {
            if (buf[base + 1 + s] >= 32) { // threshold: hot enough to show
                pattern |= (1 << s);
            }
        }
        // Map the 6-bit pattern to a braille pattern offset 0x2800
        // Valid braille patterns use bits 0-5; value 0 gives U+2800 (braille blank)
        const codePoint = pattern === 0 ? 0x2800 : 0x2800 + pattern;
        result += String.fromCodePoint(codePoint);
    }
    return result;
}

/** Build a braille glyph from two 4-bit nibbles (top = left column, bottom = right column).
 * @param top - left-column sub-cell nibble (bits 0-3 represent top-left dots)
 * @param bottom - right-column sub-cell nibble (bits 4-7 represent top-right dots)
 * @returns a single braille character
 */
export function brailleGlyph(top: number, bottom: number): string {
    const code = (top & 0x0F) | (bottom & 0xF0);
    // Clamp to the valid braille pattern range; value 0 -> U+2800 (braille blank)
    const codePoint = Math.min(Math.max(code, 0), 0x283F) + 0x2800;
    return String.fromCodePoint(codePoint);
}

/** Determine whether a terminal cell is on an edge (col 0 or col cols-1). */
function isEdge(cols: number, cell: number): boolean {
    const c = cell % cols;
    return c === 0 || c === cols - 1;
}
