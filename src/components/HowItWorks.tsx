import { motion } from 'motion/react';
import { Link, Bot, Database } from 'lucide-react';

const steps = [
  {
    icon: Link,
    title: 'Connect Your Form',
    desc: 'Simply paste your Google Form link. We automatically detect fields and logic.',
  },
  {
    icon: Bot,
    title: 'AI Conversion',
    desc: 'Our AI transforms questions into a natural, engaging conversation flow.',
  },
  {
    icon: Database,
    title: 'Collect Data',
    desc: 'Responses are structured and synced back to your Google Sheet instantly.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">How It Works</h2>
          <p className="text-gray-400 text-lg">
            Three simple steps to modernize your data collection.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-[#6E8BFF]/20 via-[#9A6BFF]/20 to-[#F4E7B8]/20" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-3xl bg-[#1C1C24] border border-white/5 flex items-center justify-center mb-8 relative z-10 group-hover:border-[#6E8BFF]/30 transition-colors shadow-2xl">
                 <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#6E8BFF] to-[#9A6BFF] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                 <step.icon className="w-10 h-10 text-[#9A6BFF] group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
