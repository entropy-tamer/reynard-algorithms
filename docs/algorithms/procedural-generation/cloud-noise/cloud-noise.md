# Cloud Noise

Source: `src/algorithms/procedural-generation/cloud-noise/`

Cloud noise samples a volumetric density field for a cloud layer. It combines
fractal noise with a coverage remap and a vertical falloff, and it advects the
field with a wind offset.

## Fractal sum

The base field is fractional Brownian motion, a sum of octaves:

$$
f(p) = \sum_{i=0}^{O-1} a_i \, n(p \cdot \ell^i),
\qquad a_i = \text{persistence}^i,\quad \ell = \text{lacunarity}.
$$

Each octave adds detail at a higher frequency and lower amplitude. With
persistence $0.5$ the amplitudes halve, so the sum converges and the normalized
result stays in $[0,1]$ after the sum of amplitudes divides it.

## Coverage

Coverage $c \in [0,1]$ moves the threshold that separates cloud from clear air.
A smooth remap avoids a hard edge:

$$
d(p) = \operatorname{smoothstep}\!\left(c - w,\ c + w,\ f(p)\right),
$$

where $w$ is a softness width. `coverage = 0.5` is the neutral setting; higher
values produce more cloud for the same noise.

## Layer shape

`layerPosition` is the normalized height inside the layer:

$$
h(p) = \frac{p_y - (\text{height} - \text{thickness}/2)}{\text{thickness}} .
$$

The density is multiplied by a falloff in $h$, so the layer has a top and a
bottom instead of a slab that ends abruptly. Wind offsets the sample position:

$$
p' = p - (t\,\text{windSpeedX},\ 0,\ t\,\text{windSpeedZ}),
$$

which makes the clouds drift without regenerating the field.

## Pitfalls

The noise scale is in world units. A scale of $0.01$ with a layer of $30$ units
gives three noise periods across the layer, which may be too few for the intended
detail.

Octaves are not free. Each octave doubles the frequency, so high-frequency
octaves alias when the sample rate is coarse; stop adding octaves at the grid
resolution.

Coverage is not density. Coverage changes the fraction of the layer that is
cloudy, density changes the opacity of the cloud that is there. Mixing them makes
the layer darker instead of fuller.

An animated wind offset without a periodic noise function drifts the pattern out
of the sampled domain. Use a tileable noise or wrap the offset.
