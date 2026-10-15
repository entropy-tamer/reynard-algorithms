# Lissajous Curves

**Source:** `trellis/src/harnesses/lissajous/index.ts` (demo), mathematical constants standard.

## Parametric equations

\[
x(t)=\sin(a\,t+\delta),\qquad y(t)=\sin(b\,t),\qquad t\in[0,2\pi k].
\]

- \(a,b\in\mathbb{Z}^+\): frequencies along each axis.
- \(\delta\): phase offset that controls symmetry/loops.
- \(k\): number of turns (least common multiple scaling).

## Shape rules

- If \(a/b\) is rational, the curve closes after \(\operatorname{lcm}(a,b)\) cycles.
- Number of lobes horizontally: \(a-1\) (if a>b), vertically: \(b-1\).
- When \(a=b\) and \(\delta=\pi/2\), the figure is a circle/ellipse.

## Demo knobs

- \(a\), \(b\): frequencies
- \(\delta\): phase
- turns: total parameter span
- animate: trace progressively

## Complexity

Drawing \(N\) samples: \(O(N)\) time, \(O(N)\) space for the traced polyline (or \(O(1)\) if streaming).

## Pitfalls

- Very high frequencies produce aliasing; increase sample density with frequency.
- Phase in degrees vs radians must be consistent.
