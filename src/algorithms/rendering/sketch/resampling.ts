/**
 * Path resampling: turn geometry into an evenly spaced point stream.
 *
 * Jitter looks like a hand when the points are roughly equidistant; jittering
 * the two endpoints of a long segment and nothing between them looks like a
 * broken ruler. Resampling happens before every jitter pass.
 *
 * @module algorithms/rendering/sketch/resampling
 */

import type { Point } from "./types.ts";

const distance = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);

/** Resample one segment into points spaced `spacing` px apart, including both ends. */
export function resampleSegment(a: Point, b: Point, spacing: number): Point[] {
    const step = Math.max(0.5, spacing);
    const length = distance(a, b);
    if (length === 0) return [{ x: a.x, y: a.y }];
    const count = Math.max(1, Math.round(length / step));
    const out: Point[] = [];
    for (let i = 0; i <= count; i++) {
        const t = i / count;
        out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
    return out;
}

/** Resample an open polyline; duplicate joints are dropped. */
export function resamplePolyline(points: readonly Point[], spacing: number): Point[] {
    if (points.length === 0) return [];
    if (points.length === 1) return [{ x: points[0]!.x, y: points[0]!.y }];
    const out: Point[] = [{ x: points[0]!.x, y: points[0]!.y }];
    for (let i = 1; i < points.length; i++) {
        const segment = resampleSegment(points[i - 1]!, points[i]!, spacing);
        for (let j = 1; j < segment.length; j++) out.push(segment[j]!);
    }
    return out;
}

/** Resample a closed ring, including the wrap segment back to the first point. */
export function resampleClosed(points: readonly Point[], spacing: number): Point[] {
    if (points.length < 3) return resamplePolyline(points, spacing);
    const open = resamplePolyline(points, spacing);
    const last = points[points.length - 1]!;
    const first = points[0]!;
    const wrap = resampleSegment(last, first, spacing);
    for (let j = 1; j < wrap.length; j++) open.push(wrap[j]!);
    return open;
}

/** Total arc length of a point stream. */
export function pathLength(points: readonly Point[]): number {
    let total = 0;
    for (let i = 1; i < points.length; i++) total += distance(points[i - 1]!, points[i]!);
    return total;
}
