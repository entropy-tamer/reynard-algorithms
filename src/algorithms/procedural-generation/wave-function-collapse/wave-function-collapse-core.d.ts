/**
 * @file Wave Function Collapse core implementation
 *
 * Wave Function Collapse Core Implementation
 *
 * Main Wave Function Collapse class that orchestrates procedural generation
 * using modular components for constraint handling, propagation, observation, and backtracking.
 *
 * @module algorithms/geometry/algorithms/wave-function-collapse
 */
import { Tile, Constraint, WaveFunctionCollapseConfig, WaveFunctionCollapseResult, WaveFunctionCollapse2DOptions, WaveFunctionCollapse3DOptions, WaveFunctionCollapseTrainingOptions, WaveFunctionCollapseTrainingResult } from "./wave-function-collapse-types";
/**
 * The WaveFunctionCollapse class provides implementations of the Wave Function Collapse algorithm
 * for constraint-based procedural generation. It supports both 2D and 3D generation with
 * overlapping and tiled models, making it ideal for creating coherent, tile-based content.
 */
export declare class WaveFunctionCollapse {
    private config;
    private random;
    /**
     * Creates a new WaveFunctionCollapse instance
     *
     * @param config Configuration options
     * @example const wfc = new WaveFunctionCollapse({width: 10, height: 10})
     */
    constructor(config?: Partial<WaveFunctionCollapseConfig>);
    /**
     * Generate 2D content using Wave Function Collapse
     *
     * @param options Generation options
     * @param tiles Available tiles
     * @param constraints Tile constraints
     * @returns Generation result
     * @example const wfc = new WaveFunctionCollapse(); const result = wfc.generate2D({width: 10, height: 10}, tiles, constraints);
     */
    generate2D(options: WaveFunctionCollapse2DOptions, tiles: Tile[], constraints: Constraint[]): WaveFunctionCollapseResult;
    /**
     * Generate 3D content using Wave Function Collapse
     *
     * @param options Generation options
     * @param tiles Available tiles
     * @param constraints Tile constraints
     * @returns Generation result
     * @example const wfc = new WaveFunctionCollapse(); const result = wfc.generate3D({width: 10, height: 10, depth: 5}, tiles, constraints);
     */
    generate3D(options: WaveFunctionCollapse3DOptions, tiles: Tile[], constraints: Constraint[]): WaveFunctionCollapseResult;
    /**
     * Train from input data
     *
     * @param options Training options
     * @returns Training result
     * @example const wfc = new WaveFunctionCollapse(); const result = wfc.trainFromInput({inputData: [['tile1', 'tile2'], ['tile2', 'tile3']]});
     */
    trainFromInput(options: WaveFunctionCollapseTrainingOptions): WaveFunctionCollapseTrainingResult;
}
//# sourceMappingURL=wave-function-collapse-core.d.ts.map