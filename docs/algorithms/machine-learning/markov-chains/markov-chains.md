# Markov Chains

Source: `src/algorithms/machine-learning/markov-chains/`

A Markov chain is a sequence of states where the next state depends only on the
current one. The model is a transition matrix $P$ with

$$
P_{ij} = \Pr(X_{t+1} = j \mid X_t = i),
\qquad
\sum_j P_{ij} = 1 .
$$

The distribution after $n$ steps from an initial row vector $\pi_0$ is
$\pi_n = \pi_0 P^n$.

## Stationary distribution

A distribution $\pi$ is stationary when

$$
\pi P = \pi, \qquad \sum_i \pi_i = 1 .
$$

For an irreducible, aperiodic chain it is unique and is the limit of $\pi_0 P^n$
from any start. Power iteration computes it by repeatedly multiplying and
renormalizing, which converges geometrically at a rate set by the second
eigenvalue.

## Absorbing states

A state with $P_{ii} = 1$ never leaves. The fundamental matrix
$N = (I - Q)^{-1}$ over the transient states $Q$ gives the expected number of
visits to each transient state before absorption, and the absorption
probabilities are $N R$ for the transition block $R$ into absorbing states.

## Hidden Markov model

An HMM adds an observation distribution per state. The forward pass computes

$$
\alpha_t(j) = b_j(o_t)\sum_i \alpha_{t-1}(i)P_{ij},
$$

the probability of the observations up to $t$ and state $j$ at $t$. The Viterbi
pass replaces the sum with a max to recover the most likely state sequence.

## Pitfalls

Rows must sum to one. A row that sums to $0.99$ slowly loses probability mass,
and the reported distribution drifts below one after enough steps.

A periodic chain has no stationary limit. A chain that alternates between two
states has a stationary distribution but $P^n$ does not converge; the power
iteration oscillates. Damping or laziness (a small self-transition) fixes the
computation but changes the model.

Reducible chains have multiple stationary distributions, one per closed class.
The returned one depends on the initial distribution, which is a property of the
question, not a bug.

The transition matrix is dense by default. A chain with many states needs a sparse
representation and a sparse multiply, or the cost is $O(n^2)$ per step.
