/**
 * @file inverse-kinematics-core.ts
 * @module algorithms/game-mechanics/inverse-kinematics-core
 * @description Inverse Kinematics (IK) solver implementations.
 *
 * Mathematical Theory:
 * IK solves for joint angles that position an end effector at a target.
 * Two algorithms implemented:
 *
 * 1. CCD (Cyclic Coordinate Descent):
 *    - Iteratively rotates each joint to point end effector toward target
 *    - Works from end effector back to base
 *    - Simple but can have convergence issues
 *
 * 2. FABRIK (Forward And Backward Reaching IK):
 *    - Forward pass: Move joints from base to end effector
 *    - Backward pass: Move joints from end effector to base
 *    - More stable convergence
 */
import type { IKChain, IKConfig, IKResult, IKOptions } from "./inverse-kinematics-types";
/**
 * Inverse Kinematics solver.
 */
export declare class InverseKinematics {
    private config;
    /**
     * Creates a new InverseKinematics instance.
     * @param config Configuration options.
     * @example
     */
    constructor(config?: Partial<IKConfig>);
    /**
     * Solve IK using CCD (Cyclic Coordinate Descent).
     * @param chain IK chain to solve.
     * @param options Solver options.
     * @returns IK result.
     * @example
     */
    solveCCD(chain: IKChain, options?: Partial<IKOptions>): IKResult;
    /**
     * Solve IK using FABRIK (Forward And Backward Reaching IK).
     * @param chain IK chain to solve.
     * @param options Solver options.
     * @returns IK result.
     * @example
     */
    solveFABRIK(chain: IKChain, options?: Partial<IKOptions>): IKResult;
}
//# sourceMappingURL=inverse-kinematics-core.d.ts.map