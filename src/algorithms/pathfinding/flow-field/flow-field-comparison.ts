/**
 * Flow Field Comparison Operations
 *
 * Handles comparison and analysis of flow fields for debugging,
 * optimization, and validation purposes.
 *
 * @module algorithms/pathfinding/flow-field
 */

import type {
  Point,
  FlowCell,
  IntegrationCell,
  FlowFieldStats,
  FlowFieldResult,
  FlowFieldComparisonOptions,
  FlowFieldComparisonResult,
} from "./flow-field-types";

/**
 * Compare two flow fields
 *
 * @param flowField1 First flow field
 * @param flowField2 Second flow field
 * @param width Grid width
 * @param height Grid height
 * @param options Comparison options
 * @returns Comparison result
 * @example
 */
export function compareFlowFields(
  flowField1: FlowCell[],
  flowField2: FlowCell[],
  width: number,
  height: number,
  options: Partial<FlowFieldComparisonOptions> = {}
): FlowFieldComparisonResult {
  const comparisonOptions: FlowFieldComparisonOptions = {
    tolerance: 1e-10,
    compareMagnitudes: true,
    compareDirections: true,
    compareIntegrationFields: false,
    detailedAnalysis: false,
    ...options,
  };

  const differences: string[] = [];
  const stats = {
    totalCells: width * height,
    identicalCells: 0,
    differentCells: 0,
    magnitudeDifferences: 0,
    directionDifferences: 0,
    maxMagnitudeDifference: 0,
    averageMagnitudeDifference: 0,
  };

  let totalMagnitudeDifference = 0;

  // Validate dimensions
  if (flowField1.length !== flowField2.length || flowField1.length !== width * height) {
    return {
      areEquivalent: false,
      identical: false,
      integrationFieldSimilarity: 0,
      flowFieldSimilarity: 0,
      overallSimilarity: 0,
      executionTimeDifference: 0,
      memoryUsageDifference: 0,
      differencesCount: 1,
      differences: ["Flow field dimensions do not match"],
      similarity: 0,
    };
  }

  // Compare each cell
  for (let i = 0; i < flowField1.length; i++) {
    const cell1 = flowField1[i];
    const cell2 = flowField2[i];
    const point = { x: i % width, y: Math.floor(i / width) };

    const cellComparison = compareFlowCells(cell1, cell2, comparisonOptions.tolerance);

    if (cellComparison.identical) {
      stats.identicalCells++;
    } else {
      stats.differentCells++;

      if (comparisonOptions.detailedAnalysis) {
        if (cellComparison.magnitudeDifferent) {
          differences.push(
            `Magnitude difference at (${point.x}, ${point.y}): ${cell1.magnitude} vs ${cell2.magnitude}`
          );
          stats.magnitudeDifferences++;
        }

        if (cellComparison.directionDifferent) {
          differences.push(
            `Direction difference at (${point.x}, ${point.y}): (${cell1.x}, ${cell1.y}) vs (${cell2.x}, ${cell2.y})`
          );
          stats.directionDifferences++;
        }
      }

      const magnitudeDiff = Math.abs(cell1.magnitude - cell2.magnitude);
      totalMagnitudeDifference += magnitudeDiff;
      stats.maxMagnitudeDifference = Math.max(stats.maxMagnitudeDifference, magnitudeDiff);
    }
  }

  stats.averageMagnitudeDifference = stats.differentCells > 0 ? totalMagnitudeDifference / stats.differentCells : 0;

  const similarity = stats.identicalCells / stats.totalCells;
  const identical = similarity === 1;

  return {
    areEquivalent: identical,
    identical,
    integrationFieldSimilarity: 0,
    flowFieldSimilarity: similarity,
    overallSimilarity: similarity,
    executionTimeDifference: 0,
    memoryUsageDifference: 0,
    differencesCount: differences.length,
    differences,
    similarity,
  };
}

/**
 * Compare two integration fields
 *
 * @param integrationField1 First integration field
 * @param integrationField2 Second integration field
 * @param width Grid width
 * @param height Grid height
 * @param tolerance Comparison tolerance
 * @returns Comparison result
 * @example
 */
