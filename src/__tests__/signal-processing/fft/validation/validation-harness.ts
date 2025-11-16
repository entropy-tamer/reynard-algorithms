/**
 * FFT Validation Harness
 *
 * Reads JSON results from Python (SciPy/NumPy) scripts and compares
 * with our FFT implementations. Generates validation reports.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { FFTFactory } from "../../../../algorithms/signal-processing/fft/fft-factory";
import { FFTAlgorithm, type FFTResult, type FFTConfig } from "../../../../algorithms/signal-processing/fft/fft-types";

/**
 * Reference result from Python (SciPy/NumPy)
 */
interface ReferenceResult {
  real: number[];
  imag: number[];
  magnitude: number[];
  phase: number[];
  power: number[];
  size: number;
}

/**
 * Test case from Python script
 */
interface TestCase {
  name: string;
  signal: number[];
  scipy: ReferenceResult;
  numpy: ReferenceResult;
}

/**
 * Validation results
 */
interface ValidationResult {
  testCase: string;
  algorithm: string;
  passed: boolean;
  errors: {
    real: number;
    imag: number;
    magnitude: number;
    phase: number;
    power: number;
  };
  maxError: number;
  meanError: number;
}

/**
 * Validation report
 */
interface ValidationReport {
  totalTests: number;
  passed: number;
  failed: number;
  results: ValidationResult[];
  summary: {
    averageMaxError: number;
    averageMeanError: number;
    worstCase: string;
  };
}

/**
 * Compare two FFT results with tolerance
 */
function compareResults(
  our: FFTResult,
  reference: ReferenceResult,
  tolerance: number = 1e-5
): { passed: boolean; errors: ValidationResult["errors"]; maxError: number; meanError: number } {
  const errors = {
    real: 0,
    imag: 0,
    magnitude: 0,
    phase: 0,
    power: 0,
  };

  let maxError = 0;
  let totalError = 0;
  let count = 0;

  const size = Math.min(our.real.length, reference.real.length);

  for (let i = 0; i < size; i++) {
    // Real part error
    const realError = Math.abs(our.real[i] - reference.real[i]);
    errors.real += realError;
    maxError = Math.max(maxError, realError);
    totalError += realError;
    count++;

    // Imaginary part error
    const imagError = Math.abs(our.imag[i] - reference.imag[i]);
    errors.imag += imagError;
    maxError = Math.max(maxError, imagError);
    totalError += imagError;
    count++;

    // Magnitude error
    const magError = Math.abs(our.magnitude[i] - reference.magnitude[i]);
    errors.magnitude += magError;
    maxError = Math.max(maxError, magError);
    totalError += magError;
    count++;

    // Phase error (handle wrap-around)
    let phaseError = Math.abs(our.phase[i] - reference.phase[i]);
    if (phaseError > Math.PI) {
      phaseError = 2 * Math.PI - phaseError;
    }
    errors.phase += phaseError;
    maxError = Math.max(maxError, phaseError);
    totalError += phaseError;
    count++;

    // Power error
    const powerError = Math.abs(our.power[i] - reference.power[i]);
    errors.power += powerError;
    maxError = Math.max(maxError, powerError);
    totalError += powerError;
    count++;
  }

  // Average errors
  errors.real /= size;
  errors.imag /= size;
  errors.magnitude /= size;
  errors.phase /= size;
  errors.power /= size;

  const meanError = count > 0 ? totalError / count : 0;
  const passed = maxError < tolerance;

  return { passed, errors, maxError, meanError };
}

/**
 * Validate FFT implementation against reference
 */
export function validateFFTImplementation(
  testCase: TestCase,
  algorithm: FFTAlgorithm,
  config: Partial<FFTConfig> = {}
): ValidationResult {
  const signal = new Float32Array(testCase.signal);
  const size = signal.length;

  const fftConfig: FFTConfig = {
    size,
    algorithm,
    normalize: false,
    ...config,
  };

  // Create FFT instance
  const fft = FFTFactory.create(fftConfig);

  // Compute FFT
  const ourResult = fft.forward(signal);

  // Compare with SciPy result (primary reference)
  const comparison = compareResults(ourResult, testCase.scipy, 1e-4);

  return {
    testCase: testCase.name,
    algorithm,
    passed: comparison.passed,
    errors: comparison.errors,
    maxError: comparison.maxError,
    meanError: comparison.meanError,
  };
}

/**
 * Load test cases from JSON file
 */
export function loadTestCases(filePath: string): TestCase[] {
  try {
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    return data.test_cases || [];
  } catch (error) {
    console.error(`Error loading test cases from ${filePath}:`, error);
    return [];
  }
}

/**
 * Run validation suite
 */
