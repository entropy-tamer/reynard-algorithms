/**
 * Hand-drawn geometry primitives for charts.
 *
 * Every primitive takes a `SketchSink` and a seed, resamples its geometry, and
 * emits a double-pass wobbly stroke. Rect-returning primitives give back a
 * `LayoutRect` so callers can run the existing AABB validators against labels.
 *
 * @module algorithms/rendering/sketch/primitives
 */

import { toLayoutRect } from "../../collision/layout-rect.ts";
import type { LayoutRect } from "../../collision/layout-rect.ts";
import { resampleClosed, resamplePolyline, resampleSegment } from "./resampling.ts";
import { deriveSeed } from "./seeding.ts";
import { sketchStroke } from "./stroke.ts";
import { DEFAULT_SKETCH_OPTIONS } from "./types.ts";
import type {
    ArrowOptions,
    HatchOptions,
    Point,
    SketchOptions,
    SketchResult,
    SketchSink,
} from "./types.ts";

const spacingOf = (options: SketchOptions): number =>
    options.spacing ?? DEFAULT_SKETCH_OPTIONS.spacing;

/** A straight line, wobbling along its whole length. */
export function sketchLine(
    sink: SketchSink,
    a: Point,
    b: Point,
    seed: number,
    options: SketchOptions = {},
): SketchResult {
    return sketchStroke(sink, resampleSegment(a, b, spacingOf(options)), seed, options);
}

/** An open polyline (axes, series paths, break marks). */
export function sketchPolyline(
    sink: SketchSink,
    points: readonly Point[],
    seed: number,
    options: SketchOptions = {},
): SketchResult {
    return sketchStroke(sink, resamplePolyline(points, spacingOf(options)), seed, options);
}

/** A closed rectangle outline. Returns its un-jittered bounds for layout checks. */
export function sketchRect(
    sink: SketchSink,
    x: number,
    y: number,
    width: number,
    height: number,
    seed: number,
    options: SketchOptions = {},
): { readonly result: SketchResult; readonly bounds: LayoutRect } {
    const corners: Point[] = [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
    ];
    const result = sketchStroke(sink, resampleClosed(corners, spacingOf(options)), seed, options);
    return { result, bounds: toLayoutRect({ x, y, width, height }) };
}

/** A bar outline; pass `hatch` to fill it with gray strokes instead of solid ink. */
export function sketchBar(
    sink: SketchSink,
    x: number,
    y: number,
    width: number,
    height: number,
    seed: number,
    options: SketchOptions = {},
    hatch?: HatchOptions,
): { readonly result: SketchResult; readonly bounds: LayoutRect } {
    const rect = sketchRect(sink, x, y, width, height, seed, options);
    if (hatch && height > 2 && width > 2) {
        sketchHatchFill(sink, x, y, width, height, deriveSeed(seed, "hatch"), hatch);
    }
    return rect;
}

/** An ellipse or circle, sampled around its circumference then resampled. */
export function sketchEllipse(
    sink: SketchSink,
    cx: number,
    cy: number,
    radiusX: number,
    radiusY: number,
    seed: number,
    options: SketchOptions = {},
): SketchResult {
    const circumference = Math.PI * (3 * (radiusX + radiusY) - Math.sqrt((3 * radiusX + radiusY) * (radiusX + 3 * radiusY)));
    const samples = Math.max(12, Math.min(240, Math.round(circumference / spacingOf(options))));
    const ring: Point[] = [];
    for (let i = 0; i < samples; i++) {
        const angle = (i / samples) * Math.PI * 2;
        ring.push({ x: cx + Math.cos(angle) * radiusX, y: cy + Math.sin(angle) * radiusY });
    }
    return sketchStroke(sink, resampleClosed(ring, spacingOf(options)), seed, options);
}

