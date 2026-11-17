import { describe, expect, it } from "vitest";
import {
    DEFAULT_JITTER,
    deriveSeed,
    hashSketch,
    jitterBound,
    jitterPath,
    pathLength,
    passSeed,
    resampleClosed,
    resamplePolyline,
    resampleSegment,
    serializeSketch,
    sketchArrow,
    sketchBar,
    sketchEllipse,
    sketchHatchFill,
    sketchLine,
    sketchPolyline,
    sketchRect,
    sketchStroke,
    sketchTextUnderline,
    textGuide,
} from "../../algorithms/rendering/sketch/index.ts";
import type { Point, SketchSink } from "../../algorithms/rendering/sketch/index.ts";
import { rectsIntersect } from "../../algorithms/collision/layout-rect.ts";

/** A canvas-like recorder: no DOM, just the calls a primitive makes. */
class RecordingSink implements SketchSink {
    calls: string[] = [];
    strokeStyle: string | { readonly __gradient?: never } = "#000";
    fillStyle: string | { readonly __gradient?: never } = "#000";
    lineWidth = 1;
    globalAlpha = 1;
    lineCap: "butt" | "round" | "square" = "butt";
    lineJoin: "miter" | "round" | "bevel" = "miter";
    beginPath() { this.calls.push("beginPath"); }
    moveTo(x: number, y: number) { this.calls.push(`moveTo:${x},${y}`); }
    lineTo(x: number, y: number) { this.calls.push(`lineTo:${x},${y}`); }
    quadraticCurveTo(cx: number, cy: number, x: number, y: number) { this.calls.push(`q:${cx},${cy},${x},${y}`); }
    closePath() { this.calls.push("closePath"); }
    stroke() { this.calls.push("stroke"); }
    fill() { this.calls.push("fill"); }
    setLineDash(segments: number[]) { this.calls.push(`dash:${segments.join(",")}`); }
}

const seg = (a: Point, b: Point): Point[] => [{ ...a }, { ...b }];
const finite = (points: readonly Point[]) => points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

describe("deriveSeed", () => {
    it("is deterministic and diverges on any part", () => {
        const a = deriveSeed("chart", "bar-1", "neutral");
        expect(a).toBe(deriveSeed("chart", "bar-1", "neutral"));
        expect(a).not.toBe(deriveSeed("chart", "bar-2", "neutral"));
        expect(a).not.toBe(deriveSeed("chart", "bar-1", "light"));
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThanOrEqual(0xffffffff);
    });

    it("length-prefixes parts so ['ab','c'] cannot collide with ['a','bc']", () => {
        expect(deriveSeed("ab", "c")).not.toBe(deriveSeed("a", "bc"));
    });

    it("handles empty input and numbers stably", () => {
        expect(deriveSeed()).toBe(deriveSeed());
        expect(deriveSeed(1, 2)).toBe(deriveSeed("1", "2"));
        expect(passSeed(7, 0)).not.toBe(passSeed(7, 1));
    });
});

describe("resampling", () => {
    it("resamples a segment to ~fixed spacing, including both ends", () => {
        const points = resampleSegment({ x: 0, y: 0 }, { x: 100, y: 0 }, 10);
        expect(points).toHaveLength(11);
        expect(points[0]).toEqual({ x: 0, y: 0 });
        expect(points[10]).toEqual({ x: 100, y: 0 });
        for (let i = 1; i < points.length; i++) {
            expect(points[i]!.x - points[i - 1]!.x).toBeCloseTo(10, 6);
        }
    });

    it("handles zero-length and single-point inputs", () => {
        expect(resampleSegment({ x: 2, y: 3 }, { x: 2, y: 3 }, 10)).toEqual([{ x: 2, y: 3 }]);
        expect(resamplePolyline([{ x: 1, y: 1 }], 10)).toEqual([{ x: 1, y: 1 }]);
        expect(resamplePolyline([], 10)).toEqual([]);
    });

    it("drops duplicate joints in a polyline and closes a ring", () => {
        const open = resamplePolyline([{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 20 }], 10);
        expect(open).toHaveLength(5);
        const ring = resampleClosed([{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 20 }], 10);
        expect(pathLength(ring)).toBeGreaterThan(pathLength(open));
        expect(finite(ring)).toBe(true);
    });
});

describe("jitterPath", () => {
    const line = resampleSegment({ x: 10, y: 50 }, { x: 210, y: 50 }, 8);

    it("is deterministic and finite", () => {
        const a = jitterPath(line, 42);
        const b = jitterPath(line, 42);
        expect(a).toEqual(b);
        expect(finite(a)).toBe(true);
        expect(a).not.toEqual(jitterPath(line, 43));
    });

    it("stays within the documented bound", () => {
        const j = jitterPath(line, 7, { scale: 1 });
        const bound = jitterBound({ scale: 1 });
        expect(bound).toBeCloseTo(DEFAULT_JITTER.amplitude + DEFAULT_JITTER.fineAmplitude, 6);
        for (let i = 0; i < j.length; i++) {
            expect(Math.abs(j[i]!.y - line[i]!.y)).toBeLessThanOrEqual(bound + 1e-9);
            expect(j[i]!.x).toBe(line[i]!.x); // horizontal line -> normal is vertical
        }
    });

    it("is smooth: adjacent displacements do not jump", () => {
        const j = jitterPath(line, 99);
        for (let i = 2; i < j.length - 1; i++) {
            const d1 = j[i]!.y - j[i - 1]!.y;
            const d2 = j[i + 1]!.y - j[i]!.y;
            // Each displacement is bounded by jitterBound, so the difference
            // of two consecutive displacements is bounded by twice that.
            expect(Math.abs(d2 - d1)).toBeLessThan(2 * jitterBound({ scale: 1 }));
        }
    });

    it("returns the exact geometry at roughness 0 and anchors endpoints", () => {
        expect(jitterPath(line, 5, { scale: 0 })).toEqual(line);
        const j = jitterPath(line, 5);
        expect(j[0]).toEqual(line[0]);
        expect(j[j.length - 1]).toEqual(line[line.length - 1]);
    });
});

