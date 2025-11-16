# FFT Implementation Validation Resources

This document lists publicly available online resources and samples that can be used to validate our FFT implementation.

## Interactive Visualization Tools

### 1. Falstad Fourier Transform Visualizer

- **URL**: https://www.falstad.com/fourier/
- **Description**: Interactive applet demonstrating Fourier series and transforms. Allows you to visualize pure tones (sine, cosine), complex waveforms (triangle, sawtooth, square), and see their frequency components in real-time.
- **Use Case**: Validate that our FFT correctly identifies pure tones and complex waveforms
- **Features**:
  - Pure tone generation (sine, cosine)
  - Complex waveforms (triangle, sawtooth, square)
  - Real-time frequency visualization
  - Magnitude/phase view
- **Status**: ✅ Verified - Working interactive tool

### 2. MDN Web Audio API Examples

- **URL**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
- **Description**: Comprehensive guide with code examples for FFT visualization using Web Audio API
- **Demo**: https://mdn.github.io/webaudio-examples/voice-change-o-matic/
- **Use Case**: Reference implementation for FFT usage patterns and visualization techniques
- **Features**:
  - Waveform visualization
  - Frequency bar graph
  - Real-time audio analysis
- **Status**: ✅ Verified - Working documentation and demo

## Reference Implementations

### 3. SciPy FFT Documentation

- **URL**: https://docs.scipy.org/doc/scipy/reference/fft.html
- **Description**: Official SciPy FFT documentation with API reference
- **Use Case**: Compare our FFT results with SciPy's reference implementation
- **Features**:
  - Complete API documentation
  - Reference implementation details
  - Helper functions (fftfreq, fftshift, etc.)
- **Status**: ✅ Verified - Official documentation

### 4. NumPy FFT Documentation

- **URL**: https://numpy.org/doc/stable/reference/routines.fft.html
- **Description**: NumPy FFT reference implementation
- **Use Case**: Cross-validation with NumPy FFT results
- **Features**:
  - Complete API documentation
  - Reference implementation
  - Helper functions
- **Status**: ✅ Verified - Official documentation

## Test Data and Validation Resources

### 5. Real Python FFT Tutorial

- **URL**: https://realpython.com/python-scipy-fft/
- **Description**: Comprehensive tutorial with examples and test cases
- **Use Case**: Learn validation techniques and test patterns
- **Features**:
  - Step-by-step FFT examples
  - Test signal generation
  - Visualization techniques
  - Code samples
- **Status**: ✅ Verified - Working tutorial

### 6. GitHub - SciPy Test Suite

- **URL**: https://github.com/scipy/scipy/tree/main/scipy/fft/tests
- **Description**: SciPy's official FFT test suite
- **Use Case**: Extract test cases and expected results
- **Key Files**:
  - `test_fft.py` - Basic FFT tests
  - `test_rfft.py` - Real FFT tests
  - `test_helper.py` - Helper function tests
- **Status**: ✅ Verified - Public repository

### 7. GitHub - NumPy Test Suite

- **URL**: https://github.com/numpy/numpy/tree/main/numpy/fft/tests
- **Description**: NumPy's official FFT test suite
- **Use Case**: Extract test cases and expected results
- **Key Files**:
  - `test_fft.py` - Basic FFT tests
  - `test_helper.py` - Helper function tests
- **Status**: ✅ Verified - Public repository

## Validation Strategy

### Pure Tone Validation

1. Generate pure sine waves at known frequencies (e.g., 440 Hz, 1000 Hz)
2. Run FFT and verify:
   - Peak frequency matches input frequency
   - Magnitude is concentrated at the expected bin
   - Phase is correct
3. Compare results with:
   - Falstad visualizer
   - SciPy/NumPy FFT
   - Expected mathematical results

### Complex Signal Validation

1. Generate multi-tone signals (chords, multiple frequencies)
2. Verify:
   - All component frequencies are detected
   - Magnitude ratios match input amplitudes
   - No spurious frequencies
3. Compare with reference implementations

### Round-Trip Validation

1. Generate signal → FFT → IFFT → Compare with original
2. Verify Parseval's theorem (energy conservation)
3. Check numerical accuracy

