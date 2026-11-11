#!/usr/bin/env node
/**
 * Generate the fox-head ASCII art used by the lock screen.
 *
 * This package is the source of truth for the art: the generated
 * `src/algorithms/rendering/fox-art/fox-art.ts` is what the splash screen, the
 * coding agent's lock screen and sly.so all read, so the three cannot drift.
 * The generator lives here for the same reason -- the file says how to
 * regenerate itself, and that line has to be true where the file is.
 *
 * The runtime never rasterises anything: this script is an offline build step
 * whose output (`fox-fire/fox-art.ts`) is committed. That keeps an SVG rasteriser and
 * two external binaries out of the shipped agent, and makes the art
 * hand-tunable -- which matters, because the shading knobs below were chosen by
 * looking at rendered frames, not by reasoning about them.
 *
 * Usage:
 *   node scripts/generate-fox-art.mjs [--svg <path>] [--out <path>] [--force]
 *
 * Requires `rsvg-convert` and `magick` on PATH.
 *
 * Two non-obvious things this script has to get right, both of which produce
 * plausible-looking but wrong output when missed:
 *
 *  1. Extract the ALPHA channel, not grayscale. `~/favicon.svg` styles its fill
 *     as `var(--color-logo, #000000)`. That custom property does not exist
 *     outside a browser, so rsvg-convert falls back to black and paints the fox
 *     solid black on transparency. `magick -colorspace gray` then yields an
 *     all-zero image, which downsamples to a solid rectangle of "ink".
 *
 *  2. The logo is LINE ART, not a filled silhouette. Its head is a hollow
 *     outline roughly 9% of the image width, with solid eyes and nose. The ink
 *     threshold below is tuned against that: too low and the stroke becomes a
 *     7-cell slab, too high and the eyes wash out.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";

/** Render resolution for the alpha extract. Higher than any tier needs. */
const SOURCE_SIZE = 2048;

/**
 * Empty cells left around the mark, per side, as a fraction of the grid width.
 *
 * The margin is applied to the grid, not to the source crop: the fox's ears run
 * from x=23 to x=2024 of 2048, so a fixed source crop either clips an ear
 * (0.06 clipped both) or leaves none at all. Cropping to the ink box and
 * centring it in a larger grid is the only way to guarantee both.
 */
const FIT_PADDING = 0.03;

/** Coverage at or above which a cell counts as ink. See note 2 above. */
const INK_THRESHOLD = 0.62;

/**
 * Size tiers, widest first. Several are committed rather than downscaling the
 * largest at runtime: downsampling a 3-cell stroke to 1 cell destroys the eyes,
 * and small terminals are exactly where a mushy logo is most visible.
 */
const TIERS = [
    { name: "large", cols: 100 },
    { name: "medium", cols: 80 },
    { name: "small", cols: 64 },
    { name: "tiny", cols: 48 },
    // The tier that makes the Fox Gate work on an 80x24 terminal.
    //
    // Every tier above needs at least 32 rows of chrome+art, because the grid is
    // `rows = cols / 2` (a square source SVG in ~2:1 cells) and the chrome costs
    // 8. 80x24 is the default terminal size and fits none of them, so the gate
    // rendered wordmark and status with no fox at all. 32 cols => 16 rows => a
    // 24-row total, which is exactly the default terminal. The regression test
    // "an 80x24 terminal still gets a fox" pins that floor: if CHROME_ROWS grows
    // past 8 this tier stops fitting 80x24 and that test must fail loudly.
    { name: "micro", cols: 32 },
];

/** 64 symbols; the cell code indexes into this. */
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";

/** Distance buckets are clamped to this before packing. */
const DIST_CAP = 3;

/** Offsets and weights for the two-pass chamfer distance transform. */
const CHAMFER = [
    [-1, 0, 1],
    [0, -1, 1],
    [-1, -1, Math.SQRT2],
    [1, -1, Math.SQRT2],
];

