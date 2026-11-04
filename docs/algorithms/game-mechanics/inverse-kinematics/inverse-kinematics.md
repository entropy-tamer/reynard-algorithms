# Inverse Kinematics

Source: `src/algorithms/game-mechanics/inverse-kinematics/`

Inverse kinematics finds joint angles that place an end effector at a target. A
chain of $n$ segments has a forward map from joint angles to the effector
position, and the inverse is generally not unique: a two-segment arm has two
solutions (elbow up or down), and a redundant arm has infinitely many.

## Cyclic coordinate descent

CCD walks the chain from the tip to the root. At each joint it rotates the
remaining chain so the effector points at the target, which is a single angle:

$$
\Delta\theta_i = \operatorname{atan2}\bigl(v_{\text{target}} \times v_{\text{effector}},
\, v_{\text{target}} \cdot v_{\text{effector}}\bigr).
$$

Each joint update reduces the distance to the target, and a few sweeps converge.
The cost is $O(n)$ per sweep plus the forward evaluation.

## FABRIK

Forward And Backward Reaching IK works on positions instead of angles. A backward
pass moves the tip to the target and drags each joint to its predecessor at the
segment length; a forward pass restores the root. The passes are

$$
p_i' = p_{i+1} + \frac{p_i - p_{i+1}}{|p_i - p_{i+1}|}\,d_i ,
$$

repeated until the tip is within tolerance. It converges quickly and handles
long chains without the angle accumulation that CCD shows.

## Reachability

If the target distance exceeds the sum of segment lengths the chain cannot reach.
The solver points the whole chain at the target and reports the shortfall instead
of looping. If the distance is below $|d_{\max} - d_{\min}|$ the target is inside
the inner workspace and the same clamping applies.

## Two-bone closed form

For an upper arm $a$, forearm $b$ and target distance $c$, the elbow angle comes
from the law of cosines:

$$
\cos\theta = \frac{a^2 + b^2 - c^2}{2ab}.
$$

The sign of $\theta$ selects the elbow side. The closed form is exact, so use it
for two-bone rigs and reserve the iterative solvers for longer chains.

## Pitfalls

Joint limits break the convergence guarantee. A clamp that removes the rotation
CCD asked for leaves the effector farther from the target, and the next sweep
asks for the same rotation again. Apply limits after the solve and report the
residual.

Degenerate segments of zero length make the normalization undefined. Skip them in
the chain instead of dividing by zero.

The target is a point, not an orientation. A solver that also constrains the
effector direction needs a second constraint or a different formulation.