describe("sketchStroke", () => {
    it("emits the requested number of passes deterministically", () => {
        const a = new RecordingSink();
        const b = new RecordingSink();
        const points = resampleSegment({ x: 0, y: 0 }, { x: 80, y: 0 }, 10);
        const ra = sketchStroke(a, points, 123, { passes: 2 });
        sketchStroke(b, points, 123, { passes: 2 });
        expect(ra.passes).toHaveLength(2);
        expect(a.calls).toEqual(b.calls);
        expect(a.calls.filter((c) => c === "stroke")).toHaveLength(2);
        expect(serializeSketch(ra)).toBe(serializeSketch(sketchStroke(new RecordingSink(), points, 123, { passes: 2 })));
    });

    it("honors width and alpha bounds", () => {
        const sink = new RecordingSink();
        sketchStroke(sink, seg({ x: 0, y: 0 }, { x: 20, y: 0 }), 1, { width: 2, alpha: 0.5, passes: 3 });
        expect(sink.lineWidth).toBeLessThanOrEqual(2);
        expect(sink.globalAlpha).toBeLessThanOrEqual(0.5);
    });
});

describe("primitives", () => {
    const sink = () => new RecordingSink();

    it("draws a line, polyline, rect and bar with layout bounds", () => {
        expect(sketchLine(sink(), { x: 0, y: 0 }, { x: 40, y: 0 }, 1).passes.length).toBeGreaterThan(0);
        expect(sketchPolyline(sink(), [{ x: 0, y: 0 }, { x: 10, y: 10 }], 2).passes.length).toBeGreaterThan(0);
        const rect = sketchRect(sink(), 10, 20, 30, 40, 3);
        expect(rect.bounds).toMatchObject({ x: 10, y: 20, width: 30, height: 40 });
        const bar = sketchBar(sink(), 10, 20, 30, 40, 4);
        expect(bar.bounds).toMatchObject({ x: 10, y: 20, width: 30, height: 40 });
    });

    it("hatch fill stays inside the bar bounds", () => {
        const s = sink();
        const hatch = sketchHatchFill(s, 10, 20, 40, 60, 5, { hatchSpacing: 6 });
        expect(hatch.passes.length).toBeGreaterThan(0);
        // Every emitted point must lie on or inside the rect (small wobble tolerated).
        for (const pass of hatch.passes) {
            for (const p of pass) {
                expect(p.x).toBeGreaterThanOrEqual(10 - DEFAULT_JITTER.amplitude - 1);
                expect(p.x).toBeLessThanOrEqual(50 + DEFAULT_JITTER.amplitude + 1);
            }
        }
    });

    it("draws an ellipse and an arrow deterministically", () => {
        const a = sketchEllipse(sink(), 50, 50, 20, 10, 6);
        const b = sketchEllipse(sink(), 50, 50, 20, 10, 6);
        expect(hashSketch(a)).toBe(hashSketch(b));
        const arrow = sketchArrow(sink(), { x: 0, y: 0 }, { x: 60, y: 30 }, 7);
        expect(arrow.passes.length).toBeGreaterThan(0);
        expect(hashSketch(arrow)).toBe(hashSketch(sketchArrow(sink(), { x: 0, y: 0 }, { x: 60, y: 30 }, 7)));
    });

    it("uses AABB helpers to keep a value label off the bar", () => {
        const bar = sketchBar(sink(), 100, 120, 40, 60, 8).bounds;
        const label = { x: 105, y: 100, width: 30, height: 14 };
        expect(rectsIntersect(bar, label)).toBe(false);
        expect(rectsIntersect(bar, { x: 105, y: 130, width: 30, height: 14 })).toBe(true);
    });
});

describe("text and serialization", () => {
    it("textGuide is stable and stays within a small tilt", () => {
        const a = textGuide("chart", "title", "neutral", 10, 20, 100);
        expect(a).toEqual(textGuide("chart", "title", "neutral", 10, 20, 100));
        expect(Math.abs(a.rotation)).toBeLessThan(0.03);
        expect(textGuide("chart", "title", "dark", 10, 20, 100).rotation).not.toBe(a.rotation);
    });

    it("sketchTextUnderline draws deterministically", () => {
        const a = new RecordingSink();
        sketchTextUnderline(a, 0, 10, 50, 3);
        const b = new RecordingSink();
        sketchTextUnderline(b, 0, 10, 50, 3);
        expect(a.calls).toEqual(b.calls);
    });

    it("hashSketch changes with any seed change", () => {
        const points = resampleSegment({ x: 0, y: 0 }, { x: 30, y: 0 }, 10);
        expect(hashSketch(sketchStroke(new RecordingSink(), points, 1))).not.toBe(
            hashSketch(sketchStroke(new RecordingSink(), points, 2)),
        );
    });
});
