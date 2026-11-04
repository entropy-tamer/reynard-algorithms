# Geometry Primitives

Source: `src/core/geometry/`

`PointOps` and `VectorOps` are the arithmetic the algorithms share. A point is a
position, a vector is a displacement, and the two use the same pair of numbers
with different semantics.

## Vector operations

The dot product is

$$
a \cdot b = a_x b_x + a_y b_y ,
$$

and the 2D cross product is the scalar

$$
a \times b = a_x b_y - a_y b_x .
$$

The dot product gives the angle through $\cos\theta = (a\cdot b)/(|a||b|)$; the
cross product gives the signed area of the parallelogram, and its sign is the
orientation of the turn from $a$ to $b$. Every orientation test in the package is
one of these.

## Distances

Euclidean distance is

$$
|a-b| = \sqrt{(a_x-b_x)^2 + (a_y-b_y)^2},
$$

and the squared form omits the root. Comparisons use the squared form, because
$\sqrt{}$ is monotone and the root is the expensive part. The memoized distance in
`PointOps` caches the root for repeated pairs.

## Transforms

A rotation by $\theta$ is

$$
R(\theta) =
\begin{pmatrix}
\cos\theta & -\sin\theta\\
\sin\theta & \cos\theta
\end{pmatrix},
$$

and a transform composes translation, rotation and scale in that order. A
transform is applied to a point as $p' = R S p + t$; applying it in the other
order rotates the translation and moves the object somewhere else.

## Pitfalls

The cross product in 2D is a scalar, not a vector. Returning a $z$ component that
is always zero is harmless, but comparing it to a vector is a type error the
compiler may not catch in JS.

Normalizing a zero vector is undefined. Return the zero vector or throw, and be
consistent: a caller that gets a zero vector back can use it in a sum without a
NaN spreading.

Points are values. `PointOps` returns new objects and does not mutate inputs, so a
caller that expects in-place updates has to assign the returned value.

Floating-point orientation tests are exact only for small coordinates. For
predicates that decide topology, use an epsilon or an exact orientation routine;
the sign is what matters, and it flips near collinearity.
