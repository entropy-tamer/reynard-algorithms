/**
 * Test Signal Generators for FFT Validation
 *
 * Generates various test signals for FFT validation including:
 * - Pure tones (sine, cosine at known frequencies)
 * - Multi-tone signals (chords, multiple frequencies)
 * - White noise
 * - Chirp signals (frequency sweep)
 *
 * All with configurable sample rates and durations.
 */

/**
 * Generate a pure tone (sine wave) at specified frequency
 *
 * @param frequency - Frequency in Hz
 * @param sampleRate - Sample rate in Hz (default: 44100)
 * @param duration - Duration in seconds (default: 1.0)
 * @param phase - Phase offset in radians (default: 0.0)
 * @returns Float32Array of signal samples
 *
 * @example
 * ```typescript
 * const tone = generatePureTone(440, 44100, 1.0); // A4 note
 * ```
 */
export function generatePureTone(
  frequency: number,
  sampleRate: number = 44100,
  duration: number = 1.0,
  phase: number = 0.0
): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const signal = new Float32Array(numSamples);
  const twoPi = 2 * Math.PI;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    signal[i] = Math.sin(twoPi * frequency * t + phase);
  }

  return signal;
}

/**
 * Generate a cosine wave at specified frequency
 *
 * @param frequency - Frequency in Hz
 * @param sampleRate - Sample rate in Hz (default: 44100)
 * @param duration - Duration in seconds (default: 1.0)
 * @param phase - Phase offset in radians (default: 0.0)
 * @returns Float32Array of signal samples
 */
export function generateCosine(
  frequency: number,
  sampleRate: number = 44100,
  duration: number = 1.0,
  phase: number = 0.0
): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const signal = new Float32Array(numSamples);
  const twoPi = 2 * Math.PI;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    signal[i] = Math.cos(twoPi * frequency * t + phase);
  }

  return signal;
}

/**
 * Generate a multi-tone signal (chord) with multiple frequencies
 *
 * @param frequencies - Array of frequencies in Hz
 * @param sampleRate - Sample rate in Hz (default: 44100)
 * @param duration - Duration in seconds (default: 1.0)
 * @param normalize - Whether to normalize by number of frequencies (default: true)
 * @returns Float32Array of signal samples
 *
 * @example
 * ```typescript
 * const chord = generateMultiTone([261.63, 329.63, 392.00]); // C, E, G
 * ```
 */
export function generateMultiTone(
  frequencies: number[],
  sampleRate: number = 44100,
  duration: number = 1.0,
  normalize: boolean = true
): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const signal = new Float32Array(numSamples);
  const twoPi = 2 * Math.PI;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sum = 0;
    for (const freq of frequencies) {
      sum += Math.sin(twoPi * freq * t);
    }
    signal[i] = normalize ? sum / frequencies.length : sum;
  }

  return signal;
}

/**
 * Generate white noise
 *
 * @param sampleRate - Sample rate in Hz (default: 44100)
 * @param duration - Duration in seconds (default: 1.0)
 * @param seed - Random seed for reproducibility (optional)
 * @returns Float32Array of signal samples
 */
export function generateWhiteNoise(
  sampleRate: number = 44100,
  duration: number = 1.0,
  seed?: number
): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const signal = new Float32Array(numSamples);

  // Simple LCG for seeded random (if seed provided)
  let rng = seed !== undefined ? seed : Math.random() * 1000000;
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);

  for (let i = 0; i < numSamples; i++) {
    if (seed !== undefined) {
      rng = (a * rng + c) % m;
      signal[i] = (rng / m) * 2 - 1; // Normalize to [-1, 1]
    } else {
      signal[i] = Math.random() * 2 - 1;
    }
  }

  return signal;
}

/**
 * Generate a linear chirp signal (frequency sweep)
 *
 * @param startFreq - Starting frequency in Hz
 * @param endFreq - Ending frequency in Hz
 * @param sampleRate - Sample rate in Hz (default: 44100)
 * @param duration - Duration in seconds (default: 1.0)
 * @returns Float32Array of signal samples
 *
 * @example
 * ```typescript
 * const chirp = generateChirp(100, 2000, 44100, 1.0); // Sweep from 100Hz to 2000Hz
 * ```
 */
export function generateChirp(
  startFreq: number,
  endFreq: number,
  sampleRate: number = 44100,
  duration: number = 1.0
): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const signal = new Float32Array(numSamples);
  const twoPi = 2 * Math.PI;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Linear frequency sweep
    const instantaneousFreq = startFreq + ((endFreq - startFreq) * t) / duration;
    // Phase integration for linear chirp
    const phase =
      twoPi * (startFreq * t + ((endFreq - startFreq) * t * t) / (2 * duration));
    signal[i] = Math.sin(phase);
  }

  return signal;
}

/**
 * Generate a square wave
 *
 * @param frequency - Frequency in Hz
 * @param sampleRate - Sample rate in Hz (default: 44100)
 * @param duration - Duration in seconds (default: 1.0)
 * @param dutyCycle - Duty cycle (0-1, default: 0.5)
 * @returns Float32Array of signal samples
 */
export function generateSquareWave(
  frequency: number,
  sampleRate: number = 44100,
  duration: number = 1.0,
  dutyCycle: number = 0.5
): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const signal = new Float32Array(numSamples);
  const period = sampleRate / frequency;

  for (let i = 0; i < numSamples; i++) {
    const phase = (i % period) / period;
    signal[i] = phase < dutyCycle ? 1 : -1;
  }

  return signal;
}

/**
 * Generate a sawtooth wave
 *
 * @param frequency - Frequency in Hz
 * @param sampleRate - Sample rate in Hz (default: 44100)
 * @param duration - Duration in seconds (default: 1.0)
 * @returns Float32Array of signal samples
 */
export function generateSawtooth(
  frequency: number,
  sampleRate: number = 44100,
  duration: number = 1.0
): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const signal = new Float32Array(numSamples);
  const period = sampleRate / frequency;

  for (let i = 0; i < numSamples; i++) {
    const phase = (i % period) / period;
    signal[i] = 2 * phase - 1; // Map [0, 1) to [-1, 1)
  }

  return signal;
}

