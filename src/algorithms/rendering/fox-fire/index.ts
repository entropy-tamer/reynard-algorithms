/**
 * The fox head, the fire, and the frame that puts them together.
 *
 * One directory, because they are one picture: the art is the data the frame
 * draws, the fire is what the frame draws it over, and the frame is what both
 * surfaces -- a terminal and a browser -- paint.
 *
 * - `./fox-art` is the generated art (`scripts/generate-fox-art.mjs`).
 * - `./fire-dog` is the density-of-gas simulation and the braille packing.
 * - `./fox-fire` is the frame: the cells, their colours, and the palette.
 *
 * @module algorithms/algorithms/rendering/fox-fire
 */

export { FOX_ART_ALPHABET } from "./fox-art";
export type { FoxArtTier } from "./fox-art";
export { FOX_ART_TIERS } from "./fox-art";
export { FOX_ART_LARGE } from "./fox-art";
export { FOX_ART_MEDIUM } from "./fox-art";
export { FOX_ART_SMALL } from "./fox-art";
export { FOX_ART_TINY } from "./fox-art";
export { FOX_ART_MICRO } from "./fox-art";

export { FireBuffer, glyphDotBit, rampIndex, RAMP_STEPS, MAX_INTENSITY, SUB_ROWS } from "./fire-dog";
export type { FireCell, FireOptions } from "./fire-dog";

export {
    decodeFoxTier,
    foxFireColor,
    foxFireCss,
    foxFireFlatColor,
    foxMarkGlyph,
    foxTierFor,
    foxFireLayout,
    foxMix,
    renderFoxFireFrame,
    FOX_FIRE_PALETTE,
} from "./fox-fire";
export type {
    FoxFireCell,
    FoxFireFrameOptions,
    FoxFireKind,
    FoxFireLayout,
    FoxFirePalette,
    FoxFireRgb,
} from "./fox-fire";
