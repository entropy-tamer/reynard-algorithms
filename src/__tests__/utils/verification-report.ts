/**
 * Verification Report System
 *
 * Provides comprehensive verification reporting for algorithm fixes,
 * including issue tracking, performance impact analysis, and test coverage.
 *
 * @file Verification report generation utilities and class
 * @module algorithms/verificationReport
 */

import type { BenchmarkReport } from "./benchmark-utils";
import {
  IssueStatus,
  type IssueVerification,
  type TestCoverage,
  type PerformanceSummary,
  type VerificationReport,
} from "./verification-types";
import { calculateSummary, calculateTestCoverage, calculatePerformanceSummary } from "./verification-calculations";
import { generateRecommendations, generateNextSteps } from "./verification-recommendations";
import { generateMarkdown } from "./verification-markdown";
// Re-export IssueStatus so tests can import from this module directly
export { IssueStatus } from "./verification-types";

/**
 * Verification report generator
 */
export class VerificationReportGenerator {
  private issues: IssueVerification[] = [];
  private startTime: number = Date.now();

  /**
   * Add an issue to the verification report
   * @param issue Issue details without status (status is initialized internally)
   * @example
   * generator.addIssue({ issueNumber: 1, title: 'Fix bug', description: '...', affectedFiles: [], fixDescription: '...', verificationTests: [], testResults: { passed: 0, failed: 0, skipped: 0, total: 0 }, performanceImpact: { before: null, after: null, improvement: 0, regression: false }, breakingChanges: [], notes: [] });
   */
  public addIssue(issue: Omit<IssueVerification, "status">): void {
    this.issues.push({
      ...issue,
      status: IssueStatus.PENDING,
    });
  }

  /**
   * Update issue status
   * @param issueNumber Issue identifier
   * @param status New status to set
   * @example
   * generator.updateIssueStatus(42, IssueStatus.VERIFIED);
   */
  public updateIssueStatus(issueNumber: number, status: IssueStatus): void {
    const issue = this.issues.find(i => i.issueNumber === issueNumber);
    if (issue) {
      issue.status = status;
    }
  }

  /**
   * Update issue verification results
   * @param issueNumber Issue identifier
   * @param updates Partial update object for verification fields
   * @example
   * generator.updateIssueVerification(1, { notes: ['Checked manually'] });
   */
  public updateIssueVerification(
    issueNumber: number,
    updates: Partial<Omit<IssueVerification, "issueNumber" | "status">>
  ): void {
    const issue = this.issues.find(i => i.issueNumber === issueNumber);
    if (issue) {
      Object.assign(issue, updates);
    }
  }

  /**
   * Add performance data to an issue
   * @param issueNumber Issue identifier
   * @param before Benchmark report before the fix
   * @param after Benchmark report after the fix
   * @example
   * generator.addPerformanceData(1, beforeReport, afterReport);
   */
  public addPerformanceData(issueNumber: number, before: BenchmarkReport | null, after: BenchmarkReport | null): void {
    const issue = this.issues.find(i => i.issueNumber === issueNumber);
    if (issue) {
      const improvement =
        before && after ? ((before.statistics.median - after.statistics.median) / before.statistics.median) * 100 : 0;

      issue.performanceImpact = {
        before,
        after,
        improvement,
        regression: improvement < 0,
      };
    }
  }

  /**
   * Generate the final verification report
   * @returns Full verification report snapshot
   * @example
   * const report = generator.generateReport();
   */
  public generateReport(): VerificationReport {
    const endTime = Date.now();
    const executionTime = endTime - this.startTime;

    const summary = calculateSummary(this.issues);
    const testCoverage = calculateTestCoverage(this.issues);
    const performance = calculatePerformanceSummary(this.issues);
    const recommendations = generateRecommendations(this.issues);
    const nextSteps = generateNextSteps(this.issues);

    return {
      metadata: {
        timestamp: Date.now(),
        version: "1.0.0",
        generator: "Algorithm Fixes Verification System",
        executionTime,
      },
      summary,
      issues: this.issues,
      testCoverage,
      performance,
      recommendations,
      nextSteps,
    };
  }

  /**
   * Calculate summary statistics
   */
  // moved to verification-calculations.ts

  /**
   * Calculate test coverage information
   */
  // moved to verification-calculations.ts

  /**
   * Calculate performance summary
   */
  // moved to verification-calculations.ts

  /**
   * Generate recommendations
   */
  // moved to verification-recommendations.ts

  /**
   * Generate next steps
   */
  // moved to verification-recommendations.ts

  /**
   * Extract module name from file path
   */
  // moved helper into calculations module

  /**
   * Save report to file
   * @param filePath Destination path for the JSON report
   * @example
   * generator.saveReport('reports/verification.json');
   */
  public saveReport(filePath: string): void {
    const fs = require("fs");
    const path = require("path");

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const report = this.generateReport();
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  }

  /**
   * Generate markdown report
   * @returns Markdown string of the verification report
   * @example
   * const md = generator.generateMarkdownReport();
   */
  public generateMarkdownReport(): string {
    const report = this.generateReport();
    return generateMarkdown(report);
  }
}

/**
 * Global verification report generator
 */
export const verificationReportGenerator = new VerificationReportGenerator();