function parseArgs(argv) {
    const opts = {
        svg: process.env.HOME ? `${process.env.HOME}/favicon.svg` : "favicon.svg",
        out: resolve(import.meta.dirname, "../src/algorithms/rendering/fox-fire/fox-art.ts"),
        force: false,
    };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--svg") opts.svg = resolve(argv[++i]);
        else if (argv[i] === "--out") opts.out = resolve(argv[++i]);
        else if (argv[i] === "--force") opts.force = true;
        else throw new Error(`unknown argument: ${argv[i]}`);
    }
    return opts;
}

function requireTool(name) {
    try {
        execFileSync(name, ["--version"], { stdio: "ignore" });
    } catch {
        throw new Error(
            `${name} not found on PATH. It is only needed to regenerate the art; ` +
                `the generated fox-art.ts is committed, so the agent itself never needs it.`,
        );
    }
}

/** Read a binary 8-bit PGM (P5) into a flat Uint8Array of samples. */
function readPgm(path) {
    const buf = readFileSync(path);
    if (buf[0] !== 0x50 || buf[1] !== 0x35) {
        throw new Error(`${path} is not a binary PGM (P5)`);
    }
    let i = 2;
    const fields = [];
    while (fields.length < 3) {
        while (i < buf.length && buf[i] <= 0x20) i++;
        if (buf[i] === 0x23 /* # */) {
            while (i < buf.length && buf[i] !== 0x0a && buf[i] !== 0x0d) i++;
            continue;
        }
        const start = i;
        while (i < buf.length && buf[i] > 0x20) i++;
        fields.push(Number.parseInt(buf.toString("ascii", start, i), 10));
    }
    i++; // the single whitespace byte terminating the header
    const [w, h, maxval] = fields;
    if (maxval !== 255) {
        throw new Error(`${path} has maxval ${maxval}; only 8-bit is supported`);
    }
    return { w, h, data: buf.subarray(i, i + w * h) };
}

