/**
 * @file Saliency-guided placement of cover text into quiet regions.
 * @module layout/cover-placement
 *
 * The problem: a cover has one focal subject and three runs of type (kicker,
 * headline, deck). The old site pinned all three to the bottom and then spent
 * veil to make them readable over whatever happened to be there. This solver
 * turns that around. It reads a small luminance grid of the surface, finds the
 * busy/central mass, and puts the type where it intrudes least -- with a soft
 * prior toward the top corners, because that is where an editorial page puts
 * its masthead and cover lines.
 *
 * Everything here is pure and deterministic: no DOM, no canvas, no randomness
 * that is not seeded. A caller samples its own pixels (an image, a terminal's
 * cell colors, a screenshot) and hands over a grid. The same grid always yields
 * the same placement, so a verifier can reproduce the decision offline.
 *
 * The method follows the visual-balance approach used for text on images:
 * compute a saliency map, take its center of mass, prefer the quadrant opposite
 * that center, and search that quadrant on a grid the size of the text block.
 * The Microsoft "Automatic Generation of Visual-Textual Presentation Layout"
 * formulation contributes the energy split -- intrusion, wasted quiet space,
 * and semantic importance -- which is why blocks carry a `weight`.
 */

import { insetRect, rectsIntersect, type LayoutRect } from "../collision/layout-rect";
import { relativeLuminance, type Channels } from "../imaging/luminance";

/** A downsampled luminance map. Values are 0..1 relative luminance. */
export interface LumaGrid {
    readonly width: number;
    readonly height: number;
    readonly luma: Float32Array;
}

/** One run of cover type, measured as a fraction of the cover band. */
export interface TextBlock {
    /** Stable key, also used in the returned placement map. */
    readonly id: string;
    /** Semantic importance. Higher weight is placed first. */
    readonly weight: number;
    /** Block width as a fraction of the band. */
    readonly width: number;
    /** Block height as a fraction of the band. */
    readonly height: number;
}

/** Which corner the visual-balance rule favors first. */
export type Quadrant = "tl" | "tr" | "bl" | "br";

/** Which backdrop tone the type should sit against, if the design cares. */
export type TonePreference = "dark" | "light" | "any";

/** Relative weights of the energy terms. Lower total score is better. */
export interface PlacementWeights {
    readonly intrusion: number;
    readonly balance: number;
    readonly tone: number;
    readonly corner: number;
}

export interface PlacementOptions {
    /** Safe inset from the band edge, as a fraction. Default 0.04. */
    readonly margin?: number;
    /** Minimum clear space between blocks and around reserved areas. Default 0.012. */
    readonly gutter?: number;
    /** Soft prior toward the top corners, 0..1. Default 0.35. */
    readonly cornerBias?: number;
    /** Backdrop tone to seek. Default "any". */
    readonly preferredTone?: TonePreference;
    /** Areas the type must not cover (the breadcrumb pill, a logo). */
    readonly reserved?: readonly LayoutRect[];
    /** Hard subject exclusions measured from the cover pixels. Never drawn over. */
    readonly noZones?: readonly LayoutRect[];
    /** Box radius for local contrast, in grid cells. Default 3. */
    readonly radius?: number;
    /** Width of the frame-center bias, in normalized units. Default 0.34. */
    readonly centerSigma?: number;
    /** Energy term weights. */
    readonly weights?: Partial<PlacementWeights>;
}

/** A placement in normalized band coordinates, origin at the top-left. */
export interface PlacedBlock extends LayoutRect {
    /** Energy of the chosen slot. Lower is better. */
    readonly score: number;
    /** How many candidates this block considered. */
    readonly candidates: number;
}

export interface PlacementDiagnostics {
    /** Saliency center of mass in normalized coordinates. */
    readonly saliencyCenter: { readonly x: number; readonly y: number };
    /** The quadrant opposite the saliency center. */
    readonly quadrant: Quadrant;
    /** Luminance the solver was asked to seek. */
    readonly targetTone: TonePreference;
    /** Scores by block id, for a verifier to assert on. */
    readonly scores: Readonly<Record<string, number>>;
}

