/**
 * @module algorithms/geometry/algorithms/line-intersection/sweep-line
 * @description Sweep line algorithm components for Bentley-Ottmann line segment intersection.
 */

import {
  Point,
  LineSegment,
  SweepLineEvent,
  EventQueue,
  StatusStructure,
  StatusNode,
} from "./line-intersection-types";

/**
 * Priority queue implementation for sweep line events.
 */
export class SweepLineEventQueue implements EventQueue {
  private events: SweepLineEvent[] = [];

  /**
   * Adds an event to the queue.
   * @param event - The event to add.
   */
  add(event: SweepLineEvent): void {
    this.events.push(event);
    this.events.sort((a, b) => {
      // Primary sort by y-coordinate (sweep line direction)
      if (Math.abs(a.point.y - b.point.y) > 1e-10) {
        return a.point.y - b.point.y;
      }
      // Secondary sort by x-coordinate
      if (Math.abs(a.point.x - b.point.x) > 1e-10) {
        return a.point.x - b.point.x;
      }
      // Tertiary sort by event type priority
      return a.priority - b.priority;
    });
  }

  /**
   * Removes and returns the next event from the queue.
   * @returns The next event, or null if queue is empty.
   */
  poll(): SweepLineEvent | null {
    return this.events.shift() || null;
  }

  /**
   * Returns the next event without removing it.
   * @returns The next event, or null if queue is empty.
   */
  peek(): SweepLineEvent | null {
    return this.events.length > 0 ? this.events[0] : null;
  }

  /**
   * Returns the number of events in the queue.
   * @returns The queue size.
   */
  size(): number {
    return this.events.length;
  }

  /**
   * Returns whether the queue is empty.
   * @returns True if the queue is empty.
   */
  isEmpty(): boolean {
    return this.events.length === 0;
  }

  /**
   * Clears all events from the queue.
   */
  clear(): void {
    this.events = [];
  }
}

/**
 * Balanced binary search tree implementation for sweep line status structure.
 */
export class SweepLineStatusStructure implements StatusStructure {
  private root: StatusNode | null = null;
  private tolerance: number;

  constructor(tolerance: number = 1e-10) {
    this.tolerance = tolerance;
  }

  /**
   * Inserts a segment into the status structure.
   * @param segment - The segment to insert.
   * @param sweepY - Current y-coordinate of the sweep line.
   */
  insert(segment: LineSegment, sweepY: number): void {
    this.root = this.insertNode(this.root, segment, sweepY);
  }

  /**
   * Removes a segment from the status structure.
   * @param segment - The segment to remove.
   * @param sweepY - Current y-coordinate of the sweep line.
   */
  remove(segment: LineSegment, sweepY: number): void {
    this.root = this.removeNode(this.root, segment, sweepY);
  }

  /**
   * Finds the segments immediately above and below a given segment.
   * @param segment - The segment to find neighbors for.
   * @param sweepY - Current y-coordinate of the sweep line.
   * @returns Object with above and below segments.
   */
  findNeighbors(segment: LineSegment, sweepY: number): {
    above: LineSegment | null;
    below: LineSegment | null;
  } {
    const above = this.findAbove(segment, sweepY);
    const below = this.findBelow(segment, sweepY);
    return { above, below };
  }

  /**
   * Returns all segments in the status structure.
   * @param sweepY - Current y-coordinate of the sweep line.
   * @returns Array of segments ordered by their x-coordinate at sweepY.
   */
  getAllSegments(_sweepY: number): LineSegment[] {
    const segments: LineSegment[] = [];
    this.inorderTraversal(this.root, segments);
    return segments;
  }

  /**
   * Returns the number of segments in the status structure.
   * @returns The number of segments.
   */
  size(): number {
    return this.countNodes(this.root);
  }

  /**
   * Returns whether the status structure is empty.
   * @returns True if the status structure is empty.
   */
  isEmpty(): boolean {
    return this.root === null;
  }

  /**
   * Clears all segments from the status structure.
   */
  clear(): void {
    this.root = null;
  }

  /**
   * Inserts a node into the AVL tree.
   * @param node - Current node.
   * @param segment - Segment to insert.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns The updated node.
   */
  private insertNode(node: StatusNode | null, segment: LineSegment, sweepY: number): StatusNode | null {
    if (node === null) {
      return {
        segment,
        left: null,
        right: null,
        parent: null,
        height: 1,
      };
    }

    const comparison = this.compareSegments(segment, node.segment, sweepY);
    
    if (comparison < 0) {
      node.left = this.insertNode(node.left, segment, sweepY);
    } else if (comparison > 0) {
      node.right = this.insertNode(node.right, segment, sweepY);
    } else {
      // Segment already exists (shouldn't happen in normal operation)
      return node;
    }

    // Update height
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

    // Balance the tree
    return this.balance(node, sweepY);
  }

