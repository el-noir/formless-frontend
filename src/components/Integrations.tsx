import { motion } from 'motion/react';
import { SlackLogo, NotionLogo, GitHubLogo, DiscordLogo, LinearLogo } from './ui/BrandIcons';

const integrations = [
  { name: 'Slack', icon: SlackLogo, desc: 'Real-time notifications' },
  { name: 'Notion', icon: NotionLogo, desc: 'Sync database items' },
  { name: 'GitHub', icon: GitHubLogo, desc: 'Create issues automatically' },
  { name: 'Discord', icon: DiscordLogo, desc: 'Community engagement' },
  { name: 'Linear', icon: LinearLogo, desc: 'Streamline project tracking' },
];

export function Integrations() {
  return (
    <section id="integrations" className="py-24 relative overflow-hidden" aria-labelledby="integrations-title">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h2 id="integrations-title" className="text-3xl md:text-5xl font-bold text-white mb-6">Seamless Integrations</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">
          Connect Formless with the tools you already use. No code required.
        </p>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {integrations.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 50 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative px-8 py-6 rounded-2xl bg-[#1C1C24] border border-white/5 flex flex-col items-center gap-4 shadow-xl hover:border-white/10 hover:bg-[#23232D] transition-all cursor-default min-w-[160px] md:min-w-[200px]"
            >
              <div className="w-12 h-12 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                <item.icon className="w-full h-full" />
              </div>
              <div className="text-center">
                <span className="block text-white font-semibold text-lg mb-1">{item.name}</span>
                <span className="block text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{item.desc}</span>
              </div>

              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
