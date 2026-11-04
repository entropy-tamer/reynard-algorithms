# Algorithms package documentation

This tree documents `@entropy-tamer/reynard-algorithms`. Each implementation has
one guide, named after its directory, that states the model, the equations, the
cost and the failure modes. The source module header names its guide.

## Where to start

- [`CATALOGUE.md`](./CATALOGUE.md): every algorithm and data structure, grouped by
  area, with the guide link for each. Generated from the source tree.
- [`algorithms/INDEX.md`](./algorithms/INDEX.md): the guide pages in path order.
  Generated from the pages on disk.
- [guides/](./guides/): the foundations the implementations share. Geometry
  primitives, the type vocabulary, memoization, memory pooling, the performance
  utilities, profiling, the utilities barrel and the configuration layer.

## Conventions

A guide lives beside the mirror of its source directory:

```
src/algorithms/pathfinding/astar/  ->  docs/algorithms/pathfinding/astar/astar.md
src/data-structures/basic/trie/    ->  docs/data-structures/basic/trie/trie.md
```

The guide covers the whole module, including the files that split it into
implementation pieces. Chapters are only added when a topic is large enough to
warrant its own page; a per-file note that repeats the module introduction is not
a chapter.

Every page carries a `**Source:**` line pointing at the code, a mathematics
section with the equations the implementation evaluates, a complexity table, and
a pitfalls section drawn from the guards in the code. If a claim in a guide and
the source disagree, the source wins and the guide is the bug.

## Generated files

`CATALOGUE.md` and `algorithms/INDEX.md` are written by the catalog generator
in `~/src/foxtools/reynard`. Do not edit them by hand. Run:

```bash
python3 ~/src/foxtools/reynard/catalogue.py --write
python3 ~/src/foxtools/reynard/catalogue.py --check
```

The check exits non-zero when a page is stale, which is what the package gate
runs.