### Edge Cases

1. Power-of-2 sizes (Radix-2 requirement)
2. Non-power-of-2 sizes (if mixed-radix implemented)
3. Very small sizes (N=2, N=4)
4. Large sizes (N=4096, N=8192)
5. Real vs complex inputs

## Recommended Test Signals

### Standard Test Signals

1. **Pure Sine Wave**: 440 Hz at 44100 Hz sample rate
   - Expected: Single peak at 440 Hz
   - Magnitude: Should match signal amplitude

2. **Pure Cosine Wave**: 440 Hz at 44100 Hz sample rate
   - Expected: Single peak at 440 Hz
   - Phase: Should differ from sine by π/2

3. **Multi-Tone Signal**: 440 Hz + 880 Hz + 1320 Hz
   - Expected: Three distinct peaks
   - Magnitude: Should reflect relative amplitudes

4. **White Noise**: Random signal
   - Expected: Flat frequency spectrum
   - Power: Should be distributed across all frequencies

5. **Chirp Signal**: Frequency sweep from 440 Hz to 2000 Hz
   - Expected: Frequency content changes over time
   - Use: Spectrogram validation

## Online Test Data Sources

### Audio Test Files

- **FreeSound.org**: https://freesound.org/
  - Search for "pure tone", "sine wave", "test signal"
  - Many CC0/public domain audio files available
  - Direct download of known-frequency test signals

- **GitHub Audio Test Repositories**:
  - Search: `github.com` → "audio test files" OR "test signals"
  - Many repositories with known-frequency test signals
  - Example: Test tone generators, audio analysis tools

### Interactive Test Tools

- **FFTExplorer**: https://arachnoid.com/FFTExplorer/index.html
  - Java-based signal processing workshop
  - Real-time FFT analysis
  - Can export plots as images
  - Status: ✅ Verified - Working tool

## Validation Checklist

- [ ] Pure tone detection accuracy (within 1 Hz for 44.1 kHz sample rate)
- [ ] Multi-tone signal detection (all frequencies identified)
- [ ] Magnitude accuracy (within 1% of expected)
- [ ] Phase accuracy (within 1° for pure tones)
- [ ] Round-trip accuracy (IFFT(FFT(x)) ≈ x)
- [ ] Parseval's theorem (energy conservation)
- [ ] Performance benchmarks (compare with reference implementations)
- [ ] Edge case handling (power-of-2, small sizes, large sizes)

## Direct GitHub Links for Test Cases

### SciPy FFT Test Files

- **Main Test Directory**: https://github.com/scipy/scipy/tree/main/scipy/fft/tests
- **Test Files**:
  - https://github.com/scipy/scipy/blob/main/scipy/fft/tests/test_fft.py
  - https://github.com/scipy/scipy/blob/main/scipy/fft/tests/test_rfft.py
  - https://github.com/scipy/scipy/blob/main/scipy/fft/tests/test_helper.py

### NumPy FFT Test Files

- **Main Test Directory**: https://github.com/numpy/numpy/tree/main/numpy/fft/tests
- **Test Files**:
  - https://github.com/numpy/numpy/blob/main/numpy/fft/tests/test_fft.py
  - https://github.com/numpy/numpy/blob/main/numpy/fft/tests/test_helper.py

## Next Steps

1. **Create validation script** that:
   - Generates test signals (pure tones, multi-tone, white noise)
   - Runs our FFT implementation
   - Compares with SciPy/NumPy results (if Python available)
   - Reports differences and accuracy metrics

2. **Extract test cases** from SciPy/NumPy test suites:
   - Download test files from GitHub
   - Extract known test signals and expected results
   - Create TypeScript equivalents

3. **Create automated validation suite**:
   - Pure tone accuracy tests
   - Multi-tone detection tests
   - Round-trip accuracy tests
   - Parseval's theorem validation
   - Edge case handling

4. **Document acceptable tolerances** for Float32Array precision:
   - Current: ~1e-6 for magnitude, ~1e-2 for round-trip
   - Document why these tolerances are acceptable
   - Compare with reference implementations
