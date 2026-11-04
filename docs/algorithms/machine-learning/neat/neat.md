# NEAT (Neuroevolution of Augmenting Topologies)

Source: `src/algorithms/machine-learning/neat/`

NEAT evolves neural networks by mutating both weights and topology. It protects
innovation with three mechanisms: historical markings on genes, speciation by
compatibility, and fitness sharing within a species.

## Genomes and innovation

Each connection gene carries an innovation number assigned when the connection
first appears. Two genomes align their genes by that number, so crossover can
combine structures without breaking them, and disjoint or excess genes are
counted instead of matched.

## Compatibility distance

The distance between two genomes is

$$
\delta = \frac{c_1 E}{N} + \frac{c_2 D}{N} + c_3 \bar{W},
$$

where $E$ is the number of excess genes, $D$ the number of disjoint genes,
$\bar W$ the mean weight difference of matching genes, and $N$ the larger genome
size (with $N = 1$ for small genomes). Genomes within a threshold belong to the
same species; `compatibilityThreshold` defaults to $3.0$.

## Speciation and reproduction

Each species reproduces in proportion to its shared fitness, which is the raw
fitness divided by the species size. That gives a species with a novel topology
time to improve before it competes with the whole population. Species with no
improvement are removed after a stagnation window.

## Mutation

Weight mutation perturbs or replaces a weight. Structural mutation adds a node by
splitting a connection or adds a connection between two unconnected nodes. New
structures start with small weights, so they do not immediately dominate.

## Cost

One generation costs $O(P \cdot G)$ for $P$ genomes and $G$ genes, dominated by
the network evaluation. Speciation adds $O(S \cdot P)$ for $S$ species, which is
small in practice.

## Pitfalls

Innovation numbers must be global per run. Two independent counters produce the
same number for different structures, and crossover then mismatches genes.

The compatibility coefficients are a tuning surface. A threshold too high merges
everything into one species and loses the protection; too low and every genome is
its own species, which removes the sharing benefit.

Fitness sharing assumes the fitness is comparable across species. A raw score that
scales with the task's magnitude distorts the allocation; normalize first.

Structural innovation is slow. A new node needs several generations to find useful
weights, so the stagnation window must be long enough to give it that time.