export function runValidationSuite(
  testCases: TestCase[],
  algorithms: FFTAlgorithm[] = [FFTAlgorithm.AUTO, FFTAlgorithm.RADIX_2, FFTAlgorithm.RADIX_4]
): ValidationReport {
  const results: ValidationResult[] = [];

  for (const testCase of testCases) {
    // Skip if size is not supported
    const size = testCase.signal.length;
    if (size <= 0 || !Number.isInteger(size)) {
      continue;
    }

    for (const algorithm of algorithms) {
      // Check if algorithm supports this size
      if (!FFTFactory.isSizeSupported(algorithm, size)) {
        continue;
      }

      try {
        const result = validateFFTImplementation(testCase, algorithm);
        results.push(result);
      } catch (error) {
        console.error(`Error validating ${testCase.name} with ${algorithm}:`, error);
        results.push({
          testCase: testCase.name,
          algorithm,
          passed: false,
          errors: { real: Infinity, imag: Infinity, magnitude: Infinity, phase: Infinity, power: Infinity },
          maxError: Infinity,
          meanError: Infinity,
        });
      }
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  // Calculate summary statistics
  const maxErrors = results.map((r) => r.maxError).filter((e) => isFinite(e));
  const meanErrors = results.map((r) => r.meanError).filter((e) => isFinite(e));

  const averageMaxError = maxErrors.length > 0 ? maxErrors.reduce((a, b) => a + b, 0) / maxErrors.length : 0;
  const averageMeanError = meanErrors.length > 0 ? meanErrors.reduce((a, b) => a + b, 0) / meanErrors.length : 0;

  const worstCase = results.reduce((worst, current) => {
    return current.maxError > worst.maxError ? current : worst;
  }, results[0] || { testCase: "none", algorithm: "none", passed: false, errors: { real: 0, imag: 0, magnitude: 0, phase: 0, power: 0 }, maxError: 0, meanError: 0 });

  return {
    totalTests: results.length,
    passed,
    failed,
    results,
    summary: {
      averageMaxError,
      averageMeanError,
      worstCase: `${worstCase.testCase} (${worstCase.algorithm})`,
    },
  };
}

/**
 * Generate validation report as string
 */
export function generateReport(report: ValidationReport): string {
  let output = "=".repeat(80) + "\n";
  output += "FFT Validation Report\n";
  output += "=".repeat(80) + "\n\n";

  output += `Total Tests: ${report.totalTests}\n`;
  output += `Passed: ${report.passed} (${((report.passed / report.totalTests) * 100).toFixed(1)}%)\n`;
  output += `Failed: ${report.failed} (${((report.failed / report.totalTests) * 100).toFixed(1)}%)\n\n`;

  output += "Summary Statistics:\n";
  output += `  Average Max Error: ${report.summary.averageMaxError.toExponential(3)}\n`;
  output += `  Average Mean Error: ${report.summary.averageMeanError.toExponential(3)}\n`;
  output += `  Worst Case: ${report.summary.worstCase}\n\n`;

  output += "Detailed Results:\n";
  output += "-".repeat(80) + "\n";

  for (const result of report.results) {
    output += `\nTest: ${result.testCase} (${result.algorithm})\n`;
    output += `  Status: ${result.passed ? "PASS" : "FAIL"}\n`;
    output += `  Max Error: ${result.maxError.toExponential(3)}\n`;
    output += `  Mean Error: ${result.meanError.toExponential(3)}\n`;
    output += `  Errors - Real: ${result.errors.real.toExponential(3)}, `;
    output += `Imag: ${result.errors.imag.toExponential(3)}, `;
    output += `Mag: ${result.errors.magnitude.toExponential(3)}, `;
    output += `Phase: ${result.errors.phase.toExponential(3)}, `;
    output += `Power: ${result.errors.power.toExponential(3)}\n`;
  }

  output += "\n" + "=".repeat(80) + "\n";

  return output;
}

/**
 * Main validation function
 */
export function validateAgainstReference(
  referenceFile: string = "/tmp/fft-validation/scipy_numpy_results.json",
  algorithms: FFTAlgorithm[] = [FFTAlgorithm.AUTO]
): ValidationReport {
  console.log("Loading test cases from", referenceFile);
  const testCases = loadTestCases(referenceFile);

  if (testCases.length === 0) {
    console.warn("No test cases loaded. Make sure to run the Python comparison script first.");
    return {
      totalTests: 0,
      passed: 0,
      failed: 0,
      results: [],
      summary: {
        averageMaxError: 0,
        averageMeanError: 0,
        worstCase: "none",
      },
    };
  }

  console.log(`Loaded ${testCases.length} test cases`);
  console.log("Running validation suite...");

  const report = runValidationSuite(testCases, algorithms);

  console.log("\n" + generateReport(report));

  return report;
}

