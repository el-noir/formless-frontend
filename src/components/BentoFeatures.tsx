import { motion } from 'motion/react';
import { Brain, Globe, BarChart3, ShieldCheck, UserCog, Share2 } from 'lucide-react';
import { TiltCard } from './ui/TiltCard';

const features = [
  {
    icon: Brain,
    title: 'Context Aware',
    desc: 'Remembers previous answers to ask relevant follow-up questions.',
    colSpan: 'md:col-span-2',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    desc: 'Speaks 90+ languages fluently.',
    colSpan: 'md:col-span-1',
  },
  {
    icon: BarChart3,
    title: 'Instant Analytics',
    desc: 'Real-time dashboards and insights.',
    colSpan: 'md:col-span-1',
  },
  {
    icon: ShieldCheck,
    title: 'Smart Validation',
    desc: 'Ensures data quality at the source.',
    colSpan: 'md:col-span-2',
  },
  {
    icon: UserCog,
    title: 'Custom Personality',
    desc: 'Match your brand voice perfectly.',
    colSpan: 'md:col-span-1',
  },
  {
    icon: Share2,
    title: 'Export Anywhere',
    desc: 'Sync to Notion, Airtable, or Excel.',
    colSpan: 'md:col-span-2',
  },
];

export function BentoFeatures() {
  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Powerful Features</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to build intelligent conversational forms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <TiltCard key={index} className={feature.colSpan}>
              <motion.div
                className="h-full relative group overflow-hidden rounded-3xl bg-[#121218] border border-white/10 p-8 hover:border-[#6E8BFF]/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div 
                   className="absolute inset-0 bg-gradient-to-br from-[#6E8BFF]/5 to-[#9A6BFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                   style={{ transform: "translateZ(-20px)" }}
                />
                
                <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
                  <div className="w-12 h-12 rounded-2xl bg-[#1C1C24] border border-white/5 flex items-center justify-center mb-6 shadow-lg">
                    <feature.icon className="w-6 h-6 text-[#9A6BFF]" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
