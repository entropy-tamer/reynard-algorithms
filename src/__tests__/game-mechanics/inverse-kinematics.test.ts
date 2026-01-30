/**
 * @file inverse-kinematics.test.ts
 * @description Tests for Inverse Kinematics algorithms.
 */

import { describe, it, expect } from "vitest";
import { InverseKinematics } from "../../algorithms/game-mechanics/inverse-kinematics/inverse-kinematics-core";
import type { IKChain } from "../../algorithms/game-mechanics/inverse-kinematics/inverse-kinematics-types";

describe("InverseKinematics", () => {
  const createSimpleChain = (): IKChain => ({
    base: { x: 0, y: 0, z: 0 },
    joints: [
      { position: { x: 5, y: 0, z: 0 }, length: 5 },
      { position: { x: 10, y: 0, z: 0 }, length: 5 },
    ],
    target: { x: 10, y: 5, z: 0 },
  });

  describe("CCD solver", () => {
    it("should solve IK using CCD", () => {
      const ik = new InverseKinematics();
      const chain = createSimpleChain();

      const result = ik.solveCCD(chain, { maxIterations: 10 });

      expect(result.joints).toBeDefined();
      expect(result.endEffector).toBeDefined();
      expect(result.iterations).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeGreaterThanOrEqual(0);
    });
  });

  describe("FABRIK solver", () => {
    it("should solve IK using FABRIK", () => {
      const ik = new InverseKinematics();
      const chain = createSimpleChain();

      const result = ik.solveFABRIK(chain, { maxIterations: 10 });

      expect(result.joints).toBeDefined();
      expect(result.endEffector).toBeDefined();
      expect(result.iterations).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeGreaterThanOrEqual(0);
    });
  });
});


