import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Sparkles, Loader2 } from 'lucide-react';

interface StrategyData {
  thisWeek: string[];
  whoToTarget: string;
  whatWorks: string[];
  thirtyDayGoal: string;
}

interface ContentPiece {
  title: string;
  body: string;
}

interface PlatformPanelProps {
  isOpen: boolean;
  onClose: () => void;
  platformKey: string;
  platformLabel: string;
  platformEmoji: string;
  strategy: StrategyData | null;
  content: ContentPiece[];
  onGenerateMore: () => Promise<void>;
  generatingMore: boolean;
}

export default function PlatformPanel({
  isOpen,
  onClose,
  platformLabel,
  platformEmoji,
  strategy,
  content,
  onGenerateMore,
  generatingMore,
}: PlatformPanelProps) {
  const [activeTab, setActiveTab] = useState<'strategy' | 'content'>('strategy');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[#0A192F] border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-[#0A192F]/95 backdrop-blur-sm border-b border-white/10 p-5 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platformEmoji}</span>
                  <h2 className="text-xl font-bold text-white">{platformLabel}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('strategy')}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${
                    activeTab === 'strategy'
                      ? 'bg-[#2979FF] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Strategy
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${
                    activeTab === 'content'
                      ? 'bg-[#2979FF] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Content
                </button>
              </div>
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                {activeTab === 'strategy' && strategy && (
                  <motion.div
                    key="strategy"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2979FF]" />
                        What To Do This Week
                      </h3>
                      <ul className="space-y-2.5">
                        {strategy.thisWeek.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                            <span className="text-[#2979FF] font-bold mt-0.5">{i + 1}.</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#06D6A0]" />
                        Who To Target
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{strategy.whoToTarget}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FFD166]" />
                        What Works In Your Industry
                      </h3>
                      <ul className="space-y-2.5">
                        {strategy.whatWorks.map((tip, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                            <span className="text-[#FFD166] mt-0.5">-</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-[#2979FF]/10 to-[#06D6A0]/10 border border-[#2979FF]/20 rounded-xl p-5">
                      <h3 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#EF476F]" />
                        Your 30-Day Goal
                      </h3>
                      <p className="text-white text-sm leading-relaxed font-medium">{strategy.thirtyDayGoal}</p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'content' && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {content.map((piece, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-5"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-semibold text-sm">{piece.title}</h4>
                          <button
                            onClick={() => handleCopy(piece.body, i)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              copiedIndex === i
                                ? 'bg-[#06D6A0]/20 text-[#06D6A0]'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                            }`}
                          >
                            {copiedIndex === i ? (
                              <><Check size={12} /> Copied!</>
                            ) : (
                              <><Copy size={12} /> Copy</>
                            )}
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{piece.body}</p>
                      </motion.div>
                    ))}

                    <button
                      onClick={onGenerateMore}
                      disabled={generatingMore}
                      className="w-full py-3.5 bg-[#2979FF]/15 border border-[#2979FF]/30 text-[#2979FF] rounded-xl font-semibold hover:bg-[#2979FF]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generatingMore ? (
                        <><Loader2 size={16} className="animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles size={16} /> Generate 3 More</>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
