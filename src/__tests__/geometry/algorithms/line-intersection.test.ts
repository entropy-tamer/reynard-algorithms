/**
 * @module algorithms/geometry/algorithms/line-intersection/tests
 * @description Unit tests for Bentley-Ottmann line segment intersection algorithm.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { LineIntersection } from "../../../geometry/algorithms/line-intersection/line-intersection-core";
import { SweepLineEventQueue, SweepLineStatusStructure, SweepLineUtils } from "../../../geometry/algorithms/line-intersection/sweep-line";
import type { LineSegment, SweepLineEvent, IntersectionQueryOptions } from "../../../geometry/algorithms/line-intersection/line-intersection-types";

describe("LineIntersection", () => {
  let intersection: LineIntersection;

  beforeEach(() => {
    intersection = new LineIntersection();
  });

  describe("Basic Functionality", () => {
    it("should create an instance with default configuration", () => {
      expect(intersection).toBeInstanceOf(LineIntersection);
      const config = intersection.getConfig();
      expect(config.tolerance).toBe(1e-10);
      expect(config.validateInput).toBe(true);
      expect(config.removeDuplicates).toBe(true);
    });

    it("should create an instance with custom configuration", () => {
      const customIntersection = new LineIntersection({
        tolerance: 1e-6,
        validateInput: false,
        maxIntersections: 100,
      });
      const config = customIntersection.getConfig();
      expect(config.tolerance).toBe(1e-6);
      expect(config.validateInput).toBe(false);
      expect(config.maxIntersections).toBe(100);
    });

    it("should update configuration", () => {
      intersection.updateConfig({ tolerance: 1e-8 });
      const config = intersection.getConfig();
      expect(config.tolerance).toBe(1e-8);
    });
  });

  describe("Input Validation", () => {
    it("should validate segment structure", () => {
      const invalidSegments = [
        { id: 1, start: { x: 0, y: 0 } } as any, // Missing end
      ];
      const result = intersection.validateSegments(invalidSegments);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Segment 0 must have start and end points");
    });

    it("should validate segment points", () => {
      const invalidSegments: LineSegment[] = [
        { id: 1, start: { x: "invalid", y: 0 } as any, end: { x: 1, y: 1 } },
      ];
      const result = intersection.validateSegments(invalidSegments);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Segment 0 has invalid start or end point");
    });

    it("should detect zero-length segments", () => {
      const zeroLengthSegments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
        { id: 2, start: { x: 1, y: 1 }, end: { x: 2, y: 2 } },
      ];
      const result = intersection.validateSegments(zeroLengthSegments);
      expect(result.warnings).toContain("Segment 0 has zero or very small length");
    });

    it("should detect duplicate segments", () => {
      const duplicateSegments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
        { id: 2, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      ];
      const result = intersection.validateSegments(duplicateSegments);
      expect(result.duplicateCount).toBe(1);
      expect(result.warnings).toContain("Segments 0 and 1 are duplicates");
    });

    it("should handle validation disabled", () => {
      const intersectionNoValidation = new LineIntersection({ validateInput: false });
      const invalidSegments = [
        { id: 1, start: { x: 0, y: 0 } } as any,
      ];
      const result = intersectionNoValidation.findIntersections(invalidSegments);
      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 2 segments are required");
    });
  });

  describe("Simple Intersections", () => {
    it("should find intersection between two crossing lines", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 2, y: 2 } },
        { id: 2, start: { x: 0, y: 2 }, end: { x: 2, y: 0 } },
      ];

      const result = intersection.findIntersections(segments);

      expect(result.stats.success).toBe(true);
      expect(result.hasIntersections).toBe(true);
      expect(result.intersections).toHaveLength(1);
      expect(result.intersections[0].point.x).toBeCloseTo(1, 10);
      expect(result.intersections[0].point.y).toBeCloseTo(1, 10);
      expect(result.intersections[0].segments[0].id).toBe(1);
      expect(result.intersections[0].segments[1].id).toBe(2);
    });

    it("should find no intersection between parallel lines", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 2, y: 0 } },
        { id: 2, start: { x: 0, y: 1 }, end: { x: 2, y: 1 } },
      ];

      const result = intersection.findIntersections(segments);

      expect(result.stats.success).toBe(true);
      expect(result.hasIntersections).toBe(false);
      expect(result.intersections).toHaveLength(0);
    });

    it("should find no intersection between non-intersecting lines", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
        { id: 2, start: { x: 5, y: 5 }, end: { x: 6, y: 6 } },
      ];

      const result = intersection.findIntersections(segments);

      expect(result.stats.success).toBe(true);
      expect(result.hasIntersections).toBe(false);
      expect(result.intersections).toHaveLength(0);
    });

    it("should handle single segment", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      ];

      const result = intersection.findIntersections(segments);

      expect(result.stats.success).toBe(false);
      expect(result.stats.error).toContain("At least 2 segments are required");
    });
  });

  describe("Multiple Intersections", () => {
    it("should find multiple intersections", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 3, y: 3 } },
        { id: 2, start: { x: 0, y: 3 }, end: { x: 3, y: 0 } },
        { id: 3, start: { x: 1, y: 0 }, end: { x: 1, y: 3 } },
      ];

      const result = intersection.findIntersections(segments);

      expect(result.stats.success).toBe(true);
      expect(result.hasIntersections).toBe(true);
      expect(result.intersections.length).toBeGreaterThan(0);
    });

    it("should find intersections in a grid pattern", () => {
      const segments: LineSegment[] = [
        // Horizontal lines
        { id: 1, start: { x: 0, y: 0 }, end: { x: 2, y: 0 } },
        { id: 2, start: { x: 0, y: 1 }, end: { x: 2, y: 1 } },
        { id: 3, start: { x: 0, y: 2 }, end: { x: 2, y: 2 } },
        // Vertical lines
        { id: 4, start: { x: 0, y: 0 }, end: { x: 0, y: 2 } },
        { id: 5, start: { x: 1, y: 0 }, end: { x: 1, y: 2 } },
        { id: 6, start: { x: 2, y: 0 }, end: { x: 2, y: 2 } },
      ];

      const result = intersection.findIntersections(segments);

      expect(result.stats.success).toBe(true);
      expect(result.hasIntersections).toBe(true);
      expect(result.intersections.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle segments that share endpoints", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
        { id: 2, start: { x: 1, y: 1 }, end: { x: 2, y: 0 } },
      ];

      const result = intersection.findIntersections(segments);

      expect(result.stats.success).toBe(true);
      // Should find intersection at shared endpoint
    });

    it("should handle collinear segments", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 2, y: 0 } },
        { id: 2, start: { x: 1, y: 0 }, end: { x: 3, y: 0 } },
      ];

      const result = intersection.findIntersections(segments);

      expect(result.stats.success).toBe(true);
      // Collinear segments may or may not be considered intersecting depending on implementation
    });

    it("should handle horizontal and vertical segments", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 1 }, end: { x: 2, y: 1 } }, // Horizontal
        { id: 2, start: { x: 1, y: 0 }, end: { x: 1, y: 2 } }, // Vertical
      ];

      const result = intersection.findIntersections(segments);

      expect(result.stats.success).toBe(true);
      expect(result.hasIntersections).toBe(true);
      expect(result.intersections).toHaveLength(1);
      expect(result.intersections[0].point.x).toBeCloseTo(1, 10);
      expect(result.intersections[0].point.y).toBeCloseTo(1, 10);
    });
  });

  describe("Query Operations", () => {
    it("should filter intersections by bounding box", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 2, y: 2 } },
        { id: 2, start: { x: 0, y: 2 }, end: { x: 2, y: 0 } },
        { id: 3, start: { x: 5, y: 5 }, end: { x: 7, y: 7 } },
        { id: 4, start: { x: 5, y: 7 }, end: { x: 7, y: 5 } },
      ];

      const queryOptions: IntersectionQueryOptions = {
        boundingBox: {
          min: { x: 0, y: 0 },
          max: { x: 3, y: 3 },
        },
      };

      const result = intersection.queryIntersections(segments, queryOptions);

      expect(result.count).toBeGreaterThan(0);
      // All intersections should be within the bounding box
      for (const intersection of result.intersections) {
        expect(intersection.point.x).toBeGreaterThanOrEqual(0);
        expect(intersection.point.x).toBeLessThanOrEqual(3);
        expect(intersection.point.y).toBeGreaterThanOrEqual(0);
        expect(intersection.point.y).toBeLessThanOrEqual(3);
      }
    });

    it("should filter intersections by segment IDs", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 2, y: 2 } },
        { id: 2, start: { x: 0, y: 2 }, end: { x: 2, y: 0 } },
        { id: 3, start: { x: 1, y: 0 }, end: { x: 1, y: 2 } },
      ];

      const queryOptions: IntersectionQueryOptions = {
        segmentIds: [1, 2],
      };

      const result = intersection.queryIntersections(segments, queryOptions);

      expect(result.count).toBeGreaterThan(0);
      // All intersections should involve segments 1 or 2
      for (const intersection of result.intersections) {
        const segmentIds = [intersection.segments[0].id, intersection.segments[1].id];
        expect(segmentIds.some(id => [1, 2].includes(id as number))).toBe(true);
      }
    });

    it("should filter intersections by distance", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 2, y: 2 } },
        { id: 2, start: { x: 0, y: 2 }, end: { x: 2, y: 0 } },
      ];

      const queryOptions: IntersectionQueryOptions = {
        maxDistance: 1.5, // Distance from origin
      };

      const result = intersection.queryIntersections(segments, queryOptions);

      expect(result.count).toBeGreaterThan(0);
      // All intersections should be within the specified distance from origin
      for (const intersection of result.intersections) {
        const distance = Math.sqrt(intersection.point.x ** 2 + intersection.point.y ** 2);
        expect(distance).toBeLessThanOrEqual(1.5);
      }
    });
  });

  describe("Serialization", () => {
    it("should serialize intersection results", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 2, y: 2 } },
        { id: 2, start: { x: 0, y: 2 }, end: { x: 2, y: 0 } },
      ];

      const result = intersection.findIntersections(segments);
      const serialized = intersection.serialize(result, { precision: 3 });

      expect(serialized.intersections).toHaveLength(1);
      expect(serialized.intersections[0].point.x).toBe(1);
      expect(serialized.intersections[0].point.y).toBe(1);
      expect(serialized.intersections[0].segmentIds).toEqual([1, 2]);
    });

    it("should include statistics in serialization", () => {
      const segments: LineSegment[] = [
        { id: 1, start: { x: 0, y: 0 }, end: { x: 2, y: 2 } },
        { id: 2, start: { x: 0, y: 2 }, end: { x: 2, y: 0 } },
      ];

      const result = intersection.findIntersections(segments);
      const serialized = intersection.serialize(result, { includeStats: true });

      expect(serialized.stats).toBeDefined();
      expect(serialized.stats!.segmentCount).toBe(2);
      expect(serialized.stats!.success).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should handle large number of segments efficiently", () => {
      const segments: LineSegment[] = [];
      for (let i = 0; i < 100; i++) {
        segments.push({
          id: i,
          start: { x: Math.random() * 10, y: Math.random() * 10 },
          end: { x: Math.random() * 10, y: Math.random() * 10 },
        });
      }

      const startTime = performance.now();
      const result = intersection.findIntersections(segments);
      const executionTime = performance.now() - startTime;

      expect(result.stats.success).toBe(true);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.stats.executionTime).toBeLessThan(5000);
    });

    it("should respect max intersections limit", () => {
      const limitedIntersection = new LineIntersection({ maxIntersections: 5 });
      const segments: LineSegment[] = [];
      
      // Create many intersecting segments
      for (let i = 0; i < 20; i++) {
        segments.push({
          id: i,
          start: { x: 0, y: i },
          end: { x: 20, y: i },
        });
        segments.push({
          id: i + 20,
          start: { x: i, y: 0 },
          end: { x: i, y: 20 },
        });
      }

      const result = limitedIntersection.findIntersections(segments);

      expect(result.stats.success).toBe(true);
      expect(result.intersections.length).toBeLessThanOrEqual(5);
    });
  });
});

describe("SweepLineEventQueue", () => {
  let eventQueue: SweepLineEventQueue;

  beforeEach(() => {
    eventQueue = new SweepLineEventQueue();
  });

  describe("Basic Functionality", () => {
    it("should create an instance", () => {
      expect(eventQueue).toBeInstanceOf(SweepLineEventQueue);
      expect(eventQueue.isEmpty()).toBe(true);
      expect(eventQueue.size()).toBe(0);
    });

    it("should add and poll events", () => {
      const event: SweepLineEvent = {
        type: "start",
        point: { x: 0, y: 0 },
        segment: { id: 1, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
        priority: 1,
      };

      eventQueue.add(event);
      expect(eventQueue.size()).toBe(1);
      expect(eventQueue.isEmpty()).toBe(false);

      const polledEvent = eventQueue.poll();
      expect(polledEvent).toEqual(event);
      expect(eventQueue.size()).toBe(0);
      expect(eventQueue.isEmpty()).toBe(true);
    });

    it("should peek without removing", () => {
      const event: SweepLineEvent = {
        type: "start",
        point: { x: 0, y: 0 },
        segment: { id: 1, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
        priority: 1,
      };

      eventQueue.add(event);
      const peekedEvent = eventQueue.peek();
      expect(peekedEvent).toEqual(event);
      expect(eventQueue.size()).toBe(1); // Size should remain unchanged
    });

    it("should clear all events", () => {
      const event: SweepLineEvent = {
        type: "start",
        point: { x: 0, y: 0 },
        segment: { id: 1, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
        priority: 1,
      };

      eventQueue.add(event);
      eventQueue.clear();
      expect(eventQueue.size()).toBe(0);
      expect(eventQueue.isEmpty()).toBe(true);
    });
  });

  describe("Event Ordering", () => {
    it("should order events by y-coordinate", () => {
      const event1: SweepLineEvent = {
        type: "start",
        point: { x: 0, y: 2 },
        segment: { id: 1, start: { x: 0, y: 2 }, end: { x: 1, y: 3 } },
        priority: 1,
      };
      const event2: SweepLineEvent = {
        type: "start",
        point: { x: 0, y: 1 },
        segment: { id: 2, start: { x: 0, y: 1 }, end: { x: 1, y: 2 } },
        priority: 1,
      };

      eventQueue.add(event1);
      eventQueue.add(event2);

      const firstEvent = eventQueue.poll();
      const secondEvent = eventQueue.poll();

      expect(firstEvent).toEqual(event2); // Lower y-coordinate first
      expect(secondEvent).toEqual(event1);
    });

    it("should order events by x-coordinate when y is equal", () => {
      const event1: SweepLineEvent = {
        type: "start",
        point: { x: 2, y: 1 },
        segment: { id: 1, start: { x: 2, y: 1 }, end: { x: 3, y: 2 } },
        priority: 1,
      };
      const event2: SweepLineEvent = {
        type: "start",
        point: { x: 1, y: 1 },
        segment: { id: 2, start: { x: 1, y: 1 }, end: { x: 2, y: 2 } },
        priority: 1,
      };

      eventQueue.add(event1);
      eventQueue.add(event2);

      const firstEvent = eventQueue.poll();
      const secondEvent = eventQueue.poll();

      expect(firstEvent).toEqual(event2); // Lower x-coordinate first
      expect(secondEvent).toEqual(event1);
    });
  });
});

describe("SweepLineStatusStructure", () => {
  let statusStructure: SweepLineStatusStructure;

  beforeEach(() => {
    statusStructure = new SweepLineStatusStructure();
  });

  describe("Basic Functionality", () => {
    it("should create an instance", () => {
      expect(statusStructure).toBeInstanceOf(SweepLineStatusStructure);
      expect(statusStructure.isEmpty()).toBe(true);
      expect(statusStructure.size()).toBe(0);
    });

    it("should insert and remove segments", () => {
      const segment: LineSegment = {
        id: 1,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };

      statusStructure.insert(segment, 0.5);
      expect(statusStructure.size()).toBe(1);
      expect(statusStructure.isEmpty()).toBe(false);

      statusStructure.remove(segment, 0.5);
      expect(statusStructure.size()).toBe(0);
      expect(statusStructure.isEmpty()).toBe(true);
    });

    it("should find neighbors", () => {
      const segment1: LineSegment = {
        id: 1,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };
      const segment2: LineSegment = {
        id: 2,
        start: { x: 0, y: 1 },
        end: { x: 1, y: 0 },
      };

      statusStructure.insert(segment1, 0.5);
      statusStructure.insert(segment2, 0.5);

      const neighbors = statusStructure.findNeighbors(segment1, 0.5);
      expect(neighbors.above).toBe(segment2);
      expect(neighbors.below).toBeNull();
    });

    it("should get all segments", () => {
      const segment1: LineSegment = {
        id: 1,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };
      const segment2: LineSegment = {
        id: 2,
        start: { x: 0, y: 1 },
        end: { x: 1, y: 0 },
      };

      statusStructure.insert(segment1, 0.5);
      statusStructure.insert(segment2, 0.5);

      const allSegments = statusStructure.getAllSegments(0.5);
      expect(allSegments).toHaveLength(2);
      expect(allSegments).toContain(segment1);
      expect(allSegments).toContain(segment2);
    });

    it("should clear all segments", () => {
      const segment: LineSegment = {
        id: 1,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };

      statusStructure.insert(segment, 0.5);
      statusStructure.clear();
      expect(statusStructure.size()).toBe(0);
      expect(statusStructure.isEmpty()).toBe(true);
    });
  });
});

describe("SweepLineUtils", () => {
  describe("createSegmentEvents", () => {
    it("should create start and end events for a segment", () => {
      const segment: LineSegment = {
        id: 1,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };

      const events = SweepLineUtils.createSegmentEvents(segment);

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe("start");
      expect(events[1].type).toBe("end");
      expect(events[0].point).toEqual({ x: 0, y: 0 });
      expect(events[1].point).toEqual({ x: 1, y: 1 });
    });

    it("should handle segments with start point above end point", () => {
      const segment: LineSegment = {
        id: 1,
        start: { x: 1, y: 1 },
        end: { x: 0, y: 0 },
      };

      const events = SweepLineUtils.createSegmentEvents(segment);

      expect(events[0].type).toBe("start");
      expect(events[1].type).toBe("end");
      expect(events[0].point).toEqual({ x: 0, y: 0 }); // Should be swapped
      expect(events[1].point).toEqual({ x: 1, y: 1 });
    });
  });

  describe("createIntersectionEvent", () => {
    it("should create an intersection event", () => {
      const point = { x: 1, y: 1 };
      const segment1: LineSegment = {
        id: 1,
        start: { x: 0, y: 0 },
        end: { x: 2, y: 2 },
      };
      const segment2: LineSegment = {
        id: 2,
        start: { x: 0, y: 2 },
        end: { x: 2, y: 0 },
      };

      const event = SweepLineUtils.createIntersectionEvent(point, segment1, segment2);

      expect(event.type).toBe("intersection");
      expect(event.point).toEqual(point);
      expect(event.segments).toEqual([segment1, segment2]);
      expect(event.priority).toBe(2);
    });
  });

  describe("lineSegmentsIntersect", () => {
    it("should find intersection between crossing segments", () => {
      const segment1: LineSegment = {
        id: 1,
        start: { x: 0, y: 0 },
        end: { x: 2, y: 2 },
      };
      const segment2: LineSegment = {
        id: 2,
        start: { x: 0, y: 2 },
        end: { x: 2, y: 0 },
      };

      const result = SweepLineUtils.lineSegmentsIntersect(segment1, segment2);

      expect(result).not.toBeNull();
      expect(result!.point.x).toBeCloseTo(1, 10);
      expect(result!.point.y).toBeCloseTo(1, 10);
      expect(result!.t1).toBeCloseTo(0.5, 10);
      expect(result!.t2).toBeCloseTo(0.5, 10);
    });

    it("should return null for parallel segments", () => {
      const segment1: LineSegment = {
        id: 1,
        start: { x: 0, y: 0 },
        end: { x: 2, y: 0 },
      };
      const segment2: LineSegment = {
        id: 2,
        start: { x: 0, y: 1 },
        end: { x: 2, y: 1 },
      };

      const result = SweepLineUtils.lineSegmentsIntersect(segment1, segment2);

      expect(result).toBeNull();
    });

    it("should return null for non-intersecting segments", () => {
      const segment1: LineSegment = {
        id: 1,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      };
      const segment2: LineSegment = {
        id: 2,
        start: { x: 5, y: 5 },
        end: { x: 6, y: 6 },
      };

      const result = SweepLineUtils.lineSegmentsIntersect(segment1, segment2);

      expect(result).toBeNull();
    });
  });

  describe("pointOnSegment", () => {
    it("should detect point on segment", () => {
      const segment: LineSegment = {
        id: 1,
        start: { x: 0, y: 0 },
        end: { x: 2, y: 2 },
      };
      const point = { x: 1, y: 1 };

      const result = SweepLineUtils.pointOnSegment(point, segment);

      expect(result).toBe(true);
    });

    it("should detect point not on segment", () => {
      const segment: LineSegment = {
        id: 1,
        start: { x: 0, y: 0 },
        end: { x: 2, y: 2 },
      };
      const point = { x: 1, y: 2 };

      const result = SweepLineUtils.pointOnSegment(point, segment);

      expect(result).toBe(false);
    });
  });

  describe("distance", () => {
    it("should calculate distance between points", () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };

      const distance = SweepLineUtils.distance(p1, p2);

      expect(distance).toBe(5);
    });
  });

  describe("pointsEqual", () => {
    it("should detect equal points", () => {
      const p1 = { x: 1.0, y: 2.0 };
      const p2 = { x: 1.0, y: 2.0 };

      const result = SweepLineUtils.pointsEqual(p1, p2);

      expect(result).toBe(true);
    });

    it("should detect unequal points", () => {
      const p1 = { x: 1.0, y: 2.0 };
      const p2 = { x: 1.1, y: 2.0 };

      const result = SweepLineUtils.pointsEqual(p1, p2);

      expect(result).toBe(false);
    });

    it("should respect tolerance", () => {
      const p1 = { x: 1.0, y: 2.0 };
      const p2 = { x: 1.0001, y: 2.0 };

      const result1 = SweepLineUtils.pointsEqual(p1, p2, 1e-3);
      const result2 = SweepLineUtils.pointsEqual(p1, p2, 1e-5);

      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });
});
