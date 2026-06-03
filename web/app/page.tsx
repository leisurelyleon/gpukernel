"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SimCanvas from "@/components/SimCanvas";
import BenchmarkPanel from "@/components/BenchmarkPanel";
import UnsupportedNotice from "@/components/UnsupportedNotice";
import { acquireGpu } from "@/lib/gpu/device";
import { GpuSimulation } from "@/lib/gpu/simulation";
import { cpuStep, seedParticles } from "@/lib/cpu/nbody";
import type { Backend, BenchResult } from "@/lib/types";

const LIVE_PARTICLES = 1500;
const BENCH_PARTICLES = 2000;
const BENCH_STEPS = 50;

export default function Home() {
  const [backend, setBackend] = useState<Backend | null>(null);
  const [adapterInfo, setAdapterInfo] = useState<string>("");
  const [results, setResults] = useState<BenchResult[]>([]);
  const [running, setRunning] = useState(false);

  // Latest particle frame, read by the canvas via a ref (no re-render per frame).
  const frameRef = useRef<Float32Array | null>(null);
  const getFrame = useCallback(() => frameRef.current, []);

  // Set up the live simulation once, choosing GPU when available else CPU.
  useEffect(() => {
    let disposed = false;
    let gpuSim: GpuSimulation | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    (async () => {
      const gpu = await acquireGpu();

      if (gpu && !disposed) {
        setBackend("gpu");
        setAdapterInfo(gpu.adapterInfo);
        const data = seedParticles(LIVE_PARTICLES);
        gpuSim = new GpuSimulation(gpu.device, data, LIVE_PARTICLES);
        const loop = async () => {
          if (disposed || !gpuSim) return;
          frameRef.current = await gpuSim.stepAndRead();
        };
        interval = setInterval(loop, 16);
      } else if (!disposed) {
        setBackend("cpu");
        const data = seedParticles(LIVE_PARTICLES);
        interval = setInterval(() => {
          cpuStep(data, LIVE_PARTICLES, 1);
          frameRef.current = data.slice(0);
        }, 16);
      }
    })();

    return () => {
      disposed = true;
      if (interval) clearInterval(interval);
      if (gpuSim) gpuSim.destroy();
    };
  }, []);

  const runBenchmark = useCallback(async () => {
    setRunning(true);
    const out: BenchResult[] = [];

    // CPU timing.
    {
      const data = seedParticles(BENCH_PARTICLES);
      const t0 = performance.now();
      cpuStep(data, BENCH_PARTICLES, BENCH_STEPS);
      const millis = performance.now() - t0;
      out.push({
        backend: "cpu",
        particles: BENCH_PARTICLES,
        steps: BENCH_STEPS,
        millis,
        throughput: (BENCH_PARTICLES * BENCH_STEPS) / (millis / 1000),
      });
    }

    // GPU timing (only if available).
    const gpu = await acquireGpu();
    if (gpu) {
      const data = seedParticles(BENCH_PARTICLES);
      const sim = new GpuSimulation(gpu.device, data, BENCH_PARTICLES);
      const t0 = performance.now();
      sim.step(BENCH_STEPS);
      await sim.finish();
      const millis = performance.now() - t0;
      sim.destroy();
      out.push({
        backend: "gpu",
        particles: BENCH_PARTICLES,
        steps: BENCH_STEPS,
        millis,
        throughput: (BENCH_PARTICLES * BENCH_STEPS) / (millis / 1000),
      });
    }

    setResults(out);
    setRunning(false);
  }, []);

  return (
    <main className="page">
      <header>
        <h1>gpukernel</h1>
        <p>
          A parallel N-body particle simulation running in your browser via
          WebGPU compute shaders (WGSL). Below is a live simulation; the
          benchmark compares the same kernel on the GPU versus a CPU baseline.
          When WebGPU isn&apos;t available, everything falls back to the CPU.
        </p>
        {backend === "gpu" && (
          <p className="badge ok">● Running on GPU — {adapterInfo}</p>
        )}
        {backend === "cpu" && <UnsupportedNotice />}
        {backend === null && <p className="badge">Detecting GPU…</p>}
      </header>

      <SimCanvas getFrame={getFrame} />

      <div className="bench-wrap">
        <BenchmarkPanel results={results} running={running} onRun={runBenchmark} />
      </div>

      <style jsx>{`
        .page { max-width: 760px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
        h1 { font-family: var(--mono); font-size: 1.6rem; margin: 0 0 0.5rem; }
        header p { color: var(--muted); font-size: 0.9rem; line-height: 1.6; max-width: 65ch; }
        .badge { font-family: var(--mono); font-size: 0.8rem; }
        .badge.ok { color: var(--ok); }
        .bench-wrap { margin-top: 1.25rem; }
      `}</style>
    </main>
  );
}
