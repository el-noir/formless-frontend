import { motion } from 'motion/react';
import { Bot, Activity, Shield, Globe, Zap, Database, Share2, Layers } from 'lucide-react';

// Visual for Context Aware (Stacked Cards)
export function ContextAwareVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1 - i * 0.15, y: -i * 12, scale: 1 - i * 0.05 }}
          transition={{ duration: 0.5, delay: i * 0.2 }}
          className="absolute w-48 h-32 bg-brand-card border border-white/10 rounded-xl shadow-2xl flex flex-col p-4 backdrop-blur-sm"
          style={{
            zIndex: 3 - i,
            top: `calc(50% + ${i * 10}px)`,
            left: `calc(50% - ${96 - i * 5}px)`
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <Bot className="w-4 h-4 text-brand-purple" />
            </div>
            <div className="h-2 w-20 bg-white/10 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-white/5 rounded-full" />
            <div className="h-2 w-3/4 bg-white/5 rounded-full" />
          </div>

          {i === 0 && (
            <motion.div
              animate={{ x: [0, 5, 0], y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-2 -bottom-2 bg-gradient-to-r from-brand-purple to-brand-purple text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border border-white/20 flex items-center gap-1"
            >
              <Layers className="w-3 h-3" />
              Context
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Visual for Instant Analytics (Bar Chart)
export function AnalyticsVisual() {
  return (
    <div className="relative w-full h-full flex items-end justify-center gap-2 pb-12 px-8 pointer-events-none">
      {[0.4, 0.7, 0.5, 0.9, 0.6].map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${height * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: i * 0.1, type: "spring" }}
          className="w-8 rounded-t-lg bg-gradient-to-t from-brand-purple/10 to-brand-purple relative group border-t border-x border-white/10"
        >
        </motion.div>
      ))}

      {/* Floating Insight Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        animate={{ y: [0, -8, 0] }}
        className="absolute top-8 right-8 bg-brand-card border border-white/10 p-3 rounded-xl shadow-xl flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-[#2A2A35] flex items-center justify-center">
          <Activity className="w-4 h-4 text-[#F4E7B8]" />
        </div>
        <div>
          <div className="text-xs text-gray-400">Conversion</div>
          <div className="text-sm font-bold text-white">+24.5%</div>
        </div>
      </motion.div>
    </div>
  );
}

// Visual for Security (Shield Scan)
export function SecurityVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      <div className="relative w-24 h-24">
        <Shield className="w-full h-full text-brand-card drop-shadow-2xl" strokeWidth={1.5} />

        {/* Animated Scan Line */}
        <motion.div
          initial={{ top: '0%' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-brand-purple shadow-[0_0_10px_theme(colors.brand.purple)] z-10"
        />

        {/* Glow effect behind */}
        <div className="absolute inset-0 bg-brand-purple/20 blur-xl rounded-full" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-brand-card p-3 rounded-full border border-white/10 shadow-xl z-20">
            <Shield className="w-6 h-6 text-brand-purple" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Visual for Integration/Export (Network)
export function IntegrationVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      {/* Center Node */}
      <div className="w-14 h-14 rounded-2xl bg-brand-card border border-white/10 flex items-center justify-center relative z-20 shadow-[0_0_30px_theme(colors.brand.blue/15)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-purple flex items-center justify-center text-white font-bold text-xs">AI</div>
      </div>

      {/* Orbiting Satellites */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-10"
        >
          <div
            className="absolute top-1/2 left-1/2 w-10 h-10 -ml-5 -mt-5 rounded-full bg-brand-card border border-white/10 flex items-center justify-center shadow-lg"
            style={{
              transform: `rotate(${i * 120}deg) translateX(${70 + i * 10}px) rotate(-${i * 120}deg)`
            }}
          >
            {i === 0 && <Database className="w-4 h-4 text-gray-400" />}
            {i === 1 && <Share2 className="w-4 h-4 text-gray-400" />}
            {i === 2 && <Zap className="w-4 h-4 text-gray-400" />}
          </div>

          {/* Dotted Line Connection */}
          <div
            className="absolute top-1/2 left-1/2 h-[1px] border-t border-dashed border-white/20 origin-left"
            style={{
              width: `${70 + i * 10}px`,
              transform: `rotate(${i * 120}deg)`
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Visual for Multi-Language
export function GlobalVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      <Globe className="w-32 h-32 text-white/5 absolute" strokeWidth={1} />

      {/* Floating Labels */}
      {[
        { text: 'Hello', x: -40, y: -30, delay: 0 },
        { text: 'Bonjour', x: 40, y: -20, delay: 1 },
        { text: 'Hola', x: -20, y: 40, delay: 2 },
        { text: 'こんにちは', x: 30, y: 30, delay: 3 },
      ].map((item, i) => (
        <motion.div
          key={i}
          animate={{
            y: [item.y, item.y - 10, item.y],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 3, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
          className="absolute px-3 py-1.5 rounded-lg bg-brand-card border border-white/10 text-xs text-gray-300 shadow-lg"
          style={{ transform: `translate(${item.x}px, ${item.y}px)` }}
        >
          {item.text}
        </motion.div>
      ))}
    </div>
  );
}
