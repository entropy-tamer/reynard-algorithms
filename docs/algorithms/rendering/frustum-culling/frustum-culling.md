# Frustum Culling

Source: `src/algorithms/rendering/frustum-culling/`

The view frustum is the intersection of six half-spaces: near, far, left, right,
top and bottom. An object outside any one of them cannot be visible and is
skipped before it reaches the pipeline.

## Plane representation

Each plane is stored as $(a, b, c, d)$ with the normal $(a,b,c)$ pointing inward,
so a point $p$ is inside when

$$
a p_x + b p_y + c p_z + d \ge 0 .
$$

The six planes come from the combined view-projection matrix: adding and
subtracting rows gives the left/right, bottom/top and near/far planes.

## Sphere test

For a sphere with center $c$ and radius $r$ the signed distance to a plane is
$n \cdot c + d$. The sphere is outside when

$$
n \cdot c + d < -r ,
$$

inside when the distance exceeds $r$, and intersecting otherwise. Testing six
planes costs six dot products and no square roots.

## Box test

For an AABB the farthest point along a plane normal is the positive vertex:

$$
p = (n_x > 0 ? \max_x : \min_x,\ \dots).
$$

If the positive vertex is outside a plane, the whole box is outside. The test is
conservative, so a box that straddles a plane is kept.

## Cost

Six plane tests per object, $O(1)$ each. A scene of $n$ objects costs $O(n)$
before any draw call, which is why the test is worth doing above a few hundred
objects. A hierarchy (octree or BVH) turns it into $O(\log n)$ for whole subtrees.

## Pitfalls

The plane normals must point inward. A sign flip makes the test cull exactly the
visible half of the scene, which looks like a broken camera instead of a culling
bug.

The near plane is the one that catches objects behind the camera. A test that
covers the five lateral/far planes only leaves geometry behind the eye in the
pipeline.

The view-projection matrix is row-major or column-major depending on the source.
Extracting planes from the wrong convention produces planes that are not the
frustum's.

Culling is conservative at the edges. A box that intersects a plane is kept even
when it is visually outside, which is correct; tightening the test requires a
different volume.