export interface CoverPlacement {
    /** Placements keyed by block id, in the caller's original order. */
    readonly blocks: Readonly<Record<string, PlacedBlock>>;
    readonly diagnostics: PlacementDiagnostics;
}

const DEFAULT_WEIGHTS: PlacementWeights = {
    intrusion: 1.5,
    balance: 0.6,
    tone: 0.5,
    corner: 1,
};

const DEFAULT_OPTIONS = {
    margin: 0.04,
    gutter: 0.012,
    cornerBias: 0.35,
    preferredTone: "any" as TonePreference,
    radius: 3,
    centerSigma: 0.34,
};

/** Tone targets in relative luminance. A light backdrop is the paper palette. */
const TONE_LUMA: Readonly<Record<Exclude<TonePreference, "any">, number>> = {
    dark: 0.02,
    light: 0.82,
};

const clamp = (value: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, value));

const clamp01 = (value: number): number => clamp(value, 0, 1);

/**
 * Build a luminance grid from RGBA bytes. Transparent pixels take the backdrop
 * luminance: a background-removed cover shows the page through its cutouts, and
 * that page is a large, quiet, uniform field -- not a hole the solver should
 * mistake for a place where text will be invisible.
 */
export function makeLumaGrid(
    rgba: ArrayLike<number>,
    width: number,
    height: number,
    backdrop: Channels = [247, 246, 244],
): LumaGrid {
    if (width < 1 || height < 1) throw new RangeError("makeLumaGrid: width and height must be positive");
    const luma = new Float32Array(width * height);
    const backdropLuma = relativeLuminance(backdrop);
    for (let i = 0; i < width * height; i += 1) {
        const offset = i * 4;
        if (rgba[offset + 3] !== undefined && rgba[offset + 3] < 8) {
            luma[i] = backdropLuma;
            continue;
        }
        luma[i] = relativeLuminance([rgba[offset], rgba[offset + 1], rgba[offset + 2]]);
    }
    return { width, height, luma };
}

/** Summed-area table with a one-cell zero border, for O(1) region queries. */
export function integralImage(values: Float32Array, width: number, height: number): Float32Array {
    const stride = width + 1;
    const table = new Float32Array(stride * (height + 1));
    for (let y = 0; y < height; y += 1) {
        let row = 0;
        for (let x = 0; x < width; x += 1) {
            row += values[y * width + x];
            table[(y + 1) * stride + x + 1] = table[y * stride + x + 1] + row;
        }
    }
    return table;
}

/** Sum over a rectangle of grid cells, clipped to the grid. */
export function regionSum(
    table: Float32Array,
    width: number,
    height: number,
    x: number,
    y: number,
    cellWidth: number,
    cellHeight: number,
): number {
    const x0 = clamp(Math.floor(x), 0, width);
    const y0 = clamp(Math.floor(y), 0, height);
    const x1 = clamp(Math.ceil(x + cellWidth), 0, width);
    const y1 = clamp(Math.ceil(y + cellHeight), 0, height);
    const stride = width + 1;
    return table[y1 * stride + x1] - table[y0 * stride + x1] - table[y1 * stride + x0] + table[y0 * stride + x0];
}

/** Largest value in a rectangle of grid cells. A small, very loud subject is
 * invisible to a mean over a large text box; the max keeps that subject in the
 * energy function, which is the whole point of measuring intrusion. */
export function regionMax(
    values: Float32Array,
    width: number,
    height: number,
    x: number,
    y: number,
    cellWidth: number,
    cellHeight: number,
): number {
    const x0 = clamp(Math.floor(x), 0, width);
    const y0 = clamp(Math.floor(y), 0, height);
    const x1 = clamp(Math.ceil(x + cellWidth), 0, width);
    const y1 = clamp(Math.ceil(y + cellHeight), 0, height);
    let max = 0;
    for (let cy = y0; cy < y1; cy += 1) {
        for (let cx = x0; cx < x1; cx += 1) max = Math.max(max, values[cy * width + cx]);
    }
    return max;
}

