export type Backend = "gpu" | "cpu";

export interface BenchResult {
  backend: Backend;
  particles: number;
  steps: number;
  millis: number;
  /** Particle-updates per second (particles * steps / seconds). */
  throughput: number;
}
