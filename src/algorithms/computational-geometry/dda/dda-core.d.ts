/**
 * @module algorithms/geometry/algorithms/dda/dda-core
 * @description Implements the Digital Differential Analyzer (DDA) line algorithm.
 */
export interface Point2D {
    x: number;
    y: number;
}
export interface DDALineResult {
    points: Point2D[];
    pointCount: number;
    success: boolean;
}
/**
 *
 */
export declare class DDALine {
    /**
     * Generate integer grid points for a line using the classic DDA algorithm.
     * @param start
     * @param end
     * @example
     */
    static draw(start: Point2D, end: Point2D): DDALineResult;
}
export declare const DDA: {
    draw: typeof DDALine.draw;
};
//# sourceMappingURL=dda-core.d.ts.map