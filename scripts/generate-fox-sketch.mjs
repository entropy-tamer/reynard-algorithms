#!/usr/bin/env node
/**
 * Generate the hand-drawn fox-head strokes used by the neutral-theme charts.
 *
 * The source is the same favicon the site uses for its CSS-mask mark. This
 * script parses its SVG path data, samples the curves, normalises to a small
 * display size and pushes every point through the sketch jitter primitives.
 * The result is a committed TypeScript module of stroke arrays -- the runtime
 * never rasterises or traces anything, so the drawing is reproducible and
 * diffable. Same contract as scripts/generate-fox-art.mjs.
 *
 * Usage:
 *   node scripts/generate-fox-sketch.mjs [--svg <path>] [--out <path>] [--force]
 *
 * Run `pnpm run build` first: the generator imports the sketch primitives from
 * dist/index.js so it uses the exact code the renderer will use.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { deriveSeed, jitterPath, resampleClosed } from "../dist/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SVG = join(homedir(), "favicon.svg");
const DEFAULT_OUT = resolve(HERE, "../src/algorithms/rendering/sketch/fox-sketch-paths.ts");
const GENERATOR_VERSION = "1";

/** Display size in CSS px: the 28px desktop mark with room for the wobble. */
const TARGET_SIZE = 34;
/** Empty margin around the mark, as a fraction of the target box. */
const PADDING = 0.08;
/** Resampling spacing and jitter tuning, in target px. */
const SPACING = 1.2;
const JITTER = { amplitude: 1.15, wavelength: 15, fineAmplitude: 0.28 };
const ROUGHNESS = 0.7;
const PRECISION = 2;

function args() {
    const out = { svg: DEFAULT_SVG, out: DEFAULT_OUT, force: false };
    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg === "--svg") out.svg = resolve(process.argv[++i]);
        else if (arg === "--out") out.out = resolve(process.argv[++i]);
        else if (arg === "--force") out.force = true;
        else throw new Error(`unknown argument: ${arg}`);
    }
    return out;
}

/** Tokenize an SVG path `d` into command letters and numbers. */
function tokenize(d) {
    const tokens = [];
    const re = /[MmLlHhVvCcSsQqTtZzAa]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g;
    let match;
    while ((match = re.exec(d)) !== null) tokens.push(match[0]);
    return tokens;
}

/** Cubic Bezier sampled into `steps` points (excluding the start). */
function sampleCubic(p0, p1, p2, p3, steps) {
    const out = [];
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;
        out.push({
            x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
            y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
        });
    }
    return out;
}

const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

/** Parse path data into subpaths of points. Supports the commands in the favicon. */
function parsePath(d) {
    const tokens = tokenize(d);
    const subpaths = [];
    let current = { x: 0, y: 0 };
    let start = { x: 0, y: 0 };
    let points = [];
    let command = null;
    let i = 0;
    const num = () => Number(tokens[i++]);
    const finish = () => {
        if (points.length > 1) subpaths.push(points);
        points = [];
    };

    while (i < tokens.length) {
        if (/[A-Za-z]/.test(tokens[i])) command = tokens[i++];
        if (!command) throw new Error("path data starts without a command");
        const relative = command === command.toLowerCase();
        const upper = command.toUpperCase();

        if (upper === "Z") {
            if (points.length > 1) points.push({ ...points[0] });
            finish();
            current = { ...start };
            command = null;
            continue;
        }
        if (upper === "M") {
            finish();
            const x = num();
            const y = num();
            current = relative ? { x: current.x + x, y: current.y + y } : { x, y };
            start = { ...current };
            points = [{ ...current }];
            command = relative ? "l" : "L"; // implicit line-to after move-to
            continue;
        }
        if (upper === "L") {
            const x = num();
            const y = num();
            current = relative ? { x: current.x + x, y: current.y + y } : { x, y };
            points.push({ ...current });
            continue;
        }
        if (upper === "H" || upper === "V") {
            const value = num();
            current = upper === "H"
                ? { x: relative ? current.x + value : value, y: current.y }
                : { x: current.x, y: relative ? current.y + value : value };
            points.push({ ...current });
            continue;
        }
        if (upper === "C") {
            const c1 = { x: num(), y: num() };
            const c2 = { x: num(), y: num() };
            const end = { x: num(), y: num() };
            if (relative) {
                c1.x += current.x; c1.y += current.y;
                c2.x += current.x; c2.y += current.y;
                end.x += current.x; end.y += current.y;
            }
            const estimate = (dist(current, c1) + dist(c1, c2) + dist(c2, end)) / 2;
            const steps = Math.max(12, Math.min(64, Math.ceil(estimate)));
            points.push(...sampleCubic(current, c1, c2, end, Math.min(steps, 64)));
            current = end;
            continue;
        }
        if (upper === "Q" || upper === "S" || upper === "T" || upper === "A") {
            throw new Error(`favicon uses unsupported command ${command}; extend the generator`);
        }
        throw new Error(`unknown SVG command ${command}`);
    }
    finish();
    return subpaths;
}

