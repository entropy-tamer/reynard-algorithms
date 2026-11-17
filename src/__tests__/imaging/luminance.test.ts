import { describe, expect, it } from "vitest";
import {
    channelsOf,
    compositeChannels,
    contrastRatio,
    mixChannels,
    pixelsOf,
    relativeLuminance,
    requiredAlpha,
    srgbChannel,
} from "../../index";

describe("imaging/luminance", () => {
    it("linearizes the sRGB endpoints", () => {
        expect(srgbChannel(0)).toBe(0);
        expect(srgbChannel(255)).toBeCloseTo(1, 5);
        expect(srgbChannel(128)).toBeCloseTo(0.2159, 3);
    });

    it("measures black and white luminance", () => {
        expect(relativeLuminance([0, 0, 0])).toBe(0);
        expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 5);
        expect(relativeLuminance([255, 0, 0])).toBeCloseTo(0.2126, 4);
    });

    it("reports the canonical contrast ratio", () => {
        expect(contrastRatio([255, 255, 255], [0, 0, 0])).toBeCloseTo(21, 1);
        expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 1);
        expect(contrastRatio([120, 120, 120], [120, 120, 120])).toBe(1);
    });

    it("composites and mixes channels without alpha leaks", () => {
        expect(compositeChannels([0, 0, 0], [200, 100, 50], 0.5)).toEqual([100, 50, 25]);
        expect(mixChannels([10, 20, 30], [30, 20, 10], 0.5)).toEqual([20, 20, 20]);
        expect(channelsOf("245 245 245")).toEqual([245, 245, 245]);
    });

    it("skips fully transparent samples", () => {
        expect(pixelsOf([1, 2, 3, 0, 4, 5, 6, 255])).toEqual([[4, 5, 6]]);
    });

    it("finds the weakest veil that clears the floor", () => {
        const white: [number, number, number] = [255, 255, 255];
        const black: [number, number, number] = [0, 0, 0];
        const alpha = requiredAlpha(white, black, black, 4.5);
        expect(alpha).toBeGreaterThan(0.75);
        expect(alpha).toBeLessThanOrEqual(1);
        expect(requiredAlpha([], black, black)).toBe(1);
    });
});
