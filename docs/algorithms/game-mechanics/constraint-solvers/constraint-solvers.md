# Constraint Solvers

Source: `src/algorithms/game-mechanics/constraint-solvers/`

A constraint solver moves bodies until a set of geometric relations holds. The
distance constraint keeps two bodies at a rest length $L$:

$$
C(p_a, p_b) = |p_b - p_a| - L = 0 .
$$

The solver does not integrate forces; it projects positions. Each iteration
computes the violation and distributes the correction by inverse mass:

$$
\Delta p_a = -\frac{w_a}{w_a + w_b}\,C\,\hat{n},
\qquad
\Delta p_b = +\frac{w_b}{w_a + w_b}\,C\,\hat{n},
$$

where $w_i = 1/m_i$ and $\hat{n}$ is the unit vector from $a$ to $b$. That is the
mass-weighted split: a heavier body moves less, and an infinite mass ($w = 0$)
does not move at all.

## Relaxation

Applying the full correction in one step overshoots when constraints share
bodies. The config exposes `relaxation` (default $0.2$) and `iterations`
(default $10$). One pass with a relaxation factor $\omega$ is

$$
\Delta p = \omega \cdot \Delta p_{\text{full}} .
$$

Iterating is Gauss-Seidel: each constraint sees the positions left by the
previous one, so the order of the list influences the converged result. That is
acceptable for a game and is why the iteration count matters more than a single
exact solve.

## Angle and joint constraints

An angle constraint applies the same projection to the two arms around a shared
joint, with the error measured as the difference between the current and rest
angle. A joint constraint is a distance constraint between the anchor points of
two bodies.

## Pitfalls

Both bodies at zero inverse mass make the system unsolvable. The solver skips the
constraint instead of dividing by zero, and the caller sees no correction.

Stiffness is not mass. A stiffness of $1$ with one iteration produces a rigid
constraint that fights every other constraint; lower stiffness or more iterations
is the stable combination.

The rest length is in world units. Scaling a model without scaling the rest
lengths leaves the solver pulling the model apart.

Velocity is not updated by the position projection. A physics loop that needs
energy conservation applies the position delta to velocity as a correction term,
or uses a velocity-level solver instead.
