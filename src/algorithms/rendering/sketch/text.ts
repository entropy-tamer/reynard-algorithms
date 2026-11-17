/**
 * Hand-lettered text helpers.
 *
 * Glyphs come from the font (reynard-font-humor); this module supplies the
 * deterministic baseline tilt and an optional wobbly underline, so text drawn
 * on a canvas sits on the same hand-drawn grid as the strokes around it.
 *
 * @module algorithms/rendering/sketch/text
 */

import { createSketchRandom, deriveSeed } from "./seeding.ts";
import { sketchStroke } from "./stroke.ts";
import type { SketchOptions, SketchResult, SketchSink, TextGuide } from "./types.ts";

/**
 * A small, deterministic tilt and vertical offset for a label baseline.
 * `chartId`, `elementId` and `theme` make the tilt stable across redraws.
 */
export function textGuide(
    chartId: string,
    elementId: string,
    theme: string,
    x: number,
    y: number,
    width: number,
): TextGuide {
    const random = createSketchRandom(deriveSeed(chartId, elementId, theme, "text-guide"));
    return {
        x,
        y,
        rotation: (random() * 2 - 1) * 0.022,
        width,
    };
}

/** A wobbly underline beneath hand-lettered text. */
export function sketchTextUnderline(
    sink: SketchSink,
    x: number,
    y: number,
    width: number,
    seed: number,
    options: SketchOptions = {},
): SketchResult {
    return sketchStroke(
        sink,
        [
            { x, y },
            { x: x + width / 2, y: y + 0.4 },
            { x: x + width, y },
        ],
        seed,
        { ...options, passes: options.passes ?? 1, width: options.width ?? 1 },
    );
}