/** Rasterise the SVG and return its alpha channel as w*h samples in 0..255. */
function extractAlpha(svgPath) {
    const dir = mkdtempSync(join(tmpdir(), "fox-art-"));
    try {
        const png = join(dir, "src.png");
        const pgm = join(dir, "alpha.pgm");
        execFileSync("rsvg-convert", [
            "-w",
            String(SOURCE_SIZE),
            "-h",
            String(SOURCE_SIZE),
            "-f",
            "png",
            "-o",
            png,
            svgPath,
        ]);
        // Alpha, not grayscale. See note 1 in the header.
        execFileSync("magick", [png, "-alpha", "extract", "-depth", "8", pgm]);
        return readPgm(pgm);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

/**
 * Box-filter the ink bounding box into a cols x rows grid, centred, with a
 * guaranteed empty margin on all four sides.
 *
 * The margin has to come from the GRID, not from cropping the source. The fox's
 * ears already span 1.1%-98.8% of the viewBox, so any source crop wide enough
 * to add breathing room also clips an ear. Cropping to the ink box exactly and
 * then placing it inside a larger grid is the only way to get both.
 *
 * Terminal cells are about twice as tall as they are wide, so a W x H grid has
 * physical aspect W : 2H; the inner block is sized to match the source box's
 * own aspect so the mark is not stretched.
 */
function downsample({ w, h, data }, cols, rows, marginCells) {
    const box = inkBounds(w, h, data);
    const x0 = box.minX;
    const y0 = box.minY;
    const bw = box.maxX - box.minX + 1;
    const bh = box.maxY - box.minY + 1;

    const innerCols = Math.max(2, cols - marginCells * 2);
    const innerRows = Math.max(2, rows - marginCells * 2);
    // W / (2H) == bw / bh  =>  H == W * bh / (2 * bw)
    let blockCols = innerCols;
    let blockRows = Math.round((blockCols * bh) / (2 * bw));
    if (blockRows > innerRows) {
        blockRows = innerRows;
        blockCols = Math.round((blockRows * 2 * bw) / bh);
    }
    blockCols = Math.max(1, Math.min(blockCols, innerCols));
    blockRows = Math.max(1, Math.min(blockRows, innerRows));
    const offX = Math.floor((cols - blockCols) / 2);
    const offY = Math.floor((rows - blockRows) / 2);

    const out = [];
    for (let y = 0; y < rows; y++) {
        const row = new Float64Array(cols);
        const by = y - offY;
        if (by >= 0 && by < blockRows) {
            const sy0 = y0 + Math.floor((by * bh) / blockRows);
            const sy1 =
                y0 +
                Math.max(
                    Math.floor((by * bh) / blockRows) + 1,
                    Math.floor(((by + 1) * bh) / blockRows),
                );
            for (let x = 0; x < blockCols; x++) {
                const bx = x + offX;
                const sx0 = x0 + Math.floor((bx * bw) / blockCols);
                const sx1 =
                    x0 +
                    Math.max(
                        Math.floor((bx * bw) / blockCols) + 1,
                        Math.floor(((bx + 1) * bw) / blockCols),
                    );
                let total = 0;
                let n = 0;
                for (let sy = sy0; sy < sy1 && sy < h; sy++) {
                    for (let sx = sx0; sx < sx1 && sx < w; sx++) {
                        total += data[sy * w + sx];
                        n++;
                    }
                }
                row[bx] = n > 0 ? total / n / 255 : 0;
            }
        }
        out.push(row);
    }
    return out;
}

/** Bounding box of the inked pixels, in source pixels. Throws if there is none. */
function inkBounds(w, h, data) {
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    const cut = INK_THRESHOLD * 255;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (data[y * w + x] >= cut) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    if (maxX < 0) {
        throw new Error(
            "no inked pixels in the alpha channel -- check that the SVG path is " +
                "filled and that extractAlpha() still extracts alpha rather than grayscale",
        );
    }
    return { minX, minY, maxX, maxY };
}

/**
 * Two-pass chamfer distance transform. `seeds` marks cells at distance 0;
 * every other cell gets its distance to the nearest seed.
 */
function chamferDistance(ink, rows, cols, seedIsInk) {
    const BIG = 1e6;
    const dist = new Float64Array(rows * cols);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            dist[y * cols + x] = ink[y * cols + x] === (seedIsInk ? 1 : 0) ? 0 : BIG;
        }
    }
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            if (dist[i] === 0) continue;
            let best = dist[i];
            for (const [dy, dx, w] of CHAMFER) {
                const ny = y + dy;
                const nx = x + dx;
                if (ny >= 0 && nx >= 0 && ny < rows && nx < cols) {
                    best = Math.min(best, dist[ny * cols + nx] + w);
                }
            }
            dist[i] = best;
        }
    }
    for (let y = rows - 1; y >= 0; y--) {
        for (let x = cols - 1; x >= 0; x--) {
            const i = y * cols + x;
            if (dist[i] === 0) continue;
            let best = dist[i];
            for (const [dy, dx, w] of CHAMFER) {
                const ny = y + dy;
                const nx = x + dx;
                if (ny >= 0 && nx >= 0 && ny < rows && nx < cols) {
                    best = Math.min(best, dist[ny * cols + nx] + w);
                }
            }
            dist[i] = best;
        }
    }
    return dist;
}

function buildTier(alpha, cols, name) {
    const rows = Math.floor(cols / 2);
    const marginCells = Math.max(1, Math.round(cols * FIT_PADDING));
    const grid = downsample(alpha, cols, rows, marginCells);

    const ink = new Uint8Array(cols * rows);
    let inkCount = 0;
    for (let i = 0; i < ink.length; i++) {
        if (grid[Math.floor(i / cols)][i % cols] >= INK_THRESHOLD) {
            ink[i] = 1;
            inkCount++;
        }
    }
    if (inkCount === 0) {
        throw new Error(
            `tier ${name}: no ink. The alpha channel is empty -- check that the SVG path ` +
                `is filled and that the alpha extraction in extractAlpha() still applies.`,
        );
    }

    // dOut: distance from an ink cell to the nearest empty cell. 0 on the rim,
    // growing inward -- this is the tube-shading depth, and for the solid eyes
    // it is what produces a hollow-looking pupil.
    const dOut = chamferDistance(ink, rows, cols, false);
    // dIn: distance from an empty cell to the nearest ink cell. 1 marks the
    // single-cell aura; 2+ is open field, which is where sparkles live.
    const dIn = chamferDistance(ink, rows, cols, true);

    let cells = "";
    for (let i = 0; i < ink.length; i++) {
        const code =
            (ink[i] === 1 ? 32 : 0) +
            Math.min(DIST_CAP, Math.floor(dOut[i])) * 4 +
            Math.min(DIST_CAP, Math.floor(dIn[i]));
        cells += ALPHABET[code];
    }
    return { name, cols, rows, cells, inkCount };
}

