import { motion } from 'motion/react';

export function Background() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0B0B0F]">
      {/* Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6E8BFF] rounded-full blur-[120px] opacity-20"
      />
      
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-[#9A6BFF] rounded-full blur-[120px] opacity-15"
      />

      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-[#F4E7B8] rounded-full blur-[140px] opacity-10"
      />

       <motion.div
        animate={{
          x: [0, -70, 0],
          y: [0, -120, 0],
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[20%] right-[30%] w-[300px] h-[300px] bg-[#6E8BFF] rounded-full blur-[100px] opacity-15"
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,#0B0B0F_90%] pointer-events-none" />
    </div>
  );
}
