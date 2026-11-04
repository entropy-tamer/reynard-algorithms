# Decision Trees

Source: `src/algorithms/machine-learning/decision-trees/`

A decision tree splits the feature space by axis-aligned thresholds. Each internal
node tests one feature against one value, each leaf predicts a class or a value,
and a prediction follows one root-to-leaf path.

## Split criteria

For classification, entropy is

$$
H(S) = -\sum_{c} p_c \log_2 p_c ,
$$

and information gain for a split into $S_L, S_R$ is

$$
IG = H(S) - \frac{|S_L|}{|S|}H(S_L) - \frac{|S_R|}{|S|}H(S_R).
$$

Gini impurity is the cheaper alternative:

$$
G(S) = 1 - \sum_c p_c^2 .
$$

For regression, the criterion is the variance reduction, which is the same
formula with mean squared error in place of entropy.

## Building

At each node the algorithm scans features and candidate thresholds, computes the
gain, and keeps the best. With $n$ samples and $d$ features the scan costs
$O(nd)$ per node and $O(nd \log n)$ for a balanced tree; sorting the feature
values once makes the threshold scan linear in $n$.

## Stopping

A tree grown to purity memorizes the training set. `maxDepth`,
`minSamplesSplit`, `minSamplesLeaf` and a minimum gain bound the growth. Pruning
after the fact removes subtrees that do not improve validation accuracy.

## Pitfalls

The split is axis-aligned. A diagonal boundary needs many stair steps, which is
both a deeper tree and a worse fit than a model with oblique splits.

Gain is biased toward features with many distinct values. A unique identifier
splits the training set perfectly and generalizes to nothing; cap the candidate
thresholds or use a corrected criterion.

Missing values need a policy before the split, not after. Sending them down one
branch biases the child distributions; a third branch or an imputation is the
explicit choice.

A deep tree is unstable. A small change in the data can change the root split and
the whole structure, which is why ensembles are the usual next step.