/** Normalise every subpath into a TARGET_SIZE box with PADDING on each side. */
function normalise(subpaths) {
    const all = subpaths.flat();
    const minX = Math.min(...all.map((p) => p.x));
    const maxX = Math.max(...all.map((p) => p.x));
    const minY = Math.min(...all.map((p) => p.y));
    const maxY = Math.max(...all.map((p) => p.y));
    const inner = TARGET_SIZE * (1 - 2 * PADDING);
    const scale = inner / Math.max(maxX - minX, maxY - minY);
    const offsetX = (TARGET_SIZE - (maxX - minX) * scale) / 2 - minX * scale;
    const offsetY = (TARGET_SIZE - (maxY - minY) * scale) / 2 - minY * scale;
    return subpaths.map((path) => path.map((p) => ({
        x: p.x * scale + offsetX,
        y: p.y * scale + offsetY,
    })));
}

const round = (n) => Math.round(n * 10 ** PRECISION) / 10 ** PRECISION;

function main() {
    const opts = args();
    if (!existsSync(opts.svg)) throw new Error(`no such SVG: ${opts.svg}`);
    if (!existsSync(opts.out) && !opts.force) {
        throw new Error(`refusing to overwrite a missing generated file without --force: ${opts.out}`);
    }

    const svg = readFileSync(opts.svg, "utf8");
    const sourceHash = createHash("sha256").update(svg).digest("hex");
    const sourcePaths = [...svg.matchAll(/\sd="([^"]+)"/g)].map((match) => match[1]);
    if (sourcePaths.length === 0) throw new Error("no <path d=...> in the source SVG");

    const normalised = normalise(sourcePaths.flatMap(parsePath));
    const strokes = normalised.map((path, index) => {
        const seed = deriveSeed("fox-mark", GENERATOR_VERSION, index);
        return jitterPath(resampleClosed(path, SPACING), seed, { ...JITTER, scale: ROUGHNESS })
            .map((p) => ({ x: round(p.x), y: round(p.y) }));
    });

    const body = strokes
        .map((stroke) => "    [\n" + stroke.map((p) => `        { x: ${p.x}, y: ${p.y} },`).join("\n") + "\n    ],")
        .join("\n");
    const out = `// GENERATED FILE -- DO NOT EDIT BY HAND.
// Regenerate with: node scripts/generate-fox-sketch.mjs
//
// Source: ${opts.svg}
// Source SHA-256: ${sourceHash}
// Generator version: ${GENERATOR_VERSION}
// Sampling: target ${TARGET_SIZE}px, spacing ${SPACING}px, jitter amplitude
// ${JITTER.amplitude}px / fine ${JITTER.fineAmplitude}px at roughness ${ROUGHNESS}.
// Stroke count: ${strokes.length}. Points: ${strokes.reduce((n, s) => n + s.length, 0)}.

/** Source SHA-256. The unit test fails if the favicon changes without a regen. */
export const FOX_SKETCH_SOURCE_HASH = "${sourceHash}";

/** Generator version, folded into the per-stroke seed. */
export const FOX_SKETCH_VERSION = "${GENERATOR_VERSION}";

/** Display box of the emitted strokes, in CSS px. */
export const FOX_SKETCH_BOUNDS = { width: ${TARGET_SIZE}, height: ${TARGET_SIZE} } as const;

/** Hand-drawn fox head: one array of points per SVG subpath. */
export const FOX_SKETCH_STROKES: readonly (readonly { readonly x: number; readonly y: number }[])[] = [
${body}
];
`;
    writeFileSync(opts.out, out);
    console.log(`fox-sketch: ${strokes.length} strokes, ${strokes.reduce((n, s) => n + s.length, 0)} points -> ${opts.out}`);
}

main();
