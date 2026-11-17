/**
 * Path jitter: displace a resampled point stream to look hand-drawn.
 *
 * The low-frequency component is smooth simplex noise sampled along arc
 * length (so a long stroke bends like a wrist, not like static). A small
 * uncorrelated component from mulberry32 gives the line its tooth. Both use
 * the seeded stream, so the result is byte-for-byte deterministic.
 *
 * @module algorithms/rendering/sketch/jitter
 */

import { SimplexNoise } from "../../procedural-generation/simplex-noise/simplex-noise-core.ts";
import { createSketchRandom } from "./seeding.ts";
import { pathLength } from "./resampling.ts";
import type { JitterOptions, Point } from "./types.ts";
import { DEFAULT_JITTER } from "./types.ts";

/** Unit tangents and normals at each point (endpoints use the adjacent segment). */
function frames(points: readonly Point[]): { nx: number; ny: number }[] {
    return points.map((point, i) => {
        const prev = points[Math.max(0, i - 1)]!;
        const next = points[Math.min(points.length - 1, i + 1)]!;
        const tx = next.x - prev.x;
        const ty = next.y - prev.y;
        const len = Math.hypot(tx, ty);
        if (len === 0) return { nx: 0, ny: 0 };
        return { nx: -ty / len, ny: tx / len };
    });
}

/**
 * Return a new point stream displaced along each point's normal.
 *
 * `amplitude` and `fineAmplitude` are multiplied by `scale` (the caller's
 * roughness). With `scale === 0` the geometry is returned unchanged, which
 * gives sketch mode a clean fallback and a stable animation end frame.
 */
export function jitterPath(
    points: readonly Point[],
    seed: number,
    options: Partial<JitterOptions> & { readonly scale?: number } = {},
): Point[] {
    const opts = { ...DEFAULT_JITTER, ...options };
    const scale = options.scale ?? 1;
    const amplitude = opts.amplitude * scale;
    const fineAmplitude = opts.fineAmplitude * scale;
    if (points.length === 0) return [];
    if (amplitude === 0 && fineAmplitude === 0) {
        return points.map((point) => ({ x: point.x, y: point.y }));
    }

    const random = createSketchRandom(seed);
    const noise = new SimplexNoise({ seed });
    const normals = frames(points);
    const total = pathLength(points);
    let arc = 0;

    return points.map((point, i) => {
        if (i > 0) arc += Math.hypot(point.x - points[i - 1]!.x, point.y - points[i - 1]!.y);
        const smooth = noise.noise2D((arc / opts.wavelength) * 2 + 13.5, 0.5) * amplitude;
        const fine = (random() * 2 - 1) * fineAmplitude;
        const offset = smooth + fine;
        // The first and last point keep their position: axes and bars must
        // still land on their measured coordinates.
        const anchored = i === 0 || i === points.length - 1 || total === 0 ? 0 : 1;
        return {
            x: point.x + normals[i]!.nx * offset * anchored,
            y: point.y + normals[i]!.ny * offset * anchored,
        };
    });
}

/** Largest possible normal displacement, for bound assertions in tests. */
export function jitterBound(options: Partial<JitterOptions> & { readonly scale?: number } = {}): number {
    const opts = { ...DEFAULT_JITTER, ...options };
    const scale = options.scale ?? 1;
    return (opts.amplitude + opts.fineAmplitude) * scale;
}
