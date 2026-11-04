# K-Means Clustering

Source: `src/algorithms/machine-learning/clustering/`

K-means partitions $n$ points into $k$ clusters by minimizing the within-cluster
sum of squared distances:

$$
J = \sum_{i=1}^{k} \sum_{x \in C_i} |x - \mu_i|^2 ,
\qquad
\mu_i = \frac{1}{|C_i|}\sum_{x \in C_i} x .
$$

The objective is non-convex, so the algorithm finds a local minimum. It alternates
two exact steps: assign each point to its nearest centroid, then recompute each
centroid as the mean of its assigned points.

## Monotonicity

Both steps cannot increase $J$. Assignment picks the nearest centroid, so it can
only reduce the sum; recomputing the mean is the minimizer of the squared
distance for a fixed assignment. The sequence therefore converges, and it
terminates when no point changes cluster. That is a local optimum, not the global
one.

## Initialization

The clustering depends on the initial centroids. Random initialization can produce
empty clusters and a poor local minimum. K-means++ picks the first centroid
uniformly and each subsequent one with probability proportional to its squared
distance from the nearest chosen centroid, which gives an expected
$O(\log k)$ approximation to the optimum.

## Cost

One iteration is $O(nkd)$ for $d$ dimensions: every point against every centroid.
The number of iterations is usually small, but the worst case is superpolynomial.
The total is $O(nkd \cdot T)$ for $T$ iterations.

## Choosing k

The elbow method plots $J$ against $k$ and looks for the value where the decrease
flattens. The silhouette score compares each point's mean intra-cluster distance
$a$ with its mean distance $b$ to the nearest other cluster:

$$
s = \frac{b - a}{\max(a, b)} \in [-1, 1].
$$

Neither is a proof; both are evidence for a human decision.

## Pitfalls

Features with different scales dominate the distance. Standardize before
clustering, or the cluster structure follows the largest unit.

K-means assumes spherical, similar-sized clusters. Elongated or nested clusters
are split along the wrong axis, and no amount of iterations fixes the model.

Empty clusters are possible when a centroid loses every point. Reinitialize that
centroid at the farthest point, or the objective is computed over fewer than $k$
clusters.

The mean is sensitive to outliers. A single extreme point drags its centroid and
absorbs nearby points; k-medians or trimming is the resistant alternative.
