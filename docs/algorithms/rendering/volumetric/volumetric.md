# Volumetric Rendering

Source: `src/algorithms/rendering/volumetric/`

Volumetric rendering integrates emission and absorption along a view ray through
a participating medium. The emission-absorption form is

$$
L(x) = \int_{0}^{s} T(t)\,\sigma(t)\,c(t)\,dt + T(s)\,L_{\text{bg}},
\qquad
T(t) = e^{-\int_0^t \sigma(u)\,du},
$$

where $\sigma$ is extinction, $c$ the emitted color, and $T$ the transmittance.
The integral has no closed form for a general density, so it is sampled.

## Ray marching

Split the ray into steps of length $\Delta t$. At step $i$ the sample is at
$t_i = (i + 0.5)\Delta t$, and the compositing recurrence is

$$
T_i = T_{i-1}\,e^{-\sigma(t_i)\Delta t},
\qquad
L = L + T_{i-1}\,\sigma(t_i)\,c(t_i)\,\Delta t .
$$

That is front-to-back alpha compositing with the opacity
$\alpha_i = 1 - e^{-\sigma_i \Delta t}$.

## Density functions

`density-functions.ts` provides the field: constant, exponential height falloff,
and noise-modulated variants. A height fog uses

$$
\sigma(y) = \sigma_0 e^{-(y-y_0)/H},
$$

and a cloud layer multiplies it by a fBm noise sampled in three dimensions.

## Cost

The cost is $O(S)$ per ray for $S$ steps, so $O(P \cdot S)$ for $P$ pixels. The
step count is the quality knob: too few and the volume bands, too many and the
frame time explodes. Jittering the start offset turns the banding into noise,
which is easier to denoise than a hard ring.

## Pitfalls

Fixed step size is a quality compromise. A density that varies faster than
$\Delta t$ aliases; adapt the step to the local density or use a shadow map to
skip empty space.

The transmittance must stay in $[0,1]$. A negative density or a negative step
produces values above one and the compositing blows up.

The background term is not optional for a transparent medium. Dropping
$T(s)L_{\text{bg}}$ makes the volume opaque even when the density is low.

The integral is over the segment inside the medium, not the whole ray. Starting
the march at the camera when the camera is outside the volume wastes samples and
can add a false layer of fog.
