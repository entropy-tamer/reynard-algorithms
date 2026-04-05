/**
 * @file marching-squares-types.ts
 * @module algorithms/geometry/algorithms/marching-squares/types
 * @description Defines the types and interfaces for Marching Squares algorithm.
 */
/**
 * Represents a 2D point with x and y coordinates.
 */
export interface Point {
    x: number;
    y: number;
}
/**
 * Represents a line segment with start and end points.
 */
export interface LineSegment {
    start: Point;
    end: Point;
}
/**
 * Represents a marching squares cell with its corner values and position.
 */
export interface MarchingCell {
    /** Corner values (clockwise: bottom-left, bottom-right, top-right, top-left) */
    corners: [number, number, number, number];
    /** Position of the bottom-left corner of the cell */
    position: Point;
    /** Width and height of the cell */
    size: {
        width: number;
        height: number;
    };
}
/**
 * Configuration options for Marching Squares algorithm.
 */
export interface MarchingSquaresConfig {
    /**
     * The threshold value for determining surface crossing.
     * Values above this threshold are considered "solid".
     * @default 0.5
     */
    threshold?: number;
    /**
     * Whether to simplify the generated contours by removing redundant vertices.
     * @default true
     */
    simplifyContours?: boolean;
    /**
     * Tolerance for contour simplification (only used if simplifyContours is true).
     * @default 1e-6
     */
    simplificationTolerance?: number;
    /**
     * Whether to connect contours into closed loops.
     * @default true
     */
    connectContours?: boolean;
    /**
     * Whether to validate input data (check for valid dimensions, etc.).
     * @default true
     */
    validateInput?: boolean;
}
/**
 * Statistics about the marching squares process.
 */
export interface MarchingSquaresStats {
    /**
     * Width of the input scalar field.
     */
    width: number;
    /**
     * Height of the input scalar field.
     */
    height: number;
    /**
     * Number of contour segments generated.
     */
    segmentCount: number;
    /**
     * Number of contour vertices generated.
     */
    vertexCount: number;
    /**
     * Time taken for marching squares in milliseconds.
     */
    executionTime: number;
    /**
     * Whether the operation was successful.
     */
    success: boolean;
    /**
     * Error message if operation failed.
     */
    error?: string;
}
/**
 * Represents a contour as a series of connected line segments.
 */
export interface Contour {
    /**
     * Array of vertices that make up the contour path.
     */
    vertices: Point[];
    /**
     * Whether this contour forms a closed loop.
     */
    isClosed: boolean;
    /**
     * The level/isovalue this contour represents.
     */
    level: number;
}
/**
 * The result of a marching squares operation.
 */
export interface MarchingSquaresResult {
    /**
     * Array of contours generated from the scalar field.
     */
    contours: Contour[];
    /**
     * Statistics about the marching squares process.
     */
    stats: MarchingSquaresStats;
}
/**
 * Options for querying marching squares results.
 */
export interface MarchingSquaresQueryOptions {
    /**
     * Minimum contour length to include in results.
     * @default 0
     */
    minLength?: number;
    /**
     * Maximum contour length to include in results.
     * @default Infinity
     */
    maxLength?: number;
    /**
     * Whether to include only closed contours.
     * @default false
     */
    closedOnly?: boolean;
    /**
     * Bounding box to filter contours (minX, minY, maxX, maxY).
     * Only contours intersecting this box will be included.
     */
    bounds?: [number, number, number, number];
}
/**
 * Result of a marching squares query operation.
 */
export interface MarchingSquaresQueryResult {
    /**
     * Filtered array of contours.
     */
    contours: Contour[];
    /**
     * Number of contours that were filtered out.
     */
    filteredCount: number;
}
//# sourceMappingURL=marching-squares-types.d.ts.map