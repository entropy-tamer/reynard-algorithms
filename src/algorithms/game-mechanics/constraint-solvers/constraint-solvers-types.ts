/**
 * @file constraint-solvers-types.ts
 * @module algorithms/game-mechanics/constraint-solvers-types
 * @description Type definitions for Physics Constraint Solvers.
 */

import type { Point3D, MutablePoint3D, MutableVector3D } from "../../../core/types";

/**
 * Physics body with position, velocity, and mass.
 */
export interface PhysicsBody {
  /**
   * Position (mutable).
   */
  position: MutablePoint3D;
  /**
   * Velocity (mutable).
   */
  velocity: MutableVector3D;
  /**
   * Mass.
   */
  mass: number;
  /**
   * Inverse mass (1/mass, for optimization).
   */
  invMass?: number;
}

/**
 * Distance constraint between two bodies.
 */
export interface DistanceConstraint {
  /**
   * First body.
   */
  bodyA: PhysicsBody;
  /**
   * Second body.
   */
  bodyB: PhysicsBody;
  /**
   * Rest length of the constraint.
   */
  restLength: number;
  /**
   * Stiffness (0-1, higher = stiffer).
   * @default 0.9
   */
  stiffness?: number;
}

/**
 * Angle constraint between three bodies.
 */
export interface AngleConstraint {
  /**
   * First body.
   */
  bodyA: PhysicsBody;
  /**
   * Middle body (vertex).
   */
  bodyB: PhysicsBody;
  /**
   * Third body.
   */
  bodyC: PhysicsBody;
  /**
   * Rest angle (in radians).
   */
  restAngle: number;
  /**
   * Stiffness (0-1).
   * @default 0.9
   */
  stiffness?: number;
}

/**
 * Joint constraint (ball-and-socket).
 */
export interface JointConstraint {
  /**
   * First body.
   */
  bodyA: PhysicsBody;
  /**
   * Second body.
   */
  bodyB: PhysicsBody;
  /**
   * Anchor point on body A (local space).
   */
  anchorA: Point3D;
  /**
   * Anchor point on body B (local space).
   */
  anchorB: Point3D;
}

/**
 * Configuration for constraint solver.
 */
export interface ConstraintSolverConfig {
  /**
   * Number of solver iterations.
   * @default 10
   */
  iterations?: number;
  /**
   * Relaxation factor.
   * @default 0.2
   */
  relaxation?: number;
  /**
   * Whether to use sequential impulse method.
   * @default true
   */
  useSequentialImpulse?: boolean;
}

/**
 * Solver result.
 */
export interface ConstraintSolverResult {
  /**
   * Updated body positions.
   */
  bodies: PhysicsBody[];
  /**
   * Total constraint error.
   */
  error: number;
  /**
   * Number of iterations performed.
   */
  iterations: number;
}

/**
 * Options for constraint solving.
 */
export interface ConstraintSolverOptions extends Partial<ConstraintSolverConfig> {}

/**
 * Default configuration.
 */
export const DEFAULT_CONSTRAINT_SOLVER_CONFIG: Required<ConstraintSolverConfig> = {
  iterations: 10,
  relaxation: 0.2,
  useSequentialImpulse: true,
};

