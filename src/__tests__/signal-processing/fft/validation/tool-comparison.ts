/**
 * Linux Tools Comparison
 *
 * Aggregates results from ffmpeg and sox comparisons and generates reports.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Tool comparison result
 */
export interface ToolComparisonResult {
  tool: string;
  testFile: string;
  success: boolean;
  outputFiles: string[];
  notes: string[];
}

/**
 * Comparison report
 */
export interface ToolComparisonReport {
  tool: string;
  totalTests: number;
  successful: number;
  failed: number;
  results: ToolComparisonResult[];
  summary: string;
}

/**
 * Check if tool output files exist
 */
function checkToolOutputs(outputDir: string, testName: string): {
  exists: boolean;
  files: string[];
} {
  const possibleFiles = [
    `${testName}_freq.png`,
    `${testName}_spectrum.png`,
    `${testName}_spectrogram.png`,
    `${testName}_freq.txt`,
  ];

  const existingFiles: string[] = [];
  for (const file of possibleFiles) {
    const fullPath = join(outputDir, file);
    if (existsSync(fullPath)) {
      existingFiles.push(file);
    }
  }

  return {
    exists: existingFiles.length > 0,
    files: existingFiles,
  };
}

/**
 * Generate comparison report for a tool
 */
export function generateToolReport(tool: string, outputDir: string): ToolComparisonReport {
  const testFiles = ["tone_440hz", "chord", "noise", "chirp"];
  const results: ToolComparisonResult[] = [];

  for (const testFile of testFiles) {
    const check = checkToolOutputs(outputDir, testFile);
    results.push({
      tool,
      testFile,
      success: check.exists,
      outputFiles: check.files,
      notes: check.exists
        ? [`Generated ${check.files.length} output file(s)`]
        : ["No output files found. Make sure the tool script ran successfully."],
    });
  }

  const successful = results.filter((r) => r.success).length;
  const failed = results.length - successful;

  let summary = `${tool} comparison: ${successful}/${results.length} tests generated output files.`;
  if (failed > 0) {
    summary += ` ${failed} test(s) did not produce expected output files.`;
  }

  return {
    tool,
    totalTests: results.length,
    successful,
    failed,
    results,
    summary,
  };
}

/**
 * Generate combined report for all tools
 */
export function generateCombinedReport(
  ffmpegDir: string = "/tmp/fft-validation/ffmpeg_output",
  soxDir: string = "/tmp/fft-validation/sox_output"
): string {
  const reports: ToolComparisonReport[] = [];

  if (existsSync(ffmpegDir)) {
    reports.push(generateToolReport("ffmpeg", ffmpegDir));
  }

  if (existsSync(soxDir)) {
    reports.push(generateToolReport("sox", soxDir));
  }

  let output = "=".repeat(80) + "\n";
  output += "Linux Tools FFT Comparison Report\n";
  output += "=".repeat(80) + "\n\n";

  for (const report of reports) {
    output += `Tool: ${report.tool}\n`;
    output += `  Total Tests: ${report.totalTests}\n`;
    output += `  Successful: ${report.successful}\n`;
    output += `  Failed: ${report.failed}\n`;
    output += `  Summary: ${report.summary}\n\n`;

    output += "  Detailed Results:\n";
    for (const result of report.results) {
      output += `    ${result.testFile}: ${result.success ? "✓" : "✗"}\n`;
      if (result.outputFiles.length > 0) {
        output += `      Files: ${result.outputFiles.join(", ")}\n`;
      }
      for (const note of result.notes) {
        output += `      Note: ${note}\n`;
      }
    }
    output += "\n";
  }

  output += "=".repeat(80) + "\n";
  output += "\n";
  output += "Next Steps:\n";
  output += "1. Compare visual outputs (spectrograms) with our FFT visualizations\n";
  output += "2. Extract numerical data from tool outputs for direct comparison\n";
  output += "3. Use the same audio files as input to our FFT implementation\n";
  output += "4. Document differences in frequency resolution and windowing\n";

  return output;
}

/**
 * Document tool usage and differences
 */
export function documentToolUsage(): string {
  return `
Linux FFT Tools Documentation
==============================

FFmpeg:
  - showfreqs filter: Generates frequency visualization
  - showspectrum filter: Generates spectrogram
  - Usage: ffmpeg -i input.wav -af "showfreqs=mode=line" output.png
  - Note: Primarily visual output, numerical data extraction requires parsing

SoX:
  - spectrogram: Generates spectrogram images
  - stat -freq: Provides frequency statistics
  - Usage: sox input.wav -n spectrogram -o output.png
  - Note: Good for visual comparison, limited numerical output

Comparison Strategy:
  1. Generate same test signals with both tools and our implementation
  2. Compare visual outputs (spectrograms, frequency plots)
  3. Extract peak frequencies and compare magnitudes
  4. Document windowing differences and frequency resolution
  5. Note any scaling or normalization differences

Limitations:
  - Tools primarily generate visualizations, not raw FFT data
  - Direct numerical comparison requires parsing images or using tool-specific APIs
  - Window functions and scaling may differ between implementations
  - Sample rate and FFT size may vary
`;
}

