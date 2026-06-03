"use client";

export default function UnsupportedNotice() {
  return (
    <div className="notice">
      <strong>WebGPU isn&apos;t available in this browser.</strong>
      <p>
        The simulation is running on the <code>CPU fallback</code> instead.
        For the GPU-accelerated path, try a recent Chrome, Edge, or Safari on a
        device with WebGPU support.
      </p>
      <style jsx>{`
        .notice {
          border: 1px solid var(--warn); border-radius: 8px;
          background: rgba(210, 153, 34, 0.08); padding: 0.75rem 1rem;
          font-size: 0.85rem; color: var(--text); margin-bottom: 1rem;
        }
        .notice p { color: var(--muted); margin: 0.4rem 0 0; line-height: 1.5; }
        code { font-family: var(--mono); color: var(--accent); }
      `}</style>
    </div>
  );
}
