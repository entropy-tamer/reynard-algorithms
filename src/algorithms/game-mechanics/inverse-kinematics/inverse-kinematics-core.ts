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

import type { Point3D, Vector3D } from "../../../core/types";
import type { Joint, IKChain, IKConfig, IKResult, IKOptions } from "./inverse-kinematics-types";
import { DEFAULT_IK_CONFIG } from "./inverse-kinematics-types";

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
 * Calculate vector from p1 to p2.
 * @param p1
 * @param p2
 * @example
 */
function vector3D(p1: Point3D, p2: Point3D): Vector3D {
  return {
    x: p2.x - p1.x,
    y: p2.y - p1.y,
    z: p2.z - p1.z,
  };
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
 * Calculate dot product of two 3D vectors.
 * @param v1
 * @param v2
 * @example
 */
function dot3D(v1: Vector3D, v2: Vector3D): number {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

/**
 * Clamp angle to constraints.
 * @param angle
 * @param minAngle
 * @param maxAngle
 * @example
 */
function clampAngle(angle: number, minAngle?: number, maxAngle?: number): number {
  if (minAngle !== undefined && angle < minAngle) return minAngle;
  if (maxAngle !== undefined && angle > maxAngle) return maxAngle;
  return angle;
}

/**
 * Calculate end effector position from chain.
 * @param base
 * @param joints
 * @example
 */
function calculateEndEffector(base: Point3D, joints: Joint[]): Point3D {
  let current = { ...base };
  for (const joint of joints) {
    // Simplified: assumes joints are connected in sequence
    // In full implementation, would use joint angles and lengths
    current = {
      x: current.x + joint.length,
      y: current.y,
      z: current.z,
    };
  }
  return current;
}

/**
 * Inverse Kinematics solver.
 */
export class InverseKinematics {
  private config: Required<IKConfig>;

  /**
   * Creates a new InverseKinematics instance.
   * @param config Configuration options.
   * @example
   */
  constructor(config: Partial<IKConfig> = {}) {
    this.config = { ...DEFAULT_IK_CONFIG, ...config };
  }

  /**
   * Solve IK using CCD (Cyclic Coordinate Descent).
   * @param chain IK chain to solve.
   * @param options Solver options.
   * @returns IK result.
   * @example
   */
  solveCCD(chain: IKChain, options: Partial<IKOptions> = {}): IKResult {
    const maxIterations = options.maxIterations ?? this.config.maxIterations;
    const tolerance = options.tolerance ?? this.config.tolerance;
    const damping = options.damping ?? this.config.damping;
    const enforceConstraints = options.enforceConstraints ?? this.config.enforceConstraints;

    const joints = chain.joints.map((j) => ({ ...j }));
    let endEffector = calculateEndEffector(chain.base, joints);
    let iterations = 0;

    for (iterations = 0; iterations < maxIterations; iterations++) {
      const error = distance3D(endEffector, chain.target);
      if (error < tolerance) {
        break;
      }

      // Iterate from end effector back to base
      for (let i = joints.length - 1; i >= 0; i--) {
        const joint = joints[i];
        if (!joint) continue;

        const jointPos = i === 0 ? chain.base : joints[i - 1]?.position ?? chain.base;

        // Vector from joint to end effector
        const toEnd = vector3D(jointPos, endEffector);
        // Vector from joint to target
        const toTarget = vector3D(jointPos, chain.target);

        const toEndNorm = normalize3D(toEnd);
        const toTargetNorm = normalize3D(toTarget);

        // Calculate rotation angle
        const dot = dot3D(toEndNorm, toTargetNorm);
        const clampedDot = Math.max(-1, Math.min(1, dot)); // Clamp for acos
        let angle = Math.acos(clampedDot) * damping;

        if (enforceConstraints && (joint.minAngle !== undefined || joint.maxAngle !== undefined)) {
          angle = clampAngle(angle, joint.minAngle, joint.maxAngle);
        }

        // Apply rotation (simplified - would need proper rotation matrix)
        // For now, update joint angle
        joint.angle = (joint.angle ?? 0) + angle;

        // Recalculate end effector
        endEffector = calculateEndEffector(chain.base, joints);
      }
    }

    const finalError = distance3D(endEffector, chain.target);

    return {
      joints,
      endEffector,
      error: finalError,
      iterations,
      converged: finalError < tolerance,
    };
  }

  /**
   * Solve IK using FABRIK (Forward And Backward Reaching IK).
   * @param chain IK chain to solve.
   * @param options Solver options.
   * @returns IK result.
   * @example
   */
  solveFABRIK(chain: IKChain, options: Partial<IKOptions> = {}): IKResult {
    const maxIterations = options.maxIterations ?? this.config.maxIterations;
    const tolerance = options.tolerance ?? this.config.tolerance;

    // Calculate total chain length
    let totalLength = 0;
    for (const joint of chain.joints) {
      totalLength += joint.length;
    }

    // Check if target is reachable
    const baseToTarget = distance3D(chain.base, chain.target);
    if (baseToTarget > totalLength) {
      // Target is unreachable - extend chain
      const direction = normalize3D(vector3D(chain.base, chain.target));
      const adjustedTarget: Point3D = {
        x: chain.base.x + direction.x * totalLength,
        y: chain.base.y + direction.y * totalLength,
        z: chain.base.z + direction.z * totalLength,
      };
      return this.solveFABRIK({ ...chain, target: adjustedTarget }, options);
    }

    // Initialize joint positions
    const positions: Point3D[] = [chain.base];
    let current = chain.base;
    for (const joint of chain.joints) {
      current = {
        x: current.x + joint.length,
        y: current.y,
        z: current.z,
      };
      positions.push(current);
    }

    let iterations = 0;
    for (iterations = 0; iterations < maxIterations; iterations++) {
      const endEffector = positions[positions.length - 1];
      if (!endEffector) break;
      const error = distance3D(endEffector, chain.target);
      if (error < tolerance) {
        break;
      }

      // Backward pass: from end effector to base
      positions[positions.length - 1] = { ...chain.target };
      for (let i = positions.length - 2; i >= 0; i--) {
        const posI = positions[i];
        const posI1 = positions[i + 1];
        const joint = chain.joints[i];
        if (!posI || !posI1 || !joint) continue;

        const direction = normalize3D(vector3D(posI, posI1));
        const length = joint.length;
        positions[i] = {
          x: posI1.x - direction.x * length,
          y: posI1.y - direction.y * length,
          z: posI1.z - direction.z * length,
        };
      }

      // Forward pass: from base to end effector
      positions[0] = { ...chain.base };
      for (let i = 0; i < positions.length - 1; i++) {
        const posI = positions[i];
        const posI1 = positions[i + 1];
        const joint = chain.joints[i];
        if (!posI || !posI1 || !joint) continue;

        const direction = normalize3D(vector3D(posI, posI1));
        const length = joint.length;
        positions[i + 1] = {
          x: posI.x + direction.x * length,
          y: posI.y + direction.y * length,
          z: posI.z + direction.z * length,
        };
      }
    }

    const endEffector = positions[positions.length - 1];
    if (!endEffector) {
      // Fallback: use calculated end effector
      const fallbackEndEffector = calculateEndEffector(chain.base, chain.joints);
      return {
        joints: chain.joints,
        endEffector: fallbackEndEffector,
        error: distance3D(fallbackEndEffector, chain.target),
        iterations,
        converged: false,
      };
    }

    const finalError = distance3D(endEffector, chain.target);

    // Update joint positions
    const updatedJoints = chain.joints.map((joint, i) => {
      const position = positions[i + 1];
      if (!position) {
        return joint;
      }
      return {
        ...joint,
        position,
      };
    });

    return {
      joints: updatedJoints,
      endEffector,
      error: finalError,
      iterations,
      converged: finalError < tolerance,
    };
  }
}
