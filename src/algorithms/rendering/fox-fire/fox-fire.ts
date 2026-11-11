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
import { RAMP_STEPS, type FireBuffer } from "./fire-dog";

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
    /**
     * The colour the cell is painted with, when the palette could be blended.
     *
     * `undefined` for a gap (there is nothing there) and on a light surface,
     * where a blended glow is invisible: the caller picks a flat tone from
     * `kind` and `level` instead.
     */
    readonly color?: FoxFireRgb;
}

/**
 * The three stops every surface paints the picture with.
 *
 * The palette is injected, not baked in: a terminal theme has slots and a web
 * page has CSS colours, and the two cannot share one. What they can share is
 * the *picture*, which is what the frame computes.
 */
export interface FoxFirePalette {
    /** The coolest fire, and the shadow of the mark. */
    readonly shadow: FoxFireRgb;
    /** The warmest fire, and the lit rim of the mark. */
    readonly light: FoxFireRgb;
    /** The crest: the sweep's highlight, and the heart of the flame. */
    readonly crest: FoxFireRgb;
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
    /** The fire (see `./fire-dog`): the simulation and the glyph packing. */
    readonly fire: FireBuffer;
    /** The frame's width, in cells. */
    readonly cols: number;
    /** The frame's height, in cells. */
    readonly rows: number;
    /** Where the mark's left edge sits in the frame. */
    readonly offsetX?: number;
    /** Where the mark's top edge sits in the frame. */
    readonly offsetY?: number;
    /**
     * The animation phase, in [0, 1).
     *
     * The phase is where the sweep's crest is: a band of light that travels
     * across the mark, which is what keeps the head from looking painted on.
     * The same phase drives the fire's own clock on the surfaces that own one.
     */
    readonly phase?: number;
    /** The palette to paint with. The package's ember palette is the default. */
    readonly palette?: FoxFirePalette;
    /**
     * True on a light surface.
     *
     * A glow is invisible on a light background, so the frame stops blending
     * and the caller paints flat tones. The picture is the same either way.
     */
    readonly light?: boolean;
}

/**
 * Draw one frame: the fire, the mark over it, and the gap between them.
 *
 * The gap is a cell that touches the mark but carries no ink. The lock screen
 * leaves it blank, and so does this: a flame licking against the stroke reads
 * as an outline drawn in flame rather than as the mark with a fire behind it.
 */
export function renderFoxFireFrame(options: FoxFireFrameOptions): FoxFireCell[][] {
    const { tier, fire, cols, rows } = options;
    const codes = decodeFoxTier(tier);
    const offsetX = options.offsetX ?? 0;
    const offsetY = options.offsetY ?? 0;
    const palette = options.palette ?? FOX_FIRE_PALETTE;
    const blend = options.light !== true;
    // Where the sweep's crest is. The crest runs off the left edge, across the
    // mark, and off the right edge again, and it leans with the mark's own
    // rows, so it reads as light travelling over a curved surface.
    const phase = options.phase ?? 0;
    const sweepX = -12 + phase * (tier.cols + 24);
    const frame: FoxFireCell[][] = [];

    for (let y = 0; y < rows; y += 1) {
        const cells: FoxFireCell[] = [];
        for (let x = 0; x < cols; x += 1) {
            const markX = x - offsetX;
            const markY = y - offsetY;
            const inMark =
                markX >= 0 && markY >= 0 && markX < tier.cols && markY < tier.rows;
            const code = inMark ? codes[markY * tier.cols + markX] : 0;

            if ((code & 32) !== 0) {
                const depth = (code >> 2) & 3;
                cells.push({
                    glyph: foxMarkGlyph(depth),
                    kind: "mark",
                    level: depth,
                    color: blend
                        ? markColor(depth, markY, tier.rows, markX, sweepX, palette)
                        : undefined,
                });
                continue;
            }

            // A cell that touches the mark carries no fire: the one-cell gap
            // is what keeps the flame off the stroke.
            if (inMark && (code & 3) === 1) {
                cells.push({ glyph: " ", kind: "gap", level: 0 });
                continue;
            }

            // The fire's own cell: the glyph it packs and the ramp it is on.
            const cell = fire.cell(x, y);
            cells.push({
                glyph: cell.ramp < 0 ? " " : fire.glyphFor(cell.packed),
                kind: "fire",
                level: cell.ramp < 0 ? 0 : cell.ramp / (RAMP_STEPS - 1),
                color:
                    blend && cell.ramp >= 0 ? fireColor(cell.ramp, palette) : undefined,
            });
        }
        frame.push(cells);
    }
    return frame;
}

