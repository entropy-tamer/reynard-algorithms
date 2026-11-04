# Behavior Trees

Source: `src/algorithms/machine-learning/behavior-trees/`

A behavior tree is a hierarchy of nodes that returns one of three states:
success, failure or running. The root is ticked each frame, children are ticked
in order, and composite nodes decide how many children to tick and what their
results mean.

## Composites

A selector returns success on the first child that succeeds, and failure when
every child fails. A sequence returns failure on the first child that fails, and
success when every child succeeds. A running child stops the tick at that point,
so the tree remembers where it was without an explicit state machine.

The semantics are

$$
\text{selector} = \bigvee_i s_i, \qquad
\text{sequence} = \bigwedge_i s_i,
$$

with running treated as "not yet decided" instead of as a third truth value.

## Decorators and leaves

A decorator wraps one child and modifies its result: invert, repeat, retry, or
run until failure. Leaves are conditions (read state, return success or failure)
and actions (start work, return running until done).

## Cost

A tick visits at most the nodes on the active path. The worst case is the whole
tree, $O(N)$ for $N$ nodes, and the usual case is much smaller because a running
leaf stops the descent.

## Pitfalls

State lives in the running nodes, not in the tree. Rebuilding the tree between
frames loses the in-progress action, which is why the tree is allocated once and
reset instead of recreated.

A selector that ticks a running child on every frame must not restart it. The
child returns running until it finishes; a parent that calls its start method
again resets the action and the agent loops forever.

Ordering is semantics. A sequence that checks a condition after acting instead of
before produces an action that runs once and then fails every frame.

Parallel nodes need an explicit policy for how many children must succeed and how
failure propagates. Without one, the tick order decides the outcome, which is
fragile under refactoring.
