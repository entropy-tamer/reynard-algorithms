# Simplex Noise

Source: `src/algorithms/procedural-generation/simplex-noise/`

Simplex noise evaluates the noise on a simplex lattice instead of a square
lattice. In two dimensions the simplex is a triangle, in three a tetrahedron, and
in four a pentachoron. Fewer corners per cell means fewer gradient evaluations and
no directional artifacts from the square grid.

## Skew and unskew

The skewed coordinates place a point in the simplex lattice:

$$
s = (x+y)F_2, \qquad i = \lfloor x+s \rfloor,\ j = \lfloor y+s \rfloor ,
$$

with

$$
F_2 = \frac{\sqrt 3 - 1}{2} \approx 0.366, \qquad
G_2 = \frac{3 - \sqrt 3}{6} \approx 0.211 .
$$

Unskewing gives the cell origin back:

$$
t = (i+j)G_2, \qquad x_0 = x - (i - t),\quad y_0 = y - (j - t).
$$

The same pattern extends to three and four dimensions with their own $F$ and $G$
constants.

## Contribution

Each corner contributes a radial kernel times the gradient dot product:

$$
n = \sum_{k=0}^{2} \max\!\left(0,\ r^2 - |d_k|^2\right)^4
\,(g_k \cdot d_k),
$$

with $r^2 = 0.5$ in two dimensions. The fourth power keeps the kernel continuous
at the radius, and the scale factor ($70$ in 2D) maps the sum to roughly
$[-1,1]$.

## Fractal use

The multiscale helper sums octaves with lacunarity and persistence, the same
construction as Perlin. The advantage of simplex is visible in the octave sum:
each octave is cheaper, and the artifacts of the square lattice do not accumulate.

## Pitfalls

The output is not exactly in $[-1,1]$. The scale constant is chosen empirically,
and a sample can exceed the bound by a few percent; clamp if the consumer needs a
strict range.

The permutation table defines the field. Two instances with different seeds do
not tile, and a serialized field needs its seed and permutation.

The 4D case is much more expensive than 3D. Use it only when the fourth
dimension is real (time or a parameter), not as a substitute for two 2D samples.

Simplex noise is not tileable by default. Wrapping a coordinate only works if the
permutation is periodic at the wrap length, which this implementation does not
guarantee.

## Analysis and filtering

The `utils/` tree measures and filters a sampled field. `analyzeNoise` returns
amplitude, mean, variance and a frequency summary; `computeFrequencyDomainProperties`
runs an FFT and reports the dominant bins. The filters are the standard three:
low-pass, which keeps bins below a cutoff $f_c$; high-pass, which keeps bins
above it; and band-pass, which keeps $[f_{\text{low}}, f_{\text{high}}]$.

Spatial filters use a kernel instead: a Gaussian with standard deviation $\sigma$
and a median with an odd window. The Gaussian weights are

$$
w_i = \frac{1}{\sqrt{2\pi}\sigma}e^{-i^2/(2\sigma^2)},
$$

normalized over the window. The median filter is the right choice for impulse
noise, because a single outlier cannot move the median.

`computeFilterGain` and `computeNoiseReduction` report the RMS ratio before and
after the filter, which is the number to quote when comparing filter settings.
