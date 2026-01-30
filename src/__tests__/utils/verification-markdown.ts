/**
 * @file Markdown rendering for verification reports
 */
import type { VerificationReport } from "./verification-types";

/**
 * Convert a verification report into a human-readable markdown document
 * @param report Verification report to render
 * @returns Markdown string
 * @example
 * const md = generateMarkdown(report);
 */
export function generateMarkdown(report: VerificationReport): string {
  let markdown = `# Algorithm Fixes Verification Report\n\n`;
  markdown += `**Generated:** ${new Date(report.metadata.timestamp).toISOString()}\n`;
  markdown += `**Execution Time:** ${report.metadata.executionTime}ms\n\n`;

  markdown += `## Summary\n\n`;
  markdown += `- **Total Issues:** ${report.summary.totalIssues}\n`;
  markdown += `- **Fixed:** ${report.summary.issuesFixed}\n`;
  markdown += `- **Verified:** ${report.summary.issuesVerified}\n`;
  markdown += `- **Failed:** ${report.summary.issuesFailed}\n`;
  markdown += `- **Success Rate:** ${report.summary.successRate.toFixed(1)}%\n\n`;

  markdown += `## Issues\n\n`;
  for (const issue of report.issues) {
    markdown += `### Issue #${issue.issueNumber}: ${issue.title}\n\n`;
    markdown += `**Status:** ${issue.status}\n\n`;
    markdown += `**Description:** ${issue.description}\n\n`;
    markdown += `**Fix:** ${issue.fixDescription}\n\n`;

    if (issue.affectedFiles.length > 0) {
      markdown += `**Affected Files:**\n`;
      for (const file of issue.affectedFiles) markdown += `- ${file}\n`;
      markdown += `\n`;
    }

    if (issue.performanceImpact.before && issue.performanceImpact.after) {
      markdown += `**Performance Impact:** ${issue.performanceImpact.improvement.toFixed(1)}%\n\n`;
    }

    if (issue.breakingChanges.length > 0) {
      markdown += `**Breaking Changes:**\n`;
      for (const change of issue.breakingChanges) markdown += `- ${change}\n`;
      markdown += `\n`;
    }
  }

  if (report.recommendations.length > 0) {
    markdown += `## Recommendations\n\n`;
    for (const rec of report.recommendations) markdown += `- ${rec}\n`;
    markdown += `\n`;
  }

  if (report.nextSteps.length > 0) {
    markdown += `## Next Steps\n\n`;
    for (const step of report.nextSteps) markdown += `- ${step}\n`;
    markdown += `\n`;
  }

  return markdown;
}
