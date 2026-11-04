# Bloom Filter

Source: `src/data-structures/basic/bloom-filter/`

A Bloom filter answers set membership with a fixed bit array and $k$ independent
hash functions. It can return a false positive but never a false negative, which
is the trade it makes for constant memory per key.

## Sizing

For $n$ inserted keys and a target false-positive rate $p$, the bit count and
hash count are

$$
m = -\frac{n \ln p}{(\ln 2)^2},
\qquad
k = \frac{m}{n}\ln 2 .
$$

The expected false-positive rate after all $n$ keys are inserted is

$$
p \approx \left(1 - e^{-kn/m}\right)^k .
$$

Rounding $m$ up and $k$ to the nearest integer moves $p$ slightly; the config
reports the achieved estimate so a caller can check the real number instead of
the requested one.

## Operations

Insertion sets $k$ bits, so it costs $O(k)$ hash evaluations. A lookup costs the
same and stops at the first clear bit. `BloomFilter` keeps statistics for
insertions, hits, misses and estimated saturation, which is the number to watch:
once most bits are set, every query passes.

```ts
const filter = new BloomFilter({ expectedItems: 10_000, falsePositiveRate: 0.01 });
filter.add("alpha");
filter.mightContain("alpha"); // true
filter.mightContain("beta");  // true or false, never a false negative
```

## Pitfalls

The structure cannot delete. Clearing bits for one key would also clear them for
every other key that hashed there, so removal needs a counting variant or a
rebuild from the surviving keys.

The false-positive rate is a property of the population, not of a single query.
Checking $n$ keys after inserting $n$ keys is the regime the formula describes.

Hash independence matters. Reusing one hash with different seeds is acceptable
only when the family is well mixed; correlated seeds collapse the effective $k$.

Serialization has to carry the hash parameters and the seed, or a restored filter
answers questions about a different bit layout.
