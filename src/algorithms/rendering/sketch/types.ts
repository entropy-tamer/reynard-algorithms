/**
 * Shared types for the hand-drawn ("sketch") rendering primitives.
 *
 * The sink is a structural subset of `CanvasRenderingContext2D`, so a real
 * canvas context satisfies it directly and a recording object can be used in
 * unit tests without a DOM. Nothing in this module imports a DOM type.
 *
 * @module algorithms/rendering/sketch/types
 */

/** A point in CSS pixels. */
export interface Point {
    readonly x: number;
    readonly y: number;
}

/** The canvas-like surface the primitives draw onto. */
export interface SketchSink {
    beginPath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    quadraticCurveTo(cx: number, cy: number, x: number, y: number): void;
    closePath(): void;
    stroke(): void;
    fill(): void;
    setLineDash(segments: number[]): void;
    strokeStyle: string | CanvasGradientLike;
    fillStyle: string | CanvasGradientLike;
    lineWidth: number;
    globalAlpha: number;
    lineCap: "butt" | "round" | "square";
    lineJoin: "miter" | "round" | "bevel";
}

/** Minimal stand-in for a gradient; a CSS color string is the normal value. */
export type CanvasGradientLike = { readonly __gradient?: never };

/** How far and how smoothly a path is displaced. All distances are CSS px. */
export interface JitterOptions {
    /** Peak normal displacement of the low-frequency component. */
    readonly amplitude: number;
    /** Arc length (px) over which the low-frequency component completes a cycle. */
    readonly wavelength: number;
    /** Peak displacement of the per-point (uncorrelated) component. */
    readonly fineAmplitude: number;
}

/** Options common to every sketch primitive. */
export interface SketchOptions {
    /** Roughness scale, 0 = clean geometry, 1 = full hand-drawn wobble. Default 0.55. */
    readonly roughness?: number;
    /** Number of overlapping passes. Default 2 (the matplotlib xkcd recipe). */
    readonly passes?: number;
    /** Lateral offset between successive passes, in px. Default 0.9. */
    readonly passOffset?: number;
    /** Base stroke width, px. Default 1.6. */
    readonly width?: number;
    /** Base stroke alpha, 0..1. Default 0.85. */
    readonly alpha?: number;
    /** Stroke color. Default "#000". */
    readonly color?: string;
    /** Explicit seed; when absent the caller's derived seed is used. */
    readonly seed?: number;
    /** Resampling spacing, px. Default 12. */
    readonly spacing?: number;
}

/** Result of a stroke: the emitted passes, for determinism checks and e2e signatures. */
export interface SketchResult {
    readonly passes: readonly (readonly Point[])[];
    readonly seed: number;
}

/** Arrow annotation: a dashed leader with a two-stroke arrowhead. */
export interface ArrowOptions extends SketchOptions {
    readonly dash?: readonly number[];
    readonly headLength?: number;
    readonly headSpread?: number;
}

/** Fill a region with parallel hatch strokes instead of a solid wash. */
export interface HatchOptions extends SketchOptions {
    /** Distance between hatch lines, px. Default 7. */
    readonly hatchSpacing?: number;
    /** Hatch angle in radians. Default -Math.PI / 4. */
    readonly hatchAngle?: number;
}

/** A hand-lettered baseline: a small deterministic tilt for canvas text. */
export interface TextGuide {
    readonly x: number;
    readonly y: number;
    readonly rotation: number;
    readonly width: number;
}

export const DEFAULT_SKETCH_OPTIONS = {
    roughness: 0.55,
    passes: 2,
    passOffset: 0.9,
    width: 1.6,
    alpha: 0.85,
    color: "#000",
    spacing: 12,
} as const;

export const DEFAULT_JITTER: JitterOptions = {
    amplitude: 2.4,
    wavelength: 46,
    fineAmplitude: 0.5,
};
