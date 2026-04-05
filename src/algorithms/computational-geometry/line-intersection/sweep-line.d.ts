/**
 * @module algorithms/geometry/algorithms/line-intersection/sweep-line
 * @description Sweep line algorithm components for Bentley-Ottmann line segment intersection.
 */
import { EventQueue, LineSegment, Point, StatusStructure, SweepLineEvent } from "./line-intersection-types";
/**
 * Priority queue implementation for sweep line events.
 */
export declare class SweepLineEventQueue implements EventQueue {
    private events;
    /**
     * Adds an event to the queue.
     * @param event - The event to add.
     * @example
     */
    add(event: SweepLineEvent): void;
    /**
     * Removes and returns the next event from the queue.
     * @returns The next event, or null if queue is empty.
     * @example
     */
    poll(): SweepLineEvent | null;
    /**
     * Returns the next event without removing it.
     * @returns The next event, or null if queue is empty.
     * @example
     */
    peek(): SweepLineEvent | null;
    /**
     * Returns the number of events in the queue.
     * @returns The queue size.
     * @example
     */
    size(): number;
    /**
     * Returns whether the queue is empty.
     * @returns True if the queue is empty.
     * @example
     */
    isEmpty(): boolean;
    /**
     * Clears all events from the queue.
     * @example
     */
    clear(): void;
}
/**
 * Balanced binary search tree implementation for sweep line status structure.
 */
export declare class SweepLineStatusStructure implements StatusStructure {
    private root;
    private tolerance;
    /**
     *
     * @param tolerance
     * @example
     */
    constructor(tolerance?: number);
    /**
     * Inserts a segment into the status structure.
     * @param segment - The segment to insert.
     * @param sweepY - Current y-coordinate of the sweep line.
     * @example
     */
    insert(segment: LineSegment, sweepY: number): void;
    /**
     * Removes a segment from the status structure.
     * @param segment - The segment to remove.
     * @param sweepY - Current y-coordinate of the sweep line.
     * @example
     */
    remove(segment: LineSegment, sweepY: number): void;
    /**
     * Finds the segments immediately above and below a given segment.
     * @param segment - The segment to find neighbors for.
     * @param sweepY - Current y-coordinate of the sweep line.
     * @returns Object with above and below segments.
     * @example
     */
    findNeighbors(segment: LineSegment, sweepY: number): {
        above: LineSegment | null;
        below: LineSegment | null;
    };
    /**
     * Returns all segments in the status structure.
     * @param sweepY - Current y-coordinate of the sweep line.
     * @param _sweepY
     * @returns Array of segments ordered by their x-coordinate at sweepY.
     * @example
     */
    getAllSegments(_sweepY: number): LineSegment[];
    /**
     * Returns the number of segments in the status structure.
     * @returns The number of segments.
     * @example
     */
    size(): number;
    /**
     * Returns whether the status structure is empty.
     * @returns True if the status structure is empty.
     * @example
     */
    isEmpty(): boolean;
    /**
     * Clears all segments from the status structure.
     * @example
     */
    clear(): void;
    /**
     * Inserts a node into the AVL tree.
     * @param node - Current node.
     * @param segment - Segment to insert.
     * @param sweepY - Current sweep line y-coordinate.
     * @returns The updated node.
     * @example
     */
    private insertNode;
    /**
     * Removes a node from the AVL tree.
     * @param node - Current node.
     * @param segment - Segment to remove.
     * @param sweepY - Current sweep line y-coordinate.
     * @returns The updated node.
     * @example
     */
    private removeNode;
    /**
     * Balances an AVL tree node.
     * @param node - The node to balance.
     * @param sweepY - Current sweep line y-coordinate.
     * @param _sweepY
     * @returns The balanced node.
     * @example
     */
    private balance;
    /**
     * Performs a right rotation.
     * @param node - The node to rotate.
     * @returns The rotated node.
     * @example
     */
    private rotateRight;
    /**
     * Performs a left rotation.
     * @param node - The node to rotate.
     * @returns The rotated node.
     * @example
     */
    private rotateLeft;
    /**
     * Gets the height of a node.
     * @param node - The node.
     * @returns The height of the node.
     * @example
     */
    private getHeight;
    /**
     * Gets the balance factor of a node.
     * @param node - The node.
     * @returns The balance factor.
     * @example
     */
    private getBalance;
    /**
     * Finds the minimum node in a subtree.
     * @param node - The root of the subtree.
     * @returns The minimum node.
     * @example
     */
    private findMin;
    /**
     * Compares two segments at a given sweep line y-coordinate.
     * @param seg1 - First segment.
     * @param seg2 - Second segment.
     * @param sweepY - Current sweep line y-coordinate.
     * @returns Negative if seg1 < seg2, positive if seg1 > seg2, 0 if equal.
     * @example
     */
    private compareSegments;
    /**
     * Gets the x-coordinate of a segment at a given y-coordinate.
     * @param segment - The segment.
     * @param y - The y-coordinate.
     * @returns The x-coordinate.
     * @example
     */
    private getXAtY;
    /**
     * Finds the segment immediately above a given segment.
     * @param segment - The reference segment.
     * @param sweepY - Current sweep line y-coordinate.
     * @returns The segment above, or null if none.
     * @example
     */
    private findAbove;
    /**
     * Finds the segment immediately below a given segment.
     * @param segment - The reference segment.
     * @param sweepY - Current sweep line y-coordinate.
     * @returns The segment below, or null if none.
     * @example
     */
    private findBelow;
    /**
     * Performs inorder traversal to collect all segments.
     * @param node - Current node.
     * @param segments - Array to collect segments.
     * @example
     */
    private inorderTraversal;
    /**
     * Counts the number of nodes in a subtree.
     * @param node - The root of the subtree.
     * @returns The number of nodes.
     * @example
     */
    private countNodes;
}
/**
 * Utility functions for sweep line operations.
 */
