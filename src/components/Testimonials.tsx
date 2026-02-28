import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Quote, Pause, Play } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    quote: "FormAI transformed how we qualify leads. The conversational approach increased our conversion rate by 35% in just two weeks.",
    author: "Sarah Chen",
    role: "Head of Growth",
    company: "TechFlow",
    image: "https://images.unsplash.com/photo-1765005204058-10418f5123c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFuJTIwY29ycG9yYXRlfGVufDF8fHx8MTc3MTIxODkxN3ww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    quote: "The AI extraction is magic. We used to spend hours cleaning data from Google Forms. Now it's instant and structured perfectly.",
    author: "Marcus Rodriguez",
    role: "Product Manager",
    company: "StartScale",
    image: "https://images.unsplash.com/photo-1769071166862-8cc3a6f2ac5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbiUyMHN0YXJ0dXB8ZW58MXx8fHwxNzcxMjY3MTM5fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    quote: "It feels like having a real person interview our candidates. The engagement is incredible compared to static forms.",
    author: "Elena Fisher",
    role: "Recruiting Lead",
    company: "HireFast",
    image: "https://images.unsplash.com/photo-1769636930016-5d9f0ca653aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFuJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzcxMjU4NzYxfDA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden bg-brand-dark border-t border-gray-800" aria-labelledby="testimonials-title">

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 id="testimonials-title" className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Trusted by Innovators</h2>
          <p className="text-gray-400 text-lg">Join thousands of teams building smarter forms.</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative min-h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
              >
                <div className="w-12 h-12 rounded-md bg-brand-surface border border-gray-800 flex items-center justify-center mb-10 shadow-sm">
                  <Quote className="w-6 h-6 text-brand-purple" />
                </div>

                <p className="text-2xl md:text-4xl font-medium text-white mb-12 leading-tight max-w-4xl tracking-tight">
                  &ldquo;{testimonials[current].quote}&rdquo;
                </p>

                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <Image
                      src={testimonials[current].image}
                      alt={testimonials[current].author}
                      width={80}
                      height={80}
                      className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border border-gray-800 object-cover shadow-sm"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-white text-lg font-semibold mb-1">{testimonials[current].author}</div>
                    <div className="text-sm text-gray-400 font-medium tracking-wide uppercase">{testimonials[current].role} • <span className="text-brand-purple">{testimonials[current].company}</span></div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center gap-6 mt-12">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple"
              aria-label={isPaused ? 'Resume testimonial rotation' : 'Pause testimonial rotation'}
            >
              {isPaused ? <Play className="w-4 h-4 text-white" /> : <Pause className="w-4 h-4 text-white" />}
            </button>
            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-brand-purple ${index === current ? 'w-12 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  aria-label={`Go to testimonial ${index + 1} of ${testimonials.length}`}
                  aria-current={index === current ? 'true' : 'false'}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
