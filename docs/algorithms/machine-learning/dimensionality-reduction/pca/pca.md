# Principal Component Analysis

Source: `src/algorithms/machine-learning/dimensionality-reduction/pca/`

PCA finds orthogonal directions that maximize the variance of a centered data
set. With $X \in \mathbb{R}^{n \times d}$ centered by column means, the covariance
matrix is

$$
C = \frac{1}{n-1} X^\top X .
$$

The principal components are the eigenvectors of $C$, and the variance along
component $i$ is its eigenvalue $\lambda_i$.

## Projection

Sorting the eigenvalues gives $\lambda_1 \ge \lambda_2 \ge \dots \ge 0$. Keeping
the first $k$ eigenvectors as columns of $W$ projects

$$
Z = XW ,
$$

and the fraction of variance retained is

$$
\frac{\sum_{i=1}^{k}\lambda_i}{\sum_{j=1}^{d}\lambda_j}.
$$

The discarded variance is the reconstruction error of the projection.

## Computing it

The covariance matrix is $d \times d$, so the eigendecomposition costs $O(d^3)$.
When $n < d$ it is cheaper to decompose the $n \times n$ Gram matrix $XX^\top$;
the non-zero eigenvalues agree and the eigenvectors map between the two forms.

The implementation exposes matrix helpers for centering, covariance and
eigenvalue decomposition (`eigenvalueDecomposition`), and the PCA class wraps
them with the projection and the explained-variance report.

## Standardization

PCA maximizes variance, so a feature measured in a large unit dominates. Centering
is required; scaling to unit variance first is the usual choice when the features
are not comparable. The two variants answer different questions and produce
different components.

## Pitfalls

The sign of an eigenvector is arbitrary. Two correct implementations can return
$w$ or $-w$, so a test that compares components directly must fix the sign.

Components are orthogonal in the input space, not necessarily interpretable. A
component that loads on several features is a direction, not a named quantity.

PCA is linear. A curved manifold needs Isomap, LLE or an autoencoder; the first
two are in this package.

Outliers dominate the variance and therefore the first component. Inspect the
projection before trusting the explained-variance number.
