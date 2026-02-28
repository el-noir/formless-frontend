import { motion } from 'motion/react';
import { MagneticButton } from './ui/MagneticButton';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section id="waitlist" className="py-32 relative bg-brand-dark overflow-hidden" aria-labelledby="cta-title">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-purple/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8 leading-tight"
        >
          Forms were built for fields.<br />
          <span className="text-gray-500">We built them for conversations.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex justify-center gap-4"
        >
          <MagneticButton className="px-10 py-4 bg-brand-purple hover:bg-[#8B5CF6] text-white font-semibold rounded-full text-lg transition-all focus:outline-none focus:ring-4 focus:ring-brand-purple/30 shadow-[0_0_20px_theme(colors.brand.blue/30)]">
            <a href="/start-free" className="flex items-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </a>
          </MagneticButton>
          <MagneticButton className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full border border-white/10 text-lg transition-all focus:outline-none focus:ring-4 focus:ring-white/10">
            <a href="/contact" className="flex items-center gap-2">
              Contact Sales
            </a>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