export function compareIntegrationFields(
  integrationField1: IntegrationCell[],
  integrationField2: IntegrationCell[],
  width: number,
  height: number,
  tolerance: number = 1e-10
): FlowFieldComparisonResult {
  const differences: string[] = [];
  const stats = {
    totalCells: width * height,
    identicalCells: 0,
    differentCells: 0,
    magnitudeDifferences: 0,
    directionDifferences: 0,
    maxMagnitudeDifference: 0,
    averageMagnitudeDifference: 0,
  };

  let totalCostDifference = 0;

  // Validate dimensions
  if (integrationField1.length !== integrationField2.length || integrationField1.length !== width * height) {
    return {
      areEquivalent: false,
      identical: false,
      integrationFieldSimilarity: 0,
      flowFieldSimilarity: 0,
      overallSimilarity: 0,
      executionTimeDifference: 0,
      memoryUsageDifference: 0,
      differencesCount: 1,
      differences: ["Integration field dimensions do not match"],
      similarity: 0,
    };
  }

  // Compare each cell
  for (let i = 0; i < integrationField1.length; i++) {
    const cell1 = integrationField1[i];
    const cell2 = integrationField2[i];
    const point = { x: i % width, y: Math.floor(i / width) };

    const costDiff = Math.abs(cell1.cost - cell2.cost);

    if (costDiff <= tolerance) {
      stats.identicalCells++;
    } else {
      stats.differentCells++;
      totalCostDifference += costDiff;
      stats.maxMagnitudeDifference = Math.max(stats.maxMagnitudeDifference, costDiff);

      differences.push(`Cost difference at (${point.x}, ${point.y}): ${cell1.cost} vs ${cell2.cost}`);
    }
  }

  stats.averageMagnitudeDifference = stats.differentCells > 0 ? totalCostDifference / stats.differentCells : 0;

  const similarity = stats.identicalCells / stats.totalCells;
  const identical = similarity === 1;

  return {
    areEquivalent: identical,
    identical,
    integrationFieldSimilarity: similarity,
    flowFieldSimilarity: 0,
    overallSimilarity: similarity,
    executionTimeDifference: 0,
    memoryUsageDifference: 0,
    differencesCount: differences.length,
    differences,
    similarity,
  };
}

/**
 * Compare flow field statistics
 *
 * @param stats1 First statistics
 * @param stats2 Second statistics
 * @param tolerance Comparison tolerance
 * @returns Comparison result
 * @example
 */
export function compareStats(
  stats1: FlowFieldStats,
  stats2: FlowFieldStats,
  tolerance: number = 1e-10
): { identical: boolean; differences: string[] } {
  const differences: string[] = [];

  // Compare numeric properties
  const numericProps: (keyof FlowFieldStats)[] = [
    "cellsProcessed",
    "goalCells",
    "obstacleCells",
    "walkableCells",
    "maxIntegrationCost",
    "minIntegrationCost",
    "averageIntegrationCost",
    "executionTime",
  ];

  for (const prop of numericProps) {
    const val1 = stats1[prop] as number;
    const val2 = stats2[prop] as number;
    const diff = Math.abs(val1 - val2);

    if (diff > tolerance) {
      differences.push(`${prop}: ${val1} vs ${val2} (diff: ${diff})`);
    }
  }

  // Compare boolean properties
  if (stats1.success !== stats2.success) {
    differences.push(`success: ${stats1.success} vs ${stats2.success}`);
  }

  return {
    identical: differences.length === 0,
    differences,
  };
}

/**
 * Compare two flow field results
 *
 * @param result1 First flow field result
 * @param result2 Second flow field result
 * @param options Comparison options
 * @returns Comparison result
 * @example
 */
export function compareFlowFieldResults(
  result1: FlowFieldResult,
  result2: FlowFieldResult,
  options: Partial<FlowFieldComparisonOptions> = {}
): FlowFieldComparisonResult {
  const comparisonOptions: FlowFieldComparisonOptions = {
    tolerance: 1e-10,
    compareMagnitudes: true,
    compareDirections: true,
    compareIntegrationFields: true,
    detailedAnalysis: true,
    ...options,
  };

  const differences: string[] = [];
  const stats = {
    totalCells: 0,
    identicalCells: 0,
    differentCells: 0,
    magnitudeDifferences: 0,
    directionDifferences: 0,
    maxMagnitudeDifference: 0,
    averageMagnitudeDifference: 0,
  };

  // Compare flow fields
  if (result1.flowField && result2.flowField && result1.width && result1.height) {
    const flowFieldComparison = compareFlowFields(
      result1.flowField,
      result2.flowField,
      result1.width,
      result1.height,
      comparisonOptions
    );

    differences.push(...flowFieldComparison.differences);
    Object.assign(stats, flowFieldComparison.stats);
  }

  // Compare integration fields
  if (
    comparisonOptions.compareIntegrationFields &&
    result1.integrationField &&
    result2.integrationField &&
    result1.width &&
    result1.height
  ) {
    const integrationComparison = compareIntegrationFields(
      result1.integrationField,
      result2.integrationField,
      result1.width,
      result1.height,
      comparisonOptions.tolerance || 1e-10
    );

    differences.push(...integrationComparison.differences);
  }

  // Compare statistics
  if (result1.stats && result2.stats) {
    const statsComparison = compareStats(result1.stats, result2.stats, comparisonOptions.tolerance);
    differences.push(...statsComparison.differences);
  }

  const similarity = stats.totalCells > 0 ? stats.identicalCells / stats.totalCells : 1;
  const identical = differences.length === 0;

  return {
    areEquivalent: identical,
    identical,
    integrationFieldSimilarity: comparisonOptions.compareIntegrationFields ? similarity : 0,
    flowFieldSimilarity: comparisonOptions.compareFlowFields ? similarity : 0,
    overallSimilarity: similarity,
    executionTimeDifference: (result1.stats?.executionTime || 0) - (result2.stats?.executionTime || 0),
    memoryUsageDifference: 0,
    differencesCount: differences.length,
    differences,
    similarity,
  };
}

