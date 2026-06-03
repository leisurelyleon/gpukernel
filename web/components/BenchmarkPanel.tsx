"use client";

import type { BenchResult } from "@/lib/types";

function fmt(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(0);
}

export default function BenchmarkPanel({
  results,
  running,
  onRun,
}: {
  results: BenchResult[];
  running: boolean;
  onRun: () => void;
}) {
  const gpu = results.find((r) => r.backend === "gpu");
  const cpu = results.find((r) => r.backend === "cpu");
  const speedup =
    gpu && cpu && cpu.millis > 0 ? (cpu.millis / gpu.millis).toFixed(1) : null;

  return (
    <div className="bench">
      <div className="bench-head">
        <h2>Benchmark</h2>
        <button onClick={onRun} disabled={running}>
          {running ? "Running…" : "Run GPU vs CPU"}
        </button>
      </div>

      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Backend</th>
              <th>Particles</th>
              <th>Steps</th>
              <th>Time</th>
              <th>Throughput</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.backend}>
                <td className="mono">{r.backend.toUpperCase()}</td>
                <td>{r.particles.toLocaleString()}</td>
                <td>{r.steps}</td>
                <td>{r.millis.toFixed(1)} ms</td>
                <td>{fmt(r.throughput)} updates/s</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {speedup && (
        <p className="speedup">
          GPU is <strong>{speedup}×</strong> faster than CPU on this workload.
        </p>
      )}

      <style jsx>{`
        .bench { border: 1px solid var(--border); border-radius: 8px; padding: 1rem; background: var(--panel); }
        .bench-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        h2 { font-size: 1rem; margin: 0; font-family: var(--mono); }
        button {
          background: var(--accent); color: #0d1117; border: none;
          padding: 0.5rem 0.9rem; border-radius: 6px; font-weight: 600;
          cursor: pointer; font-size: 0.8rem;
        }
        button:disabled { opacity: 0.6; cursor: default; }
        table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        th, td { text-align: left; padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--border); }
        th { color: var(--muted); font-weight: 600; }
        .mono { font-family: var(--mono); }
        .speedup { margin: 0.75rem 0 0; font-size: 0.85rem; color: var(--ok); }
      `}</style>
    </div>
  );
}