function chunk(str, width) {
    const lines = [];
    for (let i = 0; i < str.length; i += width) lines.push(str.slice(i, i + width));
    return lines;
}

function emit(tiers, svgPath, svgHash) {
    const parts = [];
    parts.push("// GENERATED FILE -- DO NOT EDIT BY HAND.");
    parts.push("// Regenerate with: node scripts/generate-fox-art.mjs");
    parts.push("//");
    parts.push(`// Source: ${svgPath}`);
    parts.push(`// Source SHA-256: ${svgHash}`);
    parts.push(
        `// Ink threshold: ${INK_THRESHOLD}   Grid margin: ${FIT_PADDING}   Source raster: ${SOURCE_SIZE}px`,
    );
    parts.push("//");
    parts.push("// Cropped to the logo's own ink bounding box, then centred in the grid with");
    parts.push("// a margin of empty cells. The margin cannot come from a source crop: the ears");
    parts.push("// span 1.1%-98.8% of the viewBox, so a fixed crop either clips an ear or leaves");
    parts.push("// no margin at all.");
    parts.push("//");
    parts.push("// The logo is line art: a hollow outline roughly 9% of the image width, with");
    parts.push("// solid eyes and nose. The threshold above is tuned against that shape -- lower");
    parts.push("// and the stroke becomes a slab, higher and the eyes disappear.");
    parts.push("");
    parts.push("/** Symbol table indexed by a packed cell code. */");
    parts.push("export const FOX_ART_ALPHABET =");
    parts.push(`    ${JSON.stringify(ALPHABET)};`);
    parts.push("");
    parts.push("export interface FoxArtTier {");
    parts.push("    readonly name: string;");
    parts.push("    readonly cols: number;");
    parts.push("    readonly rows: number;");
    parts.push("    /** `cols * rows` packed cell codes, row-major. */");
    parts.push("    readonly cells: string;");
    parts.push("}");
    parts.push("");

    for (const tier of tiers) {
        parts.push(`export const FOX_ART_${tier.name.toUpperCase()}: FoxArtTier = {`);
        parts.push(`    name: ${JSON.stringify(tier.name)},`);
        parts.push(`    cols: ${tier.cols},`);
        parts.push(`    rows: ${tier.rows},`);
        parts.push("    cells:");
        for (const line of chunk(tier.cells, tier.cols)) {
            parts.push(`        ${JSON.stringify(line)} +`);
        }
        parts[parts.length - 1] = parts[parts.length - 1].replace(/ \+\n?$/, ",");
        parts.push("};");
        parts.push("");
    }

    parts.push("/** Size tiers, widest first. */");
    parts.push(
        "export const FOX_ART_TIERS: readonly FoxArtTier[] = [" +
            tiers.map((t) => `FOX_ART_${t.name.toUpperCase()}`).join(", ") +
            "];",
    );
    parts.push("");
    return parts.join("\n");
}

function main() {
    const opts = parseArgs(process.argv.slice(2));
    requireTool("rsvg-convert");
    requireTool("magick");

    if (!existsSync(opts.svg)) {
        throw new Error(`SVG not found: ${opts.svg} (pass --svg <path>)`);
    }

    const svgHash = createHash("sha256").update(readFileSync(opts.svg)).digest("hex");
    const alpha = extractAlpha(opts.svg);
    const tiers = TIERS.map((t) => buildTier(alpha, t.cols, t.name));

    for (const t of tiers) {
        const pct = ((t.inkCount / (t.cols * t.rows)) * 100).toFixed(1);
        process.stderr.write(`${t.name}: ${t.cols}x${t.rows}, ${t.inkCount} ink cells (${pct}%)\n`);
    }

    writeFileSync(opts.out, emit(tiers, opts.svg, svgHash), "utf8");
    process.stderr.write(`\nwrote ${opts.out}\n  source sha256 ${svgHash}\n`);
}

main();
