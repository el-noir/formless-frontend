"use client";

export function Background() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0B0B0F]">
      {/* Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,#0B0B0F_90%] pointer-events-none" />
    </div>
  );
}
