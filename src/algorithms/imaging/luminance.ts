/**
 * @file Perceptual luminance and WCAG contrast arithmetic for sampled images.
 * @module imaging/luminance
 *
 * Pure, DOM-free color measurement. This is the arithmetic that a caller such as
 * a cover hero needs when it has already sampled pixels behind its words. It
 * deliberately knows nothing about canvases, themes or pages: the sampling and
 * the decision about *where* to put text belong to their own modules.
 *
 * The constants and formulas match the ones the site's hero previously carried
 * inline. Keeping them here means a placement solver and an ink chooser cannot
 * disagree about what "4.5:1" or "relative luminance" means.
 */

/** An opaque RGB triple. Values are 0-255. */
export type Channels = readonly [number, number, number];

/** Linearize one sRGB channel (0-255) to relative luminance space. */
export const srgbChannel = (value: number): number => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** Relative luminance, weights from WCAG 2.1. Returns a number in [0, 1]. */
export const relativeLuminance = (channels: Channels): number =>
    0.2126 * srgbChannel(channels[0]) + 0.7152 * srgbChannel(channels[1]) + 0.0722 * srgbChannel(channels[2]);

/** WCAG contrast ratio between two opaque colors, always >= 1. */
export const contrastRatio = (a: Channels, b: Channels): number => {
    const first = relativeLuminance(a);
    const second = relativeLuminance(b);
    const hi = Math.max(first, second);
    const lo = Math.min(first, second);
    return (hi + 0.05) / (lo + 0.05);
};

/** Composite `pixels` toward `veil` by `alpha`, rounding back to bytes. */
export const compositeChannels = (veil: Channels, pixels: Channels, alpha: number): Channels => [
    Math.round(veil[0] * alpha + pixels[0] * (1 - alpha)),
    Math.round(veil[1] * alpha + pixels[1] * (1 - alpha)),
    Math.round(veil[2] * alpha + pixels[2] * (1 - alpha)),
];

/** Parse a CSS-style `"r g b"` triple. Missing values become zero. */
export const channelsOf = (value: string): Channels => {
    const numbers = value.trim().split(/\s+/).map(Number);
    return [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0];
};

/** Mix two opaque colors; `weightA` is `a`'s share. */
export const mixChannels = (a: Channels, b: Channels, weightA: number): Channels => [
    Math.round(a[0] * weightA + b[0] * (1 - weightA)),
    Math.round(a[1] * weightA + b[1] * (1 - weightA)),
    Math.round(a[2] * weightA + b[2] * (1 - weightA)),
];

/** Read RGBA bytes as channel triples, skipping fully transparent samples. */
export function pixelsOf(rgba: ArrayLike<number>): Channels[] {
    const out: Channels[] = [];
    for (let i = 0; i + 3 < rgba.length; i += 4) {
        if (rgba[i + 3] === 0) continue;
        out.push([rgba[i], rgba[i + 1], rgba[i + 2]]);
    }
    return out;
}

/**
 * The smallest veil alpha at which `ink` clears `floor` over every pixel, or 1
 * when even an opaque veil cannot. A 32-step binary search is enough because the
 * rendered alpha is quantized to hundredths and speed matters more than a tenth
 * of a percent here.
 */
export function requiredAlpha(
    pixels: readonly Channels[],
    ink: Channels,
    veil: Channels,
    floor = 4.5,
): number {
    if (pixels.length === 0) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 32; i += 1) {
        const mid = (lo + hi) / 2;
        const worst = pixels.reduce(
            (acc, pixel) => Math.min(acc, contrastRatio(ink, compositeChannels(veil, pixel, mid))),
            Number.POSITIVE_INFINITY,
        );
        if (worst >= floor) hi = mid;
        else lo = mid;
    }
    return hi;
}
