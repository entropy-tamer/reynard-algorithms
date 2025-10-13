# Geometry

> Mathematical theory and implementation details for Geometry

## Mathematical Theory

**Coordinate System**:
We work in a 2D Cartesian coordinate system where:

- Origin $(0, 0)$ is at the top-left corner
- X-axis extends rightward (positive direction)
- Y-axis extends downward (positive direction)
- All coordinates are represented as floating-point numbers

This coordinate system is commonly used in computer graphics and UI frameworks, where the origin is at the top-left corner of the screen or canvas. This differs from traditional mathematical coordinate systems where Y increases upward, but matches the pixel coordinate system used in most graphics libraries and web browsers.

**Point Mathematics**:
A point $P$ in 2D space is defined as $P = (x, y)$ where $x, y \in \mathbb{R}$.

**Distance Formula**:
The Euclidean distance between two points $P_1 = (x_1, y_1)$ and $P_2 = (x_2, y_2)$ is:
$$d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$

This formula is derived from the Pythagorean theorem and represents the straight-line distance between two points.

**Performance Optimization**: For distance comparisons (not exact distance), we can avoid the expensive square root operation by comparing squared distances: $d^2 = (x_2 - x_1)^2 + (y_2 - y_1)^2$.

**Linear Interpolation (Lerp)**:
Given two points $P_1$ and $P_2$, and a parameter $t \in [0, 1]$:
$$P(t) = P_1 + t \cdot (P_2 - P_1) = (x_1 + t(x_2 - x_1), y_1 + t(y_2 - y_1))$$

Linear interpolation is used for smooth transitions and animations.

**Parameter Behavior**: When $t = 0$, we get $P_1$; when $t = 1$, we get $P_2$; and when $t = 0.5$, we get the midpoint. Values outside $[0, 1]$ extrapolate beyond the original points.

**Midpoint Calculation**:
The midpoint $M$ between two points $P_1$ and $P_2$ is:
$$M = \left(\frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2}\right)$$

This is a special case of linear interpolation where $t = 0.5$.

## Implementation

For implementation details and usage examples, see the source code in the `src/` directory.

## API Reference

```typescript
// Import the algorithm
import { Geometry } from '@entropy-tamer/reynard-algorithms';
```

## Performance

See the [Performance Analysis](../performance/) section for detailed benchmarks and optimization strategies.
