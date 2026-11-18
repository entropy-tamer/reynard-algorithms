import { describe, expect, it } from "vitest";
import { contentFloorPct, fitColumnsToContent, type SizedColumn } from "../../index";

const col = (key: string, width: number, minWidthPx?: number, resizable = true): SizedColumn => ({
    key,
    width,
    minWidthPx,
    resizable,
});
const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

describe("contentFloorPct", () => {
    it("returns the default floor for a missing or unpositive measurement", () => {
        expect(contentFloorPct(undefined, 1000)).toBe(4);
        expect(contentFloorPct(0, 1000)).toBe(4);
        expect(contentFloorPct(-10, 1000)).toBe(4);
        expect(contentFloorPct(100, 0)).toBe(4);
    });

    it("converts pixels plus gutter into a percentage", () => {
        expect(contentFloorPct(100, 1000, 20)).toBe(12);
        expect(contentFloorPct(25, 1000)).toBe(4); // below the floor
        expect(contentFloorPct(900, 1000)).toBe(80); // above the ceiling
    });
});

describe("fitColumnsToContent", () => {
    it("returns an empty result for no columns", () => {
        expect(fitColumnsToContent([], { containerPx: 1000 })).toEqual({
            widths: [],
            overflowPx: 0,
            raised: [],
        });
    });

    it("normalizes declared widths when no floor bites", () => {
        const result = fitColumnsToContent([col("a", 1), col("b", 1), col("c", 1)], { containerPx: 1000 });
        expect(result.widths).toEqual([33.34, 33.33, 33.33]);
        expect(sum(result.widths)).toBe(100);
        expect(result.raised).toEqual([]);
        expect(result.overflowPx).toBe(0);
    });

    it("raises a narrow column and borrows from the roomiest donor", () => {
        const columns = [col("wide", 50), col("roomy", 30), col("badge", 20, 250)];
        const result = fitColumnsToContent(columns, { containerPx: 1000 });
        // badge floor is 25%: +5 from wide (slack 46) rather than roomy (slack 26)
        expect(result.widths).toEqual([45, 30, 25]);
        expect(result.raised).toEqual(["badge"]);
        expect(sum(result.widths)).toBe(100);
        expect(result.overflowPx).toBe(0);
    });

    it("accounts for the inter-column gutter", () => {
        const result = fitColumnsToContent([col("a", 95), col("b", 5, 100)], {
            containerPx: 1000,
            gutterPx: 20,
        });
        expect(result.widths).toEqual([88, 12]);
        expect(result.raised).toEqual(["b"]);
    });

    it("donates from resizable columns before fixed ones", () => {
        const columns = [col("fixed", 50, undefined, false), col("flex", 30), col("badge", 20, 250)];
        expect(fitColumnsToContent(columns, { containerPx: 1000 }).widths).toEqual([50, 25, 25]);
    });

    it("uses a fixed column when no resizable one has slack", () => {
        const columns = [col("fixed", 76, undefined, false), col("floor", 4), col("badge", 20, 250)];
        expect(fitColumnsToContent(columns, { containerPx: 1000 }).widths).toEqual([71, 4, 25]);
    });

    it("caps a floor at the configured ceiling", () => {
        const result = fitColumnsToContent([col("a", 90), col("b", 10, 900)], { containerPx: 1000 });
        expect(result.widths).toEqual([20, 80]);
        expect(sum(result.widths)).toBe(100);
    });

    it("reports overflow instead of shrinking below a floor", () => {
        const result = fitColumnsToContent([col("a", 50, 600), col("b", 50, 600)], {
            containerPx: 1000,
        });
        expect(result.widths).toEqual([60, 60]);
        expect(result.raised).toEqual(["a", "b"]);
        expect(result.overflowPx).toBe(200);
    });

    it("never mutates its input", () => {
        const columns = [col("a", 90), col("b", 10, 250)];
        const before = columns.map((column) => ({ ...column }));
        fitColumnsToContent(columns, { containerPx: 1000 });
        expect(columns).toEqual(before);
    });

    it("is deterministic", () => {
        const columns = [col("a", 60), col("b", 25), col("c", 15, 250)];
        const options = { containerPx: 1000, gutterPx: 8 };
        const first = fitColumnsToContent(columns, options);
        expect(fitColumnsToContent(columns, options)).toEqual(first);
    });

    it("keeps a finite sum with an unpositive container", () => {
        const result = fitColumnsToContent([col("a", 60), col("b", 40, 100)], { containerPx: 0 });
        expect(sum(result.widths)).toBe(100);
        expect(result.overflowPx).toBe(0);
        expect(result.widths.every(Number.isFinite)).toBe(true);
    });

    it("holds the sum invariant across a spread of declared widths", () => {
        for (const width of [1, 7.3, 19, 33.33, 51.7, 89.99]) {
            const result = fitColumnsToContent(
                [col("a", width), col("b", 100 - width, 120)],
                { containerPx: 768, gutterPx: 11.2 },
            );
            expect(sum(result.widths)).toBe(100);
        }
    });
});
