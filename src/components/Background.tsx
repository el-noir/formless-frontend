"use client";

export function Background() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0B0B0F]">
      {/* Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Orbs with CSS animations for better performance */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6E8BFF] rounded-full blur-[80px] opacity-20 animate-orb-slow" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-[#9A6BFF] rounded-full blur-[80px] opacity-15 animate-orb-medium" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,#0B0B0F_90%] pointer-events-none" />

      <style jsx>{`
        @keyframes orb-float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(100px, -50px) scale(1.1); }
          66% { transform: translate(50px, 50px) scale(0.9); }
        }
        @keyframes orb-float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-80px, 40px) scale(1.15); }
        }
        .animate-orb-slow {
          animation: orb-float-slow 25s infinite linear;
        }
        .animate-orb-medium {
          animation: orb-float-medium 20s infinite linear;
        }
      `}</style>
    </div>
  );
}
