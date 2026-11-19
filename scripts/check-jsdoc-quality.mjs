#!/usr/bin/env node
/**
 * Detects declarations whose JSDoc block contains only tags (or nothing) and
 * no descriptive prose. Empty shells look thorough while telling the reader
 * nothing, so this gate refuses to let them through.
 *
 * Run:            node scripts/check-jsdoc-quality.mjs
 * Scope override: node scripts/check-jsdoc-quality.mjs src/core
 * Self-test:      node scripts/check-jsdoc-quality.mjs --selftest
 *
 * Implementation notes (learned the hard way):
 * - Regex over FULL TEXT (not line-by-line state tracking): line-based parsing
 *   broke repeatedly on multi-line blocks and inline comments.
 * - A block counts as "attached to a declaration" if the code immediately
 *   after it looks like a class member (method, constructor, accessor,
 *   property), a standalone function, or a variable binding.
 * - Only prose BEFORE the first block tag counts as a description. An
 *   `@example`-only block is a shell even when the example contains code;
 *   `@param x the value` does not describe the declaration itself.
 * - Module/class-level file headers are excluded via @module/@file markers.
 * - Exit 0 means "no shells found" (or the self-test passed); exit 1 means
 *   "shells found" (or the self-test failed). A gate that always exits 0 is
 *   worse than no gate, so the exit code is set from the result.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const args = process.argv.slice(2);
const selfTest = args.includes("--selftest");
const scopeArg = args.find(arg => !arg.startsWith("--"));
const scope = scopeArg ?? "src";

// Matches a declaration on the first code line after a JSDoc block:
// - class methods/constructors/accessors: [modifiers] name<T>(...)
// - standalone functions: [export] [async] function name<T>(
// - variable bindings, including arrow functions: [export] const name = ...
const DECL_RE =
  /^[ \t]*(?:(?:public|private|protected|static|readonly|abstract|override|async|get|set)\s+)*(?:(?:constructor)|[A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(/;
const FN_DECL_RE = /^[ \t]*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\b/;
const VAR_DECL_RE = /^[ \t]*(?:export\s+)?(?:declare\s+)?(?:const|let|var)\s+/;

function looksLikeDeclaration(firstCodeLine) {
  return (
    DECL_RE.test(firstCodeLine) ||
    FN_DECL_RE.test(firstCodeLine) ||
    VAR_DECL_RE.test(firstCodeLine) ||
    /^[ \t]*(?:readonly\s+)?[A-Za-z_$][\w$]*\s*(?::[^=;]+)?=[^=]/.test(firstCodeLine) ||
    /^[ \t]*(?:private\s+|public\s+|protected\s+|readonly\s+)+[A-Za-z_$][\w$]*\s*[:;]/.test(firstCodeLine)
  );
}

// Strip the leading comment decorations from one line of a JSDoc block.
function stripCommentLine(line) {
  return line.replace(/^\s*\/?\*+\s?/, "").trim();
}

// Real prose must exist before the first block tag. Tag bodies (including
// fenced @example code) never count as a description of the declaration.
function hasDescription(block) {
  const lines = block.split("\n").map(stripCommentLine);
  const firstTag = lines.findIndex(line => line.startsWith("@"));
  const prose = firstTag === -1 ? lines : lines.slice(0, firstTag);
  return prose.some(line => line.length >= 8 && /[A-Za-z]/.test(line));
}

// Report the actual declared name, not the first modifier (private/export/...).
function declarationName(line) {
  const stripped = line
    .trim()
    .replace(/^(?:(?:public|private|protected|static|readonly|abstract|override|async|declare|export|default|get|set)\s+)+/, "");
  if (/^constructor\b/.test(stripped)) return "constructor";
  const match = stripped.match(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)/) ??
    stripped.match(/^(?:function\s+)?([A-Za-z_$][\w$]*)/);
  return match?.[1] ?? "?";
}

// Single pass over one file's text. Returns one record per empty shell.
function scanContent(content, filepath) {
  const issues = [];
  for (const match of content.matchAll(/\/\*\*[\s\S]*?\*\//g)) {
    const block = match[0];
    const startLine = content.slice(0, match.index).split("\n").length;

    // Module/file-level headers describe the file, not a declaration.
    if (/@module\b/.test(block) || /@file\b/.test(block)) continue;

    const after = content.slice(match.index + block.length, match.index + block.length + 300);
    if (/^[ \t]*import\b/.test(after)) continue;
    if (/^[ \t]*export\s+(type|interface|enum)\b/.test(after)) continue;
    if (/^[ \t]*type\s+[A-Za-z_$]/.test(after)) continue;
    if (/^\s*$/.test(after)) continue;
    if (/^[ \t\n\r]*@/.test(after)) continue; // decorator

    const firstCodeLine = after.split("\n").find(line => line.trim().length > 0) ?? "";
    if (!looksLikeDeclaration(firstCodeLine)) continue;
    if (hasDescription(block)) continue;

    issues.push({
      file: filepath.replace(/\\/g, "/"),
      line: startLine,
      name: declarationName(firstCodeLine),
    });
  }
  return issues;
}

function walk(dir, files) {
  if (/\.ts$/.test(dir)) {
    if (!/\.(test|d)\.ts$/.test(dir) && !dir.endsWith(".bench.ts")) files.push(dir);
    return;
  }
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!full.includes("__tests__") && !full.includes("__bench__")) walk(full, files);
    } else if (
      name.endsWith(".ts") &&
      !/\.(test|d)\.ts$/.test(name) &&
      !name.endsWith(".bench.ts")
    ) {
      files.push(full);
    }
  }
}

function report(results, label) {
  const byFile = new Map();
  for (const r of results) {
    if (!byFile.has(r.file)) byFile.set(r.file, []);
    byFile.get(r.file).push(r);
  }
  console.log(`Found ${results.length} declarations with empty/tag-only JSDoc in ${label}\n`);
  for (const [file, issues] of [...byFile.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`${file} (${issues.length})`);
    for (const issue of issues.slice(0, 5)) {
      console.log(`  line ${issue.line}: ${issue.name}`);
    }
    if (issues.length > 5) console.log(`  ... and ${issues.length - 5} more`);
  }
}

// Inline fixtures. The hazard fixture MUST be reported; the clean fixture MUST
// produce zero issues. A self-test with no hazard cannot catch a dead gate.
const hazardFixture = `
class HazardFixture {
  /** @param start @param goal @example */
  findPath(start, goal) { return []; }

  /** @param options */
  constructor(options = {}) {}

  /** @example
   * const h = new HazardFixture();
   */
  onlyExample() { return 1; }
}

