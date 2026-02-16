import { motion } from 'motion/react';
import { Brain, Globe, BarChart3, ShieldCheck, UserCog, Share2 } from 'lucide-react';
import { TiltCard } from './ui/TiltCard';
import { 
  ContextAwareVisual, 
  AnalyticsVisual, 
  SecurityVisual, 
  GlobalVisual, 
  IntegrationVisual 
} from './ui/FeatureVisuals';

const features = [
  {
    icon: Brain,
    title: 'Context Aware',
    desc: 'Remembers previous answers to ask relevant follow-up questions.',
    colSpan: 'md:col-span-2',
    visual: ContextAwareVisual,
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    desc: 'Speaks 90+ languages fluently.',
    colSpan: 'md:col-span-1',
    visual: GlobalVisual,
  },
  {
    icon: BarChart3,
    title: 'Instant Analytics',
    desc: 'Real-time dashboards and insights.',
    colSpan: 'md:col-span-1',
    visual: AnalyticsVisual,
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    desc: 'SOC2 compliant data protection.',
    colSpan: 'md:col-span-2',
    visual: SecurityVisual,
  },
  {
    icon: UserCog,
    title: 'Custom Personality',
    desc: 'Match your brand voice perfectly.',
    colSpan: 'md:col-span-1',
    // No specific visual for this one, keep simple or add later
  },
  {
    icon: Share2,
    title: 'Export Anywhere',
    desc: 'Sync to Notion, Airtable, or Excel.',
    colSpan: 'md:col-span-2',
    visual: IntegrationVisual,
  },
];

export function BentoFeatures() {
  return (
    <section id="features" className="py-32 relative bg-[#0B0B0F]" aria-labelledby="features-title">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 id="features-title" className="text-3xl md:text-5xl font-bold text-white mb-6">Powerful Features</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to build intelligent conversational forms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {features.map((feature, index) => (
            <TiltCard key={index} className={feature.colSpan}>
              <motion.div
                className="h-full relative group overflow-hidden rounded-3xl bg-[#121218] border border-white/10 hover:border-[#6E8BFF]/30 transition-colors flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Visual Container */}
                <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#1C1C24]/50 to-transparent">
                  {feature.visual && (() => {
                    const Visual = feature.visual;
                    return (
                      <div className="absolute inset-0 w-full h-full" style={{ transform: "translateZ(20px)" }}>
                        <Visual />
                      </div>
                    );
                  })()}
                  
                  {/* Fallback/Overlay for hover effect */}
                  <div 
                     className="absolute inset-0 bg-gradient-to-br from-[#6E8BFF]/5 to-[#9A6BFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                     style={{ transform: "translateZ(-10px)" }}
                  />
                </div>
                
                {/* Content */}
                <div className="relative z-20 p-8 pt-0 bg-gradient-to-t from-[#121218] via-[#121218] to-transparent" style={{ transform: "translateZ(30px)" }}>
                  <div className="w-12 h-12 rounded-2xl bg-[#1C1C24] border border-white/10 flex items-center justify-center mb-4 shadow-lg">
                    <feature.icon className="w-6 h-6 text-[#9A6BFF]" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
