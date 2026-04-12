import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepShellProps {
  stepNumber: number;
  headline: string;
  subtext?: string;
  children: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

export default function StepShell({ stepNumber, headline, subtext, children, onBack, showBack = true }: StepShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
    >
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
