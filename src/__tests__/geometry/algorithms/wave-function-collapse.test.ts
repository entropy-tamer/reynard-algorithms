/**
 * @module algorithms/geometry/algorithms/wave-function-collapse/test
 * @description Comprehensive tests for the Wave Function Collapse algorithm.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { WaveFunctionCollapse } from "../../../geometry/algorithms/wave-function-collapse/wave-function-collapse-core";
import type {
  Tile,
  Constraint,
  WaveFunctionCollapse2DOptions,
  WaveFunctionCollapse3DOptions,
  WaveFunctionCollapseTrainingOptions,
  ConstraintBasedWaveFunctionCollapseOptions,
  MultiScaleWaveFunctionCollapseOptions,
} from "../../../geometry/algorithms/wave-function-collapse/wave-function-collapse-types";

describe("WaveFunctionCollapse", () => {
  let wfc: WaveFunctionCollapse;
  let basicTiles: Tile[];
  let basicConstraints: Constraint[];

  beforeEach(() => {
    wfc = new WaveFunctionCollapse();

    // Basic tiles for testing
    basicTiles = [
      { id: "grass", weight: 1.0 },
      { id: "water", weight: 0.5 },
      { id: "stone", weight: 0.3 },
      { id: "tree", weight: 0.8 },
    ];

    // Basic constraints for testing
    basicConstraints = [
      { tile1: "grass", tile2: "water", direction: "north", bidirectional: true },
      { tile1: "water", tile2: "stone", direction: "east", bidirectional: true },
      { tile1: "grass", tile2: "tree", direction: "south", bidirectional: true },
      { tile1: "stone", tile2: "tree", direction: "west", bidirectional: true },
    ];
  });

  describe("Basic Functionality", () => {
    it("should create an instance with default configuration", () => {
      const instance = new WaveFunctionCollapse();
      expect(instance).toBeInstanceOf(WaveFunctionCollapse);
    });

    it("should create an instance with custom configuration", () => {
      const config = {
        width: 20,
        height: 20,
        maxIterations: 5000,
        seed: 42,
      };
      const instance = new WaveFunctionCollapse(config);
      expect(instance).toBeInstanceOf(WaveFunctionCollapse);
    });

    it("should generate a 2D grid successfully", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 10,
        height: 10,
        maxIterations: 1000,
        seed: 123,
      };

      const result = wfc.generate2D(options, basicTiles, basicConstraints);

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(10);
      expect(result.grid[0]).toHaveLength(10);
      expect(result.stats.totalCells).toBe(100);
      expect(result.stats.collapsedCells).toBeGreaterThan(0);
      expect(result.message).toContain("Successfully generated");
    });

    it("should generate a 3D grid successfully", () => {
      const options: WaveFunctionCollapse3DOptions = {
        width: 5,
        height: 5,
        depth: 3,
        maxIterations: 1000,
        seed: 456,
      };

      const result = wfc.generate3D(options, basicTiles, basicConstraints);

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(5);
      expect(result.grid[0]).toHaveLength(5);
      expect(result.stats.totalCells).toBe(75);
      expect(result.stats.collapsedCells).toBeGreaterThan(0);
      expect(result.message).toContain("Successfully generated");
    });
  });

  describe("Configuration Options", () => {
    it("should respect width and height parameters", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 15,
        height: 8,
        maxIterations: 1000,
      };

      const result = wfc.generate2D(options, basicTiles, basicConstraints);

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(8);
      expect(result.grid[0]).toHaveLength(15);
      expect(result.stats.totalCells).toBe(120);
    });

    it("should respect maxIterations parameter", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 5,
        height: 5,
        maxIterations: 50,
      };

      const result = wfc.generate2D(options, basicTiles, basicConstraints);

      expect(result.stats.iterations).toBeLessThanOrEqual(50);
    });

    it("should use seed for reproducible results", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 5,
        height: 5,
        seed: 999,
        maxIterations: 1000,
      };

      const result1 = wfc.generate2D(options, basicTiles, basicConstraints);
      const result2 = wfc.generate2D(options, basicTiles, basicConstraints);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      // Results should be identical with the same seed
      expect(result1.grid).toEqual(result2.grid);
    });

    it("should handle periodic boundary conditions", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 6,
        height: 6,
        periodic: true,
        maxIterations: 1000,
      };

      const result = wfc.generate2D(options, basicTiles, basicConstraints);

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(6);
      expect(result.grid[0]).toHaveLength(6);
    });

    it("should handle overlapping model vs tiled model", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 5,
        height: 5,
        useOverlappingModel: false,
        maxIterations: 1000,
      };

      const result = wfc.generate2D(options, basicTiles, basicConstraints);

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(5);
      expect(result.grid[0]).toHaveLength(5);
    });
  });

  describe("Tile and Constraint Handling", () => {
    it("should work with single tile", () => {
      const singleTile: Tile[] = [{ id: "grass", weight: 1.0 }];
      const noConstraints: Constraint[] = [];

      const options: WaveFunctionCollapse2DOptions = {
        width: 3,
        height: 3,
        maxIterations: 100,
      };

      const result = wfc.generate2D(options, singleTile, noConstraints);

      expect(result.success).toBe(true);
      expect(result.stats.collapsedCells).toBe(9);

      // All cells should be 'grass'
      for (const row of result.grid) {
        for (const cell of row) {
          expect(cell).toBe("grass");
        }
      }
    });

    it("should work with tiles of different weights", () => {
      const weightedTiles: Tile[] = [
        { id: "common", weight: 10.0 },
        { id: "rare", weight: 1.0 },
      ];

      const options: WaveFunctionCollapse2DOptions = {
        width: 10,
        height: 10,
        maxIterations: 1000,
        seed: 42,
      };

      const result = wfc.generate2D(options, weightedTiles, []);

      expect(result.success).toBe(true);

      // Count occurrences
      const counts = { common: 0, rare: 0 };
      for (const row of result.grid) {
        for (const cell of row) {
          if (cell === "common") counts.common++;
          if (cell === "rare") counts.rare++;
        }
      }

      // Common should appear more frequently than rare
      expect(counts.common).toBeGreaterThan(counts.rare);
    });

    it("should handle complex constraint networks", () => {
      const complexTiles: Tile[] = [
        { id: "center", weight: 1.0 },
        { id: "edge", weight: 1.0 },
        { id: "corner", weight: 1.0 },
      ];

      const complexConstraints: Constraint[] = [
        { tile1: "center", tile2: "edge", direction: "north", bidirectional: true },
        { tile1: "center", tile2: "edge", direction: "south", bidirectional: true },
        { tile1: "center", tile2: "edge", direction: "east", bidirectional: true },
        { tile1: "center", tile2: "edge", direction: "west", bidirectional: true },
        { tile1: "edge", tile2: "corner", direction: "north", bidirectional: true },
        { tile1: "edge", tile2: "corner", direction: "south", bidirectional: true },
        { tile1: "edge", tile2: "corner", direction: "east", bidirectional: true },
        { tile1: "edge", tile2: "corner", direction: "west", bidirectional: true },
      ];

      const options: WaveFunctionCollapse2DOptions = {
        width: 5,
        height: 5,
        maxIterations: 1000,
      };

      const result = wfc.generate2D(options, complexTiles, complexConstraints);

      expect(result.success).toBe(true);
      expect(result.stats.collapsedCells).toBeGreaterThan(0);
    });

    it("should handle tiles with symmetry information", () => {
      const symmetricTiles: Tile[] = [
        { id: "symmetric", weight: 1.0, symmetry: { type: "X", rotations: 4 } },
        { id: "asymmetric", weight: 1.0, symmetry: { type: "N", rotations: 1 } },
      ];

      const options: WaveFunctionCollapse2DOptions = {
        width: 4,
        height: 4,
        maxIterations: 1000,
      };

      const result = wfc.generate2D(options, symmetricTiles, []);

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(4);
      expect(result.grid[0]).toHaveLength(4);
    });
  });

  describe("Training from Input Data", () => {
    it("should train from simple input data", () => {
      const inputData = [
        ["grass", "water", "grass"],
        ["water", "stone", "water"],
        ["grass", "water", "grass"],
      ];

      const trainingOptions: WaveFunctionCollapseTrainingOptions = {
        inputData,
        patternSize: 2,
        includeRotations: true,
        includeReflections: true,
      };

      const result = wfc.trainFromInput(trainingOptions);

      expect(result.success).toBe(true);
      expect(result.tiles.length).toBeGreaterThan(0);
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.constraints.length).toBeGreaterThan(0);
      expect(result.stats.extractedTiles).toBeGreaterThan(0);
      expect(result.stats.extractedPatterns).toBeGreaterThan(0);
      expect(result.stats.learnedConstraints).toBeGreaterThan(0);
    });

    it("should handle empty input data gracefully", () => {
      const trainingOptions: WaveFunctionCollapseTrainingOptions = {
        inputData: [],
        patternSize: 2,
      };

      const result = wfc.trainFromInput(trainingOptions);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Input data is empty");
    });

    it("should handle single-cell input data", () => {
      const inputData = [["grass"]];

      const trainingOptions: WaveFunctionCollapseTrainingOptions = {
        inputData,
        patternSize: 1,
      };

      const result = wfc.trainFromInput(trainingOptions);

      expect(result.success).toBe(true);
      expect(result.tiles).toHaveLength(1);
      expect(result.tiles[0].id).toBe("grass");
    });

    it("should respect pattern size parameter", () => {
      const inputData = [
        ["grass", "water", "stone"],
        ["water", "stone", "grass"],
        ["stone", "grass", "water"],
      ];

      const trainingOptions: WaveFunctionCollapseTrainingOptions = {
        inputData,
        patternSize: 3,
        includeRotations: false,
        includeReflections: false,
      };

      const result = wfc.trainFromInput(trainingOptions);

      expect(result.success).toBe(true);
      expect(result.patterns.length).toBeGreaterThan(0);
    });

    it("should handle periodic training data", () => {
      const inputData = [
        ["grass", "water"],
        ["water", "grass"],
      ];

      const trainingOptions: WaveFunctionCollapseTrainingOptions = {
        inputData,
        patternSize: 2,
        periodic: true,
        includeRotations: true,
      };

      const result = wfc.trainFromInput(trainingOptions);

      expect(result.success).toBe(true);
      expect(result.patterns.length).toBeGreaterThan(0);
    });

    it("should respect minimum frequency threshold", () => {
      const inputData = [
        ["grass", "water", "stone"],
        ["water", "stone", "grass"],
        ["stone", "grass", "water"],
      ];

      const trainingOptions: WaveFunctionCollapseTrainingOptions = {
        inputData,
        patternSize: 2,
        minFrequency: 2,
      };

      const result = wfc.trainFromInput(trainingOptions);

      expect(result.success).toBe(true);
      // All patterns should have frequency >= 2
      for (const pattern of result.patterns) {
        expect(pattern.frequency).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe("Constraint-Based Generation", () => {
    it("should work with custom constraint function", () => {
      const customConstraint = (position: any, tile: string, grid: (string | null)[][]) => {
        // Custom constraint: only allow 'grass' in the center
        const centerX = Math.floor(grid[0].length / 2);
        const centerY = Math.floor(grid.length / 2);
        return position.x === centerX && position.y === centerY ? tile === "grass" : tile !== "grass";
      };

      const options: ConstraintBasedWaveFunctionCollapseOptions = {
        width: 5,
        height: 5,
        maxIterations: 1000,
        customConstraint,
      };

      const result = wfc.constraintBasedGenerate(options, basicTiles, basicConstraints);

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(5);
      expect(result.grid[0]).toHaveLength(5);
    });

    it("should work with custom entropy function", () => {
      const customEntropyFunction = (cell: any) => {
        // Custom entropy: prefer cells with fewer possible tiles
        return cell.possibleTiles.length;
      };

      const options: ConstraintBasedWaveFunctionCollapseOptions = {
        width: 4,
        height: 4,
        maxIterations: 1000,
        customEntropyFunction,
      };

      const result = wfc.constraintBasedGenerate(options, basicTiles, basicConstraints);

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(4);
      expect(result.grid[0]).toHaveLength(4);
    });

    it("should work with custom cell selection heuristic", () => {
      const customCellSelection = (cells: any[]) => {
        // Custom selection: always pick the first available cell
        return cells.length > 0 ? cells[0] : null;
      };

      const options: ConstraintBasedWaveFunctionCollapseOptions = {
        width: 3,
        height: 3,
        maxIterations: 1000,
        customCellSelection,
      };

      const result = wfc.constraintBasedGenerate(options, basicTiles, basicConstraints);

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(3);
      expect(result.grid[0]).toHaveLength(3);
    });
  });

  describe("Multi-Scale Generation", () => {
    it("should generate multi-scale grids", () => {
      const options: MultiScaleWaveFunctionCollapseOptions = {
        scales: [
          {
            scale: 1,
            width: 3,
            height: 3,
            tiles: basicTiles,
            constraints: basicConstraints,
          },
          {
            scale: 2,
            width: 6,
            height: 6,
            tiles: basicTiles,
            constraints: basicConstraints,
          },
        ],
        baseConfig: {
          maxIterations: 1000,
        },
        hierarchical: true,
        interpolation: "nearest",
      };

      const result = wfc.multiScaleGenerate(options);

      expect(result.success).toBe(true);
      expect(result.grids).toHaveLength(2);
      expect(result.finalGrid).toHaveLength(6);
      expect(result.finalGrid[0]).toHaveLength(6);
      expect(result.stats.scaleStats).toHaveLength(2);
    });

    it("should handle single scale", () => {
      const options: MultiScaleWaveFunctionCollapseOptions = {
        scales: [
          {
            scale: 1,
            width: 4,
            height: 4,
            tiles: basicTiles,
            constraints: basicConstraints,
          },
        ],
        baseConfig: {
          maxIterations: 1000,
        },
      };

      const result = wfc.multiScaleGenerate(options);

      expect(result.success).toBe(true);
      expect(result.grids).toHaveLength(1);
      expect(result.finalGrid).toHaveLength(4);
      expect(result.finalGrid[0]).toHaveLength(4);
    });

    it("should handle different interpolation methods", () => {
      const options: MultiScaleWaveFunctionCollapseOptions = {
        scales: [
          {
            scale: 1,
            width: 2,
            height: 2,
            tiles: basicTiles,
            constraints: basicConstraints,
          },
          {
            scale: 2,
            width: 4,
            height: 4,
            tiles: basicTiles,
            constraints: basicConstraints,
          },
        ],
        baseConfig: {
          maxIterations: 1000,
        },
        interpolation: "linear",
      };

      const result = wfc.multiScaleGenerate(options);

      expect(result.success).toBe(true);
      expect(result.grids).toHaveLength(2);
      expect(result.finalGrid).toHaveLength(4);
      expect(result.finalGrid[0]).toHaveLength(4);
    });
  });

  describe("Analysis and Statistics", () => {
    it("should analyze generated results", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 5,
        height: 5,
        maxIterations: 1000,
      };

      const result = wfc.generate2D(options, basicTiles, basicConstraints);
      expect(result.success).toBe(true);

      const analysis = wfc.analyzeResult(result.grid, basicTiles, basicConstraints);

      expect(analysis.tileDistribution.totalTiles).toBeGreaterThan(0);
      expect(analysis.tileDistribution.uniqueTiles).toBeGreaterThan(0);
      expect(analysis.entropyAnalysis.averageEntropy).toBeGreaterThanOrEqual(0);
      expect(analysis.constraintAnalysis.totalConstraints).toBe(basicConstraints.length);
      expect(analysis.executionTime).toBeGreaterThan(0);
    });

    it("should handle empty grid analysis", () => {
      const emptyGrid: (string | null)[][] = [];
      const analysis = wfc.analyzeResult(emptyGrid, basicTiles, basicConstraints);

      expect(analysis.tileDistribution.totalTiles).toBe(0);
      expect(analysis.tileDistribution.uniqueTiles).toBe(0);
      expect(analysis.executionTime).toBeGreaterThan(0);
    });

    it("should compute tile distribution correctly", () => {
      const testGrid: (string | null)[][] = [
        ["grass", "water", "grass"],
        ["water", "stone", "water"],
        ["grass", "water", "grass"],
      ];

      const analysis = wfc.analyzeResult(testGrid, basicTiles, basicConstraints);

      expect(analysis.tileDistribution.totalTiles).toBe(9);
      expect(analysis.tileDistribution.uniqueTiles).toBe(3);
      expect(analysis.tileDistribution.tileCounts["grass"]).toBe(4);
      expect(analysis.tileDistribution.tileCounts["water"]).toBe(4);
      expect(analysis.tileDistribution.tileCounts["stone"]).toBe(1);
    });

    it("should compute constraint satisfaction correctly", () => {
      const testGrid: (string | null)[][] = [
        ["grass", "water"],
        ["water", "stone"],
      ];

      const analysis = wfc.analyzeResult(testGrid, basicTiles, basicConstraints);

      expect(analysis.constraintAnalysis.totalConstraints).toBe(basicConstraints.length);
      expect(analysis.constraintAnalysis.satisfiedConstraints).toBeGreaterThanOrEqual(0);
      expect(analysis.constraintAnalysis.violatedConstraints).toBeGreaterThanOrEqual(0);
      expect(analysis.constraintAnalysis.satisfactionRate).toBeGreaterThanOrEqual(0);
      expect(analysis.constraintAnalysis.satisfactionRate).toBeLessThanOrEqual(1);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle generation with no tiles", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 3,
        height: 3,
        maxIterations: 100,
      };

      const result = wfc.generate2D(options, [], []);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Failed to generate");
    });

    it("should handle generation with impossible constraints", () => {
      const impossibleConstraints: Constraint[] = [
        { tile1: "grass", tile2: "water", direction: "north", bidirectional: true },
        { tile1: "water", tile2: "grass", direction: "north", bidirectional: true },
      ];

      const options: WaveFunctionCollapse2DOptions = {
        width: 3,
        height: 3,
        maxIterations: 100,
      };

      const result = wfc.generate2D(options, basicTiles, impossibleConstraints);

      // Should either succeed or fail gracefully
      expect(result.success).toBeDefined();
      expect(result.stats.contradictions).toBeGreaterThanOrEqual(0);
    });

    it("should handle very small grids", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 1,
        height: 1,
        maxIterations: 100,
      };

      const result = wfc.generate2D(options, basicTiles, basicConstraints);

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(1);
      expect(result.grid[0]).toHaveLength(1);
      expect(result.stats.totalCells).toBe(1);
    });

    it("should handle very large grids", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 50,
        height: 50,
        maxIterations: 1000,
      };

      const result = wfc.generate2D(options, basicTiles, basicConstraints);

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(50);
      expect(result.grid[0]).toHaveLength(50);
      expect(result.stats.totalCells).toBe(2500);
    });

    it("should handle maximum iterations exceeded", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 10,
        height: 10,
        maxIterations: 1, // Very low limit
      };

      const result = wfc.generate2D(options, basicTiles, basicConstraints);

      expect(result.stats.iterations).toBeLessThanOrEqual(1);
      expect(result.stats.collapsedCells).toBeLessThan(100);
    });

    it("should handle backtracking limits", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 5,
        height: 5,
        maxIterations: 1000,
        useBacktracking: true,
        maxBacktrackingAttempts: 1, // Very low limit
      };

      const result = wfc.generate2D(options, basicTiles, basicConstraints);

      expect(result.stats.backtrackingAttempts).toBeLessThanOrEqual(1);
    });
  });

  describe("Performance and Benchmarks", () => {
    it("should complete generation within reasonable time", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 20,
        height: 20,
        maxIterations: 5000,
      };

      const startTime = performance.now();
      const result = wfc.generate2D(options, basicTiles, basicConstraints);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.stats.executionTime).toBeGreaterThan(0);
    });

    it("should handle multiple generations efficiently", () => {
      const options: WaveFunctionCollapse2DOptions = {
        width: 10,
        height: 10,
        maxIterations: 1000,
      };

      const startTime = performance.now();

      for (let i = 0; i < 5; i++) {
        const result = wfc.generate2D(options, basicTiles, basicConstraints);
        expect(result.success).toBe(true);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10000); // Should complete 5 generations within 10 seconds
    });

    it("should maintain consistent performance across different grid sizes", () => {
      const sizes = [5, 10, 15, 20];
      const times: number[] = [];

      for (const size of sizes) {
        const options: WaveFunctionCollapse2DOptions = {
          width: size,
          height: size,
          maxIterations: 1000,
        };

        const startTime = performance.now();
        const result = wfc.generate2D(options, basicTiles, basicConstraints);
        const endTime = performance.now();

        expect(result.success).toBe(true);
        times.push(endTime - startTime);
      }

      // Performance should scale reasonably with grid size
      expect(times[3]).toBeGreaterThan(times[0]); // Larger grids should take longer
      expect(times[3]).toBeLessThan(times[0] * 20); // But not exponentially longer
    });
  });

  describe("Integration Tests", () => {
    it("should work with training and generation pipeline", () => {
      // Step 1: Train from input data
      const inputData = [
        ["grass", "water", "grass"],
        ["water", "stone", "water"],
        ["grass", "water", "grass"],
      ];

      const trainingResult = wfc.trainFromInput({
        inputData,
        patternSize: 2,
        includeRotations: true,
      });

      expect(trainingResult.success).toBe(true);

      // Step 2: Generate using learned tiles and constraints
      const generationResult = wfc.generate2D(
        { width: 8, height: 8, maxIterations: 1000 },
        trainingResult.tiles,
        trainingResult.constraints
      );

      expect(generationResult.success).toBe(true);
      expect(generationResult.grid).toHaveLength(8);
      expect(generationResult.grid[0]).toHaveLength(8);
    });

    it("should work with constraint-based generation and analysis", () => {
      const customConstraint = (position: any, tile: string) => {
        // Allow only 'grass' in the first row
        return position.y === 0 ? tile === "grass" : tile !== "grass";
      };

      const options: ConstraintBasedWaveFunctionCollapseOptions = {
        width: 5,
        height: 5,
        maxIterations: 1000,
        customConstraint,
      };

      const result = wfc.constraintBasedGenerate(options, basicTiles, basicConstraints);

      expect(result.success).toBe(true);

      // Analyze the result
      const analysis = wfc.analyzeResult(result.grid, basicTiles, basicConstraints);

      expect(analysis.tileDistribution.totalTiles).toBeGreaterThan(0);
      expect(analysis.constraintAnalysis.totalConstraints).toBe(basicConstraints.length);
    });

    it("should work with multi-scale generation and analysis", () => {
      const options: MultiScaleWaveFunctionCollapseOptions = {
        scales: [
          {
            scale: 1,
            width: 3,
            height: 3,
            tiles: basicTiles,
            constraints: basicConstraints,
          },
          {
            scale: 2,
            width: 6,
            height: 6,
            tiles: basicTiles,
            constraints: basicConstraints,
          },
        ],
        baseConfig: {
          maxIterations: 1000,
        },
      };

      const result = wfc.multiScaleGenerate(options);

      expect(result.success).toBe(true);

      // Analyze the final grid
      const analysis = wfc.analyzeResult(result.finalGrid, basicTiles, basicConstraints);

      expect(analysis.tileDistribution.totalTiles).toBeGreaterThan(0);
      expect(analysis.entropyAnalysis.averageEntropy).toBeGreaterThanOrEqual(0);
    });
  });
});
