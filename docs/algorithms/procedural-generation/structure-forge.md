# StructureForge

Source: `src/algorithms/procedural-generation/structure-forge/`

StructureForge generates man-made structures as a stack of 2D layers. Each layer is
a wave function collapse over a tile set, and the layers are offset and transformed
so the stack reads as a building, tower, maze, dungeon, fortress or temple.

## Why layers

A full 3D WFC tracks constraints over a voxel neighborhood. With $T$ tiles and a
26-cell neighborhood the constraint table is $T^2 \cdot 26$ entries, and the search
explores combinations across the whole volume. StructureForge collapses each
$W \times H$ layer independently, then stacks $D$ layers with an offset. The
constraint table stays $T^2 \cdot 4$ and the search space stays per-layer, so the
work is

$$
O(D \cdot W \cdot H \cdot T)
$$

for the propagation pass, which is linear in the volume.

## Layer collapse

A layer is a grid of cells with a set of allowed tiles and weights $w_i$. The
entropy of a cell is

$$
H = -\sum_i p_i \ln p_i, \qquad p_i = \frac{w_i}{\sum_j w_j},
$$

and the generator collapses the lowest-entropy cell first. Adjacency constraints
then propagate to the neighbors, removing tiles until either the layer is
complete or a cell has no tile left.

The `backtrackLimit` and `maxIterations` options bound the repair work. A
contradiction is normal for a tight pattern set; the run either backtracks or
restarts the layer with a different random order.

## Stacking and structure types

Layers are stacked with a per-layer offset controlled by the seed and the
symmetry parameter. `symmetry` in $[0,1]$ interpolates between an irregular stack
and a mirrored one: at $1$ the layer is reflected about its center line, which is
what the temple type wants. `complexity` in $[0,1]$ scales the number of open
cells, so it acts on the density of rooms and corridors.

The structure type selects the post-transform:

| Type | Transform |
| --- | --- |
| building | rectangular stack, room and corridor patterns |
| tower | circular mask with a taper over depth |
| maze | corridor-dominant pattern with a single connected component |
| dungeon | enclosed layers with sparse connections |
| fortress | building layers with a thicker outer wall |
| temple | mirrored layers with a symmetric feature axis |

## Features

Doors, windows, stairs, ladders and bridges are placed after the layers are
collapsed. A door needs a wall on both sides and open cells on both faces; a
stair needs a matching opening in the layer above. `enableBridges` and
`enableSkylights` allow connections between adjacent structures and vertical
openings through several layers.

## Cost

| Quantity | Bound |
| --- | --- |
| generation | $O(D \cdot W \cdot H \cdot T)$ per collapse pass |
| memory | $O(W \cdot H \cdot D)$ cells |
| pattern storage | $O(T \cdot k)$ for pattern size $k$ |

Memory follows the output instead of the search: the generator keeps one layer
of tile sets at a time and writes each collapsed layer into the output buffer.

## Pitfalls

A material palette that omits `void` fills every cell with a solid material and
the structure has no interior. Keep `void` in the palette for the air cells.

`width` and `height` are the footprint; `depth` is the number of layers. A tower
created with `createTowerConfig(radius, height)` uses the radius for both
footprint axes, so a large radius with a small depth produces a slab.

Symmetry at $1$ with an odd width has a center column that is its own mirror. The
pattern must allow that column, or the mirror produces a contradiction at the axis.

The seed determines the layer offsets and the collapse order. Two runs with
different seeds produce different structures from the same configuration, and a
test that pins the output has to pin the seed.
