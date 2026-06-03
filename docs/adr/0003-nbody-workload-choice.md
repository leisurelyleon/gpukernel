# 3. N-body simulation as the demonstration workload

- Status: Accepted

## Context

We need a workload that is (a) embarrassingly parallel, (b) compute-bound enough
that the GPU's advantage is obvious, and (c) visually legible so a viewer
immediately "gets it."

## Decision

A naive O(n²) N-body gravity simulation: each particle sums forces from all
others. It's trivially parallel (one thread per particle), compute-heavy
(quadratic in particle count), and produces an intuitive swirling visual.

## Consequences

- (+) The parallelism and the GPU/CPU gap are both visible and intuitive.
- (+) Identical math on GPU and CPU makes the benchmark a fair comparison.
- (-) O(n²) caps the practical particle count; a Barnes-Hut tree would scale
  further but obscure the simple, legible parallel mapping. Out of scope for v1.