/** Mean over a rectangle of grid cells. Returns 0 for an empty rectangle. */
export function regionMean(
    table: Float32Array,
    width: number,
    height: number,
    x: number,
    y: number,
    cellWidth: number,
    cellHeight: number,
): number {
    const x0 = clamp(Math.floor(x), 0, width);
    const y0 = clamp(Math.floor(y), 0, height);
    const x1 = clamp(Math.ceil(x + cellWidth), 0, width);
    const y1 = clamp(Math.ceil(y + cellHeight), 0, height);
    const area = (x1 - x0) * (y1 - y0);
    return area > 0 ? regionSum(table, width, height, x, y, cellWidth, cellHeight) / area : 0;
}

function boxBounds(grid: LumaGrid, x: number, y: number, radius: number) {
    const x0 = clamp(x - radius, 0, grid.width);
    const y0 = clamp(y - radius, 0, grid.height);
    return { x0, y0, x1: clamp(x + radius + 1, 0, grid.width), y1: clamp(y + radius + 1, 0, grid.height) };
}

/**
 * A saliency proxy from local contrast, absolute tone, and a center bias.
 *
 * A flat field is quiet even when it is bright: the cream page behind a cutout
 * has low local contrast. A pixel-art fox is loud because its edges alternate
 * between black and orange, and because its crest is bright. Both signals are
 * needed -- contrast alone would rate the flat interior of a bright shape as
 * safe, and tone alone would rate cream paper as the most dangerous surface on
 * the page.
 */
export function lumaSaliency(grid: LumaGrid, options: PlacementOptions = {}): Float32Array {
    const radius = Math.max(0, Math.floor(options.radius ?? DEFAULT_OPTIONS.radius));
    const sigma = options.centerSigma ?? DEFAULT_OPTIONS.centerSigma;
    const squares = new Float32Array(grid.luma.length);
    for (let i = 0; i < grid.luma.length; i += 1) squares[i] = grid.luma[i] * grid.luma[i];
    const sum = integralImage(grid.luma, grid.width, grid.height);
    const sumSq = integralImage(squares, grid.width, grid.height);
    const saliency = new Float32Array(grid.luma.length);

    for (let y = 0; y < grid.height; y += 1) {
        for (let x = 0; x < grid.width; x += 1) {
            const box = boxBounds(grid, x, y, radius);
            const cellWidth = box.x1 - box.x0;
            const cellHeight = box.y1 - box.y0;
            const mean = regionMean(sum, grid.width, grid.height, box.x0, box.y0, cellWidth, cellHeight);
            const meanSq = regionMean(sumSq, grid.width, grid.height, box.x0, box.y0, cellWidth, cellHeight);
            const edge = Math.sqrt(Math.max(0, meanSq - mean * mean));
            const dx = (x + 0.5) / grid.width - 0.5;
            const dy = (y + 0.5) / grid.height - 0.5;
            const bias = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
            saliency[y * grid.width + x] = clamp01(0.55 * edge * 2.2 + 0.3 * grid.luma[y * grid.width + x] + 0.1 * bias);
        }
    }
    return saliency;
}

/** Center of mass of a saliency map, in normalized coordinates. */
export function saliencyCenter(saliency: Float32Array, width: number, height: number): { x: number; y: number } {
    let total = 0;
    let sx = 0;
    let sy = 0;
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const weight = saliency[y * width + x];
            total += weight;
            sx += weight * (x + 0.5);
            sy += weight * (y + 0.5);
        }
    }
    if (total <= 0) return { x: 0.5, y: 0.5 };
    return { x: sx / total / width, y: sy / total / height };
}

/**
 * The quadrant opposite a saliency center. A tie goes to the top-left: it is the
 * stable editorial default, and it keeps a flat test image deterministic.
 */
export function oppositeQuadrant(center: { x: number; y: number }): Quadrant {
    // A subject on the right pushes type to the left, and a subject low in the
    // frame pushes type to the top. Within the 3% dead band the stable editor's
    // choice wins: top-left.
    const chooseLeft = center.x > 0.47;
    const chooseTop = center.y > 0.47;
    if (chooseTop) return chooseLeft ? "tl" : "tr";
    return chooseLeft ? "bl" : "br";
}

function expand(rect: LayoutRect, by: number): LayoutRect {
    return insetRect(rect, -by);
}

function normalizedToCells(rect: LayoutRect, width: number, height: number) {
    return {
        x: rect.x * width,
        y: rect.y * height,
        cellWidth: rect.width * width,
        cellHeight: rect.height * height,
    };
}