/** @param x @returns */
export function compute(x) { return x * 2; }
`;

const cleanFixture = `
class CleanFixture {
  /** Finds a path between two grid points.
   * @param start Starting point.
   * @param goal Destination point.
   * @returns The ordered path points.
   */
  findPath(start, goal) { return []; }

  /** Creates a clean fixture with the given options.
   * @param options Construction options.
   */
  constructor(options = {}) {}
}

/** Doubles a number for callers.
 * @param x The value to double.
 * @returns Twice the input.
 */
export function compute(x) { return x * 2; }
`;

function runSelfTest() {
  const hazardIssues = scanContent(hazardFixture, "<selftest:hazard>");
  const cleanIssues = scanContent(cleanFixture, "<selftest:clean>");
  const required = ["findPath", "constructor", "onlyExample", "compute"];
  const missing = required.filter(name => !hazardIssues.some(issue => issue.name === name));

  let ok = true;
  if (missing.length > 0) {
    console.error(`SELFTEST FAIL: hazard fixture not reported: ${missing.join(", ")}`);
    ok = false;
  }
  if (cleanIssues.length > 0) {
    console.error(
      `SELFTEST FAIL: clean fixture produced ${cleanIssues.length} false positive(s): ` +
        cleanIssues.map(issue => issue.name).join(", ")
    );
    ok = false;
  }

  console.log(
    `SELFTEST ${ok ? "PASS" : "FAIL"}: hazard reported ${hazardIssues.length} shell(s) ` +
      `[${hazardIssues.map(issue => issue.name).join(", ")}], clean reported ${cleanIssues.length}.`
  );
  return ok ? 0 : 1;
}

function runScan() {
  const files = [];
  walk(scope, files);
  files.sort();
  const results = [];
  for (const filepath of files) {
    results.push(...scanContent(readFileSync(filepath, "utf8"), filepath));
  }
  report(results, scope);
  return results.length > 0 ? 1 : 0;
}

process.exit(selfTest ? runSelfTest() : runScan());