/** Liang-Barsky clip of an infinite line to an axis-aligned rect. */
function clipLineToRect(
    x0: number,
    y0: number,
    dx: number,
    dy: number,
    rect: { x: number; y: number; width: number; height: number },
): [Point, Point] | null {
    const x1 = rect.x;
    const y1 = rect.y;
    const x2 = rect.x + rect.width;
    const y2 = rect.y + rect.height;
    let t0 = 0;
    let t1 = 1;
    const p = [-dx, dx, -dy, dy];
    const q = [x0 - x1, x2 - x0, y0 - y1, y2 - y0];
    for (let i = 0; i < 4; i++) {
        if (p[i] === 0) {
            if (q[i]! < 0) return null;
            continue;
        }
        const r = q[i]! / p[i]!;
        if (p[i]! < 0) t0 = Math.max(t0, r);
        else t1 = Math.min(t1, r);
        if (t0 > t1) return null;
    }
    return [
        { x: x0 + t0 * dx, y: y0 + t0 * dy },
        { x: x0 + t1 * dx, y: y0 + t1 * dy },
    ];
}

/** Parallel hatch strokes inside a rect, each independently jittered. */
export function sketchHatchFill(
    sink: SketchSink,
    x: number,
    y: number,
    width: number,
    height: number,
    seed: number,
    options: HatchOptions = {},
): SketchResult {
    const spacing = Math.max(2, options.hatchSpacing ?? 7);
    const angle = options.hatchAngle ?? -Math.PI / 4;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const nx = -dy;
    const ny = dx;
    const center = { x: x + width / 2, y: y + height / 2 };
    const extent = Math.hypot(width, height) / 2 + spacing;
    const normals: number[] = [];
    for (let offset = -extent; offset <= extent; offset += spacing) normals.push(offset);

    const allPasses: Point[][] = [];
    normals.forEach((offset, index) => {
        const ox = center.x + nx * offset - dx * extent;
        const oy = center.y + ny * offset - dy * extent;
        const clipped = clipLineToRect(ox, oy, dx * extent * 2, dy * extent * 2, { x, y, width, height });
        if (!clipped) return;
        const lineSeed = deriveSeed(seed, index);
        const result = sketchStroke(sink, resampleSegment(clipped[0], clipped[1], spacingOf(options)), lineSeed, {
            ...options,
            passes: 1,
            width: Math.min(options.width ?? DEFAULT_SKETCH_OPTIONS.width, 1),
            alpha: (options.alpha ?? 0.4) * 0.6,
        });
        allPasses.push(...result.passes.map((pass) => [...pass]));
    });
    return { passes: allPasses, seed };
}

/** A dashed annotation leader with a two-stroke arrowhead. */
export function sketchArrow(
    sink: SketchSink,
    from: Point,
    to: Point,
    seed: number,
    options: ArrowOptions = {},
): SketchResult {
    const dash = options.dash ?? [7, 5];
    const leader = sketchStroke(
        sink,
        resampleSegment(from, to, spacingOf(options)),
        seed,
        { ...options, passes: options.passes ?? 1 },
    );
    // The dash is applied on a second, separate path so the wobble is not lost.
    sink.setLineDash([...dash]);
    sink.beginPath();
    sink.moveTo(from.x, from.y);
    sink.lineTo(to.x, to.y);
    sink.strokeStyle = options.color ?? DEFAULT_SKETCH_OPTIONS.color;
    sink.lineWidth = options.width ?? DEFAULT_SKETCH_OPTIONS.width;
    sink.globalAlpha = options.alpha ?? DEFAULT_SKETCH_OPTIONS.alpha;
    sink.stroke();
    sink.setLineDash([]);

    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLength = options.headLength ?? 9;
    const headSpread = options.headSpread ?? 0.42;
    for (const side of [-1, 1]) {
        const a = angle + Math.PI + side * headSpread;
        const tip: Point = { x: to.x + Math.cos(a) * headLength, y: to.y + Math.sin(a) * headLength };
        sketchStroke(sink, resampleSegment(to, tip, spacingOf(options)), deriveSeed(seed, `head${side}`), {
            ...options,
            passes: 1,
            width: (options.width ?? DEFAULT_SKETCH_OPTIONS.width) * 0.9,
        });
    }
    return leader;
}
