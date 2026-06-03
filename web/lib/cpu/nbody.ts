// CPU implementation of the same N-body step, used both as the WebGPU fallback
// and as the benchmark baseline. Intentionally mirrors the WGSL kernel exactly
// so the GPU vs CPU comparison is apples-to-apples.

const G = 0.0005;
const SOFTEN = 0.01;
const DT = 0.016;

/** Layout matches the GPU buffer: [posX, posY, velX, velY] per particle. */
export function cpuStep(data: Float32Array, count: number, steps: number): void {
  for (let s = 0; s < steps; s++) {
    for (let i = 0; i < count; i++) {
      const bi = i * 4;
      const px = data[bi];
      const py = data[bi + 1];
      let ax = 0;
      let ay = 0;

      for (let j = 0; j < count; j++) {
        if (j === i) continue;
        const bj = j * 4;
        const dx = data[bj] - px;
        const dy = data[bj + 1] - py;
        const dist2 = dx * dx + dy * dy + SOFTEN;
        const inv = 1 / Math.sqrt(dist2);
        const f = G * inv * inv;
        ax += dx * f;
        ay += dy * f;
      }

      data[bi + 2] += ax * DT;
      data[bi + 3] += ay * DT;
    }

    // Position integration + bounds in a second pass (matches GPU semantics).
    for (let i = 0; i < count; i++) {
      const bi = i * 4;
      data[bi] += data[bi + 2] * DT;
      data[bi + 1] += data[bi + 3] * DT;
      if (data[bi] < -1 || data[bi] > 1) data[bi + 2] *= -0.8;
      if (data[bi + 1] < -1 || data[bi + 1] > 1) data[bi + 3] *= -0.8;
      data[bi] = Math.max(-1, Math.min(1, data[bi]));
      data[bi + 1] = Math.max(-1, Math.min(1, data[bi + 1]));
    }
  }
}

/** Seed `count` particles in a ring with a small tangential velocity. */
export function seedParticles(count: number): Float32Array {
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r = 0.3 + 0.4 * Math.random();
    data[i * 4] = Math.cos(a) * r;
    data[i * 4 + 1] = Math.sin(a) * r;
    data[i * 4 + 2] = -Math.sin(a) * 0.1;
    data[i * 4 + 3] = Math.cos(a) * 0.1;
  }
  return data;
}