function candidateRects(
    block: TextBlock,
    options: Required<Pick<PlacementOptions, "margin" | "gutter">> & PlacementOptions,
    quadrant: Quadrant,
): LayoutRect[] {
    const margin = options.margin;
    const gutter = options.gutter;
    const maxX = Math.max(margin, 1 - margin - block.width);
    const maxY = Math.max(margin, 1 - margin - block.height);
    const candidates: LayoutRect[] = [
        { x: margin, y: margin, width: block.width, height: block.height },
        { x: maxX, y: margin, width: block.width, height: block.height },
        { x: margin, y: maxY, width: block.width, height: block.height },
        { x: maxX, y: maxY, width: block.width, height: block.height },
        { x: (maxX + margin) / 2, y: margin, width: block.width, height: block.height },
    ];

    // A reserved strip (the sticky header, a pill) removes the obvious top
    // corners. Without slots just below it, a small block would fall all the
    // way to the bottom edge instead of sitting in the free top-right gutter.
    const belowReserved = (options.reserved ?? []).map((area) => area.y + area.height);
    if (belowReserved.length > 0) {
        const y = Math.min(maxY, Math.max(...belowReserved) + gutter);
        candidates.push(
            { x: margin, y, width: block.width, height: block.height },
            { x: maxX, y, width: block.width, height: block.height },
            { x: (maxX + margin) / 2, y, width: block.width, height: block.height },
        );
    }

    // Slide a window over the favored quadrant. Three steps per axis is enough
    // on a 96-cell grid and keeps the search constant-time per block.
    const favorLeft = quadrant === "tl" || quadrant === "bl";
    const favorTop = quadrant === "tl" || quadrant === "tr";
    const qx0 = favorLeft ? margin : 0.5 + gutter;
    const qx1 = favorLeft ? 0.5 - gutter : 1 - margin;
    const qy0 = favorTop ? margin : 0.5 + gutter;
    const qy1 = favorTop ? 0.5 - gutter : 1 - margin;
    const spanX = Math.max(0, qx1 - qx0 - block.width);
    const spanY = Math.max(0, qy1 - qy0 - block.height);
    for (let ix = 0; ix <= 3; ix += 1) {
        for (let iy = 0; iy <= 3; iy += 1) {
            candidates.push({
                x: qx0 + (spanX * ix) / 3,
                y: qy0 + (spanY * iy) / 3,
                width: block.width,
                height: block.height,
            });
        }
    }

    const seen = new Set<string>();
    return candidates.filter((rect) => {
        const key = `${Math.round(rect.x * 1000)}:${Math.round(rect.y * 1000)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        const clear = expand(rect, gutter / 2);
        return !(options.reserved ?? []).some((area) => rectsIntersect(clear, expand(area, gutter / 2), { includeTouch: true }));
    });
}

function scoreRect(
    rect: LayoutRect,
    saliency: Float32Array,
    saliencySum: Float32Array,
    lumaSum: Float32Array,
    grid: LumaGrid,
    options: Required<Pick<PlacementOptions, "cornerBias" | "preferredTone" | "margin" | "gutter">> & PlacementOptions,
    weights: PlacementWeights,
    center: { x: number; y: number },
): number {
    const box = normalizedToCells(rect, grid.width, grid.height);
    const meanIntrusion = regionMean(saliencySum, grid.width, grid.height, box.x, box.y, box.cellWidth, box.cellHeight);
    const peakIntrusion = regionMax(saliency, grid.width, grid.height, box.x, box.y, box.cellWidth, box.cellHeight);
    const intrusion = 0.6 * meanIntrusion + 0.4 * peakIntrusion;
    const toneLuma = regionMean(lumaSum, grid.width, grid.height, box.x, box.y, box.cellWidth, box.cellHeight);
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    // Balance: the ideal center mirrors the saliency center through the frame.
    const balance = (Math.abs(centerX - (1 - center.x)) + Math.abs(centerY - (1 - center.y))) / 2;
    const target = options.preferredTone === "any" ? null : TONE_LUMA[options.preferredTone];
    const tone = target === null ? 0 : Math.abs(toneLuma - target);
    // The corner prior is deliberately soft: a loud focal subject can still win
    // a bottom slot. It only decides between otherwise comparable candidates.
    const edgeAffinity = 1 - Math.min(centerX, 1 - centerX) * 2;
    const topAffinity = clamp01(1 - centerY * 1.6);
    const prior = options.cornerBias * (0.6 * edgeAffinity + 0.4 * topAffinity);
    return weights.intrusion * intrusion + weights.balance * balance + weights.tone * tone - weights.corner * prior;
}

/**
 * Place a set of cover text blocks on a luminance grid.
 *
 * Blocks are placed in descending `weight` order so the headline claims the
 * best quiet region before the deck inherits what is left. Overlap is checked
 * with the shared layout-rect primitives, using the gutter as clear space.
 */
export function placeCoverText(
    grid: LumaGrid,
    blocks: readonly TextBlock[],
    options: PlacementOptions = {},
): CoverPlacement {
    if (grid.width < 1 || grid.height < 1 || grid.luma.length < grid.width * grid.height) {
        throw new RangeError("placeCoverText: grid is smaller than its declared dimensions");
    }
    const margin = options.margin ?? DEFAULT_OPTIONS.margin;
    const gutter = options.gutter ?? DEFAULT_OPTIONS.gutter;
    const resolved: Required<Pick<PlacementOptions, "margin" | "gutter" | "cornerBias" | "preferredTone" | "radius" | "centerSigma">> & PlacementOptions = {
        ...options,
        margin,
        gutter,
        cornerBias: options.cornerBias ?? DEFAULT_OPTIONS.cornerBias,
        preferredTone: options.preferredTone ?? DEFAULT_OPTIONS.preferredTone,
        radius: options.radius ?? DEFAULT_OPTIONS.radius,
        centerSigma: options.centerSigma ?? DEFAULT_OPTIONS.centerSigma,
    };
    const weights: PlacementWeights = { ...DEFAULT_WEIGHTS, ...options.weights };
    const saliency = lumaSaliency(grid, resolved);
    const saliencySum = integralImage(saliency, grid.width, grid.height);
    const lumaSum = integralImage(grid.luma, grid.width, grid.height);
    const center = saliencyCenter(saliency, grid.width, grid.height);
    const quadrant = oppositeQuadrant(center);

    const ordered = [...blocks].sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
    const occupied: LayoutRect[] = [...(options.reserved ?? [])];
    const placements: Record<string, PlacedBlock> = {};
    const scores: Record<string, number> = {};

    for (const block of ordered) {
        const candidates = candidateRects(block, resolved, quadrant);
        let best: PlacedBlock | null = null;
        for (const rect of candidates) {
            const clear = expand(rect, gutter / 2);
            if (occupied.some((area) => rectsIntersect(clear, expand(area, gutter / 2), { includeTouch: true }))) continue;
            const score = scoreRect(rect, saliency, saliencySum, lumaSum, grid, resolved, weights, center);
            if (best === null || score < best.score) {
                best = { ...rect, score, candidates: candidates.length };
            }
        }
        // A fully reserved band still deserves an answer: fall back to the top
        // corner rather than leaving the words unplaced.
        if (best === null) {
            const rect = candidates[0] ?? { x: margin, y: margin, width: block.width, height: block.height };
            best = { ...rect, score: Number.POSITIVE_INFINITY, candidates: candidates.length };
        }
        placements[block.id] = best;
        scores[block.id] = best.score;
        occupied.push(best);
    }

    return {
        blocks: placements,
        diagnostics: { saliencyCenter: center, quadrant, targetTone: resolved.preferredTone, scores },
    };
}

/** Options for {@link stackCoverText}. */
export interface StackOptions extends PlacementOptions {
    /** Lower edge the stack must stay above, as a band fraction. Default 0.82. */
    readonly maxBottom?: number;
    /** Width of the editorial column, as a band fraction. Default 0.42. */
    readonly columnWidth?: number;
}

/**
 * Place cover type as a top-anchored editorial column on the side opposite the
 * focal subject.
 *
 * Free scatter optimizes each block in isolation, which can strand the kicker
 * mid-band or let a long deck drift over the face. A masthead composition keeps
 * all three voices in one column: kicker, headline, deck, in that order, with a
 * shared left edge. The saliency center still chooses the side, so the column
 * lands in the quiet half of the picture. Callers pass content-aware heights;
 * if the stack is too tall, heights are scaled to fit above `maxBottom` and the
 * host shrinks its type to match.
 */
export function stackCoverText(
    grid: LumaGrid,
    blocks: readonly TextBlock[],
    options: StackOptions = {},
): CoverPlacement {
    if (grid.width < 1 || grid.height < 1 || grid.luma.length < grid.width * grid.height) {
        throw new RangeError("stackCoverText: grid is smaller than its declared dimensions");
    }
    const margin = options.margin ?? DEFAULT_OPTIONS.margin;
    const gutter = options.gutter ?? DEFAULT_OPTIONS.gutter;
    const maxBottom = options.maxBottom ?? 0.82;
    const columnWidth = options.columnWidth ?? 0.42;
    const saliency = lumaSaliency(grid, options);
    const saliencySum = integralImage(saliency, grid.width, grid.height);
    const center = saliencyCenter(saliency, grid.width, grid.height);
    const zones = options.noZones ?? [];
    const reservedBottom = (options.reserved ?? []).reduce((max, area) => Math.max(max, area.y + area.height), 0);
    const top = Math.min(maxBottom - 0.1, Math.max(margin, reservedBottom + gutter));
    const width = Math.min(columnWidth, 1 - 2 * margin);
    const heights = blocks.map((block) => Math.max(block.height, 0.02));
    const total = heights.reduce((sum, height) => sum + height, 0) + gutter * Math.max(0, blocks.length - 1);
    const available = Math.max(0.1, maxBottom - top);
    const scale = total > available ? available / total : 1;

    const blocked = (rect: LayoutRect) =>
        zones.some((zone) => rectsIntersect(expand(rect, gutter), expand(zone, gutter), { includeTouch: true }));
    const columnX = (onLeft: boolean) => (onLeft ? margin : 1 - margin - width);
    const conflicts = (onLeft: boolean) => {
        let y = top;
        let count = 0;
        for (const height of heights) {
            if (blocked({ x: columnX(onLeft), y, width, height: height * scale })) count += 1;
            y += height * scale + gutter;
        }
        return count;
    };

    // The saliency center still expresses the editorial preference, but a hard
    // no-zone can overrule it. On /rutt the face is left of center; the right
    // column is clear even though a pure center-of-mass rule might pick left.
    const preferredLeft = center.x >= 0.5;
    const left = conflicts(preferredLeft) <= conflicts(!preferredLeft) ? preferredLeft : !preferredLeft;
    const quadrant: Quadrant = left ? "tl" : "tr";

    const placements: Record<string, PlacedBlock> = {};
    const scores: Record<string, number> = {};
    let cursor = top;
    blocks.forEach((block, index) => {
        const height = heights[index] * scale;
        // If a zone still blocks this slot, slide down past it rather than
        // painting over the subject.
        let y = cursor;
        let guard = 0;
        while (blocked({ x: columnX(left), y, width, height }) && y + height < maxBottom && guard < zones.length + 1) {
            const hit = zones.find((zone) => rectsIntersect(expand({ x: columnX(left), y, width, height }, gutter), zone, { includeTouch: true }));
            y = hit ? Math.max(y + gutter, hit.y + hit.height + gutter) : y + gutter;
            guard += 1;
        }
        const rect: LayoutRect = { x: columnX(left), y, width, height };
        const intrusion = regionMean(
            saliencySum,
            grid.width,
            grid.height,
            rect.x * grid.width,
            rect.y * grid.height,
            rect.width * grid.width,
            rect.height * grid.height,
        );
        placements[block.id] = {
            ...rect,
            score: blocked(rect) ? Number.POSITIVE_INFINITY : intrusion,
            candidates: zones.length + 1,
        };
        scores[block.id] = placements[block.id].score;
        cursor = y + height + gutter;
    });

    return {
        blocks: placements,
        diagnostics: {
            saliencyCenter: center,
            quadrant,
            targetTone: options.preferredTone ?? DEFAULT_OPTIONS.preferredTone,
            scores,
        },
    };
}
