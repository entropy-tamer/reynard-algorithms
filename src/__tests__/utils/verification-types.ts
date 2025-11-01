/**
 * @file Shared types and enums for verification reports
 */
import type { BenchmarkReport } from './benchmark-utils';

export enum IssueStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  FIXED = 'fixed',
  VERIFIED = 'verified',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export interface IssueVerification {
  issueNumber: number;
  title: string;
  status: IssueStatus;
  description: string;
  affectedFiles: string[];
  fixDescription: string;
  verificationTests: string[];
  testResults: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
  };
  performanceImpact: {
    before: BenchmarkReport | null;
    after: BenchmarkReport | null;
    improvement: number;
    regression: boolean;
  };
  breakingChanges: string[];
  notes: string[];
}

export interface TestCoverage {
  overallCoverage: number;
  moduleCoverage: Record<string, number>;
  newTestsAdded: number;
  testsModified: number;
  coverageImprovement: number;
}

export interface PerformanceSummary {
  totalBenchmarks: number;
  improvements: number;
  regressions: number;
  averageChange: number;
  bestImprovement: { issue: number; improvement: number };
  worstRegression: { issue: number; regression: number };
}

export interface VerificationReport {
  metadata: {
    timestamp: number;
    version: string;
    generator: string;
    executionTime: number;
  };
  summary: {
    totalIssues: number;
    issuesFixed: number;
    issuesVerified: number;
    issuesFailed: number;
    successRate: number;
  };
  issues: IssueVerification[];
  testCoverage: TestCoverage;
  performance: PerformanceSummary;
  recommendations: string[];
  nextSteps: string[];
}


