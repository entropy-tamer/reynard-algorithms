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

import type { Point3D, Vector3D } from "../../../core/types";
import type {
  PhysicsBody,
  DistanceConstraint,
  AngleConstraint,
  JointConstraint,
  ConstraintSolverConfig,
  ConstraintSolverResult,
  ConstraintSolverOptions,
} from "./constraint-solvers-types";
import { DEFAULT_CONSTRAINT_SOLVER_CONFIG } from "./constraint-solvers-types";

/**
 * Calculate distance between two 3D points.
 * @param p1
 * @param p2
 * @example
 */
function distance3D(p1: Point3D, p2: Point3D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Normalize a 3D vector.
 * @param v
 * @example
 */
function normalize3D(v: Vector3D): Vector3D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (len < 1e-6) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Calculate angle between three points.
 * @param p1
 * @param p2
 * @param p3
 * @example
 */
function calculateAngle(p1: Point3D, p2: Point3D, p3: Point3D): number {
  const v1: Vector3D = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
  const v2: Vector3D = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };
  const v1Norm = normalize3D(v1);
  const v2Norm = normalize3D(v2);
  const dot = v1Norm.x * v2Norm.x + v1Norm.y * v2Norm.y + v1Norm.z * v2Norm.z;
  return Math.acos(Math.max(-1, Math.min(1, dot)));
}

/**
 * Constraint Solver implementation.
 */
export class ConstraintSolver {
  private config: Required<ConstraintSolverConfig>;

  /**
   * Creates a new ConstraintSolver instance.
   * @param config Configuration options.
   * @example
   */
  constructor(config: Partial<ConstraintSolverConfig> = {}) {
    this.config = { ...DEFAULT_CONSTRAINT_SOLVER_CONFIG, ...config };
  }

  /**
   * Solve distance constraints.
   * @param constraints Distance constraints.
   * @param options Solver options.
   * @returns Solver result.
   * @example
   */
  solveDistanceConstraints(
    constraints: DistanceConstraint[],
    options: Partial<ConstraintSolverOptions> = {}
  ): ConstraintSolverResult {
    const iterations = options.iterations ?? this.config.iterations;
    const relaxation = options.relaxation ?? this.config.relaxation;
    const stiffness = constraints[0]?.stiffness ?? 0.9;

    let totalError = 0;

    for (let iter = 0; iter < iterations; iter++) {
      totalError = 0;

      for (const constraint of constraints) {
        const { bodyA, bodyB, restLength } = constraint;
        const invMassA = bodyA.invMass ?? 1.0 / bodyA.mass;
        const invMassB = bodyB.invMass ?? 1.0 / bodyB.mass;

        // Calculate current distance
        const currentDist = distance3D(bodyA.position, bodyB.position);
        const error = currentDist - restLength;
        totalError += Math.abs(error);

        if (Math.abs(error) < 1e-6) continue;

        // Calculate correction direction
        const direction = normalize3D({
          x: bodyB.position.x - bodyA.position.x,
          y: bodyB.position.y - bodyA.position.y,
          z: bodyB.position.z - bodyA.position.z,
        });

        // Calculate correction magnitude
        const totalInvMass = invMassA + invMassB;
        if (totalInvMass < 1e-6) continue;

        const correction = (error * stiffness * relaxation) / totalInvMass;

        // Apply correction
        bodyA.position.x += direction.x * correction * invMassA;
        bodyA.position.y += direction.y * correction * invMassA;
        bodyA.position.z += direction.z * correction * invMassA;

        bodyB.position.x -= direction.x * correction * invMassB;
        bodyB.position.y -= direction.y * correction * invMassB;
        bodyB.position.z -= direction.z * correction * invMassB;
      }
    }

    const bodies = constraints.reduce((acc, c) => {
      if (!acc.includes(c.bodyA)) acc.push(c.bodyA);
      if (!acc.includes(c.bodyB)) acc.push(c.bodyB);
      return acc;
    }, [] as PhysicsBody[]);

    return {
      bodies,
      error: totalError,
      iterations,
    };
  }

  /**
   * Solve angle constraints.
   * @param constraints Angle constraints.
   * @param options Solver options.
   * @returns Solver result.
   * @example
   */
  solveAngleConstraints(
    constraints: AngleConstraint[],
    options: Partial<ConstraintSolverOptions> = {}
  ): ConstraintSolverResult {
    const iterations = options.iterations ?? this.config.iterations;

    let totalError = 0;

    for (let iter = 0; iter < iterations; iter++) {
      totalError = 0;

      for (const constraint of constraints) {
        const { bodyA, bodyB, bodyC, restAngle } = constraint;
        const currentAngle = calculateAngle(bodyA.position, bodyB.position, bodyC.position);
        const error = currentAngle - restAngle;
        totalError += Math.abs(error);

        // Simplified angle correction (full implementation would use proper rotation)
        // This is a placeholder - real implementation would rotate around bodyB
      }
    }

    const bodies = constraints.reduce((acc, c) => {
      if (!acc.includes(c.bodyA)) acc.push(c.bodyA);
      if (!acc.includes(c.bodyB)) acc.push(c.bodyB);
      if (!acc.includes(c.bodyC)) acc.push(c.bodyC);
      return acc;
    }, [] as PhysicsBody[]);

    return {
      bodies,
      error: totalError,
      iterations,
    };
  }

  /**
   * Solve joint constraints.
   * @param constraints Joint constraints.
   * @param options Solver options.
   * @returns Solver result.
   * @example
   */
  solveJointConstraints(
    constraints: JointConstraint[],
    options: Partial<ConstraintSolverOptions> = {}
  ): ConstraintSolverResult {
    // Joint constraints are essentially distance constraints at anchor points
    const distanceConstraints: DistanceConstraint[] = constraints.map((c) => ({
      bodyA: c.bodyA,
      bodyB: c.bodyB,
      restLength: distance3D(c.anchorA, c.anchorB),
      stiffness: 1.0,
    }));

    return this.solveDistanceConstraints(distanceConstraints, options);
  }
}
