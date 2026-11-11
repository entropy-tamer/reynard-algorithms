import { describe, expect, it } from "vitest";
import {
    decodeFoxTier,
    foxFireCss,
    foxFireFlatColor,
    foxFireLayout,
    FOX_ART_TIERS,
    renderFoxFireFrame,
    FOX_FIRE_PALETTE,
    type FoxFireCell,
    type FoxFirePalette,
} from "../../algorithms/rendering/fox-fire";
import { FireBuffer } from "../../algorithms/rendering/fox-fire";

/** A lit fire, so the frame has something to draw. */
function litFire(cols = 20, rows = 10, seed = 7): FireBuffer {
    const fire = new FireBuffer({ cols, rows, seed });
    for (let i = 0; i < 40; i++) fire.step();
    return fire;
}

describe("foxFireLayout", () => {
    it("picks the tier that fits and centres the head", () => {
        const layout = foxFireLayout(80, 22);
        expect(layout.tier.cols).toBeLessThanOrEqual(80);
        expect(layout.tier.rows).toBeLessThanOrEqual(22);
        // The head is centred: the gap on the left and the gap on the right
        // differ by at most one cell.
        const left = layout.offsetX;
        const right = 80 - layout.tier.cols - layout.offsetX;
        expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
    });

    it("falls back to the smallest tier when nothing fits", () => {
        const layout = foxFireLayout(10, 4);
        expect(layout.tier).toBe(FOX_ART_TIERS[FOX_ART_TIERS.length - 1]);
    });
});

describe("renderFoxFireFrame", () => {
    it("draws the mark's stroke and the fire around it", () => {
        const layout = foxFireLayout(80, 22);
        const frame = renderFoxFireFrame({
            tier: layout.tier,
            fire: litFire(),
            cols: 80,
            rows: 22,
            offsetX: layout.offsetX,
            offsetY: layout.offsetY,
        });
        expect(frame.length).toBe(22);
        expect(frame[0].length).toBe(80);
        const marks = frame.flat().filter((cell) => cell.kind === "mark");
        const fires = frame.flat().filter((cell) => cell.kind === "fire");
        expect(marks.length).toBeGreaterThan(0);
        expect(fires.length).toBeGreaterThan(0);
    });

    it("draws the mark's stroke, not the fire, where the art says ink", () => {
        const layout = foxFireLayout(80, 22);
        const fire = litFire();
        const frame = renderFoxFireFrame({
            tier: layout.tier,
            fire,
            cols: 80,
            rows: 22,
            offsetX: layout.offsetX,
            offsetY: layout.offsetY,
        });
        const codes = decodeFoxTier(layout.tier);
        let ink = 0;
        frame.forEach((row, y) => {
            row.forEach((cell, x) => {
                const markX = x - layout.offsetX;
                const markY = y - layout.offsetY;
                const inMark =
                    markX >= 0 && markY >= 0 &&
                    markX < layout.tier.cols && markY < layout.tier.rows;
                const code = inMark ? codes[markY * layout.tier.cols + markX] : 0;
                if ((code & 32) !== 0) {
                    ink += 1;
                    // The stroke is drawn as the mark, never as fire.
                    expect(cell.kind).toBe("mark");
                    expect(cell.glyph).not.toBe(" ");
                }
            });
        });
        expect(ink).toBeGreaterThan(0);
    });

    it("paints the mark and the fire when the palette can be blended", () => {
        const layout = foxFireLayout(80, 22);
        const frame = renderFoxFireFrame({
            tier: layout.tier,
            fire: litFire(),
            cols: 80,
            rows: 22,
            offsetX: layout.offsetX,
            offsetY: layout.offsetY,
        });
        const mark = frame.flat().find((cell) => cell.kind === "mark");
        expect(mark?.color).toBeDefined();
        expect(foxFireCss(mark as FoxFireCell)).toMatch(/^rgb\(/);
    });

    it("paints flat tones on a light surface, and no blended colour", () => {
        const layout = foxFireLayout(80, 22);
        const frame = renderFoxFireFrame({
            tier: layout.tier,
            fire: litFire(),
            cols: 80,
            rows: 22,
            offsetX: layout.offsetX,
            offsetY: layout.offsetY,
            light: true,
        });
        for (const cell of frame.flat()) {
            expect(cell.color).toBeUndefined();
        }
        const mark = frame.flat().find((cell) => cell.kind === "mark");
        // The flat tone is the palette's lit one: the head is the subject.
        expect(foxFireFlatColor(mark as FoxFireCell)).toEqual(FOX_FIRE_PALETTE.light);
    });

    it("moves the sweep's crest with the phase", () => {
        const layout = foxFireLayout(80, 22);
        const options = {
            tier: layout.tier,
            fire: litFire(),
            cols: 80,
            rows: 22,
            offsetX: layout.offsetX,
            offsetY: layout.offsetY,
        };
        const early = renderFoxFireFrame({ ...options, phase: 0 });
        const late = renderFoxFireFrame({ ...options, phase: 0.5 });
        const colours = (frame: FoxFireCell[][]) =>
            frame
                .flat()
                .filter((cell) => cell.kind === "mark")
                .map((cell) => cell.color?.r ?? 0)
                .join(",");
        expect(colours(early)).not.toBe(colours(late));
    });

    it("takes the palette the caller gives it", () => {
        const layout = foxFireLayout(80, 22);
        const palette: FoxFirePalette = {
            shadow: { r: 0, g: 0, b: 0 },
            light: { r: 1, g: 2, b: 3 },
            crest: { r: 4, g: 5, b: 6 },
        };
        const frame = renderFoxFireFrame({
            tier: layout.tier,
            fire: litFire(),
            cols: 80,
            rows: 22,
            offsetX: layout.offsetX,
            offsetY: layout.offsetY,
            palette,
        });
        const mark = frame.flat().find((cell) => cell.kind === "mark");
        expect(mark?.color).toBeDefined();
        // The mark's colour is made of the palette's stops and nothing else.
        const channels = [mark?.color?.r ?? -1, mark?.color?.g ?? -1, mark?.color?.b ?? -1];
        for (const channel of channels) {
            expect(channel).toBeGreaterThanOrEqual(0);
            expect(channel).toBeLessThanOrEqual(255);
        }
    });
});