/**
 * The mark's colour at one cell.
 *
 * The stroke is shaded by its own row -- the head is lighter at the top and
 * darker at the jaw -- and the outermost cell of the stroke catches the light.
 * The crest of the sweep then passes over it.
 */
function markColor(
    depth: number,
    markY: number,
    markRows: number,
    markX: number,
    sweepX: number,
    palette: FoxFirePalette,
): FoxFireRgb {
    const gy = markY / markRows;
    const base = foxMix(palette.shadow, palette.light, clamp01(0.18 + gy * 0.82));
    // The rim highlight: the outermost cell of the stroke. RIM is 1, not 0,
    // because `depth` is the distance to the nearest empty cell and a cell
    // touching empty space is one step from it.
    const rim = depth === RIM ? 0.75 : depth === RIM + 1 ? 0.3 : 0;
    let color = foxMix(base, palette.light, rim);
    const crest = smoothstep(6, 0, Math.abs(markX - (sweepX + markY * 0.35)));
    if (crest > 0) color = foxMix(color, palette.crest, crest);
    return color;
}

/**
 * The fire's colour at one cell.
 *
 * The ramp runs from the shadow to the light, and the hottest cells warm
 * towards the crest: a flame's core is the hottest thing on screen, and
 * stopping at the palette's own light reads as a warm wash rather than as fire.
 */
function fireColor(ramp: number, palette: FoxFirePalette): FoxFireRgb {
    const color = foxMix(palette.shadow, palette.light, ramp / (RAMP_STEPS - 1));
    const hot = smoothstep(RAMP_STEPS - 2, RAMP_STEPS - 1, ramp);
    return hot > 0 ? foxMix(color, palette.crest, hot) : color;
}

/** Clamp to [0, 1]. */
function clamp01(value: number): number {
    return value < 0 ? 0 : value > 1 ? 1 : value;
}

/**
 * The smoothstep between two edges.
 *
 * The crest is a band of light with soft edges, and a hard edge reads as a
 * rectangle travelling over the mark.
 */
function smoothstep(edge0: number, edge1: number, value: number): number {
    const t = edge0 === edge1 ? 0 : clamp01((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
}

/**
 * The palette both surfaces paint with.
 *
 * Literal colours, not theme slots: a terminal theme and a web page cannot
 * share a slot, and the point of this module is that the two pictures are the
 * same picture. The stops are the ember ramp the lock screen's `ember` palette
 * resolves to, so the shared frame reads the same as the screen it came from.
 */
export const FOX_FIRE_PALETTE: FoxFirePalette = {
    /** The coolest fire, and the shadow of the mark. */
    shadow: { r: 122, g: 34, b: 12 },
    /** The warmest fire, and the lit rim of the mark. */
    light: { r: 255, g: 122, b: 47 },
    /** The crest: the sweep's highlight, and the heart of the flame. */
    crest: { r: 255, g: 196, b: 107 },
};

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
    return cell.color;
}

/**
 * The flat tone a cell gets on a light surface.
 *
 * A glow is invisible on a light background, so the frame stops blending and
 * the caller paints flat tones: the mark in the shadow, the flame in the crest
 * where it is hottest and in the shadow where it is not. The picture is the
 * same one; only the shading is gone.
 */
export function foxFireFlatColor(
    cell: FoxFireCell,
    palette: FoxFirePalette = FOX_FIRE_PALETTE,
): FoxFireRgb | undefined {
    if (cell.kind === "gap") return undefined;
    // The mark is the subject, so it keeps the palette's lit tone; the flame's
    // cool cells go to the shadow and its hot ones to the crest.
    if (cell.kind === "mark") return palette.light;
    return cell.level > 0.8 ? palette.crest : palette.shadow;
}

/** One cell of a frame as a CSS colour, or `undefined` for a gap. */
export function foxFireCss(cell: FoxFireCell): string | undefined {
    const colour = foxFireColor(cell);
    if (colour === undefined) return undefined;
    return `rgb(${colour.r} ${colour.g} ${colour.b})`;
}
