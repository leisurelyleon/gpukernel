# gpukernel

Real-time **GPU compute in the browser** via WebGPU compute shaders (WGSL).
`gpukernel` runs a parallel N-body particle simulation on the GPU and benchmarks
the same kernel against a CPU baseline — with an automatic CPU fallback when
WebGPU isn't available, so it works in every browser.

## What it demonstrates

- **Real GPGPU.** A WGSL compute shader with storage buffers, bind groups, and
  workgroup dispatch — one thread per particle. (ADR 0001)
- **Honest capability handling.** Runtime WebGPU detection with a CPU fallback;
  the app degrades gracefully instead of failing. (ADR 0002)
- **A fair benchmark.** Identical N-body math on GPU and CPU, compared by
  throughput (particle-updates/second). (ADR 0003)

## Layout

| Path        | What it is                                  |
|-------------|---------------------------------------------|
| `web/`      | Next.js frontend + all WebGPU/CPU compute   |
| `docs/`     | Architecture + ADRs                         |

There is no backend — all computation runs client-side in the browser.

## Develop

Prerequisites: Node 20+. (A `.devcontainer` ships it.)

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

Open in a WebGPU-capable browser (recent Chrome/Edge/Safari) for the GPU path;
other browsers automatically use the CPU fallback.

## Deploy

Static frontend on Vercel — Root Directory = `web`. No backend, no env vars.

## Status

- [x] WGSL compute kernel + GPU pipeline
- [x] CPU fallback + runtime capability detection
- [x] GPU vs CPU benchmark
- [x] Deployed on Vercel
