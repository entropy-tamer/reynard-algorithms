/**
 * Deterministic seeds for hand-drawn rendering.
 *
 * A wobble that re-rolls on every redraw makes a "hand-drawn" chart visibly
 * shiver when it is resized or when the theme toggles, and makes pixel-level
 * e2e checks flaky. The seed is therefore derived from stable identifiers --
 * chart id, element id, theme -- and fed to the tree-wide mulberry32.
 *
 * @module algorithms/rendering/sketch/seeding
 */

import { mulberry32 } from "../../../utils/prng/mulberry32.ts";

/** A part of a seed key: strings or numbers. */
export type SeedPart = string | number;

/**
 * FNV-1a over a separator-joined key, returned as an unsigned 32-bit integer.
 *
 * A length-prefixed encoding is used instead of a plain join so that
 * `["ab", "c"]` and `["a", "bc"]` cannot collide.
 */
export function deriveSeed(...parts: readonly SeedPart[]): number {
    let hash = 0x811c9dc5;
    for (const part of parts) {
        const text = String(part);
        // length prefix + separator
        for (const ch of `${text.length}:${text}|`) {
            hash ^= ch.charCodeAt(0);
            hash = Math.imul(hash, 0x01000193) >>> 0;
        }
    }
    return hash >>> 0;
}

/** A fresh deterministic random stream from a seed. */
export function createSketchRandom(seed: number): () => number {
    return mulberry32(seed);
}

/** Derive a per-pass seed without calling the random stream (pass order is stable). */
export function passSeed(seed: number, pass: number): number {
    return (seed + Math.imul(pass + 1, 0x9e3779b9)) >>> 0;
}
