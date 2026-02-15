import { motion } from 'motion/react';
import { MagneticButton } from './ui/MagneticButton';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#6E8BFF]/10 to-transparent pointer-events-none" />
      
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
           <MagneticButton className="group relative px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden">
             <span className="flex items-center gap-2 relative z-10">
               Start Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </span>
           </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
