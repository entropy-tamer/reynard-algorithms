/**
 * The fox head over the fire: one frame, one geometry, one palette.
 *
 * The splash screen the `r` command opens on and the page the site renders
 * the same effect on were two implementations of one picture, and they drifted
 * apart in the way that two implementations do: the splash screen computed a
 * fox overlay and threw it away, the page printed the art's alphabet symbols
 * in a corner, and neither showed the head the lock screen shows. The head is
 * the point, so the picture lives here, once.
 *
 * What is shared is the *frame*: which cell carries the mark, which carries
 * the gap that keeps the flame off the stroke, which carries fire, and what
 * colour each of them is. A terminal paints those cells with SGR escapes and
 * a browser paints the same cells with CSS colours, from the same stops, so
 * the two surfaces are the same picture rather than two pictures that agree
 * about the fire.
 *
 * The art itself is data (see `../fox-art`): the fox is a grid of packed cell
 * codes, and nothing here rasterises anything.
 *
 * @module algorithms/algorithms/rendering/fox-fire
 */

import { FOX_ART_ALPHABET, FOX_ART_TIERS, type FoxArtTier } from "./fox-art";
import { SUB_CELLS_PER_CELL } from "./fire-types";

/** A colour, in the 0-255 range every surface can print. */
export interface FoxFireRgb {
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

/** What one cell of the frame is. */
export type FoxFireKind = "mark" | "gap" | "fire";

/** One cell of the frame. */
export interface FoxFireCell {
    /** The character to draw. A blank is a space, never an empty string. */
    readonly glyph: string;
    /** What the cell is: the mark, the gap around it, or fire. */
    readonly kind: FoxFireKind;
    /**
     * Fire cells: the heat in the cell, 0 to 1. Mark cells: the stroke
     * depth, 1 for the rim and 3 for the deepest cell of the stroke.
     */
    readonly level: number;
}

/**
 * Where the head sits in a frame, and which head it is.
 *
 * The layout is the same on every surface: the tier that fits, and the head
 * centred in the frame. A page at 80x24 and a terminal at 80x24 therefore
 * draw the same picture, which is the only way "the same effect" means
 * anything.
 */
export interface FoxFireLayout {
    /** The tier to draw. */
    readonly tier: FoxArtTier;
    /** Where the mark's left edge sits. */
    readonly offsetX: number;
    /** Where the mark's top edge sits. */
    readonly offsetY: number;
}

/**
 * The layout of a frame of `cols` by `rows` cells.
 *
 * The head is centred: the fire is the ground it stands on, and a head pinned
 * to the edge reads as a watermark rather than as the subject.
 */
export function foxFireLayout(cols: number, rows: number): FoxFireLayout {
    const tier = foxTierFor(cols, rows);
    return {
        tier,
        offsetX: Math.max(0, Math.floor((cols - tier.cols) / 2)),
        offsetY: Math.max(0, Math.floor((rows - tier.rows) / 2)),
    };
}

/** The glyphs the mark is drawn with, by stroke depth. */
const GLYPH_RIM = "█";
const GLYPH_BODY = "▓";
const GLYPH_DEEP = "▒";

/**
 * The tier that fits a frame.
 *
 * The tiers are widest first, and a head that does not fit is worse than a
 * smaller head: the large tier is 100x50, which no terminal that can show a
 * splash screen has. The first tier that fits both ways wins, and the
 * smallest is the fallback for a frame narrower than the tiny tier.
 *
 * The rule lives here so the two surfaces pick the same head for the same
 * size: a page at 80x24 and a terminal at 80x24 draw the same picture.
 */
export function foxTierFor(cols: number, rows: number): FoxArtTier {
    const fits = FOX_ART_TIERS.find((tier) => tier.cols <= cols && tier.rows <= rows);
    return fits ?? FOX_ART_TIERS[FOX_ART_TIERS.length - 1];
}

/** The stroke depth of a cell touching empty space. */
const RIM = 1;

/** The packed codes of a tier, decoded once per tier. */
const decoded = new Map<string, Uint8Array>();

/**
 * The tier's packed cell codes, as numbers.
 *
 * The art stores its cells as characters from a 64-symbol alphabet, and every
 * consumer was decoding that by hand. A symbol that is not in the alphabet
 * decodes to 0, which is open field: a corrupt cell must not draw as a
 * silhouette that looks deliberate.
 */
export function decodeFoxTier(tier: FoxArtTier): Uint8Array {
    const hit = decoded.get(tier.name);
    if (hit) return hit;
    const codes = new Uint8Array(tier.cols * tier.rows);
    for (let index = 0; index < codes.length; index += 1) {
        codes[index] = Math.max(FOX_ART_ALPHABET.indexOf(tier.cells[index] ?? ""), 0);
    }
    decoded.set(tier.name, codes);
    return codes;
}

/** The glyph a mark cell is drawn with. */
export function foxMarkGlyph(depth: number): string {
    return depth === RIM ? GLYPH_RIM : depth === RIM + 1 ? GLYPH_BODY : GLYPH_DEEP;
}

/** What the frame needs to know about the fire it is drawn over. */
export interface FoxFireFrameOptions {
    /** The tier to draw. */
    readonly tier: FoxArtTier;
    /** The fire's sub-cell buffer (see `./fire`). */
    readonly fire: Uint8Array;
    /** The fire's own width, in cells. */
    readonly fireCols: number;
    /** The frame's width, in cells. */
    readonly cols: number;
    /** The frame's height, in cells. */
    readonly rows: number;
    /** Where the mark's left edge sits in the frame. */
    readonly offsetX?: number;
    /** Where the mark's top edge sits in the frame. */
    readonly offsetY?: number;
}

/**
 * Draw one frame: the fire, the mark over it, and the gap between them.
 *
 * The gap is a cell that touches the mark but carries no ink. The lock screen
 * leaves it blank, and so does this: a flame licking against the stroke reads
 * as an outline drawn in flame rather than as the mark with a fire behind it.
 */
export function renderFoxFireFrame(options: FoxFireFrameOptions): FoxFireCell[][] {
    const { tier, fire, fireCols, cols, rows } = options;
    const codes = decodeFoxTier(tier);
    const offsetX = options.offsetX ?? 0;
    const offsetY = options.offsetY ?? 0;
    const frame: FoxFireCell[][] = [];

    for (let y = 0; y < rows; y += 1) {
        const cells: FoxFireCell[] = [];
        const rowBase = y * fireCols * SUB_CELLS_PER_CELL;
        for (let x = 0; x < cols; x += 1) {
            const markX = x - offsetX;
            const markY = y - offsetY;
            const inMark =
                markX >= 0 && markY >= 0 && markX < tier.cols && markY < tier.rows;
            const code = inMark ? codes[markY * tier.cols + markX] : 0;

            if ((code & 32) !== 0) {
                const depth = (code >> 2) & 3;
                cells.push({ glyph: foxMarkGlyph(depth), kind: "mark", level: depth });
                continue;
            }

            // A cell that touches the mark carries no fire: the one-cell gap
            // is what keeps the flame off the stroke.
            if (inMark && (code & 3) === 1) {
                cells.push({ glyph: " ", kind: "gap", level: 0 });
                continue;
            }

            const base = rowBase + x * SUB_CELLS_PER_CELL;
            let heat = 0;
            for (let sub = 1; sub < SUB_CELLS_PER_CELL; sub += 1) {
                const value = fire[base + sub] ?? 0;
                if (value > heat) heat = value;
            }
            cells.push({
                glyph: heat >= 32 ? fireGlyph(fire, base) : " ",
                kind: "fire",
                level: heat / 63,
            });
        }
        frame.push(cells);
    }
    return frame;
}

/**
 * The braille glyph for one cell of the fire.
 *
 * The fire's buffer holds eight sub-cells per cell; the glyph packs the six
 * that the braille pattern can carry. A sub-cell counts as lit at half
 * brightness, which is the threshold `rowToBraille` uses, so the two agree on
 * where a cell stops being empty.
 */
function fireGlyph(fire: Uint8Array, base: number): string {
    let pattern = 0;
    for (let sub = 0; sub < 6; sub += 1) {
        if ((fire[base + 1 + sub] ?? 0) >= 32) pattern |= 1 << sub;
    }
    return String.fromCodePoint(0x2800 + pattern);
}

/**
 * The palette both surfaces paint with.
 *
 * Literal colours, not theme slots: a terminal theme and a web page cannot
 * share a slot, and the point of this module is that the two pictures are the
 * same picture. The stops are the ember ramp the lock screen's `ember` palette
 * resolves to, so the shared frame reads the same as the screen it came from.
 */
export const FOX_FIRE_PALETTE = {
    /** The coolest fire. */
    fireShadow: { r: 122, g: 34, b: 12 },
    /** The warmest fire. */
    fireLight: { r: 255, g: 122, b: 47 },
    /** The heart of the flame. */
    ember: { r: 255, g: 196, b: 107 },
    /** The lit rim of the stroke. */
    markRim: { r: 255, g: 176, b: 102 },
    /** The body of the stroke. */
    markBody: { r: 226, g: 84, b: 42 },
    /** The deepest cell of the stroke. */
    markDeep: { r: 160, g: 60, b: 26 },
} as const satisfies Record<string, FoxFireRgb>;

/** Mix two colours; `t` is clamped. */
export function foxMix(a: FoxFireRgb, b: FoxFireRgb, t: number): FoxFireRgb {
    const k = Math.max(0, Math.min(1, t));
    return {
        r: Math.round(a.r + (b.r - a.r) * k),
        g: Math.round(a.g + (b.g - a.g) * k),
        b: Math.round(a.b + (b.b - a.b) * k),
    };
}

/**
 * The colour one cell is painted with.
 *
 * Fire warms towards the ember at its hottest cells, and the mark is shaded by
 * its stroke depth. A gap has no colour: the caller paints the surface.
 */
export function foxFireColor(cell: FoxFireCell): FoxFireRgb | undefined {
    const palette = FOX_FIRE_PALETTE;
    if (cell.kind === "gap") return undefined;
    if (cell.kind === "mark") {
        if (cell.level === RIM) return palette.markRim;
        return cell.level === RIM + 1 ? palette.markBody : palette.markDeep;
    }
    const base = foxMix(palette.fireShadow, palette.fireLight, cell.level);
    if (cell.level > 0.86) return foxMix(base, palette.ember, (cell.level - 0.86) / 0.14);
    return base;
}

/** One cell of a frame as a CSS colour, or `undefined` for a gap. */
export function foxFireCss(cell: FoxFireCell): string | undefined {
    const colour = foxFireColor(cell);
    if (colour === undefined) return undefined;
    return `rgb(${colour.r} ${colour.g} ${colour.b})`;
}
