import { useState } from 'react';
import { Shield, Gift, Star, Copy, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import StepShell from './StepShell';
import LoadingOverlay from './LoadingOverlay';

const PROOF_OPTIONS = [
  {
    id: 'free-testimonial',
    icon: Gift,
    title: "I'll do it free/discounted for a testimonial",
    description: 'Lowest risk for them, fastest path for you',
  },
  {
    id: 'guarantee',
    icon: Shield,
    title: "I'll guarantee results or full refund",
    description: 'Shows massive confidence in what you deliver',
  },
  {
    id: 'experience',
    icon: Star,
    title: 'I have past experience to reference',
    description: 'Leverage what you already know',
  },
];

interface StepData {
  credibility_type: string;
  credibility_statement: string;
}

interface Props {
  data: StepData;
  onUpdate: (fields: Partial<StepData>) => void;
  onNext: () => void;
  onBack: () => void;
  callAI: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
}

export default function StepBuildProof({ data, onUpdate, onNext, onBack, callAI }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectType = async (typeId: string) => {
    onUpdate({ credibility_type: typeId, credibility_statement: '' });
    setLoading(true);
    try {
      const result = await callAI('credibility', { credibilityType: typeId }) as { statement: string };
      onUpdate({ credibility_type: typeId, credibility_statement: result.statement || '' });
    } catch (err) {
      console.error('Failed to generate credibility:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.credibility_statement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingOverlay message="Building your credibility..." />}
      </AnimatePresence>

      <StepShell
        stepNumber={3}
        headline="You don't need experience. You need ONE result."
        subtext="Pick your approach. AI will write your credibility statement."
        onBack={onBack}
      >
        <div className="space-y-4">
          {PROOF_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = data.credibility_type === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectType(option.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#2979FF] bg-[#2979FF]/10 ring-1 ring-[#2979FF]/50'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#2979FF]/20' : 'bg-white/5'
                  }`}>
                    <Icon size={18} className={isSelected ? 'text-[#2979FF]' : 'text-gray-400'} />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {option.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}

          <AnimatePresence>
            {data.credibility_statement && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#0A192F] border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#2979FF]">Your credibility statement:</p>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-all"
                  >
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <p className="text-white text-sm leading-relaxed">{data.credibility_statement}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={onNext}
            disabled={!data.credibility_statement}
            className="w-full py-4 bg-[#2979FF] text-white rounded-xl font-bold text-base hover:bg-[#2979FF]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            I'm Ready to Pitch
          </button>
        </div>
      </StepShell>
    </>
  );
}
