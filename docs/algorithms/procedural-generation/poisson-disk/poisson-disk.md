# Poisson Disk Sampling

Source: `src/algorithms/procedural-generation/poisson-disk/`

Poisson disk sampling places points so that no two are closer than a radius $r$,
with a density that is roughly uniform. The output is blue noise: no clumps and
no lattice pattern.

## Bridson's algorithm

Keep an active list of points. Pick a point from it, generate up to `maxAttempts`
candidates uniformly in the annulus

$$
r \le |c - p| \le 2r,
$$

and accept a candidate when its cell and the neighboring cells contain no point
within $r$. An accepted point joins the active list; a point with no accepted
candidate leaves it. The process ends when the active list is empty.

Sampling in $[r, 2r]$ instead of $[0, 2r]$ is what makes the algorithm linear
expected: the annulus area is proportional to $r^2$, so each accepted point needs
a constant number of attempts on average.

## Background grid

A grid with cell size $r/\sqrt{2}$ guarantees that any point within $r$ of a
candidate shares a cell or a neighbor cell. That turns the rejection test into
a constant number of cell lookups.

## Packing density

The expected number of points is bounded by the packing density of disks of
radius $r/2$. For a domain of area $A$ the count is roughly

$$
n \approx \frac{A}{r^2} \cdot \frac{2}{\sqrt{3}} \cdot \frac{1}{4} \approx 0.29\,\frac{A}{r^2},
$$

where the factors are the hexagonal packing density and the disk area ratio. The
exact count depends on the seed and on `maxAttempts`.

## Pitfalls

`maxAttempts` trades density for time. Too few attempts leaves gaps, too many
spends time rejecting candidates in a full region; $30$ is the usual value.

The domain must be large enough for the radius. A width below $r$ admits at most
one point, and the algorithm returns a short list instead of an error.

Distance is Euclidean. A non-uniform world scale needs the radius scaled per
axis, or the samples form ellipses.

The output is a point set, not a mesh. A renderer that needs a triangulation runs
Delaunay afterward; the sampling does not produce connectivity.
