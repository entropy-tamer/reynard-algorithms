# Sweep and Prune Collision Detection

Source: `src/algorithms/collision/broad-phase/sweep-prune/`

Sweep and prune finds pairs of boxes whose intervals overlap on one axis, then
confirms the overlap on the remaining axes. Boxes are projected onto the sweep
axis and the endpoints are sorted. A sweep keeps an active set: an opening
endpoint adds a box, a closing endpoint removes it, and every pair in the active
set at the closing endpoint is a candidate.

## Interval overlap

Two closed intervals $[a_1, a_2]$ and $[b_1, b_2]$ overlap when

$$
a_1 \le b_2 \;\wedge\; b_1 \le a_2 .
$$

After the sweep, the candidate set has size $O(n + k)$ for $k$ overlapping pairs
on the sweep axis. Confirming on the other axes costs $O(1)$ per candidate, so a
frame costs

$$
O(n \log n + k)
$$

with a comparison sort. When only a few boxes move between frames, insertion
sort on the nearly-sorted endpoint list costs $O(n + m)$ for $m$ moved
endpoints, which is the temporal-coherence case this implementation is built
for.

## Choosing the axis

The sweep axis should be the one with the largest variance in box centers. A
poor axis produces many candidate intervals that fail on the next axis, and the
`MultiAxisSweepResult` exposes the per-axis counts so the choice is measurable
instead of guessed.

## Incremental updates

`IncrementalUpdate` records the endpoint moves for the boxes that changed.
`SweepPrune` applies them with a local insertion sort and emits the pairs that
entered and left the active set. The cache keeps the previous frame's pair list
so a consumer can update contacts instead of rebuilding them.

## Pitfalls

The sort must be stable, or boxes that share an endpoint can be reported twice.
`SortingOptions` carries the tie-break rule.

Touching boxes are a policy decision. With closed intervals a box that ends
exactly where the next begins is a collision; a game that wants a gap uses an
epsilon on one side.

Zero-size boxes are legal and produce a valid interval, but they overlap any box
whose span contains them, which can inflate the pair count in degenerate scenes.

The active set is only correct while every endpoint is present exactly once.
Dropping an endpoint on removal leaves stale boxes in the set and produces pairs
with objects that no longer exist.
