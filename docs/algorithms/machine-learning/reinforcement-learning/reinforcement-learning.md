# Reinforcement Learning

Source: `src/algorithms/machine-learning/reinforcement-learning/`

The environment is a Markov decision process: states $s$, actions $a$, transition
probabilities $P(s' \mid s,a)$, rewards $r$, and a discount $\gamma \in [0,1)$.
The value of a policy is the expected discounted return

$$
V^\pi(s) = \mathbb{E}_\pi\!\left[\sum_{t=0}^{\infty}\gamma^t r_t \,\middle|\, s_0 = s\right].
$$

## Bellman equations

The optimal value satisfies

$$
V^*(s) = \max_a \left[ r(s,a) + \gamma \sum_{s'} P(s' \mid s,a) V^*(s') \right],
$$

and the action-value form is

$$
Q^*(s,a) = r(s,a) + \gamma \sum_{s'} P(s' \mid s,a)\max_{a'} Q^*(s',a').
$$

## Q-learning

Model-free control updates a table entry from each transition:

$$
Q(s,a) \leftarrow Q(s,a) + \alpha\left[r + \gamma \max_{a'}Q(s',a') - Q(s,a)\right].
$$

The bracket is the temporal-difference error. With a decaying learning rate and
enough exploration every pair is visited, and the table converges to $Q^*$ for a
finite MDP.

Exploration uses $\varepsilon$-greedy: with probability $\varepsilon$ pick a
random action, otherwise the argmax. Decaying $\varepsilon$ trades exploration for
exploitation.

## Deep Q-network

`DQN` replaces the table with a network and adds two stabilizers: a replay buffer
that breaks the correlation between consecutive samples, and a target network
whose weights update slowly. The loss is the squared TD error at the sampled
transitions.

## Pitfalls

The discount factor changes the problem. $\gamma = 0$ is myopic, $\gamma \to 1$
makes distant rewards matter and the value estimates noisy.

The reward scale sets the effective learning rate. A reward of $1000$ with
$\alpha = 0.1$ makes one update dominate the table.

Function approximation breaks the convergence guarantee. Q-learning with a
nonlinear approximator can diverge; the replay buffer and target network reduce
the chance, they do not prove it.

Off-policy updates need coverage. A behavior policy that never takes an action
leaves its value at the initial estimate, and the greedy policy then looks better
than it is.
