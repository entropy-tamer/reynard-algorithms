# Space Colonization

Source: `src/algorithms/procedural-generation/space-colonization/`

Space colonization grows a branching structure toward a set of attractors. It is
the standard algorithm for trees and veins: branches extend toward nearby
attractors, and an attractor is removed once a branch reaches it.

## Growth step

For each attractor $a$, find the closest branch node $n$ within the influence
radius $d_i$. The node collects a direction

$$
d(n) = \sum_{a \in A(n)} \frac{a - n}{|a - n|} ,
$$

normalized and scaled by the step length $D$:

$$
n' = n + D\,\hat{d}(n).
$$

An attractor within the kill radius $d_k$ of a node is removed, which stops the
growth locally.

## Parameters

$d_i$ controls how far a branch can sense an attractor, $d_k$ how close counts as
reached, and $D$ the segment length. The ratio $D/d_k$ sets the resolution: a step
much larger than the kill radius overshoots and produces few branches.

A tropism vector biases the direction:

$$
\hat{d} = \operatorname{normalize}\!\left(\sum \hat{u}_a + w\,\hat{t}\right),
$$

which is how a tree grows upward while still reaching sideways.

Attractor spacing $s$ sets the three lengths. The working ratios are

$$
d_i \approx 1.5\text{ to }2s, \qquad d_k \approx 0.5s, \qquad D \approx 0.5\,d_k .
$$

When $D$ is large relative to $d_k$ a node steps past the attractor and never
consumes it, and the branch orbits. That is the characteristic failure of a bad
ratio, not a bug in the pull sum.

## Cost

Each iteration tests every node against every attractor, so the cost is
$O(|N| \cdot |A|)$ per step. A spatial index over the attractors reduces it to
$O(|N| \log |A|)$ and is what makes large point clouds practical.

## Pitfalls

The closest-node rule creates a single trunk that forks only when two attractors
are far apart. A tree that looks like a broom needs a crowding rule: cap the
children per node or split the direction when the attractor spread is wide.

Attractors behind a branch still pull it backward. The direction sum can cancel
to near zero, and the normalized step becomes unstable; skip a node whose sum is
below an epsilon.

The kill radius is a hard cutoff. A large value ends growth early and produces a
stub; a small value makes the structure chase the last few attractors for many
iterations.

The output is a set of segments, not a mesh. Rendering needs a radius per depth
and a joint treatment; the algorithm only gives the skeleton.

A closed venation network with unlimited fan-in grows without bound. Cap the
children per node, or the memory follows the attractor count multiplied by the
branching factor.

The pull sums must be cleared at the start of every iteration. A sum that
accumulates across iterations keeps pulling toward attractors that are already
consumed, and the node count grows geometrically.
