import { describe, expect, it } from "vitest";
import {
    integralImage,
    lumaSaliency,
    makeLumaGrid,
    oppositeQuadrant,
    placeCoverText,
    rectsIntersect,
    stackCoverText,
    regionMean,
    regionSum,
    saliencyCenter,
    type LumaGrid,
    type TextBlock,
} from "../../index";

const BLOCKS: readonly TextBlock[] = [
    { id: "headline", weight: 1, width: 0.36, height: 0.2 },
    { id: "kicker", weight: 0.7, width: 0.16, height: 0.04 },
    { id: "deck", weight: 0.5, width: 0.26, height: 0.1 },
];

function flatGrid(luma: number, width = 96, height = 54): LumaGrid {
    const values = new Float32Array(width * height).fill(luma);
    return { width, height, luma: values };
}

function gridWithBlob(blobX: number, blobY: number, blobLuma = 0.6): LumaGrid {
    const grid = flatGrid(0.01);
    for (let y = 0; y < grid.height; y += 1) {
        for (let x = 0; x < grid.width; x += 1) {
            const dx = x / grid.width - blobX;
            const dy = y / grid.height - blobY;
            if (dx * dx + dy * dy < 0.02) grid.luma[y * grid.width + x] = blobLuma;
        }
    }
    return grid;
}

describe("layout/cover-placement", () => {
    it("computes integral sums and means", () => {
        const values = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const sum = integralImage(values, 3, 3);
        expect(regionSum(sum, 3, 3, 0, 0, 3, 3)).toBe(45);
        expect(regionSum(sum, 3, 3, 1, 1, 1, 1)).toBe(5);
        expect(regionMean(sum, 3, 3, 0, 0, 3, 3)).toBe(5);
    });

    it("builds a luma grid with a backdrop for transparent pixels", () => {
        const grid = makeLumaGrid([255, 0, 0, 255, 255, 255, 255, 0], 2, 1);
        expect(grid.luma[0]).toBeCloseTo(0.2126, 3);
        expect(grid.luma[1]).toBeGreaterThan(0.7);
    });

    it("puts the saliency center opposite a bright subject", () => {
        const grid = gridWithBlob(0.8, 0.8);
        const saliency = lumaSaliency(grid);
        const center = saliencyCenter(saliency, grid.width, grid.height);
        expect(center.x).toBeGreaterThan(0.55);
        expect(center.y).toBeGreaterThan(0.55);
        expect(oppositeQuadrant(center)).toBe("tl");
        expect(oppositeQuadrant({ x: 0.1, y: 0.1 })).toBe("br");
    });

    it("places three blocks without overlap on a flat dark surface", () => {
        const result = placeCoverText(flatGrid(0.01), BLOCKS, { preferredTone: "dark" });
        const placed = Object.values(result.blocks);
        expect(placed).toHaveLength(3);
        for (let i = 0; i < placed.length; i += 1) {
            for (let j = i + 1; j < placed.length; j += 1) {
                expect(rectsIntersect(placed[i], placed[j])).toBe(false);
            }
        }
        expect(result.diagnostics.quadrant).toBe("tl");
        expect(result.blocks.headline.x).toBeLessThan(0.5);
        expect(result.blocks.headline.y).toBeLessThan(0.5);
    });

    it("moves the headline away from a bottom-right subject", () => {
        const result = placeCoverText(gridWithBlob(0.8, 0.8), BLOCKS);
        expect(result.blocks.headline.x).toBeLessThan(0.5);
        expect(result.blocks.headline.y).toBeLessThan(0.5);
    });

    it("moves the headline away from a top-left subject", () => {
        const result = placeCoverText(gridWithBlob(0.2, 0.2), BLOCKS);
        // The balance term pushes right, and the soft corner prior keeps it high:
        // top-right is the intended answer for a subject in the top-left.
        expect(result.blocks.headline.x).toBeGreaterThan(0.4);
        expect(result.blocks.headline.y).toBeLessThan(0.5);
    });

    it("honors reserved areas", () => {
        const reserved = [{ x: 0, y: 0, width: 0.5, height: 0.3 }];
        const result = placeCoverText(flatGrid(0.01), BLOCKS, { reserved });
        const kicker = result.blocks.kicker;
        expect(rectsIntersect(kicker, reserved[0])).toBe(false);
    });

    it("stacks the three roles in a top-anchored column on the quiet side", () => {
        const blocks: TextBlock[] = [
            { id: "kicker", weight: 0.7, width: 0.18, height: 0.05 },
            { id: "headline", weight: 1, width: 0.4, height: 0.22 },
            { id: "deck", weight: 0.5, width: 0.4, height: 0.12 },
        ];
        const result = stackCoverText(gridWithBlob(0.8, 0.4), blocks, {
            reserved: [{ x: 0, y: 0, width: 1, height: 0.12 }],
        });
        expect(result.diagnostics.quadrant).toBe("tl");
        expect(result.blocks.kicker.y).toBeGreaterThanOrEqual(0.12);
        expect(result.blocks.headline.y).toBeGreaterThan(result.blocks.kicker.y);
        expect(result.blocks.deck.y).toBeGreaterThan(result.blocks.headline.y);
        expect(result.blocks.kicker.x).toBe(result.blocks.headline.x);
        expect(result.blocks.deck.x).toBe(result.blocks.headline.x);
        expect(result.blocks.kicker.x).toBeLessThan(0.5);
        expect(rectsIntersect(result.blocks.headline, result.blocks.deck)).toBe(false);
    });

    it("moves the column when a hard no-zone blocks the preferred side", () => {
        const blocks: TextBlock[] = [
            { id: "kicker", weight: 0.7, width: 0.18, height: 0.05 },
            { id: "headline", weight: 1, width: 0.4, height: 0.22 },
            { id: "deck", weight: 0.5, width: 0.4, height: 0.12 },
        ];
        // Subject sits right (so left is preferred), but the left half is a
        // hard no-zone; the solver must take the clear right column.
        const result = stackCoverText(gridWithBlob(0.8, 0.5), blocks, {
            noZones: [{ x: 0, y: 0, width: 0.48, height: 1 }],
        });
        expect(result.diagnostics.quadrant).toBe("tr");
        for (const block of Object.values(result.blocks)) {
            expect(block.x).toBeGreaterThan(0.5);
            expect(Number.isFinite(block.score)).toBe(true);
        }
    });

    it("is deterministic", () => {
        const grid = gridWithBlob(0.35, 0.7);
        const first = placeCoverText(grid, BLOCKS, { cornerBias: 0.5 });
        const second = placeCoverText(grid, BLOCKS, { cornerBias: 0.5 });
        expect(first.blocks).toEqual(second.blocks);
    });
});
