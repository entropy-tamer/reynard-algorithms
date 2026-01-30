/**
 * @file Tests for circular positioning and radial math algorithms
 */
import { describe, expect, it } from "vitest";
import {
  calculateCircularPosition,
  calculateCircularPositionFull,
  calculateRadialPositions,
  degreesToRadians,
  radiansToDegrees,
  normalizeAngle,
  calculateArcLength,
  calculateSectorArea,
} from "../algorithms/computational-geometry/circular/circular-core";

describe("Circular Positioning Algorithms", () => {
  describe("degreesToRadians", () => {
    it("should convert 0 degrees to 0 radians", () => {
      expect(degreesToRadians(0)).toBe(0);
    });

    it("should convert 90 degrees to π/2 radians", () => {
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2, 10);
    });

    it("should convert 180 degrees to π radians", () => {
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 10);
    });

    it("should convert 360 degrees to 2π radians", () => {
      expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI, 10);
    });

    it("should convert negative degrees correctly", () => {
      expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2, 10);
    });

    it("should convert large angles correctly", () => {
      expect(degreesToRadians(720)).toBeCloseTo(4 * Math.PI, 10);
    });
  });

  describe("radiansToDegrees", () => {
    it("should convert 0 radians to 0 degrees", () => {
      expect(radiansToDegrees(0)).toBe(0);
    });

    it("should convert π/2 radians to 90 degrees", () => {
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90, 10);
    });

    it("should convert π radians to 180 degrees", () => {
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180, 10);
    });

    it("should convert 2π radians to 360 degrees", () => {
      expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360, 10);
    });

    it("should convert negative radians correctly", () => {
      expect(radiansToDegrees(-Math.PI / 2)).toBeCloseTo(-90, 10);
    });

    it("should be inverse of degreesToRadians", () => {
      const degrees = 45;
      const radians = degreesToRadians(degrees);
      expect(radiansToDegrees(radians)).toBeCloseTo(degrees, 10);
    });
  });

  describe("normalizeAngle", () => {
    describe("radians (default)", () => {
      it("should normalize 0 to 0", () => {
        expect(normalizeAngle(0)).toBe(0);
      });

      it("should normalize 2π to 0", () => {
        expect(normalizeAngle(2 * Math.PI)).toBeCloseTo(0, 10);
      });

      it("should normalize 3π to π", () => {
        expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI, 10);
      });

      it("should normalize negative angles", () => {
        expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 10);
      });

      it("should normalize large positive angles", () => {
        expect(normalizeAngle(5 * Math.PI)).toBeCloseTo(Math.PI, 10);
      });

      it("should normalize large negative angles", () => {
        expect(normalizeAngle(-3 * Math.PI)).toBeCloseTo(Math.PI, 10);
      });
    });

    describe("degrees", () => {
      it("should normalize 0 to 0", () => {
        expect(normalizeAngle(0, "degrees")).toBe(0);
      });

      it("should normalize 360 to 0", () => {
        expect(normalizeAngle(360, "degrees")).toBe(0);
      });

      it("should normalize 450 to 90", () => {
        expect(normalizeAngle(450, "degrees")).toBe(90);
      });

      it("should normalize negative angles", () => {
        expect(normalizeAngle(-90, "degrees")).toBe(270);
      });

      it("should normalize large positive angles", () => {
        expect(normalizeAngle(720, "degrees")).toBe(0);
      });

      it("should normalize large negative angles", () => {
        expect(normalizeAngle(-450, "degrees")).toBe(270);
      });
    });
  });

  describe("calculateCircularPosition", () => {
    it("should calculate position at origin with zero angle", () => {
      const result = calculateCircularPosition(0, 0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("should calculate position at 0 degrees (right)", () => {
      const result = calculateCircularPosition(0, 10);
      expect(result.x).toBeCloseTo(10, 10);
      expect(result.y).toBeCloseTo(0, 10);
    });

    it("should calculate position at 90 degrees (up)", () => {
      const result = calculateCircularPosition(Math.PI / 2, 10);
      expect(result.x).toBeCloseTo(0, 10);
      expect(result.y).toBeCloseTo(10, 10);
    });

    it("should calculate position at 180 degrees (left)", () => {
      const result = calculateCircularPosition(Math.PI, 10);
      expect(result.x).toBeCloseTo(-10, 10);
      expect(result.y).toBeCloseTo(0, 10);
    });

    it("should calculate position at 270 degrees (down)", () => {
      const result = calculateCircularPosition((3 * Math.PI) / 2, 10);
      expect(result.x).toBeCloseTo(0, 10);
      expect(result.y).toBeCloseTo(-10, 10);
    });

    it("should calculate position with custom center", () => {
      const result = calculateCircularPosition(0, 5, { x: 10, y: 20 });
      expect(result.x).toBeCloseTo(15, 10);
      expect(result.y).toBeCloseTo(20, 10);
    });

    it("should calculate position at 45 degrees", () => {
      const result = calculateCircularPosition(Math.PI / 4, 10);
      const expected = 10 / Math.sqrt(2);
      expect(result.x).toBeCloseTo(expected, 10);
      expect(result.y).toBeCloseTo(expected, 10);
    });

    it("should handle negative radius", () => {
      const result = calculateCircularPosition(0, -10);
      expect(result.x).toBeCloseTo(-10, 10);
      expect(result.y).toBeCloseTo(0, 10);
    });

    it("should maintain distance from center", () => {
      const radius = 15;
      const angle = Math.PI / 3;
      const result = calculateCircularPosition(angle, radius);
      const distance = Math.sqrt(result.x * result.x + result.y * result.y);
      expect(distance).toBeCloseTo(radius, 10);
    });
  });

  describe("calculateCircularPositionFull", () => {
    it("should return position with angle and radius", () => {
      const options = { angle: Math.PI / 4, radius: 10 };
      const result = calculateCircularPositionFull(options);

      expect(result).toHaveProperty("x");
      expect(result).toHaveProperty("y");
      expect(result.angle).toBe(Math.PI / 4);
      expect(result.radius).toBe(10);
    });

    it("should use default center when not provided", () => {
      const options = { angle: 0, radius: 5 };
      const result = calculateCircularPositionFull(options);
      const expected = calculateCircularPosition(0, 5);

      expect(result.x).toBeCloseTo(expected.x, 10);
      expect(result.y).toBeCloseTo(expected.y, 10);
    });

    it("should use custom center when provided", () => {
      const options = { angle: Math.PI / 2, radius: 10, center: { x: 5, y: 5 } };
      const result = calculateCircularPositionFull(options);

      expect(result.x).toBeCloseTo(5, 10);
      expect(result.y).toBeCloseTo(15, 10);
      expect(result.angle).toBe(Math.PI / 2);
      expect(result.radius).toBe(10);
    });
  });

  describe("calculateRadialPositions", () => {
    it("should generate correct number of positions", () => {
      const positions = calculateRadialPositions({ count: 12, radius: 10 });
      expect(positions.length).toBe(12);
    });

    it("should generate evenly spaced positions", () => {
      const positions = calculateRadialPositions({ count: 4, radius: 10 });
      expect(positions.length).toBe(4);

      // Check that positions are at 0°, 90°, 180°, 270°
      expect(positions[0].x).toBeCloseTo(10, 10);
      expect(positions[0].y).toBeCloseTo(0, 10);

      expect(positions[1].x).toBeCloseTo(0, 10);
      expect(positions[1].y).toBeCloseTo(10, 10);

      expect(positions[2].x).toBeCloseTo(-10, 10);
      expect(positions[2].y).toBeCloseTo(0, 10);

      expect(positions[3].x).toBeCloseTo(0, 10);
      expect(positions[3].y).toBeCloseTo(-10, 10);
    });

    it("should use custom start angle", () => {
      const positions = calculateRadialPositions({
        count: 4,
        radius: 10,
        startAngle: Math.PI / 2, // Start at 90 degrees
      });

      // First position should be at 90 degrees (up)
      expect(positions[0].x).toBeCloseTo(0, 10);
      expect(positions[0].y).toBeCloseTo(10, 10);
    });

    it("should use custom angle step", () => {
      const positions = calculateRadialPositions({
        count: 3,
        radius: 10,
        startAngle: 0,
        angleStep: Math.PI / 3, // 60 degrees
      });

      expect(positions.length).toBe(3);
      // First at 0°, second at 60°, third at 120°
      expect(positions[0].x).toBeCloseTo(10, 10);
      expect(positions[0].y).toBeCloseTo(0, 10);
    });

    it("should use custom center", () => {
      const positions = calculateRadialPositions({
        count: 4,
        radius: 10,
        center: { x: 5, y: 5 },
      });

      // First position should be offset by center
      expect(positions[0].x).toBeCloseTo(15, 10);
      expect(positions[0].y).toBeCloseTo(5, 10);
    });

    it("should generate positions for clock face (12 hours)", () => {
      const positions = calculateRadialPositions({
        count: 12,
        radius: 100,
        startAngle: Math.PI / 2, // Start at top (12 o'clock) - 90° in standard math coordinates
      });

      expect(positions.length).toBe(12);
      // First position should be at top (12 o'clock) - positive y in standard coordinates
      expect(positions[0].x).toBeCloseTo(0, 10);
      expect(positions[0].y).toBeCloseTo(100, 10);
    });

    it("should handle single position", () => {
      const positions = calculateRadialPositions({ count: 1, radius: 10 });
      expect(positions.length).toBe(1);
      expect(positions[0].x).toBeCloseTo(10, 10);
      expect(positions[0].y).toBeCloseTo(0, 10);
    });
  });

  describe("calculateArcLength", () => {
    it("should calculate arc length for full circle (radians)", () => {
      const length = calculateArcLength(10, 2 * Math.PI);
      expect(length).toBeCloseTo(2 * Math.PI * 10, 10);
    });

    it("should calculate arc length for half circle (radians)", () => {
      const length = calculateArcLength(10, Math.PI);
      expect(length).toBeCloseTo(Math.PI * 10, 10);
    });

    it("should calculate arc length for quarter circle (radians)", () => {
      const length = calculateArcLength(10, Math.PI / 2);
      expect(length).toBeCloseTo((Math.PI * 10) / 2, 10);
    });

    it("should calculate arc length for full circle (degrees)", () => {
      const length = calculateArcLength(10, 360, "degrees");
      expect(length).toBeCloseTo(2 * Math.PI * 10, 10);
    });

    it("should calculate arc length for half circle (degrees)", () => {
      const length = calculateArcLength(10, 180, "degrees");
      expect(length).toBeCloseTo(Math.PI * 10, 10);
    });

    it("should calculate arc length for quarter circle (degrees)", () => {
      const length = calculateArcLength(10, 90, "degrees");
      expect(length).toBeCloseTo((Math.PI * 10) / 2, 10);
    });

    it("should handle zero angle", () => {
      const length = calculateArcLength(10, 0);
      expect(length).toBe(0);
    });

    it("should handle zero radius", () => {
      const length = calculateArcLength(0, Math.PI);
      expect(length).toBe(0);
    });
  });

  describe("calculateSectorArea", () => {
    it("should calculate sector area for full circle (radians)", () => {
      const area = calculateSectorArea(10, 2 * Math.PI);
      expect(area).toBeCloseTo(Math.PI * 10 * 10, 10);
    });

    it("should calculate sector area for half circle (radians)", () => {
      const area = calculateSectorArea(10, Math.PI);
      expect(area).toBeCloseTo((Math.PI * 10 * 10) / 2, 10);
    });

    it("should calculate sector area for quarter circle (radians)", () => {
      const area = calculateSectorArea(10, Math.PI / 2);
      expect(area).toBeCloseTo((Math.PI * 10 * 10) / 4, 10);
    });

    it("should calculate sector area for full circle (degrees)", () => {
      const area = calculateSectorArea(10, 360, "degrees");
      expect(area).toBeCloseTo(Math.PI * 10 * 10, 10);
    });

    it("should calculate sector area for half circle (degrees)", () => {
      const area = calculateSectorArea(10, 180, "degrees");
      expect(area).toBeCloseTo((Math.PI * 10 * 10) / 2, 10);
    });

    it("should calculate sector area for quarter circle (degrees)", () => {
      const area = calculateSectorArea(10, 90, "degrees");
      expect(area).toBeCloseTo((Math.PI * 10 * 10) / 4, 10);
    });

    it("should handle zero angle", () => {
      const area = calculateSectorArea(10, 0);
      expect(area).toBe(0);
    });

    it("should handle zero radius", () => {
      const area = calculateSectorArea(0, Math.PI);
      expect(area).toBe(0);
    });

    it("should match formula: A = (r²θ)/2", () => {
      const radius = 5;
      const angle = Math.PI / 3;
      const area = calculateSectorArea(radius, angle);
      const expected = (radius * radius * angle) / 2;
      expect(area).toBeCloseTo(expected, 10);
    });
  });

  describe("Integration Tests", () => {
    it("should work together for clock face generation", () => {
      // Generate 12 hour positions starting at top (12 o'clock)
      // In standard math coordinates, 90° (π/2) points up (positive y)
      const startAngle = degreesToRadians(90); // 90 degrees = top in standard coordinates
      const radius = 100;
      const positions = calculateRadialPositions({
        count: 12,
        radius,
        startAngle,
      });

      expect(positions.length).toBe(12);

      // Verify first position is at top (positive y in standard coordinates)
      const firstPos = positions[0];
      expect(firstPos.x).toBeCloseTo(0, 10);
      expect(firstPos.y).toBeCloseTo(radius, 10);

      // Verify all positions are at correct distance
      positions.forEach(pos => {
        const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
        expect(distance).toBeCloseTo(radius, 10);
      });
    });

    it("should calculate arc length and sector area consistently", () => {
      const radius = 10;
      const angleDeg = 90;
      const angleRad = degreesToRadians(angleDeg);

      const arcLength = calculateArcLength(radius, angleRad);
      const sectorArea = calculateSectorArea(radius, angleRad);

      // Verify they use the same angle
      expect(arcLength).toBeCloseTo((Math.PI * radius) / 2, 10);
      expect(sectorArea).toBeCloseTo((Math.PI * radius * radius) / 4, 10);
    });

    it("should generate positions matching manual calculations", () => {
      // Generate 4 positions at 0°, 90°, 180°, 270°
      const positions = calculateRadialPositions({ count: 4, radius: 10 });

      // Manually calculate expected positions
      const expected = [
        calculateCircularPosition(0, 10),
        calculateCircularPosition(Math.PI / 2, 10),
        calculateCircularPosition(Math.PI, 10),
        calculateCircularPosition((3 * Math.PI) / 2, 10),
      ];

      positions.forEach((pos, i) => {
        expect(pos.x).toBeCloseTo(expected[i].x, 10);
        expect(pos.y).toBeCloseTo(expected[i].y, 10);
      });
    });
  });
});
