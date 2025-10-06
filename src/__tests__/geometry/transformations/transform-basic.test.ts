import { describe, it, expect } from "vitest";
import { TransformOps } from "../../../geometry/transformations/transformation-algorithms";

describe("TransformOps - Basic Operations", () => {
  describe("identity", () => {
    it("should create identity transform", () => {
      const transform = TransformOps.identity();

      expect(transform.translateX).toBe(0);
      expect(transform.translateY).toBe(0);
      expect(transform.scaleX).toBe(1);
      expect(transform.scaleY).toBe(1);
      expect(transform.rotation).toBe(0);
    });
  });

  describe("translate", () => {
    it("should create translation transform", () => {
      const transform = TransformOps.translate(10, 20);

      expect(transform.translateX).toBe(10);
      expect(transform.translateY).toBe(20);
      expect(transform.scaleX).toBe(1);
      expect(transform.scaleY).toBe(1);
      expect(transform.rotation).toBe(0);
    });

    it("should work with negative values", () => {
      const transform = TransformOps.translate(-5, -10);

      expect(transform.translateX).toBe(-5);
      expect(transform.translateY).toBe(-10);
    });
  });

  describe("scale", () => {
    it("should create uniform scale transform", () => {
      const transform = TransformOps.scale(2);

      expect(transform.translateX).toBe(0);
      expect(transform.translateY).toBe(0);
      expect(transform.scaleX).toBe(2);
      expect(transform.scaleY).toBe(2);
      expect(transform.rotation).toBe(0);
    });

    it("should create non-uniform scale transform", () => {
      const transform = TransformOps.scale(2, 3);

      expect(transform.scaleX).toBe(2);
      expect(transform.scaleY).toBe(3);
    });

    it("should work with fractional scale", () => {
      const transform = TransformOps.scale(0.5);

      expect(transform.scaleX).toBe(0.5);
      expect(transform.scaleY).toBe(0.5);
    });
  });

  describe("rotate", () => {
    it("should create rotation transform", () => {
      const transform = TransformOps.rotate(Math.PI / 2);

      expect(transform.translateX).toBe(0);
      expect(transform.translateY).toBe(0);
      expect(transform.scaleX).toBe(1);
      expect(transform.scaleY).toBe(1);
      expect(transform.rotation).toBe(Math.PI / 2);
    });

    it("should work with negative rotation", () => {
      const transform = TransformOps.rotate(-Math.PI / 4);

      expect(transform.rotation).toBe(-Math.PI / 4);
    });
  });
});
