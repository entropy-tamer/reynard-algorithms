# Spatial Hash

Source: `src/data-structures/spatial/spatial-hash/`

A spatial hash maps world coordinates to integer cells and stores the objects
that overlap each cell in a bucket. It is the simplest broad phase: no tree, no
sort, and a lookup that is constant expected time when the cell size matches the
object size.

## Cell size

For $n$ objects of radius $r$ spread over a world of area $A$, the average
occupancy of a cell of side $s$ is

$$
\lambda = \frac{n\,\pi r^2}{A} \cdot \frac{A}{s^2} = \frac{n \pi r^2}{s^2} .
$$

A cell side near $2r$ keeps $\lambda$ small and the number of cells an object
touches at four. Much smaller cells increase the bookkeeping per object; much
larger cells increase the number of candidate pairs. `calculateOptimalCellSize`
computes a starting value from the object count and bounds.

## Coordinates

The cell index is a floor, not a truncation:

$$
c_x = \left\lfloor \frac{x - \text{min}_x}{s} \right\rfloor ,
$$

so negative coordinates stay on the correct side of the origin. Truncation
collapses $-0.9$ and $0.9$ into the same cell and produces phantom pairs near
zero.

## Cost

| Operation | Expected time |
| --- | --- |
| insert | $O(1)$ |
| remove | $O(1)$ |
| query cell | $O(1)$ |
| range query | $O(c + k)$ for $c$ cells and $k$ candidates |
| pair enumeration | $O(n + P)$ for $P$ candidate pairs |

## Pitfalls

An object that spans several cells is stored in each of them, so it can be
reported more than once. The caller has to deduplicate by identity, and the
pair enumeration handles that with a visited set.

Hash collisions merge unrelated buckets. That is safe for correctness because
the candidate test still runs, but it silently raises the pair count; the stats
expose both bucket loads and collision counts.

Cell size is a tuning parameter, not a constant. A workload with mixed object
sizes needs either a hierarchical hash or a size chosen for the largest object.
