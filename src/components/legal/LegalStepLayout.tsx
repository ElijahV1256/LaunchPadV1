import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Building2,
  FileCheck,
  Hash,
  Landmark,
  ShieldCheck,
  ScrollText,
  ExternalLink,
  Rocket,
} from 'lucide-react';
import { LEGAL_STEPS, NORTHWEST_LINK } from '../../data/legal-steps';

const ICON_MAP: Record<string, React.ElementType> = {
  building: Building2,
  'file-check': FileCheck,
  hash: Hash,
  landmark: Landmark,
  'shield-check': ShieldCheck,
  'scroll-text': ScrollText,
};

interface LegalStepLayoutProps {
  stepKey: string;
  completedSteps: string[];
  onMarkComplete: (stepKey: string) => void;
  children: React.ReactNode;
}

export default function LegalStepLayout({
  stepKey,
  completedSteps,
  onMarkComplete,
  children,
}: LegalStepLayoutProps) {
  const navigate = useNavigate();
  const currentIndex = LEGAL_STEPS.findIndex((s) => s.key === stepKey);
  const currentStep = LEGAL_STEPS[currentIndex];
  const prevStep = currentIndex > 0 ? LEGAL_STEPS[currentIndex - 1] : null;
  const nextStep = currentIndex < LEGAL_STEPS.length - 1 ? LEGAL_STEPS[currentIndex + 1] : null;
  const isComplete = completedSteps.includes(stepKey);

  return (
    <div className="min-h-screen bg-[#060d19]">
      <div className="border-b border-white/[0.06] bg-[#060d19]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-3">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {LEGAL_STEPS.map((step, i) => {
              const StepIcon = ICON_MAP[step.icon] || Building2;
              const isDone = completedSteps.includes(step.key);
              const isCurrent = step.key === stepKey;

              return (
                <button
                  key={step.key}
                  onClick={() => navigate(step.path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-white/[0.08] text-white'
                      : isDone
                      ? 'text-emerald-400 hover:bg-white/[0.04]'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                  }`}
                >
                  {isDone && !isCurrent ? (
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        isCurrent ? 'bg-[#2979FF] text-white' : 'bg-white/[0.06] text-gray-500'
                      }`}
                    >
                      {step.number}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 pb-32">
        <nav className="flex items-center gap-1.5 text-sm mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Home size={14} />
            Dashboard
          </button>
          <ChevronRight size={13} className="text-gray-700" />
          <button
            onClick={() => navigate('/legal')}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            Legal
          </button>
          <ChevronRight size={13} className="text-gray-700" />
          <span className="text-gray-300 font-medium">Step {currentStep.number}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: `${currentStep.color}18`, color: currentStep.color }}
            >
              {currentStep.number}
            </span>
            <p className="text-gray-500 text-sm font-medium">Step {currentStep.number} of {LEGAL_STEPS.length}</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            {currentStep.title}
          </h1>
          <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
            {currentStep.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {children}
        </motion.div>

        <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/[0.06]">
          {prevStep ? (
            <button
              onClick={() => navigate(prevStep.path)}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all text-sm"
            >
              <ChevronLeft size={16} />
              {prevStep.shortTitle}
            </button>
          ) : (
            <button
              onClick={() => navigate('/legal')}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all text-sm"
            >
              <ChevronLeft size={16} />
              Overview
            </button>
          )}

          <div className="flex items-center gap-3">
            {!isComplete && (
              <button
                onClick={() => onMarkComplete(stepKey)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/15 transition-all border border-emerald-500/20"
              >
                <CheckCircle2 size={15} />
                Mark Complete
              </button>
            )}
            {isComplete && (
              <span className="flex items-center gap-1.5 px-3 py-2 text-emerald-400 text-sm">
                <CheckCircle2 size={15} />
                Completed
              </span>
            )}
            {nextStep ? (
              <button
                onClick={() => navigate(nextStep.path)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#2979FF] text-white rounded-xl text-sm font-semibold hover:bg-[#3d88ff] transition-all"
              >
                Next: {nextStep.shortTitle}
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={() => navigate('/mission-control')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#2979FF] text-white rounded-xl text-sm font-semibold hover:bg-[#3d88ff] transition-all shadow-lg shadow-[#2979FF]/20"
              >
                <Rocket size={15} />
                Mission Control
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#060d19]/90 backdrop-blur-md sm:hidden">
        <div className="flex items-center justify-center gap-3 px-5 py-3">
          <a
            href={NORTHWEST_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#06D6A0] text-[#060d19] rounded-xl text-sm font-bold hover:bg-[#05c490] transition-all"
          >
            Start with Northwest
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <p className="text-center text-gray-600 text-[11px] pb-6 px-5">
        Some links in this section are affiliate partnerships. We only recommend tools we trust.
      </p>
    </div>
  );
}
