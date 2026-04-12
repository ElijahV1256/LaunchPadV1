import { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import StepShell from './StepShell';
import LoadingOverlay from './LoadingOverlay';

interface StepData {
  pitch: string;
}

interface Props {
  data: StepData;
  customerName: string;
  onUpdate: (fields: Partial<StepData>) => void;
  onNext: () => void;
  onBack: () => void;
  callAI: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
}

export default function StepMakePitch({ data, customerName, onUpdate, onNext, onBack, callAI }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(!!data.pitch);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await callAI('pitch') as { pitch: string };
      onUpdate({ pitch: result.pitch || '' });
      setGenerated(true);
    } catch (err) {
      console.error('Failed to generate pitch:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pitchLines = data.pitch ? data.pitch.split('\n').filter(l => l.trim()) : [];

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingOverlay message="Writing your pitch..." />}
      </AnimatePresence>

      <StepShell
        stepNumber={4}
        headline="Here's your exact script. Read it word for word."
        subtext={`A personalized pitch for ${customerName}. Send this today. Not tomorrow. Today.`}
        onBack={onBack}
      >
        <div className="space-y-5">
          {!generated && (
            <button
              onClick={handleGenerate}
              className="w-full py-4 bg-[#2979FF]/15 border border-[#2979FF]/30 text-[#2979FF] rounded-xl font-semibold hover:bg-[#2979FF]/25 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Generate My Pitch
            </button>
          )}

          <AnimatePresence>
            {data.pitch && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-[#0A192F] border border-white/10 rounded-xl p-5">
                  <div className="space-y-3">
                    {pitchLines.map((line, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="text-white text-sm leading-relaxed"
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-3.5 bg-[#2979FF] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2979FF]/90 transition-all"
                  >
                    {copied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Copy Pitch</>}
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="px-4 py-3.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <Sparkles size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {generated && (
            <div className="pt-2">
              <p className="text-center text-xs text-gray-500 mb-3">
                Send this today. Not tomorrow. Today.
              </p>
              <button
                onClick={onNext}
                className="w-full py-4 bg-[#2979FF] text-white rounded-xl font-bold text-base hover:bg-[#2979FF]/90 transition-all"
              >
                I Sent It
              </button>
            </div>
          )}
        </div>
      </StepShell>
    </>
  );
}
