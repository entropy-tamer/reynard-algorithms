#!/usr/bin/env bash
# One command for the Woodpecker `perf` step. The A* gate is relative: it
# compares growth and per-node cost within one process, so a loaded host does
# not flip the verdict. The committed baseline is only a catastrophic ceiling.
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm install --frozen-lockfile --prefer-offline
pnpm run build
node scripts/perf-gate.mjs
