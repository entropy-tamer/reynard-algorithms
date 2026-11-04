# Multidimensional Scaling

Source: `src/algorithms/machine-learning/dimensionality-reduction/mds/`

MDS embeds points in a low-dimensional space so that pairwise distances match a
given dissimilarity matrix $D$. The stress of an embedding $X$ is

$$
\text{stress}(X) = \sum_{i<j}\bigl(d_{ij} - |x_i - x_j|\bigr)^2 .
$$

Classical MDS solves the metric version exactly. Double-center the squared
distance matrix:

$$
B = -\frac{1}{2} H D^{(2)} H,
\qquad
H = I - \frac{1}{n}\mathbf{1}\mathbf{1}^\top ,
$$

where $H$ is the centering matrix. For Euclidean distances $B$ is positive
semi-definite and equals $XX^\top$. The embedding is then

$$
X = V_k \Lambda_k^{1/2},
$$

taking the $k$ largest eigenvalues $\Lambda_k$ and their eigenvectors $V_k$.

## Metric and non-metric

Classical MDS assumes the dissimilarities are Euclidean distances (or close to
them). Non-metric MDS only preserves the order of the distances and uses an
iterative stress majorization with a monotone regression. The class exposes the
classical path; the iterative refinement is a separate loop around the
eigen-decomposition.

## Cost

Forming $B$ is $O(n^2 d)$ or $O(n^2)$ from a distance matrix, and the
eigendecomposition is $O(n^3)$. The $n \times n$ matrix is the memory bound, so
large $n$ needs landmark MDS: embed a subset, then place the rest by distance.

## Pitfalls

$B$ picks up negative eigenvalues from noise or from non-Euclidean input. Clamp
them to zero before the square root, or the embedding contains NaN.

The embedding is defined up to rotation, reflection and translation. Compare
embeddings by their distance matrix, not by coordinates.

Double centering requires the full matrix. A sparse distance matrix with missing
entries needs the iterative form, not the closed form.

The choice of $k$ is a decision. The eigenvalue spectrum gives the same
explained-variance reading as PCA, and the discarded tail is the stress the
embedding accepts.
