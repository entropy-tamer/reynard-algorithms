# Mutation registry — reynard algorithms

A green test suite proves only that the code and the tests agree. To find out whether the tests
can *disagree*, we break the implementation on purpose and check that a test goes red. This
directory is the durable ledger of those experiments.

## The tool

We reuse the canary-guided checker from foxtools, not a bespoke script:

- Runner: [~/src/foxtools/testkit/mutate-check.sh](file:///home/kade/src/foxtools/testkit/mutate-check.sh)
- Rot linter (cheap, run this first): [~/src/foxtools/testkit/lint-spec.py](file:///home/kade/src/foxtools/testkit/lint-spec.py)
- Why the canary is mandatory: [~/src/foxtools/testkit/MUTATION-CHECK.md](file:///home/kade/src/foxtools/testkit/MUTATION-CHECK.md)

The checker derives its verdict from vitest's **JSON** report (`numTotalTests` / `numFailedTests`),
never from human-readable output. Every spec carries a `canary-*` mutant that is applied first;
if the canary is not caught the run returns `UNSOUND` and reports nothing, because a harness that
cannot see red cannot interpret green.

## What is mutated

The **implementation** under test, not the test file. Mutating a test would only prove the test
runner works; mutating the source asks the question we actually care about — *would a regression
in this algorithm be noticed?* The user shorthand "mutate each test" is read here as "for each
test suite, mutate the code it guards and see whether that suite notices".

## Registry layout

```
mutation/
  README.md            this file
  specs/*.tsv          the mutants (4 tab-separated fields; diffable, reviewable)
  results/2026-11-21.md measured verdicts, with the exact command used
```

The specs fall into two groups: `union-find`, `trie-stats` and `astar-heuristics` measure whether
existing tests can detect regressions, while the five `regressions-*` specs guard production bugs
that were found and fixed during the audit. Known survivors are recorded as comments in the spec
that produced them, so a future run does not rediscover them.

A spec row is `name <TAB> file <TAB> find-string <TAB> replacement-string`. `# repo:` and
`# runner:` directives at the top make each spec self-contained, so it can be linted and run
from any working directory.

## How to run (from anywhere)

```sh
# cheap rot check — milliseconds
python3 ~/src/foxtools/testkit/lint-spec.py ~/reynard/algorithms ~/reynard/algorithms/mutation/specs/*.tsv

# expensive run — one full suite invocation per mutant
bash ~/src/foxtools/testkit/mutate-check.sh ~/reynard/algorithms \
  ~/reynard/algorithms/mutation/specs/union-find.tsv -- \
  src/__tests__/union-find/union-find.test.ts
```

Verdicts: `DETECTED` (0), `SURVIVED` (1, a real test gap), `INVALID` (2, the edit never applied or
broke collection), `UNSOUND` (3, canary survived or baseline red).

## Operational rules (learned from foxtools, §7 of MUTATION-CHECK.md)

1. Do not run a linter, grep check, or test suite against the tree **while** a mutation run is
   mutating it. A mid-mutant file is valid input for the checker and invalid for everything else.
2. Never point the checker at a tree with uncommitted work you did not author. Restore is a `cp`
   from an in-memory backup, not `git checkout`; a mid-run crash leaves the file mutated.
3. After a run, re-run the target suite and confirm the baseline is green again. Restores are
   sha256-verified by the tool, but trust the re-run.

## Why `isolate: false` matters here

`vitest.config.ts` sets `isolate: false`. With the default, each test file gets a fresh worker
(~649 ms of spawn + environment); this suite spawned 102 workers and paid ~8.8 s of pure startup.
Reusing workers makes each mutant run materially cheaper. The trade-off is that module-level
singletons survive between files, so any test that relies on a pristine module registry must
reset its own state.
