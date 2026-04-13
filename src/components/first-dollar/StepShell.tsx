import { useState, useEffect } from 'react';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEP_TIPS: Record<number, string[]> = {
  1: [
    'Keep it simple -- the hardest part of starting a business is not overcomplicating it.',
    'Your first offer doesn\'t need to be perfect. It just needs to exist.',
    'Price based on the value you deliver, not the time it takes.',
    'People pay for solutions to problems they already know they have.',
  ],
  2: [
    'Your first customer is almost always one conversation away.',
    'Don\'t sell to strangers first. Sell to people who already trust you.',
    'You only need ONE person to say yes. That\'s it.',
    'The best first customers are people who\'ve already complained about this problem to you.',
  ],
  3: [
    'Confidence comes after action, not before. Move anyway.',
    'One real result beats a hundred promises.',
    'Nobody asks for your resume before buying a coffee. Stop overthinking credentials.',
    'Your story IS your proof. Own it.',
  ],
  4: [
    'A bad pitch sent today beats a perfect pitch sent never.',
    'People don\'t buy the best product -- they buy the one they hear about.',
    'Rejection is data, not failure. Every "no" sharpens your "yes."',
    'Send it today. Not tomorrow. Today.',
  ],
  5: [
    'Every "no" teaches you more than a "yes" ever could.',
    'Follow up. Most sales happen after the 2nd or 3rd conversation.',
    'Ask for honest feedback -- it\'s the fastest shortcut to a better offer.',
    'Speed of learning beats speed of earning at this stage.',
  ],
  6: [
    'You just did what most people only talk about.',
    'The gap between zero and one is the hardest gap in business. You crossed it.',
    'Your second sale will be 10x easier than your first.',
  ],
};

interface StepShellProps {
  stepNumber: number;
  headline: string;
  subtext?: string;
  children: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

export default function StepShell({ stepNumber, headline, subtext, children, onBack, showBack = true }: StepShellProps) {
  const tips = STEP_TIPS[stepNumber] || [];
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (tips.length <= 1) return;
    setTipIndex(Math.floor(Math.random() * tips.length));
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [stepNumber, tips.length]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
    >
      {tips.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 flex items-start gap-3">
          <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <AnimatePresence mode="wait">
            <motion.p
              key={`${stepNumber}-${tipIndex}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-amber-200/80 text-sm leading-relaxed"
            >
              {tips[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors mb-6 text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#2979FF]/20 flex items-center justify-center text-[#2979FF] font-bold text-sm shrink-0">
            {stepNumber}
          </div>
          <span className="text-xs font-semibold text-[#2979FF] uppercase tracking-wider">
            Step {stepNumber} of 6
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Montserrat'] mb-2 leading-tight">
          {headline}
        </h2>

        {subtext && (
          <p className="text-gray-400 text-sm mb-6">{subtext}</p>
        )}

        <div className="mt-6">{children}</div>
      </div>
    </motion.div>
  );
}
