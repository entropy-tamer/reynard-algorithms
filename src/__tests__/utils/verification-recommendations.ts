/**
 * @file Recommendation and next-step generators for verification reports
 */
import { IssueStatus, type IssueVerification } from "./verification-types";

/**
 * Generate actionable recommendations based on issues and their status/perf
 * @param issues Issues to analyze for recommendations
 * @returns List of recommendation strings
 * @example
 * const recs = generateRecommendations(issues);
 */
export function generateRecommendations(issues: IssueVerification[]): string[] {
  const recommendations: string[] = [];
  const failedIssues = issues.filter(i => i.status === IssueStatus.FAILED);
  const regressions = issues.filter(i => i.performanceImpact.regression);

  if (failedIssues.length > 0) {
    recommendations.push(`${failedIssues.length} issues failed verification and need attention`);
  }

  if (regressions.length > 0) {
    recommendations.push(`${regressions.length} issues show performance regressions and should be optimized`);
  }

  const lowCoverage = issues.filter(i => i.testResults.total > 0 && i.testResults.passed / i.testResults.total < 0.8);

  if (lowCoverage.length > 0) {
    recommendations.push(`${lowCoverage.length} issues have low test coverage and need additional tests`);
  }

  if (issues.length > 0 && issues.every(i => i.status === IssueStatus.VERIFIED)) {
    recommendations.push("All issues have been successfully verified and are ready for production");
  }

  return recommendations;
}

/**
 * Propose next steps to move issues toward completion
 * @param issues Issues to analyze for next steps
 * @returns List of next step strings
 * @example
 * const steps = generateNextSteps(issues);
 */
export function generateNextSteps(issues: IssueVerification[]): string[] {
  const nextSteps: string[] = [];
  const pendingIssues = issues.filter(i => i.status === IssueStatus.PENDING);
  const inProgressIssues = issues.filter(i => i.status === IssueStatus.IN_PROGRESS);

  if (pendingIssues.length > 0) {
    nextSteps.push(`Address ${pendingIssues.length} pending issues`);
  }

  if (inProgressIssues.length > 0) {
    nextSteps.push(`Complete ${inProgressIssues.length} in-progress issues`);
  }

  nextSteps.push("Run comprehensive integration tests");
  nextSteps.push("Update documentation with changes");
  nextSteps.push("Deploy to staging environment for validation");

  return nextSteps;
}
