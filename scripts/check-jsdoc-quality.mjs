#!/usr/bin/env node
/**
 * Detects methods/properties whose JSDoc block contains no descriptive text
 * (only @tags like @param/@example, or nothing at all).
 *
 * Run:            node scripts/check-jsdoc-quality.mjs
 * Scope override: node scripts/check-jsdoc-quality.mjs src/core
 *
 * Implementation notes (learned the hard way):
 * - Regex over FULL TEXT (not line-by-line state tracking): line-based parsing
 *   broke repeatedly on multi-line blocks and inline comments.
 * - A block counts as "attached to a declaration" if the code immediately
 *   after it looks like a class member (method call signature, constructor,
 *   accessor, or property with type annotation).
 * - Module/class-level file headers are excluded via @module/@file markers.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const scope = process.argv[2] ?? "src";
const files = [];

function walk(dir) {
  // Allow a single file as scope.
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
      if (!full.includes("__tests__") && !full.includes("__bench__")) walk(full);
    } else if (name.endsWith(".ts") && !/\.(test|d)\.ts$/.test(name) && !name.endsWith(".bench.ts")) {
      files.push(full);
    }
  }
}

walk(scope);
files.sort();

// Matches a declaration on the first code line after a JSDoc block:
// - class methods / constructors / accessors: [modifiers] name<T>(...
// - standalone functions: [export] [async] function name<T>(
// - variable bindings: [export] [declare] const/let/var name ...
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

const results = []; // { file, line, name }

for (const filepath of files) {
  const content = readFileSync(filepath, "utf8");

  for (const match of content.matchAll(/\/\*\*([^*]|\*(?!\/))*?\*\//g)) {
    const block = match[0];
    const startLine = content.slice(0, match.index).split("\n").length;

    // Skip module/file-level headers.
    if (/@module\b/.test(block) || /@file\b/.test(block)) continue;

    // What follows the JSDoc?
    const after = content.slice(match.index + block.length, match.index + block.length + 300);

    // Skip non-declaration contexts (imports, exports of consts, etc).
    if (/^[ \t]*import\b/.test(after)) continue;
    if (/^[ \t]*export\s+(type|interface|enum)\b/.test(after)) continue;
    if (/^[ \t]*type\s+[A-Za-z_$]/.test(after)) continue;
    if (/^\s*$/.test(after)) continue;
    if (/^[ \t\n\r]*@/.test(after)) continue; // decorator

    const firstCodeLine = after.split("\n").find(l => l.trim().length > 0) ?? "";
    const isDecl = looksLikeDeclaration(firstCodeLine);
    if (!isDecl) continue;

    // Does the block contain real description text?
    const hasDescription = block
      .split("\n")
      .map(l => l.replace(/^\s*\/?\*+\s?/, "").trim())
      .some(text => text.length >= 8 && !text.startsWith("@"));

    if (!hasDescription) {
      const nameMatch = firstCodeLine.match(/(?:constructor|[A-Za-z_$][\w$]*)/);
      results.push({ file: filepath.replace(/\\/g, "/"), line: startLine, name: nameMatch?.[0] ?? "?" });
    }
  }
}

// Group and report.
const byFile = new Map();
for (const r of results) {
  if (!byFile.has(r.file)) byFile.set(r.file, []);
  byFile.get(r.file).push(r);
}

console.log(`Found ${results.length} declarations with empty/tag-only JSDoc in ${scope}\n`);
for (const [file, issues] of [...byFile.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${file} (${issues.length})`);
  for (const issue of issues.slice(0, 5)) {
    console.log(`  line ${issue.line}: ${issue.name}`);
  }
  if (issues.length > 5) console.log(`  ... and ${issues.length - 5} more`);
}
