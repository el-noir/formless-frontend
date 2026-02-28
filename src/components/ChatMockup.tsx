import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Bot, User, Sparkles } from 'lucide-react';

const scenarios = [
  {
    type: "Lead Generation",
    messages: [
      { role: 'ai', content: 'What is your company name?' },
      { role: 'user', content: "Acme Corp" },
      { role: 'ai', content: "Got it. What's your monthly revenue?" },
      { role: 'user', content: "Around $15k MRR." },
    ]
  },
  {
    type: "Support Ticket",
    messages: [
      { role: 'ai', content: 'Describe the issue briefly.' },
      { role: 'user', content: "My dashboard is failing to load." },
      { role: 'ai', content: "Understood. Is this happening on mobile or desktop?" },
      { role: 'user', content: "Desktop only, Chrome browser." },
    ]
  },
  {
    type: "Feedback Survey",
    messages: [
      { role: 'ai', content: 'How would you rate our recent update?' },
      { role: 'user', content: "It's great, but a bit slow." },
      { role: 'ai', content: "Thanks. Can you specify which part feels slow?" },
      { role: 'user', content: "The reporting tab takes 5s to load." },
    ]
  }
];

export function ChatMockup() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let messageTimer: NodeJS.Timeout;

    // Reset state when scenario changes
    setStep(0);

    // Animate messages one by one
    const runSequence = () => {
      let currentStep = 0;
      messageTimer = setInterval(() => {
        if (currentStep < 4) {
          setStep(prev => prev + 1);
          currentStep++;
        } else {
          clearInterval(messageTimer);
          // Wait before switching scenario
          setTimeout(() => {
            setScenarioIndex(prev => (prev + 1) % scenarios.length);
          }, 3000);
        }
      }, 1500);
    };

    runSequence();

    return () => clearInterval(messageTimer);
  }, [scenarioIndex]);

  const currentScenario = scenarios[scenarioIndex];

  return (
    <div className="relative w-full max-w-[480px] mx-auto perspective-[1000px]">
      <motion.div
        initial={{ rotateX: 10, y: 100, opacity: 0 }}
        animate={{ rotateX: 0, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="relative bg-[#0B0B0F] border border-gray-800 rounded-xl p-6 shadow-sm overflow-hidden min-h-[400px] mb-8 lg:mb-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#9A6BFF] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">FormAI Assistant</h3>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-400 font-medium">{currentScenario.type}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {currentScenario.messages.map((msg, index) => (
              (step > index) && (
                <motion.div
                  key={`${scenarioIndex}-${index}`}
                  initial={{ opacity: 0, x: msg.role === 'ai' ? -20 : 20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-[#111116] border border-gray-800' : 'bg-white text-black shadow-sm'
                    }`}>
                    {msg.role === 'ai' ? <Bot className="w-4 h-4 text-[#9A6BFF]" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-none ${msg.role === 'ai'
                      ? 'bg-[#111116] text-gray-200 border border-gray-800 rounded-bl-none'
                      : 'bg-[#9A6BFF] text-white rounded-br-none border border-[#8555e8]'
                    }`}>
                    {msg.content}
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {step < 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#111116] border border-gray-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#9A6BFF]" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#111116] border border-gray-800 rounded-bl-none flex gap-1 items-center h-[46px]">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 rounded-full bg-gray-400"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
