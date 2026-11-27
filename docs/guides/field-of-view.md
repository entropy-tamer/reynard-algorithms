# Grid line of sight and fog of war

`field-of-view` answers two questions on a small rectangular grid: can two cells
see each other, and what has an observer seen over a sequence of frames? It was
added for the fox-and-chicken chase, where cell-shaped text is the terrain and a
sprite may not stand on an opaque cell.

## Model

A `VisionGrid` supplies `width`, `height` and `isOpaque(x, y)`. Space outside the
grid is opaque, so rays stop at the boundary. `hasLineOfSight` walks a Bresenham
line from one cell to the other. Every intermediate cell must be transparent. A
diagonal step exposes both corners it passes between; two opaque corners close
the gap, so an observer cannot peek through a blocked diagonal. The target cell
itself may be opaque: a wall is visible, while the ground behind it is not.

`computeFov(grid, origin, radius, explored?)` applies that line test to each
cell inside a circular radius and returns a `FieldOfView` with `visible` and
`explored` byte arrays, plus `isVisible` and `isExplored` lookups. The `explored`
array is copied, never mutated, so a caller can keep memory across frames and a
redraw cannot rewrite history.

## Cost and bounds

The scan is bounded by the radius, not by the whole board. For a chase field of
tens of cells across with a radius of eight, that is roughly two hundred line
queries per frame. A full shadowcast would do more bookkeeping than this field
needs and would hide its rules in a larger implementation.

The line walk is `O(max(dx, dy))` per candidate and `computeFov` is
`O(radius² · radius)` in the worst case. It allocates two byte arrays of
`width * height` per call; callers that repaint often should keep `explored` in
agent state and treat a snapshot's arrays as read-only copies.

## Failure modes

- A radius that covers the whole card lights everything and makes fog decoration
  rather than information. Keep it small enough that the unexplored region is
  legible.
- A diagonal corner rule that is missing lets a sprite see through two solid
  cells. The tests pin that case explicitly.
- Reusing an `explored` array from a field of a different width mis-indexes
  memory. A field resize must reset the arrays.
- Treating the target cell as a blocker hides walls. The wall itself is a valid
  sighting; ground beyond it is not.

## Tests

`src/__tests__/field-of-view.test.ts` pins open neighbours, board edges, a wall
that stops a ray, the closed diagonal corner, persistent memory, non-mutation of
the input array and a wall that stays visible while its shadow does not.
