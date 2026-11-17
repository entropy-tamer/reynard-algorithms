/**
 * Hand-drawn ("sketch") rendering primitives.
 *
 * The math behind the neutral-theme xkcd-style charts: stable seeds, path
 * resampling, smooth jitter, double-pass strokes, wobbly geometry, and a
 * deterministic signature for tests. No DOM types; the sink is a structural
 * subset of CanvasRenderingContext2D.
 *
 * @module algorithms/rendering/sketch
 */

export { deriveSeed, createSketchRandom, passSeed } from "./seeding.ts";
export type { SeedPart } from "./seeding.ts";
export { resampleSegment, resamplePolyline, resampleClosed, pathLength } from "./resampling.ts";
export { jitterPath, jitterBound } from "./jitter.ts";
export { drawPass, sketchStroke, SKETCH_JITTER } from "./stroke.ts";
export {
    sketchLine,
    sketchPolyline,
    sketchRect,
    sketchBar,
    sketchEllipse,
    sketchHatchFill,
    sketchArrow,
} from "./primitives.ts";
export { textGuide, sketchTextUnderline } from "./text.ts";
export { serializePoints, serializeSketch, hashSketch } from "./serialize.ts";
export { DEFAULT_SKETCH_OPTIONS, DEFAULT_JITTER } from "./types.ts";
export type {
    Point,
    SketchSink,
    CanvasGradientLike,
    JitterOptions,
    SketchOptions,
    SketchResult,
    ArrowOptions,
    HatchOptions,
    TextGuide,
} from "./types.ts";
