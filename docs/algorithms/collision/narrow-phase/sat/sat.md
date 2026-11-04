# Separating Axis Theorem (SAT)

Source: `src/algorithms/collision/narrow-phase/sat/`

For two convex polygons, SAT states that they are disjoint exactly when there is
a line such that the projections of the polygons onto its normal do not overlap.
For polygons the candidate normals are the edge normals of both shapes.

## Projection test

Let polygon $A$ have vertices $a_i$ and unit axis $u$. Its projection is the
interval

$$
[\min_i (a_i \cdot u),\; \max_i (a_i \cdot u)] .
$$

With intervals $[a_{\min}, a_{\max}]$ and $[b_{\min}, b_{\max}]$ the axis
separates when

$$
a_{\max} < b_{\min} \quad \text{or} \quad b_{\max} < a_{\min} .
$$

If no candidate axis separates, the polygons intersect. The overlap on axis $u$
is

$$
\min(a_{\max}, b_{\max}) - \max(a_{\min}, b_{\min}),
$$

and the axis with the smallest positive overlap gives the minimum translation
vector. `sat-contact.ts` uses that axis to place contact points.

## Cost

With $n$ and $m$ edges the test is $O(n + m)$ projections, each $O(n)$ or $O(m)$
naive, or $O(n + m)$ total when the projection is cached per polygon per axis.
The implementation caches axes and projections (`sat-cache.ts`), and
`SATConfig.maxContactPoints` caps the contact list at four by default, which is
the number a stable 2D solver wants.

## Early outs

A bounding-circle test runs before the axis loop. If

$$
|c_A - c_B| > r_A + r_B ,
$$

the polygons cannot overlap and the axis loop is skipped. The circle radii are
precomputed with the polygons.

## Pitfalls

The epsilon matters at contact. `DEFAULT_SAT_CONFIG.epsilon` is $10^{-10}$; a
contact that should register as touching can fall on either side of it, so a
caller that needs resting contacts applies a small tolerance instead of testing
for zero penetration.

Axes must be normalized before comparing overlap depths. Unnormalized edge
normals scale the overlap by the edge length, and the minimum translation vector
then points along the longest edge instead of the shallowest face.

The vertex order must be consistent (counter-clockwise for a positive area). A
clockwise polygon still projects correctly, but the outward normal flips and the
contact direction points inward.

Caching is keyed by polygon identity. Mutating a polygon in place without
invalidating the cache returns the old axes and the old projection.
