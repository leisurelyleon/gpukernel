# 1. Use WebGPU compute shaders for the parallel workload

- Status: Accepted

## Context

The project demonstrates general-purpose parallel GPU computation in a deployable,
linkable form. Options: a native GPU API (CUDA/Vulkan/Metal — not web-deployable),
WebGL (graphics-oriented, no first-class compute), or WebGPU (browser-native, with
first-class compute shaders).

## Decision

Use WebGPU compute shaders (WGSL). As of late 2025 WebGPU ships by default in
Chrome, Edge, Firefox, and Safari, making a browser-based GPGPU demo viable and
shareable as a single URL.

## Consequences

- (+) Real GPGPU (storage buffers, bind groups, dispatch) — the genuine article.
- (+) Zero-install: the demo is a link, runs on the visitor's own GPU.
- (+) No backend, no infrastructure — a purely static deploy.
- (-) Support has OS/driver gaps; some visitors won't have WebGPU. Addressed by
  ADR 0002.
