"use client";

import { NBODY_WGSL } from "@/lib/gpu/nbody.wgsl";

const WORKGROUP_SIZE = 64;
// Particle = 4 floats (pos.xy, vel.xy) = 16 bytes.
const PARTICLE_BYTES = 4 * 4;

/** A ready-to-step GPU simulation over `count` particles. */
export class GpuSimulation {
  private device: GPUDevice;
  private count: number;
  private pipeline: GPUComputePipeline;
  private particleBuffer: GPUBuffer;
  private paramsBuffer: GPUBuffer;
  private readbackBuffer: GPUBuffer;
  private bindGroup: GPUBindGroup;

  constructor(device: GPUDevice, initial: Float32Array, count: number) {
    this.device = device;
    this.count = count;

    const module = device.createShaderModule({ code: NBODY_WGSL });
    this.pipeline = device.createComputePipeline({
      layout: "auto",
      compute: { module, entryPoint: "main" },
    });

    // Storage buffer holding all particles, seeded with the initial state.
    this.particleBuffer = device.createBuffer({
      size: count * PARTICLE_BYTES,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(this.particleBuffer.getMappedRange()).set(initial);
    this.particleBuffer.unmap();

    // Uniform buffer: { count: u32, dt: f32 } — 8 bytes, pad to 16.
    this.paramsBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const params = new ArrayBuffer(16);
    new Uint32Array(params, 0, 1)[0] = count;
    new Float32Array(params, 4, 1)[0] = 0.016; // dt
    device.queue.writeBuffer(this.paramsBuffer, 0, params);

    // Mappable buffer for reading particle positions back to draw them.
    this.readbackBuffer = device.createBuffer({
      size: count * PARTICLE_BYTES,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    this.bindGroup = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.particleBuffer } },
        { binding: 1, resource: { buffer: this.paramsBuffer } },
      ],
    });
  }

  /** Run `steps` integration steps on the GPU (no readback). */
  step(steps: number): void {
    const groups = Math.ceil(this.count / WORKGROUP_SIZE);
    const encoder = this.device.createCommandEncoder();
    for (let s = 0; s < steps; s++) {
      const pass = encoder.beginComputePass();
      pass.setPipeline(this.pipeline);
      pass.setBindGroup(0, this.bindGroup);
      pass.dispatchWorkgroups(groups);
      pass.end();
    }
    this.device.queue.submit([encoder.finish()]);
  }

  /** Step once, then read positions back as a Float32Array for rendering. */
  async stepAndRead(): Promise<Float32Array> {
    const groups = Math.ceil(this.count / WORKGROUP_SIZE);
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.dispatchWorkgroups(groups);
    pass.end();
    encoder.copyBufferToBuffer(
      this.particleBuffer,
      0,
      this.readbackBuffer,
      0,
      this.count * PARTICLE_BYTES,
    );
    this.device.queue.submit([encoder.finish()]);

    await this.readbackBuffer.mapAsync(GPUMapMode.READ);
    // Copy out before unmapping (the mapped range is invalidated on unmap).
    const copy = new Float32Array(
      this.readbackBuffer.getMappedRange().slice(0),
    );
    this.readbackBuffer.unmap();
    return copy;
  }

  /** Block until all submitted GPU work has finished (for accurate timing). */
  async finish(): Promise<void> {
    await this.device.queue.onSubmittedWorkDone();
  }

  destroy(): void {
    this.particleBuffer.destroy();
    this.paramsBuffer.destroy();
    this.readbackBuffer.destroy();
  }
}
