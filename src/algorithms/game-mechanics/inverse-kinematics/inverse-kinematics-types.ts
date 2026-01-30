/**
 * @file inverse-kinematics-types.ts
 * @module algorithms/game-mechanics/inverse-kinematics-types
 * @description Type definitions for Inverse Kinematics algorithms.
 */

import type { Point3D } from "../../../core/types";

/**
 * Joint in an IK chain.
 */
export interface Joint {
  /**
   * Position of the joint.
   */
  position: Point3D;
  /**
   * Rotation angle (in radians).
   */
  angle?: number;
  /**
   * Length of the bone from this joint to the next.
   */
  length: number;
  /**
   * Minimum rotation angle constraint.
   */
  minAngle?: number;
  /**
   * Maximum rotation angle constraint.
   */
  maxAngle?: number;
}

/**
 * IK chain configuration.
 */
export interface IKChain {
  /**
   * Base (root) joint position.
   */
  base: Point3D;
  /**
   * Joints in the chain.
   */
  joints: Joint[];
  /**
   * End effector target position.
   */
  target: Point3D;
}

/**
 * Configuration options for IK solvers.
 */
export interface IKConfig {
  /**
   * Maximum number of iterations.
   * @default 20
   */
  maxIterations?: number;
  /**
   * Convergence tolerance.
   * @default 1e-3
   */
  tolerance?: number;
  /**
   * Whether to enforce joint angle constraints.
   * @default true
   */
  enforceConstraints?: boolean;
  /**
   * Damping factor for CCD (prevents oscillation).
   * @default 0.5
   */
  damping?: number;
}

/**
 * IK solver result.
 */
export interface IKResult {
  /**
   * Updated joint positions.
   */
  joints: Joint[];
  /**
   * Final end effector position.
   */
  endEffector: Point3D;
  /**
   * Distance from end effector to target.
   */
  error: number;
  /**
   * Number of iterations performed.
   */
  iterations: number;
  /**
   * Whether the solver converged.
   */
  converged: boolean;
}

/**
 * Options for IK solving.
 */
export interface IKOptions extends Partial<IKConfig> {}

/**
 * Default configuration.
 */
export const DEFAULT_IK_CONFIG: Required<IKConfig> = {
  maxIterations: 20,
  tolerance: 1e-3,
  enforceConstraints: true,
  damping: 0.5,
};
