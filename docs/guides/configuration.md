# Configuration

Source: `src/config/`

The package reads a layered configuration: defaults, a machine-specific file,
and per-call options. The merge order is defaults, then machine, then explicit
options, with the later layer winning per key.

## Fingerprint

A machine fingerprint identifies the host so the machine layer applies only
where it was written. It is a hash of stable machine facts (platform, CPU model,
core count), not of the load or the clock. `generateMachineFingerprint` returns the
struct and `loadMachineConfig` refuses a file whose fingerprint disagrees.

## Immutable updates

`ImmutableConfig` exposes updates that return a new object instead of mutating the
current one. Structurally shared subtrees are reused, so an update costs
$O(\text{depth})$ instead of $O(\text{size})$. That is what makes it safe to hand
the config to several algorithms and update one of them.

## The manager

`AlgorithmConfigManager` owns the merged view, the path to the machine file, and a
dirty flag. `getConfigManager()` returns the process-wide instance;
`initializeConfig(path)` replaces it. A caller that wants isolation constructs its
own manager.

## Validation

The merge is shallow per key and deep for nested sections. A validator runs after
the merge and reports the keys that are out of range, so a machine file with one
bad value does not silently change every algorithm that reads the section.

## Pitfalls

The process-wide manager is shared state. Two tests that initialize it with
different paths interfere; construct a local manager or reset it in the teardown.

The fingerprint changes when the host changes. Copying a machine config to
another machine leaves it ignored, which looks like the config was not loaded.

Merging arrays replaces them, not appends them. A caller that expects the default
list to survive a partial override gets only the override.

Saving writes the whole merged config, not the diff. A saved file can pin a
default that later changes in the package, and the machine then keeps the old
value.
