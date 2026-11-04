# Circular Positioning

Source: `src/algorithms/computational-geometry/circular/`

Radial placement maps an angle and a radius to a point around a center. The
parameterization is

$$
x = c_x + r\cos\theta, \qquad y = c_y + r\sin\theta ,
$$

with $\theta$ in radians measured counter-clockwise from the positive $x$ axis.
`CircularPositioning` converts between the angular and Cartesian forms and spaces
$n$ items evenly around a circle.

## Even spacing

For $n$ items starting at $\theta_0$ the $i$-th angle is

$$
\theta_i = \theta_0 + \frac{2\pi i}{n} .
$$

When the items have extent, the angular step has to satisfy
$\Delta\theta \ge 2\arcsin\!\bigl(w/(2r)\bigr)$ for an item width $w$, or the
items overlap. That bound is the inverse of the chord length

$$
\ell = 2r\sin\frac{\Delta\theta}{2}.
$$

## Polar conversion

The inverse map is

$$
r = \sqrt{(x-c_x)^2 + (y-c_y)^2}, \qquad
\theta = \operatorname{atan2}(y-c_y,\, x-c_x).
$$

`atan2` returns $(-\pi, \pi]$; a caller that wants $[0, 2\pi)$ adds $2\pi$ to the
negative branch.

## Pitfalls

Degrees and radians are the recurring bug. The class documents radians, and every
method that takes an angle says so in its name; a degree value passed unchanged
produces a full turn in the wrong place.

A full circle of $n$ items has $n$ gaps, not $n-1$. Using $2\pi/(n-1)$ leaves a
double gap between the last and first item.

Radius zero collapses every point to the center. The angle still round-trips, but
the Cartesian result carries no information about it.

Floating-point sine and cosine are accurate to a few ulps, so two computations of
the same angle can differ in the last bit. Compare positions with a tolerance
instead of for equality.
