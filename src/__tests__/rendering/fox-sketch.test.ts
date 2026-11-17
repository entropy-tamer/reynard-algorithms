import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import {
    FOX_SKETCH_BOUNDS,
    FOX_SKETCH_SOURCE_HASH,
    FOX_SKETCH_STROKES,
    FOX_SKETCH_VERSION,
} from "../../algorithms/rendering/sketch/index.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const generated = join(root, "src/algorithms/rendering/sketch/fox-sketch-paths.ts");

const scratch: string[] = [];
afterAll(() => {
    for (const dir of scratch) rmSync(dir, { recursive: true, force: true });
});

describe("generated fox sketch", () => {
    it("guards the source: the embedded hash matches the favicon on disk", () => {
        const svg = join(root, "..", "..", "favicon.svg");
        if (!existsSync(svg)) return; // the guard is meaningful where the source exists
        const hash = createHash("sha256").update(readFileSync(svg)).digest("hex");
        expect(FOX_SKETCH_SOURCE_HASH).toBe(hash);
    });

    it("emits four finite strokes inside the display bounds", () => {
        expect(FOX_SKETCH_STROKES).toHaveLength(4);
        expect(FOX_SKETCH_VERSION).toBe("1");
        let count = 0;
        for (const stroke of FOX_SKETCH_STROKES) {
            expect(stroke.length).toBeGreaterThan(4);
            for (const point of stroke) {
                expect(Number.isFinite(point.x)).toBe(true);
                expect(Number.isFinite(point.y)).toBe(true);
                expect(point.x).toBeGreaterThanOrEqual(-1);
                expect(point.y).toBeGreaterThanOrEqual(-1);
                expect(point.x).toBeLessThanOrEqual(FOX_SKETCH_BOUNDS.width + 1);
                expect(point.y).toBeLessThanOrEqual(FOX_SKETCH_BOUNDS.height + 1);
                count++;
            }
        }
        expect(count).toBeGreaterThan(100);
    });

    it("regenerates byte-for-byte from the same source", () => {
        const dir = mkdtempSync(join(tmpdir(), "fox-sketch-"));
        scratch.push(dir);
        const out = join(dir, "fox-sketch-paths.ts");
        const result = spawnSync(
            process.execPath,
            [join(root, "scripts/generate-fox-sketch.mjs"), "--force", "--out", out],
            { encoding: "utf8" },
        );
        expect(result.status, result.stderr).toBe(0);
        expect(readFileSync(out, "utf8")).toBe(readFileSync(generated, "utf8"));
    });
});
