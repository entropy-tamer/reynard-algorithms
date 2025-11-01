/**
 * Machine fingerprint generation utilities for algorithm configuration
 * 
 * @file
 */

import type { MachineFingerprint } from './algorithm-config-types';
import { getOs, isNodeEnvironment } from './algorithm-config-node-utils';

/**
 * Simple hash function for fingerprint
 * 
 * @param str - String to hash
 * @returns Hash string
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate machine fingerprint
 * 
 * @returns Machine fingerprint
 */
export function generateMachineFingerprint(): MachineFingerprint {
  const os = getOs();
  if (!os) {
    // Browser-safe fingerprint (minimal)
    const fingerprint = {
      arch: 'browser',
      platform: 'browser',
      cores: 0,
      totalMemory: 0,
      cpuModel: 'unknown',
      nodeVersion: 'n/a',
      hash: '',
    } as MachineFingerprint;
    const fingerprintString = JSON.stringify(fingerprint);
    fingerprint.hash = simpleHash(fingerprintString);
    return fingerprint;
  }

  const cpus = os.cpus();
  const totalMemory = os.totalmem();

  const fingerprint = {
    arch: os.arch(),
    platform: os.platform(),
    cores: cpus.length,
    totalMemory,
    cpuModel: cpus[0]?.model || 'unknown',
    nodeVersion: process.version,
    hash: '',
  } as MachineFingerprint;

  // Generate hash from fingerprint data
  const fingerprintString = JSON.stringify(fingerprint);
  fingerprint.hash = simpleHash(fingerprintString);

  return fingerprint;
}


