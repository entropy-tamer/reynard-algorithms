/**
 * @file constraint-solvers-core.ts
 * @module algorithms/game-mechanics/constraint-solvers-core
 * @description Physics Constraint Solver implementation.
 *
 * Mathematical Theory:
 * Constraint solvers maintain relationships between physics bodies.
 * Uses sequential impulse method to iteratively satisfy constraints.
 *
 * For distance constraint between bodies A and B:
 * C = |pA - pB| - restLength = 0
 *
 * Impulse: J = -λ * ∇C
 * where λ is the Lagrange multiplier
 */
import type { DistanceConstraint, AngleConstraint, JointConstraint, ConstraintSolverConfig, ConstraintSolverResult, ConstraintSolverOptions } from "./constraint-solvers-types";
/**
 * Constraint Solver implementation.
 */
export declare class ConstraintSolver {
    private config;
    /**
     * Creates a new ConstraintSolver instance.
     * @param config Configuration options.
     * @example
     */
    constructor(config?: Partial<ConstraintSolverConfig>);
    /**
     * Solve distance constraints.
     * @param constraints Distance constraints.
     * @param options Solver options.
     * @returns Solver result.
     * @example
     */
    solveDistanceConstraints(constraints: DistanceConstraint[], options?: Partial<ConstraintSolverOptions>): ConstraintSolverResult;
    /**
     * Solve angle constraints.
     * @param constraints Angle constraints.
     * @param options Solver options.
     * @returns Solver result.
     * @example
     */
    solveAngleConstraints(constraints: AngleConstraint[], options?: Partial<ConstraintSolverOptions>): ConstraintSolverResult;
    /**
     * Solve joint constraints.
     * @param constraints Joint constraints.
     * @param options Solver options.
     * @returns Solver result.
     * @example
     */
    solveJointConstraints(constraints: JointConstraint[], options?: Partial<ConstraintSolverOptions>): ConstraintSolverResult;
}
//# sourceMappingURL=constraint-solvers-core.d.ts.map