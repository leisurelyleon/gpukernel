"use client";

/**
 * Acquire a WebGPU device, or report why it isn't available.
 *
 * Two separate failure points are checked explicitly:
 *  1. `navigator.gpu` may be undefined (browser/OS has no WebGPU at all).
 *  2. `requestAdapter()` may resolve to null (WebGPU exists but no usable
 *     adapter — e.g. blocklisted driver), even though `navigator.gpu` is set.
 */
export interface GpuContext {
  device: GPUDevice;
  adapterInfo: string;
}

export async function acquireGpu(): Promise<GpuContext | null> {
  if (typeof navigator === "undefined" || !navigator.gpu) {
    return null; // no WebGPU in this environment
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return null; // WebGPU present but no adapter available
  }

  const device = await adapter.requestDevice();

  // adapter.info is widely available in 2026; fall back gracefully if absent.
  let adapterInfo = "WebGPU device";
  try {
    const info = adapter.info;
    if (info && (info.vendor || info.architecture)) {
      adapterInfo = [info.vendor, info.architecture].filter(Boolean).join(" ");
    }
  } catch {
    /* adapter.info unavailable; keep the generic label */
  }

  return { device, adapterInfo };
}
