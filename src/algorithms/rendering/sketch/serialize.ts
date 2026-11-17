/**
 * Deterministic serialization of sketch output.
 *
 * Used by tests and by the browser e2e gate: a stable signature proves a chart
 * did not re-roll its wobble between redraws, without taking a screenshot whose
 * pixels differ across Chromium and Firefox.
 *
 * @module algorithms/rendering/sketch/serialize
 */

import type { Point, SketchResult } from "./types.ts";

/** Round to `precision` decimals and join into a compact, comparable string. */
export function serializePoints(points: readonly Point[], precision = 2): string {
    const factor = 10 ** precision;
    return points
        .map((point) => `${Math.round(point.x * factor) / factor},${Math.round(point.y * factor) / factor}`)
        .join(" ");
}

/** Serialize every pass of a stroke, pass-separated by `|`. */
export function serializeSketch(result: SketchResult, precision = 2): string {
    return result.passes.map((pass) => serializePoints(pass, precision)).join("|");
}

/** FNV-1a of a serialized sketch, as an unsigned hex string. */
export function hashSketch(result: SketchResult, precision = 2): string {
    const text = serializeSketch(result, precision);
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
}
