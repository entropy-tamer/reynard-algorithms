#!/usr/bin/env bash
# One command for the Woodpecker `verify` step. Every check here is offline
# once dependencies are installed; none of them depends on a renderer or a
# network service. Exit status is authoritative.
set -euo pipefail
cd "$(dirname "$0")/.."

node --version
pnpm --version

# Prefer the local store so a warmed CI image never reaches the registry.
pnpm install --frozen-lockfile --prefer-offline

pnpm run typecheck
pnpm exec biome check src scripts
pnpm run check:docs
node scripts/check-jsdoc-quality.mjs
# The fox-sketch regeneration test imports dist/index.js; a clean clone has no
# build output, so build once here rather than letting that test fail on setup.
pnpm run build
pnpm run test
