import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    quote: "FormAI transformed how we qualify leads. The conversational approach increased our conversion rate by 35% in just two weeks.",
    author: "Sarah Chen",
    role: "Head of Growth",
    company: "TechFlow",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=faces"
  },
  {
    quote: "The AI extraction is magic. We used to spend hours cleaning data from Google Forms. Now it's instant and structured perfectly.",
    author: "Marcus Rodriguez",
    role: "Product Manager",
    company: "StartScale",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
  },
  {
    quote: "It feels like having a real person interview our candidates. The engagement is incredible compared to static forms.",
    author: "Elena Fisher",
    role: "Recruiting Lead",
    company: "HireFast",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces"
  }
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Trusted by Innovators</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative h-[400px] md:h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
              >
                 <div className="w-16 h-16 rounded-full bg-[#1C1C24] border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                   <Quote className="w-6 h-6 text-[#9A6BFF]" />
                 </div>
                 
                 <p className="text-2xl md:text-4xl font-medium text-white mb-8 leading-tight max-w-3xl">
                   "{testimonials[current].quote}"
                 </p>
                 
                 <div className="flex items-center gap-4">
                    <img 
                      src={testimonials[current].image} 
                      alt={testimonials[current].author}
                      className="w-12 h-12 rounded-full border border-white/10 object-cover"
                    />
                    <div className="text-left">
                       <div className="text-white font-semibold">{testimonials[current].author}</div>
                       <div className="text-sm text-gray-400">{testimonials[current].role} at {testimonials[current].company}</div>
                    </div>
                 </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === current ? 'w-8 bg-[#9A6BFF]' : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
