/**
 * Flow Field Validation Tests
 * 
 * Comprehensive tests for flow field validation logic, including the fix
 * for Issue #1 - Flow Field Validation Logic Error.
 * 
 * @module algorithms/flowFieldValidationTests
 */

import { FlowField } from '../../pathfinding/flow-field/flow-field-core';
import { FlowFieldGenerator } from '../../pathfinding/flow-field/flow-field-generator';
import { CellType, FlowCell, IntegrationCell } from '../../pathfinding/flow-field/flow-field-types';
import { runBenchmark, assertPerformance } from '../utils/benchmark-utils';

describe('Flow Field Validation Logic', () => {
  let flowField: FlowField;

  beforeEach(() => {
    flowField = new FlowField();
  });

  describe('Issue #1: Flow Field Validation Logic Error', () => {
    it('should correctly identify valid cells with zero magnitude as errors', () => {
      // Create a flow field with a valid cell that has zero magnitude (inconsistent state)
      const flowFieldCells: FlowCell[] = [
        {
          x: 0,
          y: 0,
          vector: { x: 0, y: 0 },
          magnitude: 0,
          valid: true, // This is the problematic case - valid but no magnitude
        },
        {
          x: 1,
          y: 0,
          vector: { x: 1, y: 0 },
          magnitude: 1,
          valid: true, // This is correct - valid with magnitude
        },
      ];

      const integrationField: IntegrationCell[] = [
        { x: 0, y: 0, cost: 0, processed: true },
        { x: 1, y: 0, cost: 1, processed: true },
      ];

      const validation = flowField.validateFlowField(flowFieldCells, integrationField);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Valid flow cell at (0, 0) has zero magnitude');
    });

    it('should correctly identify invalid cells with non-zero magnitude as errors', () => {
      // Create a flow field with an invalid cell that has non-zero magnitude (inconsistent state)
      const flowFieldCells: FlowCell[] = [
        {
          x: 0,
          y: 0,
          vector: { x: 1, y: 0 },
          magnitude: 1,
          valid: false, // This is the problematic case - invalid but has magnitude
        },
        {
          x: 1,
          y: 0,
          vector: { x: 0, y: 0 },
          magnitude: 0,
          valid: false, // This is correct - invalid with no magnitude
        },
      ];

      const integrationField: IntegrationCell[] = [
        { x: 0, y: 0, cost: 0, processed: true },
        { x: 1, y: 0, cost: 1, processed: true },
      ];

      const validation = flowField.validateFlowField(flowFieldCells, integrationField);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid flow cell at (0, 0) has non-zero magnitude 1');
    });

    it('should pass validation for correctly structured flow field', () => {
      // Create a properly structured flow field
      const flowFieldCells: FlowCell[] = [
        {
          x: 0,
          y: 0,
          vector: { x: 1, y: 0 },
          magnitude: 1,
          valid: true, // Valid with magnitude - correct
        },
        {
          x: 1,
          y: 0,
          vector: { x: 0, y: 0 },
          magnitude: 0,
          valid: false, // Invalid with no magnitude - correct
        },
      ];

      const integrationField: IntegrationCell[] = [
        { x: 0, y: 0, cost: 0, processed: true },
        { x: 1, y: 0, cost: 1, processed: true },
      ];

      const validation = flowField.validateFlowField(flowFieldCells, integrationField);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should handle edge cases correctly', () => {
      // Test with cells at boundaries and special values
      const flowFieldCells: FlowCell[] = [
        {
          x: 0,
          y: 0,
          vector: { x: 0, y: 0 },
          magnitude: 0,
          valid: false, // Invalid with no magnitude - correct
        },
        {
          x: 1,
          y: 0,
          vector: { x: 0.0001, y: 0 },
          magnitude: 0.0001,
          valid: true, // Valid with very small magnitude - correct
        },
        {
          x: 2,
          y: 0,
          vector: { x: 0, y: 0 },
          magnitude: 0,
          valid: true, // Valid with zero magnitude - should be error
        },
      ];

      const integrationField: IntegrationCell[] = [
        { x: 0, y: 0, cost: 0, processed: true },
        { x: 1, y: 0, cost: 1, processed: true },
        { x: 2, y: 0, cost: 2, processed: true },
      ];

      const validation = flowField.validateFlowField(flowFieldCells, integrationField);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Valid flow cell at (2, 0) has zero magnitude');
    });
  });

  describe('Flow Field Validation Performance', () => {
    it('should validate large flow fields efficiently', async () => {
      // Create a large flow field for performance testing
      const width = 100;
      const height = 100;
      const flowFieldCells: FlowCell[] = [];
      const integrationField: IntegrationCell[] = [];

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = y * width + x;
          flowFieldCells.push({
            x,
            y,
            vector: { x: Math.random() - 0.5, y: Math.random() - 0.5 },
            magnitude: Math.random(),
            valid: Math.random() > 0.5,
          });
          integrationField.push({
            x,
            y,
            cost: Math.random() * 100,
            processed: true,
          });
        }
      }

      const report = await runBenchmark(
        'flow-field-validation-large',
        () => flowField.validateFlowField(flowFieldCells, integrationField),
        { samples: 10 }
      );

      // Assert performance is within acceptable bounds
      assertPerformance(report, {
        maxTime: 50, // Should validate 10,000 cells in under 50ms
        maxCoefficientOfVariation: 0.3,
      });

      expect(report.statistics.median).toBeLessThan(50);
      expect(report.assertions.stablePerformance).toBe(true);
    });

    it('should handle validation of mixed valid/invalid cells efficiently', async () => {
      // Create a flow field with mixed validity states
      const flowFieldCells: FlowCell[] = [];
      const integrationField: IntegrationCell[] = [];

      for (let i = 0; i < 1000; i++) {
        const isValid = i % 3 === 0; // Every third cell is valid
        const hasMagnitude = i % 2 === 0; // Every second cell has magnitude
        
        flowFieldCells.push({
          x: i % 50,
          y: Math.floor(i / 50),
          vector: { x: Math.random(), y: Math.random() },
          magnitude: hasMagnitude ? Math.random() : 0,
          valid: isValid,
        });
        
        integrationField.push({
          x: i % 50,
          y: Math.floor(i / 50),
          cost: Math.random() * 100,
          processed: true,
        });
      }

      const report = await runBenchmark(
        'flow-field-validation-mixed',
        () => flowField.validateFlowField(flowFieldCells, integrationField),
        { samples: 10 }
      );

      // Should handle mixed states efficiently
      assertPerformance(report, {
        maxTime: 20, // Should validate 1,000 cells in under 20ms
        maxCoefficientOfVariation: 0.3,
      });

      expect(report.statistics.median).toBeLessThan(20);
    });
  });

  describe('Integration with Flow Field Generation', () => {
    it('should validate generated flow fields correctly', () => {
      // Generate a real flow field and validate it
      const grid = new Array(10 * 10).fill(CellType.WALKABLE);
      const goals = [{ x: 9, y: 9 }];
      const config = {
        width: 10,
        height: 10,
        allowDiagonal: true,
        diagonalOnlyWhenClear: false,
        cardinalCost: 1,
        diagonalCost: 1.414,
        maxCost: 1000,
        useManhattanDistance: false,
        useEuclideanDistance: true,
        validateInput: true,
        enableCaching: false,
        tolerance: 1e-6,
      };

      const result = FlowFieldGenerator.generateFlowField(
        grid,
        goals,
        config,
        {
          returnIntegrationField: true,
          returnFlowField: true,
          normalizeFlowVectors: true,
          useEarlyTermination: true,
          maxIterations: 100,
          useGoalBounding: false,
          useMultiGoal: false,
        }
      );

      // Validate the generated flow field
      const validation = flowField.validateFlowField(result.flowField, result.integrationField);

      // The generated flow field should be valid
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect issues in corrupted flow fields', () => {
      // Generate a valid flow field, then corrupt it
      const grid = new Array(5 * 5).fill(CellType.WALKABLE);
      const goals = [{ x: 4, y: 4 }];
      const config = {
        width: 5,
        height: 5,
        allowDiagonal: true,
        diagonalOnlyWhenClear: false,
        cardinalCost: 1,
        diagonalCost: 1.414,
        maxCost: 1000,
        useManhattanDistance: false,
        useEuclideanDistance: true,
        validateInput: true,
        enableCaching: false,
        tolerance: 1e-6,
      };

      const result = FlowFieldGenerator.generateFlowField(
        grid,
        goals,
        config,
        {
          returnIntegrationField: true,
          returnFlowField: true,
          normalizeFlowVectors: true,
          useEarlyTermination: true,
          maxIterations: 25,
          useGoalBounding: false,
          useMultiGoal: false,
        }
      );

      // Corrupt the flow field by making a valid cell have zero magnitude
      result.flowField[0].magnitude = 0;
      result.flowField[0].valid = true;

      // Validate the corrupted flow field
      const validation = flowField.validateFlowField(result.flowField, result.integrationField);

      // Should detect the corruption
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(error => error.includes('zero magnitude'))).toBe(true);
    });
  });

  describe('Validation Options', () => {
    it('should respect validation options', () => {
      const flowFieldCells: FlowCell[] = [
        {
          x: 0,
          y: 0,
          vector: { x: 0, y: 0 },
          magnitude: 0,
          valid: true, // This should trigger an error
        },
      ];

      const integrationField: IntegrationCell[] = [
        { x: 0, y: 0, cost: 0, processed: true },
      ];

      // Test with flow field validation disabled
      const validationDisabled = flowField.validateFlowField(
        flowFieldCells,
        integrationField,
        { checkFlowFieldValidity: false }
      );

      expect(validationDisabled.isValid).toBe(true);
      expect(validationDisabled.errors).toHaveLength(0);

      // Test with flow field validation enabled
      const validationEnabled = flowField.validateFlowField(
        flowFieldCells,
        integrationField,
        { checkFlowFieldValidity: true }
      );

      expect(validationEnabled.isValid).toBe(false);
      expect(validationEnabled.errors.length).toBeGreaterThan(0);
    });
  });
});



