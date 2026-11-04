# Fast Fourier Transform

Source: `src/algorithms/signal-processing/fft/`

The discrete Fourier transform of a length-$N$ sequence is

$$
X_k = \sum_{n=0}^{N-1} x_n\,e^{-2\pi i k n/N},
\qquad k = 0, \dots, N-1 .
$$

Evaluating it directly costs $O(N^2)$ complex operations. The fast transform
factors the sum and costs $O(N\log N)$.

## Cooley-Tukey

Split the sequence into even and odd indices:

$$
X_k = E_k + e^{-2\pi i k/N} O_k ,
\qquad
X_{k+N/2} = E_k - e^{-2\pi i k/N} O_k ,
$$

where $E$ and $O$ are the transforms of the two halves. Recursing gives
$T(N) = 2T(N/2) + O(N)$, so $T(N) = O(N\log N)$. The twiddle factor
$W_N^k = e^{-2\pi i k/N}$ multiplies the odd half.

## Radix-4 and mixed radix

A radix-2 stage halves the length. A radix-4 stage quarters it and uses fewer
multiplications per butterfly, which is faster when $N$ is a power of four.
Mixed-radix handles lengths with small prime factors by applying a different
butterfly per factor; a prime length falls back to Bluestein or to the direct
transform.

## Real input

A real sequence has a conjugate-symmetric spectrum, so half the output is
redundant. The real transform packs two real sequences into one complex
transform, or uses a half-length complex transform plus a post-pass, and returns
$N/2+1$ bins.

## DCT and DST

The discrete cosine transform is

$$
X_k = \sum_{n=0}^{N-1} x_n \cos\!\left[\frac{\pi}{N}\left(n+\tfrac12\right)k\right],
$$

used for compression because it concentrates energy in few coefficients. The
discrete sine transform is the analogous sine basis. Both can be computed through
a length-$2N$ FFT.

## Convolution

Circular convolution is multiplication in the frequency domain:

$$
\mathcal{F}\{x * y\} = \mathcal{F}\{x\}\,\mathcal{F}\{y\}.
$$

Linear convolution needs zero padding to at least $N + M - 1$, or the tail wraps
into the head.

## Pitfalls

The transform direction and normalization are a convention. An inverse that does
not divide by $N$ returns a result scaled by $N$; the pair must agree.

Bit-reversal permutation is easy to get wrong for non-power-of-two lengths. The
permutation is only the identity for the radix-2 case.

Twiddle factors accumulate error. Computing $W^k$ by repeated multiplication
drifts for large $N$; recompute from the angle or use a precomputed table.

The spectrum index $k$ maps to frequency $k f_s/N$. A caller that reads the
magnitude without that mapping reports the wrong frequency for every peak.
