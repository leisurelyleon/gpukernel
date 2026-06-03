"use client";

import { useEffect, useRef } from "react";

/** Draws particle positions ([-1,1] space) onto a 2D canvas each frame. */
export default function SimCanvas({
  getFrame,
}: {
  getFrame: () => Float32Array | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, w, h);

      const frame = getFrame();
      if (frame) {
        ctx.fillStyle = "#58a6ff";
        const n = frame.length / 4;
        for (let i = 0; i < n; i++) {
          const x = (frame[i * 4] * 0.5 + 0.5) * w;
          const y = (frame[i * 4 + 1] * 0.5 + 0.5) * h;
          ctx.fillRect(x, y, 2, 2);
        }
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [getFrame]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={480}
      style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, display: "block" }}
    />
  );
}
