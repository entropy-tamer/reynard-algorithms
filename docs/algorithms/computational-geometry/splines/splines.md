# Splines

Source: `src/algorithms/computational-geometry/splines/`

A spline is a piecewise polynomial curve. This module provides Bézier, Hermite,
Catmull-Rom, B-spline and NURBS curves, each with evaluation, derivative and
point-generation helpers.

## Bézier

A degree-$n$ Bézier curve is

$$
B(t) = \sum_{i=0}^{n} \binom{n}{i} t^i (1-t)^{n-i} P_i, \qquad t \in [0,1].
$$

The de Casteljau recurrence evaluates it without the binomial coefficients:

$$
P_i^{(k)} = (1-t)P_i^{(k-1)} + t P_{i+1}^{(k-1)},
$$

which is numerically stable and costs $O(n^2)$ for degree $n$. The derivative is

$$
B'(t) = n \sum_{i=0}^{n-1} \binom{n-1}{i} t^i (1-t)^{n-1-i}(P_{i+1}-P_i),
$$

so the control points of the derivative are the scaled differences.

## Hermite

A cubic Hermite segment is defined by two endpoints and two tangents. With
$h_{00} = 2t^3-3t^2+1$, $h_{10} = t^3-2t^2+t$, $h_{01} = -2t^3+3t^2$ and
$h_{11} = t^3-t^2$,

$$
H(t) = h_{00}P_0 + h_{10}M_0 + h_{01}P_1 + h_{11}M_1 .
$$

## Catmull-Rom

Catmull-Rom is a Hermite spline whose tangents come from neighboring points:

$$
M_i = \frac{P_{i+1} - P_{i-1}}{2},
$$

optionally scaled by a tension parameter. It interpolates every control point,
which is the difference from a B-spline.

## B-spline

A B-spline is a weighted sum of basis functions over a knot vector:

$$
C(t) = \sum_i N_{i,p}(t) P_i,
$$

with the Cox-de Boor recurrence

$$
N_{i,0}(t) = [t_i \le t < t_{i+1}], \qquad
N_{i,p}(t) = \frac{t-t_i}{t_{i+p}-t_i}N_{i,p-1}(t)
+ \frac{t_{i+p+1}-t}{t_{i+p+1}-t_{i+1}}N_{i+1,p-1}(t).
$$

The curve is $C^{p-1}$ continuous at simple knots and does not interpolate the
control points in general.

## NURBS

NURBS adds a weight $w_i$ per control point and divides by their basis-weighted
sum:

$$
C(t) = \frac{\sum_i N_{i,p}(t) w_i P_i}{\sum_i N_{i,p}(t) w_i}.
$$

The weights make circles and conics representable exactly.

## Pitfalls

The knot vector length must be $n + p + 1$ for $n$ control points and degree $p$.
A vector of the wrong length silently clamps the parameter range or reads past
the end.

Catmull-Rom tangents need a point on each side. The first and last segments use a
clamped or reflected phantom point, and the choice changes the endpoint shape.

Uniform parameterization is not arc-length parameterization. A curve sampled at
equal $t$ moves faster where the control points are far apart; a caller that
needs constant speed has to reparameterize or use the derivative.

Rational curves with zero denominator at a control point are undefined. Keep the
weights positive.
