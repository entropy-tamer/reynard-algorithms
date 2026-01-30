/**
 * @file constraint-solvers.test.ts
 * @description Tests for Constraint Solvers algorithm.
 */

import { describe, it, expect } from "vitest";
import { ConstraintSolver } from "../../algorithms/game-mechanics/constraint-solvers/constraint-solvers-core";
import type {
  PhysicsBody,
  DistanceConstraint,
} from "../../algorithms/game-mechanics/constraint-solvers/constraint-solvers-types";

describe("ConstraintSolver", () => {
  const createBody = (x: number, y: number, z: number, mass: number = 1): PhysicsBody => ({
    position: { x, y, z },
    velocity: { x: 0, y: 0, z: 0 },
    mass,
    invMass: 1 / mass,
  });

  describe("Distance constraints", () => {
    it("should solve distance constraints", () => {
      const solver = new ConstraintSolver();
      const bodyA = createBody(0, 0, 0);
      const bodyB = createBody(10, 0, 0);

      const constraints: DistanceConstraint[] = [
        {
          bodyA,
          bodyB,
          restLength: 5,
          stiffness: 0.9,
        },
      ];

      const result = solver.solveDistanceConstraints(constraints, { iterations: 10 });

      expect(result.bodies).toContain(bodyA);
      expect(result.bodies).toContain(bodyB);
      expect(result.error).toBeGreaterThanOrEqual(0);
      expect(result.iterations).toBe(10);
    });

    it("should maintain distance constraint", () => {
      const solver = new ConstraintSolver();
      const bodyA = createBody(0, 0, 0);
      const bodyB = createBody(5, 0, 0);

      const constraints: DistanceConstraint[] = [
        {
          bodyA,
          bodyB,
          restLength: 5,
          stiffness: 1.0,
        },
      ];

      solver.solveDistanceConstraints(constraints, { iterations: 20 });

      // Distance should be approximately maintained
      const dx = bodyB.position.x - bodyA.position.x;
      const dy = bodyB.position.y - bodyA.position.y;
      const dz = bodyB.position.z - bodyA.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      expect(distance).toBeCloseTo(5, 1);
    });
  });
});


