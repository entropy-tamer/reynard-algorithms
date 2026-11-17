/**
 * Path resampling: turn geometry into an evenly spaced point stream.
 *
 * Jitter looks like a hand when the points are roughly equidistant; jittering
 * the two endpoints of a long segment and nothing between them looks like a
 * broken ruler. Resampling walks the polyline by ARC LENGTH, so it both
 * subdivides long segments and drops densely sampled input (SVG curves arrive
 * with hundreds of points per path).
 *
 * @module algorithms/rendering/sketch/resampling
 */

import type { Point } from "./types.ts";

const distance = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);

/** Total arc length of a point stream. */
export function pathLength(points: readonly Point[]): number {
    let total = 0;
    for (let i = 1; i < points.length; i++) total += distance(points[i - 1]!, points[i]!);
    return total;
}

/**
 * Sample a polyline at fixed arc-length intervals, including both ends.
 *
 * This is deliberately a resampler, not a filter: the output count depends on
 * the path length, not on the input count. Feeding it a 2000-point SVG trace
 * and a 2-point straight line of the same length yields the same output.
 */
export function resamplePolyline(points: readonly Point[], spacing: number): Point[] {
    if (points.length === 0) return [];
    if (points.length === 1) return [{ x: points[0]!.x, y: points[0]!.y }];
    const step = Math.max(0.5, spacing);
    const total = pathLength(points);
    if (total === 0) return [{ x: points[0]!.x, y: points[0]!.y }];
    const count = Math.max(1, Math.round(total / step));

    const out: Point[] = [];
    let segment = 1;
    let travelled = 0;
    for (let i = 0; i <= count; i++) {
        const target = (i / count) * total;
        while (segment < points.length - 1 && travelled + distance(points[segment - 1]!, points[segment]!) < target) {
            travelled += distance(points[segment - 1]!, points[segment]!);
            segment++;
        }
        const a = points[segment - 1]!;
        const b = points[segment]!;
        const length = distance(a, b);
        const t = length === 0 ? 0 : Math.min(1, Math.max(0, (target - travelled) / length));
        out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
    return out;
}

/** Resample one segment into points spaced `spacing` px apart, including both ends. */
export function resampleSegment(a: Point, b: Point, spacing: number): Point[] {
    return resamplePolyline([a, b], spacing);
}

/** Resample a closed ring, including the wrap segment back to the first point. */
export function resampleClosed(points: readonly Point[], spacing: number): Point[] {
    if (points.length < 3) return resamplePolyline(points, spacing);
    const open = resamplePolyline(points, spacing);
    const wrap = resampleSegment(points[points.length - 1]!, points[0]!, spacing);
    for (let j = 1; j < wrap.length; j++) open.push(wrap[j]!);
    return open;
}
