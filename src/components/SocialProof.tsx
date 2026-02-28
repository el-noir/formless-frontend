'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2, Shield, Lock, Server } from 'lucide-react';

const companies = [
  { name: 'Stripe', logo: 'https://cdn.simpleicons.org/stripe/white' },
  { name: 'Notion', logo: 'https://cdn.simpleicons.org/notion/white' },
  { name: 'Vercel', logo: 'https://cdn.simpleicons.org/vercel/white' },
  { name: 'Figma', logo: 'https://cdn.simpleicons.org/figma/white' },
  { name: 'Shopify', logo: 'https://cdn.simpleicons.org/shopify/white' },
  { name: 'HubSpot', logo: 'https://cdn.simpleicons.org/hubspot/white' },
];

export function SocialProof() {
  return (
    <section
      className="py-16 bg-brand-dark border-y border-gray-800"
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
            Join 2,000+ companies using Formless
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
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={120}
                height={40}
                unoptimized
                className="h-8 md:h-10 w-auto opacity-40 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0"
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
          {/* Trust Indicators */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand-surface border border-gray-800">
            <Shield className="w-4 h-4 text-brand-purple" />
            <span className="text-sm text-gray-300 font-medium">SOC2 Compliant</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand-surface border border-gray-800">
            <Lock className="w-4 h-4 text-brand-purple" />
            <span className="text-sm text-gray-300 font-medium">End-to-End Encryption</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand-surface border border-gray-800">
            <Server className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300 font-medium">99.9% Uptime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
