import { motion } from 'motion/react';
import { Step1Visual, Step2Visual, Step3Visual } from './ui/HowItWorksVisuals';

const steps = [
  {
    id: '01',
    title: 'Connect Your Form',
    desc: 'Simply paste your Google Form link. We automatically detect fields and logic.',
    visual: Step1Visual,
  },
  {
    id: '02',
    title: 'AI Conversion',
    desc: 'Our AI transforms questions into a natural, engaging conversation flow.',
    visual: Step2Visual,
  },
  {
    id: '03',
    title: 'Collect & Sync',
    desc: 'Responses are structured and synced back to your Google Sheet instantly.',
    visual: Step3Visual,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden bg-[#0B0B0F]" aria-labelledby="how-it-works-title">
      <div className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 id="how-it-works-title" className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">How It Works</h2>
          <p className="text-gray-400 text-lg">
            Three simple steps to modernize your data collection.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[180px] left-[16%] right-[16%] h-px bg-gray-800 z-0">
            <motion.div
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="h-full w-1/3 bg-[#9A6BFF] opacity-50"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative flex flex-col items-center group z-10"
            >
              {/* Card Container */}
              <div className="w-full h-[320px] bg-[#0B0B0F] border border-gray-800 rounded-xl overflow-hidden relative group-hover:border-gray-600 transition-all duration-300 flex flex-col">

                {/* Visual Area */}
                <div className="flex-1 relative bg-[#111116] flex items-center justify-center p-6">
                  {(() => {
                    const Visual = step.visual;
                    return <Visual />;
                  })()}

                  <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Step Number Badge */}
                <div className="absolute top-6 left-6 w-8 h-8 rounded-md bg-[#111116] border border-gray-800 flex items-center justify-center text-xs font-bold text-white group-hover:bg-[#1C1C22] transition-colors duration-300">
                  {step.id}
                </div>

                {/* Text Content */}
                <div className="p-6 bg-[#0B0B0F] border-t border-gray-800 relative z-20">
                  <h3 className="text-lg font-medium text-gray-200 mb-2">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
