/**
 * @file steering-behaviors.test.ts
 * @description Tests for Steering Behaviors algorithm.
 */

import { describe, it, expect } from "vitest";
import { SteeringBehaviors } from "../../algorithms/game-mechanics/steering-behaviors/steering-behaviors-core";
import type { Agent } from "../../algorithms/game-mechanics/steering-behaviors/steering-behaviors-types";

describe("SteeringBehaviors", () => {
  const createAgent = (): Agent => ({
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    maxSpeed: 5,
    maxForce: 0.5,
  });

  describe("Seek behavior", () => {
    it("should generate seek steering force", () => {
      const steering = new SteeringBehaviors();
      const agent = createAgent();
      const target = { x: 10, y: 10 };

      const result = steering.seek(agent, { target });

      expect(result.force.x).toBeDefined();
      expect(result.force.y).toBeDefined();
      expect(result.behavior).toBe("seek");
    });
  });

  describe("Flee behavior", () => {
    it("should generate flee steering force", () => {
      const steering = new SteeringBehaviors();
      const agent = createAgent();
      const threat = { x: 5, y: 5 };

      const result = steering.flee(agent, { threat, fleeDistance: 10 });

      expect(result.force.x).toBeDefined();
      expect(result.force.y).toBeDefined();
      expect(result.behavior).toBe("flee");
    });
  });

  describe("Flocking behavior", () => {
    it("should generate flocking steering force", () => {
      const steering = new SteeringBehaviors();
      const agent = createAgent();
      const neighbors: Agent[] = [
        { position: { x: 2, y: 2 }, velocity: { x: 1, y: 1 }, maxSpeed: 5, maxForce: 0.5 },
        { position: { x: -2, y: -2 }, velocity: { x: -1, y: -1 }, maxSpeed: 5, maxForce: 0.5 },
      ];

      const result = steering.flocking(agent, { agents: neighbors });

      expect(result.force.x).toBeDefined();
      expect(result.force.y).toBeDefined();
      expect(result.behavior).toBe("flocking");
    });
  });
});


