import { motion } from 'motion/react';
import { Globe, MessageCircle, Mic, Slack } from 'lucide-react';

const integrations = [
  { name: 'Web', icon: Globe, color: '#6E8BFF' },
  { name: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { name: 'Slack', icon: Slack, color: '#E01E5A' },
  { name: 'Voice', icon: Mic, color: '#F4E7B8' },
];

export function Integrations() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Built for conversations everywhere.</h2>
        
        <div className="flex flex-wrap justify-center gap-6">
          {integrations.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="px-6 py-3 rounded-full bg-[#1C1C24] border border-white/10 flex items-center gap-3 shadow-lg hover:border-white/20 transition-colors cursor-default"
            >
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
              <span className="text-white font-medium">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
