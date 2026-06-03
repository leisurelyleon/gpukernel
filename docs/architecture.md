# Architecture

`gpukernel` runs a parallel N-body particle simulation in the browser using
**WebGPU compute shaders** (WGSL), and benchmarks the same kernel on the GPU
against a CPU baseline. When WebGPU is unavailable, it transparently falls back
to the CPU so the app works everywhere.

## Data flow

```text
seed particles ─▶ GPU storage buffer ─▶ compute pass (WGSL kernel) ─▶ read
back ─▶ canvas
(or)
seed particles ─▶ Float32Array ─▶ CPU step loop ─▶ canvas (fallback path)
```

Each particle is 4 floats — `pos.xy`, `vel.xy` — laid out identically on the GPU
(a storage buffer) and CPU (a `Float32Array`), so the GPU and CPU paths compute
the exact same thing and the benchmark is apples-to-apples.

## The kernel

One `@workgroup_size(64)` compute shader advances a particle per invocation:
sum pairwise gravity from every other particle, integrate velocity and position,
soft-bounce off the viewport bounds. This is deliberately compute-bound (O(n²)
per step) so the GPU's parallelism shows up clearly against the CPU.

## Components

| Path                      | Role                                                |
|---------------------------|-----------------------------------------------------|
| `lib/gpu/device.ts`       | Adapter/device acquisition + capability detection   |
| `lib/gpu/nbody.wgsl.ts`   | The WGSL compute shader                             |
| `lib/gpu/simulation.ts`   | GPU pipeline: buffers, bind groups, dispatch, readback |
| `lib/cpu/nbody.ts`        | Equivalent CPU implementation (fallback + baseline) |
| `components/SimCanvas.tsx`| Renders particle positions each frame               |
| `components/BenchmarkPanel.tsx` | GPU vs CPU throughput comparison              |

## No backend

Everything runs client-side in the browser. There is no server — the deploy is a
static Next.js frontend on Vercel. (Contrast with the sibling projects that need
a Rust service on Fly.io; this one needs none.)
