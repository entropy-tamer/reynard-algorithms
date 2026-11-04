# Fog

Source: `src/algorithms/rendering/fog/`

Fog attenuates the color of a fragment by the amount of participating medium
between the camera and the surface. The physical model is Beer-Lambert:

$$
I = I_0\,e^{-\tau}, \qquad
\tau = \int_{0}^{s} \sigma(x(t))\,dt ,
$$

where $\tau$ is the optical depth, $\sigma$ the extinction coefficient, and $s$
the distance along the ray. A constant density gives $\tau = \sigma s$.

## Distance models

Linear fog interpolates between the near and far distances:

$$
f = \operatorname{clamp}\!\left(\frac{s - s_{\text{near}}}{s_{\text{far}} - s_{\text{near}}}, 0, 1\right).
$$

Exponential fog uses $f = 1 - e^{-\sigma s}$, and the squared variant uses
$1 - e^{-(\sigma s)^2}$. The exponential form matches the physical model; the
linear form is cheaper and is what many engines expose.

The final color is

$$
C = (1-f)\,C_{\text{object}} + f\,C_{\text{fog}} .
$$

## Height fog

A medium whose density decays with height has

$$
\sigma(y) = \sigma_0 e^{-(y - y_0)/H},
$$

so a ray at constant height has the same optical depth as a homogeneous medium,
and a vertical ray integrates the exponential. The closed form is used when the
density is uniform per layer; a volumetric renderer marches it instead.

## Pitfalls

Fog is applied after the perspective divide, so it uses the view-space distance,
not the screen depth. Using the depth buffer value directly produces fog that
depends on the projection.

The fog color is not the background color unless the scene is fully fogged at the
far plane. Setting both to the same value is a check, not a guarantee.

Exponential fog never reaches one. A far object keeps a fraction $e^{-\sigma s}$
of its color, so a very large $s$ is needed to hide geometry; clamp the far
distance for the effect to read as opaque.

Height fog needs the camera height as well as the fragment height. A ray that
descends integrates more density than a level one, and the analytic form only
covers the constant-height case.
