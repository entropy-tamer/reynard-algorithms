# Steering Behaviors

Source: `src/algorithms/game-mechanics/steering-behaviors/`

Steering computes a force from a desired velocity. The common form is

$$
F = \operatorname{clamp}\bigl(v_{\text{desired}} - v_{\text{current}},\, F_{\max}\bigr),
$$

where the desired velocity is built per behavior. The clamp bounds the
acceleration, which is what keeps a group of agents from overshooting.

## Behaviors

Seek points at the target:
$v_d = \hat{u}(t - p)\,v_{\max}$. Flee is the negation.

Arrival uses the same direction but scales the speed inside a slowing radius $R$:

$$
v_d = \hat{u}(t-p)\,v_{\max}\min\!\left(1, \frac{|t-p|}{R}\right).
$$

Pursuit targets the future position of a moving target,
$t' = t + v_t \tau$ with $\tau = |t-p|/v_{\max}$, and evasion predicts the same
point and flees it.

Wander moves a point on a circle ahead of the agent by a random angular jitter.
Separation sums the inverse-distance repulsion from neighbors inside a radius:

$$
F_{\text{sep}} = \sum_{j \in N} \frac{p_i - p_j}{|p_i - p_j|^2}.
$$

Alignment matches the average heading of neighbors, cohesion moves toward their
centroid, and `flocking` combines the three with weights.

## Combining

`blend` sums the forces and clamps the sum, or takes a weighted sum when the
caller supplies weights. Summing normalizes nothing, so three behaviors at full
weight produce three times the force of one; the weights are part of the model,
not an implementation detail.

## Cost

Each pairwise behavior is $O(n)$ per agent, so a naive flock is $O(n^2)$ per
frame. A spatial hash or a neighbor grid reduces it to $O(n + k)$ for $k$
neighbors.

## Pitfalls

The steering force is not a velocity. Integrating force as position without a
mass term makes the agent teleport; the usual loop is
$v \leftarrow v + F\Delta t$ with a maximum speed clamp afterward.

Zero distance to the target makes the direction undefined. Skip the force or pick
an arbitrary direction instead of dividing by zero.

Separation grows without bound as the distance goes to zero. The squared distance
in the denominator needs a minimum, or two coincident agents produce an infinite
force and a NaN position.

The behaviors assume a top-down plane. A 3D agent needs the desired velocity
projected onto the movement plane, or the vertical component fights gravity.
