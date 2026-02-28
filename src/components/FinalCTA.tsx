import { motion } from 'motion/react';
import { MagneticButton } from './ui/MagneticButton';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden bg-[#0B0B0F] border-t border-gray-800">

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
          className="flex justify-center"
        >
          <MagneticButton className="px-8 py-3 bg-white text-[#0B0B0F] font-semibold rounded-full hover:bg-gray-200 transition-colors shadow-sm cursor-pointer border border-[#1C1C22]">
            <a href="/start-free" className="flex items-center gap-2 focus:outline-none" aria-label="Start your free trial">
              <span>Start Free</span> <ArrowRight className="w-5 h-5" />
            </a>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
