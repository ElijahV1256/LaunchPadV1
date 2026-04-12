import { useState } from 'react';
import { PartyPopper, Clock, X, Copy, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import StepShell from './StepShell';
import LoadingOverlay from './LoadingOverlay';

interface StepData {
  outcome: string;
  revenue: number;
}

interface Props {
  data: StepData;
  customerName: string;
  onUpdate: (fields: Partial<StepData>) => void;
  onNext: () => void;
  onBack: () => void;
  callAI: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
  price: string;
}

export default function StepDeliverLearn({ data, customerName, onUpdate, onNext, onBack, callAI, price }: Props) {
  const [loading, setLoading] = useState(false);
  const [followupMsg, setFollowupMsg] = useState('');
  const [reframeData, setReframeData] = useState<{ reframe: string; nextPerson: string } | null>(null);
  const [revenueInput, setRevenueInput] = useState(data.revenue ? String(data.revenue) : '');
  const [copiedFollowup, setCopiedFollowup] = useState(false);

  const handleYes = () => {
    onUpdate({ outcome: 'yes' });
  };

  const handleWaiting = async () => {
    onUpdate({ outcome: 'waiting' });
    setLoading(true);
    try {
      const result = await callAI('followup') as { message: string };
      setFollowupMsg(result.message || '');
    } catch (err) {
      console.error('Failed to get followup:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNo = async () => {
    onUpdate({ outcome: 'no' });
    setLoading(true);
    try {
      const result = await callAI('reframe') as { reframe: string; nextPerson: string };
      setReframeData(result);
    } catch (err) {
      console.error('Failed to get reframe:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFollowup = () => {
    navigator.clipboard.writeText(followupMsg);
    setCopiedFollowup(true);
    setTimeout(() => setCopiedFollowup(false), 2000);
  };

  const handleConfirmRevenue = () => {
    const amount = parseFloat(revenueInput) || 0;
    onUpdate({ revenue: amount, outcome: 'yes' });
    onNext();
  };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingOverlay message="Preparing your next move..." />}
      </AnimatePresence>

      <StepShell
        stepNumber={5}
        headline="You sent it. Now what?"
        subtext={`What did ${customerName} say?`}
        onBack={onBack}
      >
        <div className="space-y-5">
          {!data.outcome && (
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleYes}
                className="w-full p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-left hover:bg-emerald-500/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PartyPopper size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">They said YES</p>
                    <p className="text-xs text-gray-400">Time to celebrate</p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleWaiting}
                className="w-full p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-left hover:bg-amber-500/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Still waiting...</p>
                    <p className="text-xs text-gray-400">Get a follow-up message</p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleNo}
                className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-xl text-left hover:bg-white/[0.06] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <X size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">They said no</p>
                    <p className="text-xs text-gray-400">No worries, we have a plan</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          <AnimatePresence>
            {data.outcome === 'yes' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center">
                  <p className="text-emerald-400 font-bold text-xl mb-2">Let's go!</p>
                  <p className="text-gray-300 text-sm">How much did you charge?</p>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={revenueInput}
                    onChange={(e) => setRevenueInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold text-center focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <button
                  onClick={handleConfirmRevenue}
                  disabled={!revenueInput || parseFloat(revenueInput) <= 0}
                  className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-base hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Celebrate My Win
                </button>
              </motion.div>
            )}

            {data.outcome === 'waiting' && followupMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
                  <p className="text-amber-400 font-semibold text-sm mb-2">Don't sweat it. Send this follow-up:</p>
                  <p className="text-white text-sm leading-relaxed mb-3">{followupMsg}</p>
                  <button
                    onClick={handleCopyFollowup}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg hover:bg-amber-500/30 transition-all"
                  >
                    {copiedFollowup ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Message</>}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => onUpdate({ outcome: '' })}
                    className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-all text-sm"
                  >
                    Check Again Later
                  </button>
                  <button
                    onClick={handleYes}
                    className="flex-1 py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-semibold hover:bg-emerald-500/30 transition-all text-sm"
                  >
                    They Said Yes!
                  </button>
                </div>
              </motion.div>
            )}

            {data.outcome === 'no' && reframeData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                  <p className="text-white font-semibold text-sm mb-2">{reframeData.reframe}</p>
                  <div className="mt-3 p-3 bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-lg">
                    <p className="text-xs text-[#2979FF] font-semibold mb-1">Your next person to contact:</p>
                    <p className="text-gray-300 text-sm">{reframeData.nextPerson}</p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdate({ outcome: '' })}
                  className="w-full py-3 bg-[#2979FF]/15 border border-[#2979FF]/30 text-[#2979FF] rounded-xl font-semibold hover:bg-[#2979FF]/25 transition-all text-sm"
                >
                  Try Again With Someone New
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </StepShell>
    </>
  );
}
