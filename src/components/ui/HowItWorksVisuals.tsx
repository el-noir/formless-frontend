import { motion } from 'motion/react';
import { User, Sparkles, Check, FileSpreadsheet } from 'lucide-react';

export function Step1Visual() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-[#0B0B0F]/50 pointer-events-none">
      {/* Mock Input */}
      <motion.div
        initial={{ width: '80%', opacity: 1 }}
        animate={{ width: '0%', opacity: 0 }}
        transition={{ duration: 1, delay: 2, repeat: Infinity, repeatDelay: 4 }}
        className="h-10 bg-[#1C1C24] border border-white/10 rounded-lg flex items-center px-3 mb-8 overflow-hidden"
      >
        <div className="text-xs text-gray-500 truncate">https://docs.google.com/forms/d/e/...</div>
      </motion.div>

      {/* Transformation Effect */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.8, delay: 2.5, repeat: Infinity, repeatDelay: 4.2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6E8BFF] to-[#9A6BFF] flex items-center justify-center shadow-[0_0_30px_#6E8BFF]">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      {/* Chat Bubble Result */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 3, repeat: Infinity, repeatDelay: 4.5 }}
        className="bg-[#1C1C24] border border-[#6E8BFF]/30 p-4 rounded-2xl rounded-tl-none w-3/4 shadow-lg"
      >
        <div className="h-2 w-1/2 bg-white/10 rounded-full mb-2" />
        <div className="h-2 w-3/4 bg-white/10 rounded-full" />
      </motion.div>
    </div>
  );
}

export function Step2Visual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center gap-8 p-6 pointer-events-none">
      {/* User Node */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#1C1C24] border border-white/10 flex flex-col items-center justify-center shadow-lg">
          <User className="w-6 h-6 text-gray-400 mb-1" />
          <span className="text-[10px] text-gray-500">User</span>
        </div>
      </motion.div>

      {/* Connection */}
      <div className="relative flex-1 h-[2px] bg-gradient-to-r from-gray-700 to-gray-700 mx-2">
        <motion.div
          animate={{ x: [-20, 20, -20], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#F4E7B8] w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_20px_#F4E7B8] z-10"
        >
          <Sparkles className="w-4 h-4 text-black" />
        </motion.div>
      </div>

      {/* AI Node */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#1C1C24] border border-[#9A6BFF]/30 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(154,107,255,0.1)]">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6E8BFF] to-[#9A6BFF] flex items-center justify-center text-white font-bold text-xs mb-1">AI</div>
          <span className="text-[10px] text-[#9A6BFF]">Agent</span>
        </div>
      </motion.div>
    </div>
  );
}

export function Step3Visual() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 pointer-events-none">
      {/* Spreadsheet Header */}
      <div className="w-full bg-[#1C1C24] border border-white/10 rounded-t-xl p-2 flex items-center gap-2 border-b-0">
        <FileSpreadsheet className="w-4 h-4 text-[#25D366]" />
        <div className="h-2 w-20 bg-white/10 rounded-full" />
      </div>

      {/* Rows */}
      <div className="w-full bg-[#0B0B0F] border border-white/10 rounded-b-xl overflow-hidden">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.5 + 1, duration: 0.4 }}
            className="flex items-center gap-2 p-2 border-b border-white/5 last:border-0"
          >
            <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center">
              <Check className="w-2 h-2 text-[#25D366]" />
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full" />
          </motion.div>
        ))}

        {/* New Row Animation */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
          className="bg-[#25D366]/10 p-2 flex items-center gap-2 border-l-2 border-[#25D366]"
        >
          <div className="w-4 h-4 rounded bg-[#25D366] flex items-center justify-center">
            <Check className="w-2 h-2 text-white" />
          </div>
          <div className="h-2 w-3/4 bg-white/10 rounded-full" />
        </motion.div>
      </div>

      {/* Success Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 3.5, type: "spring" }}
        className="absolute bottom-4 right-4 bg-[#25D366] text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1"
      >
        <Check className="w-3 h-3" />
        Synced
      </motion.div>
    </div>
  );
}
