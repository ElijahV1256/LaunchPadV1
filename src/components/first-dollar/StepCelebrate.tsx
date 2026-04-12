import { useState, useEffect } from 'react';
import { Copy, Check, ArrowRight, Share2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import StepShell from './StepShell';
import LoadingOverlay from './LoadingOverlay';

interface CelebrationData {
  origin_story: string;
  followup_message: string;
  next_action: string;
}

interface Props {
  revenue: number;
  businessName: string;
  celebrationData: CelebrationData;
  onBack: () => void;
  onContinue: () => void;
  callAI: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
  onUpdateCelebration: (data: Partial<CelebrationData>) => void;
}

export default function StepCelebrate({ revenue, businessName, celebrationData, onBack, onContinue, callAI, onUpdateCelebration }: Props) {
  const [loading, setLoading] = useState(false);
  const [copiedStory, setCopiedStory] = useState(false);
  const [copiedFollowup, setCopiedFollowup] = useState(false);

  useEffect(() => {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#2979FF', '#00D4FF', '#FFD700'] });
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
    }, 300);

    if (!celebrationData.origin_story) {
      generateCelebration();
    }
  }, []);

  const generateCelebration = async () => {
    setLoading(true);
    try {
      const result = await callAI('celebrate', { revenue }) as {
        originStory: string;
        followupMessage: string;
        nextAction: string;
      };
      onUpdateCelebration({
        origin_story: result.originStory || '',
        followup_message: result.followupMessage || '',
        next_action: result.nextAction || '',
      });
    } catch (err) {
      console.error('Failed to generate celebration:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyStory = () => {
    navigator.clipboard.writeText(celebrationData.origin_story);
    setCopiedStory(true);
    setTimeout(() => setCopiedStory(false), 2000);
  };

  const handleCopyFollowup = () => {
    navigator.clipboard.writeText(celebrationData.followup_message);
    setCopiedFollowup(true);
    setTimeout(() => setCopiedFollowup(false), 2000);
  };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingOverlay message="Preparing your celebration..." />}
      </AnimatePresence>

      <StepShell
        stepNumber={6}
        headline=""
        onBack={onBack}
      >
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-center py-6"
          >
            <div className="text-6xl mb-4">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
              >
                $
              </motion.span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white font-['Montserrat'] mb-2">
              You just made ${revenue}!
            </h2>
            <p className="text-gray-400">with {businessName}</p>
          </motion.div>

          {celebrationData.origin_story && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="bg-[#0A192F] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#2979FF] uppercase tracking-wider">Your Origin Story</p>
                  <button
                    onClick={handleCopyStory}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#2979FF]/15 border border-[#2979FF]/30 text-[#2979FF] rounded-lg hover:bg-[#2979FF]/25 transition-all"
                  >
                    {copiedStory ? <><Check size={12} /> Copied</> : <><Share2 size={12} /> Share Your Win</>}
                  </button>
                </div>
                <p className="text-white text-sm leading-relaxed">{celebrationData.origin_story}</p>
              </div>

              <div className="bg-[#0A192F] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Get a Testimonial</p>
                  <button
                    onClick={handleCopyFollowup}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-all"
                  >
                    {copiedFollowup ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{celebrationData.followup_message}</p>
              </div>

              <div className="bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-xl p-5">
                <p className="text-xs font-semibold text-[#2979FF] uppercase tracking-wider mb-2">Next: Get Customer #2</p>
                <p className="text-white text-sm leading-relaxed">{celebrationData.next_action}</p>
              </div>
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onContinue}
            className="w-full py-4 bg-[#2979FF] text-white rounded-xl font-bold text-base hover:bg-[#2979FF]/90 transition-all flex items-center justify-center gap-2"
          >
            Continue to Brand Identity
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </StepShell>
    </>
  );
}
