# Space Colonization — Core

**Source:** `src/algorithms/procedural-generation/space-colonization/*-core.ts`

## Idea

Given attractor points \(A\subset\mathbb{R}^d\), grow a tree (or closed venation network)
whose branches move toward attractors and consume them when close enough.

## Definitions

Let node \(p_i\) influence radius be \(d_i\), kill radius \(d_k\), segment length \(D\).

For each attractor \(a\in A\), associate to the nearest node within \(d_i\):

\[
\operatorname{pull}(p)=\sum_{a\sim p}\frac{a-p}{\|a-p\|},\qquad \text{count }n(p).
\]

Growth proposes

\[
p' = p + D\,\frac{\operatorname{pull}(p)}{\|\operatorname{pull}(p)\|}.
\]

Survival/validity:
- \(p'\) must be nearer (to at least one pulling attractor) than \(p\).
- An attractor is consumed when a node enters its \(d_k\).

## Spacing rule (critical)

Attractor spacing \(s\) sets distances:
\[
d_i\approx 1.5\text{--}2s,\quad d_k\approx 0.5s,\quad D\approx 0.5d_k.
\]
Bad ratios cause orbital non-consumption growth.

## Complexity

Per iteration:
- Association: \(O(|A|\cdot|V|)\) naive, \(O(|A|\log |V|)\) with spatial index.
- Memory: \(O(|V|+|A|)\).

## Invariants / tests

- Every child node is exactly \(D\) from parent (within tolerance).
- Every surviving attractor is outside \(d_k\) of all nodes.
- `consumed = initial - remaining`.
- Spatial index must agree with brute force.

## Known failure modes

- Pull sums not cleared between iterations -> exponential node blowup.
- No progress terminus -> branches orbit attractors.
- Closed venation with unlimited fan-in can OOM; cap fan-in.
