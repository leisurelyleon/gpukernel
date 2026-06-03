# 2. Ship a CPU fallback, detected at runtime

- Status: Accepted

## Context

WebGPU is not universally available — older devices, some Linux/Android configs,
and sandboxed/embedded browser contexts may lack it. A GPU-only demo would
hard-fail (blank screen, console error) for those visitors.

## Decision

Detect WebGPU at runtime in two steps (`navigator.gpu` present, then
`requestAdapter()` returns non-null). If either fails, run the identical N-body
step on the CPU and show an honest "running on CPU fallback" notice. The benchmark
still runs the CPU baseline regardless.

## Consequences

- (+) The app works for every visitor — it degrades, it never breaks.
- (+) Demonstrates real-world capability handling, not a happy-path-only demo.
- (-) The CPU path is far slower for large particle counts (which is the point the
  benchmark makes visible).
