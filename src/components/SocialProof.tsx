'use client';

import { motion } from 'motion/react';

const companies = [
  { name: 'Stripe', logo: 'https://cdn.simpleicons.org/stripe/white' },
  { name: 'Notion', logo: 'https://cdn.simpleicons.org/notion/white' },
  { name: 'Salesforce', logo: 'https://cdn.simpleicons.org/salesforce/white' },
  { name: 'Slack', logo: 'https://cdn.simpleicons.org/slack/white' },
  { name: 'Shopify', logo: 'https://cdn.simpleicons.org/shopify/white' },
  { name: 'HubSpot', logo: 'https://cdn.simpleicons.org/hubspot/white' },
];

export function SocialProof() {
  return (
    <section 
      className="py-16 bg-[#0A0A0F] border-y border-white/5"
      aria-label="Trusted by leading companies"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
            Trusted by Industry Leaders
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Join 2,000+ companies using FormAI
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12 items-center">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-center group"
            >
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="h-8 md:h-10 w-auto opacity-40 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">2,000+</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">50K+</div>
            <div className="text-sm text-gray-400">Forms Created</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">1M+</div>
            <div className="text-sm text-gray-400">Responses Collected</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">35%</div>
            <div className="text-sm text-gray-400">Avg. Conversion Increase</div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-300">SOC 2 Certified</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-300">GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-300">256-bit SSL</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