/**
 * Compare two flow cells
 *
 * @param cell1 First flow cell
 * @param cell2 Second flow cell
 * @param tolerance Comparison tolerance
 * @returns Cell comparison result
 * @example
 */
function compareFlowCells(
  cell1: FlowCell,
  cell2: FlowCell,
  tolerance: number
): {
  identical: boolean;
  magnitudeDifferent: boolean;
  directionDifferent: boolean;
} {
  const magnitudeDiff = Math.abs(cell1.magnitude - cell2.magnitude);
  const directionDiff = Math.abs(cell1.x - cell2.x) + Math.abs(cell1.y - cell2.y);

  const magnitudeDifferent = magnitudeDiff > tolerance;
  const directionDifferent = directionDiff > tolerance;
  const identical = !magnitudeDifferent && !directionDifferent;

  return {
    identical,
    magnitudeDifferent,
    directionDifferent,
  };
}

/**
 * Calculate flow field similarity score
 *
 * @param flowField1 First flow field
 * @param flowField2 Second flow field
 * @param width Grid width
 * @param height Grid height
 * @returns Similarity score (0-1)
 * @example
 */
export function calculateSimilarity(
  flowField1: FlowCell[],
  flowField2: FlowCell[],
  width: number,
  height: number
): number {
  if (flowField1.length !== flowField2.length || flowField1.length !== width * height) {
    return 0;
  }

  let totalSimilarity = 0;
  let validCells = 0;

  for (let i = 0; i < flowField1.length; i++) {
    const cell1 = flowField1[i];
    const cell2 = flowField2[i];

    // Skip cells with zero magnitude in both fields
    if (cell1.magnitude === 0 && cell2.magnitude === 0) {
      totalSimilarity += 1;
      validCells++;
      continue;
    }

    // Calculate cosine similarity for direction
    const dotProduct = cell1.x * cell2.x + cell1.y * cell2.y;
    const magnitude1 = Math.sqrt(cell1.x * cell1.x + cell1.y * cell1.y);
    const magnitude2 = Math.sqrt(cell2.x * cell2.x + cell2.y * cell2.y);

    if (magnitude1 === 0 || magnitude2 === 0) {
      continue;
    }

    const cosineSimilarity = dotProduct / (magnitude1 * magnitude2);
    const magnitudeSimilarity =
      1 - Math.abs(cell1.magnitude - cell2.magnitude) / Math.max(cell1.magnitude, cell2.magnitude);

    const cellSimilarity = (cosineSimilarity + magnitudeSimilarity) / 2;
    totalSimilarity += Math.max(0, cellSimilarity);
    validCells++;
  }

  return validCells > 0 ? totalSimilarity / validCells : 0;
}

/**
 * Find differences between flow fields
 *
 * @param flowField1 First flow field
 * @param flowField2 Second flow field
 * @param width Grid width
 * @param height Grid height
 * @param threshold Difference threshold
 * @returns Array of difference points
 * @example
 */
export function findDifferences(
  flowField1: FlowCell[],
  flowField2: FlowCell[],
  width: number,
  height: number,
  threshold: number = 1e-10
): Point[] {
  const differences: Point[] = [];

  for (let i = 0; i < flowField1.length; i++) {
    const cell1 = flowField1[i];
    const cell2 = flowField2[i];
    const point = { x: i % width, y: Math.floor(i / width) };

    const magnitudeDiff = Math.abs(cell1.magnitude - cell2.magnitude);
    const directionDiff = Math.abs(cell1.x - cell2.x) + Math.abs(cell1.y - cell2.y);

    if (magnitudeDiff > threshold || directionDiff > threshold) {
      differences.push(point);
    }
  }

  return differences;
}