export declare class SweepLineUtils {
    /**
     * Creates start and end events for a line segment.
     * @param segment - The line segment.
     * @returns Array of events.
     * @example
     */
    static createSegmentEvents(segment: LineSegment): SweepLineEvent[];
    /**
     * Creates an intersection event.
     * @param point - The intersection point.
     * @param segment1 - First intersecting segment.
     * @param segment2 - Second intersecting segment.
     * @returns The intersection event.
     * @example
     */
    static createIntersectionEvent(point: Point, segment1: LineSegment, segment2: LineSegment): SweepLineEvent;
    /**
     * Checks if two line segments intersect.
     * @param seg1 - First line segment.
     * @param seg2 - Second line segment.
     * @param tolerance - Tolerance for floating point comparisons.
     * @returns Object with intersection information, or null if no intersection.
     * @example
     */
    static lineSegmentsIntersect(seg1: LineSegment, seg2: LineSegment, tolerance?: number): {
        point: Point;
        t1: number;
        t2: number;
    } | null;
    /**
     * Checks if a point is on a line segment.
     * @param point - The point to check.
     * @param segment - The line segment.
     * @param tolerance - Tolerance for floating point comparisons.
     * @returns True if the point is on the segment.
     * @example
     */
    static pointOnSegment(point: Point, segment: LineSegment, tolerance?: number): boolean;
    /**
     * Calculates the distance between two points.
     * @param p1 - First point.
     * @param p2 - Second point.
     * @returns The Euclidean distance.
     * @example
     */
    static distance(p1: Point, p2: Point): number;
    /**
     * Checks if two points are equal within tolerance.
     * @param p1 - First point.
     * @param p2 - Second point.
     * @param tolerance - Tolerance for comparison.
     * @returns True if the points are equal.
     * @example
     */
    static pointsEqual(p1: Point, p2: Point, tolerance?: number): boolean;
}
//# sourceMappingURL=sweep-line.d.ts.map