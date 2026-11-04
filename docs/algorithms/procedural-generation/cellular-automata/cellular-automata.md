# Cellular Automata

Source: `src/algorithms/procedural-generation/cellular-automata/`

A cellular automaton updates a grid of cells from the states of their neighbors.
Cave and terrain generators use the binary form: a cell is wall or floor, and the
rule counts wall neighbors.

## Neighborhoods

The Moore neighborhood is the eight surrounding cells:

$$
N_M(i,j) = \{(i+di, j+dj) : di,dj \in \{-1,0,1\}, (di,dj) \neq (0,0)\},
$$

and the von Neumann neighborhood is the four orthogonal ones. With radius $r$ the
Moore neighborhood has $(2r+1)^2 - 1$ cells, which is the bound on the count.

## Rules

A birth/survival rule is written B3/S23: a dead cell with three live neighbors
becomes alive, and a live cell stays alive with two or three. The generator uses
the same form with configurable thresholds, which is what turns the classic
Game of Life into a cave smoother:

$$
s'(i,j) =
\begin{cases}
1 & s(i,j)=0 \ \wedge\ n(i,j) \in B\\
1 & s(i,j)=1 \ \wedge\ n(i,j) \in S\\
0 & \text{otherwise}
\end{cases}
$$

## Smoothing

A cave generator usually runs a few CA steps after random seeding, then a
connectivity pass. Without the connectivity pass, the CA produces isolated
pockets; the fix is to flood-fill the regions and remove those below a size
threshold.

## Cost

One generation is $O(N)$ for $N$ cells with a fixed-radius neighborhood, because
each cell does a constant amount of work. The double buffer is $O(N)$ memory.
$G$ generations cost $O(GN)$.

## Pitfalls

The buffer must be read from the previous generation and written to the next.
Updating in place makes the output depend on the scan order, which shows up as a
directional smear.

The border needs a policy. Treating the outside as wall closes caves at the edge;
treating it as floor opens them. Either is fine, but the two choices produce very
different maps from the same seed.

A rule tuned for one grid size does not transfer. The same B3/S23 on a 32-cell
grid and a 256-cell grid produces different densities, because the boundary
fraction differs.

The random seed is part of the input. Two runs with different seeds produce
different maps, and a test that pins the output has to pin the seed.
