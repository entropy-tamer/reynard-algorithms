/**
 * Double-pass sketch stroke.
 *
 * Two passes, each resampled and jittered with an independent seed, drawn with
 * slightly different width and alpha. The overlap reads as a pen pressed twice
 * -- the trick matplotlib's `plt.xkcd()` uses -- without any image texture.
 *
 * @module algorithms/rendering/sketch/stroke
 */

import { jitterPath } from "./jitter.ts";
import { passSeed } from "./seeding.ts";
import { DEFAULT_JITTER, DEFAULT_SKETCH_OPTIONS } from "./types.ts";
import type { Point, SketchOptions, SketchResult, SketchSink } from "./types.ts";

/** Draw one jittered pass through `points` and return the emitted point stream. */
export function drawPass(
    sink: SketchSink,
    points: readonly Point[],
    seed: number,
    options: SketchOptions,
    pass: number,
    passCount: number,
): Point[] {
    const roughness = options.roughness ?? DEFAULT_SKETCH_OPTIONS.roughness;
    const offset = (options.passOffset ?? DEFAULT_SKETCH_OPTIONS.passOffset) * pass;
    const emitted = jitterPath(points, seed, { scale: roughness }).map((point) => ({
        x: point.x + offset,
        y: point.y + offset * 0.6,
    }));

    if (emitted.length === 0) return emitted;
    const ratio = passCount <= 1 ? 1 : 1 - (pass / passCount) * 0.28;
    sink.lineWidth = (options.width ?? DEFAULT_SKETCH_OPTIONS.width) * ratio;
    sink.globalAlpha = (options.alpha ?? DEFAULT_SKETCH_OPTIONS.alpha) * (pass === 0 ? 1 : 0.72);
    sink.strokeStyle = options.color ?? DEFAULT_SKETCH_OPTIONS.color;
    sink.lineCap = "round";
    sink.lineJoin = "round";
    sink.setLineDash([]);
    sink.beginPath();
    sink.moveTo(emitted[0]!.x, emitted[0]!.y);
    for (let i = 1; i < emitted.length; i++) sink.lineTo(emitted[i]!.x, emitted[i]!.y);
    sink.stroke();
    return emitted;
}

/** Draw a hand-drawn stroke through a resampled point stream. */
export function sketchStroke(
    sink: SketchSink,
    points: readonly Point[],
    seed: number,
    options: SketchOptions = {},
): SketchResult {
    const passes = Math.max(1, Math.floor(options.passes ?? DEFAULT_SKETCH_OPTIONS.passes));
    const emitted: Point[][] = [];
    for (let pass = 0; pass < passes; pass++) {
        emitted.push(drawPass(sink, points, passSeed(seed, pass), options, pass, passes));
    }
    return { passes: emitted, seed };
}

/** Expose the default jitter so callers that need a bound can read one source. */
export const SKETCH_JITTER = DEFAULT_JITTER;
