# Type Vocabulary

Source: `src/core/types/`

The package shares one set of geometry and spatial types. They are structural, so
a plain object literal satisfies them; the aliases exist to name the contract in
signatures and to keep the algorithms from inventing a third spelling of `Point`.

## Geometry

`Point` is an immutable pair $(x, y)$; `MutablePoint` is the same shape without
`readonly`, and the algorithms that write in place take the mutable form.
`Vector` has the same fields and the distinction is semantic: a point is a
position, a vector is a displacement, and adding two points is not a defined
operation even though the fields allow it.

`Point3D`, `Vector3D` and `MutablePoint3D` extend the vocabulary to three axes.
`Line` is two points, `Rectangle` is an origin with a width and height, `Circle`
is a center with a radius, and `Polygon` is a closed vertex list.

The area conventions are the ones the algorithms assume:

$$
A_{\text{rect}} = w h, \qquad A_{\text{circle}} = \pi r^2,
$$

and a polygon's signed area is the shoelace sum. A polygon with a negative signed
area is clockwise; the clipping and triangulation code reads that sign as the
orientation.

## Spatial indexes

`AABB` and `AABB3D` are the axis-aligned bounds, `BoundingBox` and
`BoundingBox3D` are the same idea with a different name for callers coming from
other libraries, and `Sphere3D`, `Ray3D`, `Frustum3D` and `Plane3D` are the query
volumes. The `Transform` type composes translation, rotation and scale.

`SpatialObject` carries an id, bounds and a `data` payload typed by
`SpatialDataType`. A spatial index stores the bounds and hands the payload back,
so the caller does not pay for a downcast or a wrapper object.

## Performance types

`PerformanceMemoryInfo` is the subset of `performance.memory` the monitor reads,
and `ExtendedPerformance` adds it to the standard type. `ThrottleOptions` and
`DebounceOptions` are the configuration for the two wrappers. `PooledObject` is
the minimum a pooled value must expose: an `inUse` flag the pool flips.

## Pitfalls

A `Point` is not a `Vector` at the type level only by convention; the compiler
cannot stop `PointOps.add` from accepting two positions. Keep the names honest at
the call site.

The 2D and 3D types do not convert implicitly. A projection from 3D to 2D is a
choice of camera, so it is a function in the caller, not a field copy.

`readonly` is compile-time only. A pool that hands the same object to two callers
can still mutate through the mutable alias, and no compiler check catches it.

`Record<string, unknown>` in the payloads is deliberate: a spatial object can
carry anything; the index never inspects it. Typed payloads belong at the
edge where the caller knows the shape.
