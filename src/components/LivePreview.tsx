import { motion } from 'motion/react';
import { User, Sparkles, ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const example = {
  input: "I make about 5 to 7 thousand dollars a month usually",
  output: "$5,000 - $7,000",
};

export function LivePreview() {
  const [typedText, setTypedText] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const animate = () => {
      setTypedText("");
      setShowOutput(false);
      let i = 0;
      
      intervalId = setInterval(() => {
        setTypedText(example.input.slice(0, i + 1));
        i++;
        if (i > example.input.length) {
          clearInterval(intervalId);
          setShowOutput(true);
          timeoutId = setTimeout(animate, 4000);
        }
      }, 50);
    };

    animate();

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Intelligent Extraction</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Our AI understands context, nuance, and messy inputs, converting them into clean, structured data for your backend.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 relative">
         <motion.div 
           whileHover={{ scale: 1.02 }}
           className="bg-[#121218] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-[#9A6BFF]/30 transition-colors duration-500"
         >
           
           {/* Glow */}
           <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#9A6BFF]/10 blur-[100px] rounded-full pointer-events-none" />

           <div className="space-y-6 relative z-10">
             {/* User Input */}
             <div className="flex gap-4 items-start">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                 <User className="w-5 h-5 text-gray-300" />
               </div>
               <div className="space-y-1 flex-1">
                 <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">User Input</div>
                 <div className="text-xl text-white font-medium leading-relaxed min-h-[60px]">
                   "{typedText}<span className="animate-pulse">|</span>"
                 </div>
               </div>
             </div>

             {/* Arrow */}
             <div className="flex justify-center py-2">
               <motion.div 
                 animate={{ y: [0, 5, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="w-8 h-8 rounded-full bg-[#1C1C24] border border-white/10 flex items-center justify-center text-gray-500"
               >
                 <ArrowDown className="w-4 h-4" />
               </motion.div>
             </div>

             {/* AI Output */}
             <div className="flex gap-4 items-start">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6E8BFF] to-[#9A6BFF] flex items-center justify-center shrink-0 shadow-lg shadow-[#9A6BFF]/20 mt-1">
                 <Sparkles className="w-5 h-5 text-white" />
               </div>
               <div className="space-y-2 flex-1">
                 <div className="text-xs font-medium text-[#9A6BFF] uppercase tracking-wider">Structured Output</div>
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={showOutput ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                   className="inline-block px-4 py-2 rounded-lg bg-[#1C1C24] border border-[#9A6BFF]/30 text-[#9A6BFF] font-mono font-semibold"
                 >
                   {example.output}
                 </motion.div>
               </div>
             </div>
           </div>
        </motion.div>
      </div>
    </section>
  );
}
