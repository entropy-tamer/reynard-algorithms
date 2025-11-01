/**
 * @file Calculation helpers for verification report generation
 */
import { IssueStatus, type IssueVerification, type PerformanceSummary, type TestCoverage } from './verification-types';

/**
 * Compute summary counts and success rate from issues
 * @param issues List of issues to summarize
 * @returns Summary counts and success rate
 * @example
 * const summary = calculateSummary(issues);
 */
export function calculateSummary(issues: IssueVerification[]) {
  const totalIssues = issues.length;
  const issuesFixed = issues.filter(i => i.status === IssueStatus.FIXED).length;
  const issuesVerified = issues.filter(i => i.status === IssueStatus.VERIFIED).length;
  const issuesFailed = issues.filter(i => i.status === IssueStatus.FAILED).length;
  const successRate = totalIssues > 0 ? (issuesVerified / totalIssues) * 100 : 0;

  return { totalIssues, issuesFixed, issuesVerified, issuesFailed, successRate };
}

/**
 * Aggregate simple coverage metrics across affected files
 * @param issues Issues with affected files and test results
 * @returns Aggregated test coverage metrics
 * @example
 * const coverage = calculateTestCoverage(issues);
 */
export function calculateTestCoverage(issues: IssueVerification[]): TestCoverage {
  const moduleCoverage: Record<string, number> = {};
  let totalCoverage = 0;
  let moduleCount = 0;

  for (const issue of issues) {
    for (const file of issue.affectedFiles) {
      const module = extractModuleName(file);
      if (!moduleCoverage[module]) moduleCoverage[module] = 0;
      const pct = issue.testResults.total > 0
        ? (issue.testResults.passed / issue.testResults.total) * 100
        : 0;
      moduleCoverage[module] += pct;
      totalCoverage += pct;
      moduleCount++;
    }
  }

  const overallCoverage = moduleCount > 0 ? totalCoverage / moduleCount : 0;
  const newTestsAdded = issues.reduce((sum, issue) => sum + issue.verificationTests.length, 0);

  return {
    overallCoverage,
    moduleCoverage,
    newTestsAdded,
    testsModified: 0,
    coverageImprovement: 0,
  };
}

/**
 * Summarize performance results across issues with before/after data
 * @param issues Issues containing performanceImpact data
 * @returns Performance summary across issues
 * @example
 * const perf = calculatePerformanceSummary(issues);
 */
export function calculatePerformanceSummary(issues: IssueVerification[]): PerformanceSummary {
  const performanceIssues = issues.filter(i => i.performanceImpact.before && i.performanceImpact.after);
  const improvements = performanceIssues.filter(i => i.performanceImpact.improvement > 0).length;
  const regressions = performanceIssues.filter(i => i.performanceImpact.regression).length;

  const averageChange = performanceIssues.length > 0
    ? performanceIssues.reduce((sum, i) => sum + i.performanceImpact.improvement, 0) / performanceIssues.length
    : 0;

  const bestImprovement = performanceIssues.reduce((best, issue) => {
    if (issue.performanceImpact.improvement > best.improvement) {
      return { issue: issue.issueNumber, improvement: issue.performanceImpact.improvement };
    }
    return best;
  }, { issue: 0, improvement: 0 });

  const worstRegression = performanceIssues.reduce((worst, issue) => {
    if (issue.performanceImpact.improvement < worst.regression) {
      return { issue: issue.issueNumber, regression: issue.performanceImpact.improvement };
    }
    return worst;
  }, { issue: 0, regression: 0 });

  return {
    totalBenchmarks: performanceIssues.length,
    improvements,
    regressions,
    averageChange,
    bestImprovement,
    worstRegression,
  };
}

/**
 * Extract top-level module name after 'src' in a path
 * @param filePath File path string
 * @returns Module name or 'unknown'
 * @example
 * extractModuleName('packages/core/algorithms/src/utils/file.ts');
 */
function extractModuleName(filePath: string): string {
  const parts = filePath.split('/');
  const srcIndex = parts.indexOf('src');
  if (srcIndex >= 0 && srcIndex < parts.length - 1) return parts[srcIndex + 1];
  return 'unknown';
}


