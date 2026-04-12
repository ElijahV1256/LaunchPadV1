import { useState } from 'react';
import { Sparkles, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import StepShell from './StepShell';
import LoadingOverlay from './LoadingOverlay';

interface StepData {
  first_customer_name: string;
  customer_suggestions: string[];
}

interface Props {
  data: StepData;
  onUpdate: (fields: Partial<StepData>) => void;
  onNext: () => void;
  onBack: () => void;
  callAI: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
}

export default function StepFindCustomer({ data, onUpdate, onNext, onBack, callAI }: Props) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(data.customer_suggestions?.length > 0);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await callAI('customers') as { suggestions: string[] };
      onUpdate({ customer_suggestions: result.suggestions || [] });
      setGenerated(true);
    } catch (err) {
      console.error('Failed to generate customers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingOverlay message="Finding your first customer..." />}
      </AnimatePresence>

      <StepShell
        stepNumber={2}
        headline="Who do you already know that needs this RIGHT NOW?"
        subtext="Your first customer is always someone you already know."
        onBack={onBack}
      >
        <div className="space-y-5">
          {!generated && (
            <button
              onClick={handleGenerate}
              className="w-full py-4 bg-[#2979FF]/15 border border-[#2979FF]/30 text-[#2979FF] rounded-xl font-semibold hover:bg-[#2979FF]/25 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Show Me Who To Contact
            </button>
          )}

          <AnimatePresence>
            {data.customer_suggestions && data.customer_suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2.5"
              >
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">People in your network who need this:</p>
                {data.customer_suggestions.map((suggestion, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3.5 bg-white/[0.03] border border-white/10 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2979FF]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={14} className="text-[#2979FF]" />
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{suggestion}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2">
            <label className="block text-sm font-semibold text-white mb-2">
              Who came to mind?
            </label>
            <p className="text-xs text-gray-500 mb-3">Type a real name. This person is getting your pitch in Step 4.</p>
            <input
              type="text"
              placeholder="e.g., Sarah, Mike from work, Coach Dave..."
              value={data.first_customer_name}
              onChange={(e) => onUpdate({ first_customer_name: e.target.value })}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20 transition-all text-base"
            />
          </div>

          <button
            onClick={onNext}
            disabled={!data.first_customer_name.trim()}
            className="w-full py-4 bg-[#2979FF] text-white rounded-xl font-bold text-base hover:bg-[#2979FF]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            I Know Exactly Who
          </button>
        </div>
      </StepShell>
    </>
  );
}
