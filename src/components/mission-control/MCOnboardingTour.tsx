import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, BarChart2, Link2, ArrowRight, X } from 'lucide-react';

const STEPS = [
  {
    icon: Rocket,
    color: '#2979FF',
    title: 'Welcome to Mission Control',
    description: 'This is your daily command center. Check in every morning to see your stats, priorities, and what needs your attention.',
  },
  {
    icon: BarChart2,
    color: '#06D6A0',
    title: 'Track Your Business Metrics',
    description: 'Your Quick Stats cards show revenue, leads, messages, reviews, and appointments at a glance. These will pull real data once you connect your tools.',
  },
  {
    icon: Link2,
    color: '#F59E0B',
    title: 'Connect Your Tools',
    description: 'Link Stripe, Google Calendar, Gmail, and more to make your dashboard come alive with real-time data from your business.',
  },
];

interface Props {
  onComplete: () => void;
}

export default function MCOnboardingTour({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a1e38] p-6 sm:p-8 shadow-2xl"
        >
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="text-center">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: `${current.color}15` }}
              >
                <Icon size={28} style={{ color: current.color }} />
              </div>

              <h2 className="text-white font-bold text-xl mb-2">{current.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
                {current.description}
              </p>
            </motion.div>

            <div className="flex items-center justify-center gap-2 mb-5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-[#2979FF]' : 'w-1.5 bg-white/[0.1]'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 bg-white/[0.04] hover:bg-white/[0.06] transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => (isLast ? onComplete() : setStep(step + 1))}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-[#2979FF] text-white hover:bg-[#2979FF]/80 transition-colors"
              >
                {isLast ? "Let's Go" : 'Next'}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