  /**
   * Removes a node from the AVL tree.
   * @param node - Current node.
   * @param segment - Segment to remove.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns The updated node.
   */
  private removeNode(node: StatusNode | null, segment: LineSegment, sweepY: number): StatusNode | null {
    if (node === null) {
      return null;
    }

    const comparison = this.compareSegments(segment, node.segment, sweepY);
    
    if (comparison < 0) {
      node.left = this.removeNode(node.left, segment, sweepY);
    } else if (comparison > 0) {
      node.right = this.removeNode(node.right, segment, sweepY);
    } else {
      // Found the node to remove
      if (node.left === null || node.right === null) {
        const temp = node.left || node.right;
        if (temp === null) {
          return null;
        }
        return temp;
      }

      // Node has two children
      const successor = this.findMin(node.right);
      node.segment = successor.segment;
      node.right = this.removeNode(node.right, successor.segment, sweepY);
    }

    // Update height
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

    // Balance the tree
    return this.balance(node, sweepY);
  }

  /**
   * Balances an AVL tree node.
   * @param node - The node to balance.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns The balanced node.
   */
  private balance(node: StatusNode, _sweepY: number): StatusNode {
    const balanceFactor = this.getBalance(node);

    // Left heavy
    if (balanceFactor > 1) {
      if (this.getBalance(node.left!) < 0) {
        node.left = this.rotateLeft(node.left!);
      }
      return this.rotateRight(node);
    }

    // Right heavy
    if (balanceFactor < -1) {
      if (this.getBalance(node.right!) > 0) {
        node.right = this.rotateRight(node.right!);
      }
      return this.rotateLeft(node);
    }

    return node;
  }

  /**
   * Performs a right rotation.
   * @param node - The node to rotate.
   * @returns The rotated node.
   */
  private rotateRight(node: StatusNode): StatusNode {
    const left = node.left!;
    const rightOfLeft = left.right;

    left.right = node;
    node.left = rightOfLeft;

    // Update heights
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    left.height = 1 + Math.max(this.getHeight(left.left), this.getHeight(left.right));

    return left;
  }

  /**
   * Performs a left rotation.
   * @param node - The node to rotate.
   * @returns The rotated node.
   */
  private rotateLeft(node: StatusNode): StatusNode {
    const right = node.right!;
    const leftOfRight = right.left;

    right.left = node;
    node.right = leftOfRight;

    // Update heights
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    right.height = 1 + Math.max(this.getHeight(right.left), this.getHeight(right.right));

    return right;
  }

  /**
   * Gets the height of a node.
   * @param node - The node.
   * @returns The height of the node.
   */
  private getHeight(node: StatusNode | null): number {
    return node ? node.height : 0;
  }

