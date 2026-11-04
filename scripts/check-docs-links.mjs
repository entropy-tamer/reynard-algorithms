#!/usr/bin/env node
/**
 * Checks that every relative link in the guides resolves to a file on disk.
 *
 * Run:            node scripts/check-docs-links.mjs
 * Scope override: node scripts/check-docs-links.mjs docs/algorithms
 *
 * Why this exists: the 2026-11-04 restructure folded the step-by-step pages
 * (261 of them) into one guide per algorithm. Nothing in the repository could
 * tell a reviewer whether a surviving `](path)` pointed at a guide that still
 * existed, so the only check was to open 53 files and click. This is that check,
 * and it is the reason a docs move can be reviewed as a diff.
 *
 * Implementation notes (learned the hard way):
 * - Fenced blocks and inline code spans are MASKED, not removed: replacing their
 *   characters with spaces keeps every offset, so a reported line number is the
 *   real one. Removing the text first shifts every line after the first fence.
 * - A trailing `/` resolves to `index.md` then `README.md`. Guides link to
 *   directories and that is not a break.
 * - `.md#anchor` is checked as a file. Anchors are not resolved; heading slugs
 *   are a different instrument and a false failure there would teach people to
 *   ignore this one.
 * - Absolute targets (`/docs/...`) resolve from the repository root, which is
 *   how GitHub renders them; relative ones resolve from the containing file.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, extname } from "node:path";

const scope = process.argv[2] ?? "docs";
const repoRoot = resolve(dirname(new URL(import.meta.url).pathname), "..");

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "coverage"]);

function walk(dir, out) {
    let entries;
    try {
        entries = readdirSync(dir);
    } catch {
        return;
    }
    for (const name of entries) {
        if (SKIP_DIRS.has(name) || name.startsWith(".")) continue;
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) walk(full, out);
        else if (extname(name) === ".md") out.push(full);
    }
}

/** Blank out fenced blocks and inline code, preserving length and newlines. */
function mask(text) {
    const blank = (s) => s.replace(/[^\n]/g, " ");
    return text
        .replace(/^```[\s\S]*?^```/gm, blank)
        .replace(/^~~~[\s\S]*?^~~~/gm, blank)
        .replace(/`[^`\n]*`/g, blank);
}

function lineOf(text, offset) {
    let line = 1;
    for (let i = 0; i < offset; i++) if (text.charCodeAt(i) === 10) line++;
    return line;
}

const LINK = /\[[^\]\n]*\]\(\s*<?([^)\s<>]+)>?(?:\s+"[^"\n]*")?\s*\)/g;
const REF = /^[ ]{0,3}\[[^\]\n]+\]:\s*<?([^\s<>]+)>?/gm;

const CHECKED = new Set([
    ".md",
    ".ts",
    ".tsx",
    ".js",
    ".mjs",
    ".json",
    ".svg",
    ".png",
    ".css",
]);

const files = [];
walk(join(repoRoot, scope), files);

let links = 0;
let checked = 0;
const broken = [];

for (const file of files) {
    const raw = readFileSync(file, "utf8");
    const text = mask(raw);
    const dir = dirname(file);

    for (const regex of [LINK, REF]) {
        regex.lastIndex = 0;
        let m;
        while ((m = regex.exec(text)) !== null) {
            const target = m[1];
            links++;
            if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // http:, mailto:, data:
            if (target.startsWith("//")) continue;
            if (target.startsWith("#")) continue;

            const hashAt = target.indexOf("#");
            const withoutHash = hashAt === -1 ? target : target.slice(0, hashAt);
            if (withoutHash === "") continue;

            const decoded = decodeURIComponent(withoutHash);
            const base = decoded.startsWith("/")
                ? join(repoRoot, decoded)
                : resolve(dir, decoded);

            let found = existsSync(base) ? base : null;
            if (!found && decoded.endsWith("/")) {
                for (const candidate of ["index.md", "README.md"]) {
                    const p = join(base, candidate);
                    if (existsSync(p)) {
                        found = p;
                        break;
                    }
                }
            }
            if (!found && existsSync(`${base}.md`)) found = `${base}.md`;
            if (!found && !CHECKED.has(extname(base))) continue;

            checked++;
            if (!found) {
                broken.push({
                    file: file.slice(repoRoot.length + 1),
                    line: lineOf(text, m.index),
                    target,
                });
            }
        }
    }
}

const rel = (p) => p.slice(repoRoot.length + 1);

if (broken.length === 0) {
    console.log(
        `docs-links: ${links} links in ${files.length} files, ${checked} relative to the tree, 0 broken`,
    );
    process.exit(0);
}

console.error(`docs-links: ${broken.length} broken of ${checked} relative links`);
for (const b of broken) {
    console.error(`  ${rel(join(repoRoot, b.file))}:${b.line}  ->  ${b.target}`);
}
console.error(
    "\nA broken link after a docs move usually means a merged guide kept a pointer to a page it absorbed.",
);
process.exit(1);
