import { motion, useSpring, useTransform, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const springValue = useSpring(0, { stiffness: 40, damping: 15, mass: 1 });
  const displayValue = useTransform(springValue, (current) => Math.round(current));

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  return (
    <div className="flex flex-col items-center justify-center">
      <span ref={ref} className="text-4xl md:text-5xl font-bold text-white tracking-tight flex items-center">
        <motion.span>{displayValue}</motion.span>
        <span>{suffix}</span>
      </span>
    </div>
  );
}

const stats = [
  { value: 50000, label: 'Forms Transformed', suffix: '+' },
  { value: 95, label: 'Completion Rate', suffix: '%' },
  { value: 10, label: 'Faster Response', suffix: 'x' },
  { value: 24, label: 'Support Available', suffix: '/7' },
];

export function Stats() {
  return (
    <section className="py-20 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2 flex flex-col items-center">
            <Counter value={stat.value} suffix={stat.suffix} />
            <p className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
