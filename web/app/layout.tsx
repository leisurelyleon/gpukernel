import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "gpukernel — GPU compute in the browser",
  description:
    "A parallel N-body simulation and GPU vs CPU benchmark, running in the browser via WebGPU compute shaders, with a CPU fallback.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
