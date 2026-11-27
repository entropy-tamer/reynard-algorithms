import { describe, expect, it } from "vitest";
import {
    computeFov,
    hasLineOfSight,
    isOpaqueAt,
    lineCells,
    type VisionGrid,
} from "../field-of-view";

function grid(width: number, height: number, walls: readonly string[] = []): VisionGrid {
    const blocked = new Set(walls);
    return {
        width,
        height,
        isOpaque: (x, y) => blocked.has(`${x},${y}`),
    };
}

describe("grid line of sight", () => {
    it("sees an open neighbour and the target itself, but not off-board cells", () => {
        const open = grid(5, 5);
        expect(hasLineOfSight(open, { x: 2, y: 2 }, { x: 2, y: 2 })).toBe(true);
        expect(hasLineOfSight(open, { x: 2, y: 2 }, { x: 4, y: 4 })).toBe(true);
        expect(hasLineOfSight(open, { x: 2, y: 2 }, { x: 5, y: 2 })).toBe(false);
        expect(isOpaqueAt(open, -1, 2)).toBe(true);
    });

    it("stops at the first opaque cell, not just at the target", () => {
        const walled = grid(7, 3, ["3,1"]);
        expect(hasLineOfSight(walled, { x: 1, y: 1 }, { x: 3, y: 1 })).toBe(true);
        expect(hasLineOfSight(walled, { x: 1, y: 1 }, { x: 5, y: 1 })).toBe(false);
    });

    it("does not peek through a diagonal gap closed by two corners", () => {
        const cornered = grid(4, 4, ["1,2", "2,1"]);
        expect(hasLineOfSight(cornered, { x: 1, y: 1 }, { x: 2, y: 2 })).toBe(false);
        expect([...lineCells({ x: 1, y: 1 }, { x: 2, y: 2 })].length).toBe(1);
    });
});

describe("fog of war", () => {
    it("lights a radius and leaves the rest of the memory blank", () => {
        const open = grid(9, 9);
        const view = computeFov(open, { x: 4, y: 4 }, 2);
        expect(view.isVisible(4, 4)).toBe(true);
        expect(view.isVisible(6, 4)).toBe(true);
        expect(view.isVisible(7, 4)).toBe(false);
        expect(view.isVisible(4, 2)).toBe(true);
        expect(view.isExplored(8, 8)).toBe(false);
    });

    it("keeps explored cells after the fox walks away", () => {
        const open = grid(9, 9);
        const first = computeFov(open, { x: 1, y: 1 }, 2);
        const second = computeFov(open, { x: 7, y: 7 }, 1, first.explored);
        expect(second.isVisible(1, 1)).toBe(false);
        expect(second.isExplored(1, 1)).toBe(true);
        expect(second.explored).not.toBe(first.explored);
        expect(first.explored[1 * 9 + 1]).toBe(1);
    });

    it("never mutates the memory it was handed", () => {
        const open = grid(5, 5);
        const memory = new Uint8Array(25);
        const view = computeFov(open, { x: 2, y: 2 }, 1, memory);
        expect(memory.every((value) => value === 0)).toBe(true);
        expect(view.visible.reduce((sum, value) => sum + value, 0)).toBe(5);
    });

    it("keeps a wall visible but hides ground behind it", () => {
        const walled = grid(7, 3, ["3,1"]);
        const view = computeFov(walled, { x: 1, y: 1 }, 4);
        expect(view.isVisible(3, 1)).toBe(true);
        expect(view.isVisible(4, 1)).toBe(false);
        expect(view.isVisible(2, 0)).toBe(true);
    });
});
