# Perlin Noise

Source: `src/algorithms/procedural-generation/perlin-noise/`

Perlin noise is a gradient noise: each lattice corner has a random gradient, and
the value inside a cell interpolates the dot products between the offset and the
corner gradients.

## The 1D case

With lattice values $g_0, g_1$ and fractional position $t$,

$$
n(t) = (1-t)\,g_0 t + t\,g_1 (t-1),
$$

which is the smoothed interpolation of two gradients. In higher dimensions the
same construction uses a gradient per corner and a fade curve per axis.

## Fade curve

The interpolant is

$$
f(t) = 6t^5 - 15t^4 + 10t^3 ,
$$

chosen so $f(0)=0$, $f(1)=1$ and the first and second derivatives vanish at both
ends. That continuity is why Perlin noise has no visible lattice seams in the
first derivative.

## Fractal sum

Octaves add detail:

$$
F(p) = \sum_{i=0}^{O-1} \text{persistence}^i \,
n(p \cdot \text{lacunarity}^i).
$$

The output is normalized to approximately $[-1,1]$ by the sum of amplitudes.
Persistence below $0.5$ gives a smooth field, above $0.5$ a rougher one.

## Cost

A sample costs $O(2^d)$ corner evaluations for dimension $d$, each a few
multiplies. The octave sum multiplies by $O$, so the cost is $O(O \cdot 2^d)$ per
sample and $O(N \cdot O)$ for $N$ samples.

## Pitfalls

The permutation table is the noise identity. Two fields with different
permutations do not tile together, and a saved field needs its permutation saved
with it.

Integer overflow in the hash breaks the lattice. In JS the bitwise operators are
32-bit, which is fine for the permutation, but a hash that multiplies before
masking loses the low bits.

Perlin noise is zero at the lattice points by construction. A field sampled
exactly at integer coordinates looks flat, which is a common surprise in tests.

Anisotropic scaling of the coordinates changes the feature shape. Scale all axes
by the same factor unless a stretched pattern is intended.