  /**
   * Gets the balance factor of a node.
   * @param node - The node.
   * @returns The balance factor.
   */
  private getBalance(node: StatusNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  /**
   * Finds the minimum node in a subtree.
   * @param node - The root of the subtree.
   * @returns The minimum node.
   */
  private findMin(node: StatusNode): StatusNode {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  /**
   * Compares two segments at a given sweep line y-coordinate.
   * @param seg1 - First segment.
   * @param seg2 - Second segment.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns Negative if seg1 < seg2, positive if seg1 > seg2, 0 if equal.
   */
  private compareSegments(seg1: LineSegment, seg2: LineSegment, sweepY: number): number {
    const x1 = this.getXAtY(seg1, sweepY);
    const x2 = this.getXAtY(seg2, sweepY);
    
    if (Math.abs(x1 - x2) < this.tolerance) {
      return 0;
    }
    
    return x1 - x2;
  }

  /**
   * Gets the x-coordinate of a segment at a given y-coordinate.
   * @param segment - The segment.
   * @param y - The y-coordinate.
   * @returns The x-coordinate.
   */
  private getXAtY(segment: LineSegment, y: number): number {
    const { start, end } = segment;
    
    // Handle horizontal segments
    if (Math.abs(start.y - end.y) < this.tolerance) {
      return Math.min(start.x, end.x);
    }
    
    // Linear interpolation
    const t = (y - start.y) / (end.y - start.y);
    return start.x + t * (end.x - start.x);
  }

  /**
   * Finds the segment immediately above a given segment.
   * @param segment - The reference segment.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns The segment above, or null if none.
   */
  private findAbove(segment: LineSegment, sweepY: number): LineSegment | null {
    let current = this.root;
    let above: LineSegment | null = null;
    
    while (current !== null) {
      const comparison = this.compareSegments(segment, current.segment, sweepY);
      
      if (comparison < 0) {
        above = current.segment;
        current = current.left;
      } else {
        current = current.right;
      }
    }
    
    return above;
  }

  /**
   * Finds the segment immediately below a given segment.
   * @param segment - The reference segment.
   * @param sweepY - Current sweep line y-coordinate.
   * @returns The segment below, or null if none.
   */
  private findBelow(segment: LineSegment, sweepY: number): LineSegment | null {
    let current = this.root;
    let below: LineSegment | null = null;
    
    while (current !== null) {
      const comparison = this.compareSegments(segment, current.segment, sweepY);
      
      if (comparison > 0) {
        below = current.segment;
        current = current.right;
      } else {
        current = current.left;
      }
    }
    
    return below;
  }

  /**
   * Performs inorder traversal to collect all segments.
   * @param node - Current node.
   * @param segments - Array to collect segments.
   */
  private inorderTraversal(node: StatusNode | null, segments: LineSegment[]): void {
    if (node !== null) {
      this.inorderTraversal(node.left, segments);
      segments.push(node.segment);
      this.inorderTraversal(node.right, segments);
    }
  }

  /**
   * Counts the number of nodes in a subtree.
   * @param node - The root of the subtree.
   * @returns The number of nodes.
   */
  private countNodes(node: StatusNode | null): number {
    if (node === null) {
      return 0;
    }
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }
}

/**
 * Utility functions for sweep line operations.
 */
export class SweepLineUtils {
  /**
   * Creates start and end events for a line segment.
   * @param segment - The line segment.
   * @returns Array of events.
   */
  static createSegmentEvents(segment: LineSegment): SweepLineEvent[] {
    const events: SweepLineEvent[] = [];
    
    // Determine which point is the start (lower y, or leftmost if same y)
    let start: Point;
    let end: Point;
    
    if (segment.start.y < segment.end.y || 
        (Math.abs(segment.start.y - segment.end.y) < 1e-10 && segment.start.x < segment.end.x)) {
      start = segment.start;
      end = segment.end;
    } else {
      start = segment.end;
      end = segment.start;
    }
    
    events.push({
      type: "start",
      point: start,
      segment,
      priority: 1,
    });
    
    events.push({
      type: "end",
      point: end,
      segment,
      priority: 3,
    });
    
    return events;
  }

  /**
   * Creates an intersection event.
   * @param point - The intersection point.
   * @param segment1 - First intersecting segment.
   * @param segment2 - Second intersecting segment.
   * @returns The intersection event.
   */
  static createIntersectionEvent(
    point: Point,
    segment1: LineSegment,
    segment2: LineSegment
  ): SweepLineEvent {
    return {
      type: "intersection",
      point,
      segments: [segment1, segment2],
      priority: 2,
    };
  }

  /**
   * Checks if two line segments intersect.
   * @param seg1 - First line segment.
   * @param seg2 - Second line segment.
   * @param tolerance - Tolerance for floating point comparisons.
   * @returns Object with intersection information, or null if no intersection.
   */
  static lineSegmentsIntersect(
    seg1: LineSegment,
    seg2: LineSegment,
    tolerance: number = 1e-10
  ): {
    point: Point;
    t1: number;
    t2: number;
  } | null {
    const p1 = seg1.start;
    const p2 = seg1.end;
    const p3 = seg2.start;
    const p4 = seg2.end;

    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    
    if (Math.abs(denom) < tolerance) {
      return null; // Lines are parallel
    }

    const t1 = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const t2 = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;

    // Check if intersection is within both line segments
    if (t1 >= -tolerance && t1 <= 1 + tolerance && t2 >= -tolerance && t2 <= 1 + tolerance) {
      return {
        point: {
          x: p1.x + t1 * (p2.x - p1.x),
          y: p1.y + t1 * (p2.y - p1.y),
        },
        t1,
        t2,
      };
    }

    return null;
  }

  /**
   * Checks if a point is on a line segment.
   * @param point - The point to check.
   * @param segment - The line segment.
   * @param tolerance - Tolerance for floating point comparisons.
   * @returns True if the point is on the segment.
   */
  static pointOnSegment(
    point: Point,
    segment: LineSegment,
    tolerance: number = 1e-10
  ): boolean {
    const { start, end } = segment;
    
    // Check if point is within the bounding box of the segment
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    
    if (point.x < minX - tolerance || point.x > maxX + tolerance ||
        point.y < minY - tolerance || point.y > maxY + tolerance) {
      return false;
    }
    
    // Check if point is collinear with the segment
    const crossProduct = (point.x - start.x) * (end.y - start.y) - (point.y - start.y) * (end.x - start.x);
    return Math.abs(crossProduct) < tolerance;
  }

  /**
   * Calculates the distance between two points.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @returns The Euclidean distance.
   */
  static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Checks if two points are equal within tolerance.
   * @param p1 - First point.
   * @param p2 - Second point.
   * @param tolerance - Tolerance for comparison.
   * @returns True if the points are equal.
   */
  static pointsEqual(p1: Point, p2: Point, tolerance: number = 1e-10): boolean {
    return (
      Math.abs(p1.x - p2.x) < tolerance &&
      Math.abs(p1.y - p2.y) < tolerance
    );
  }
}
