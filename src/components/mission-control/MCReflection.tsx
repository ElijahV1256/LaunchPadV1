import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Check } from 'lucide-react';

const MOODS = [
  { rating: 1, emoji: '1', label: 'Rough' },
  { rating: 2, emoji: '2', label: 'Tough' },
  { rating: 3, emoji: '3', label: 'Okay' },
  { rating: 4, emoji: '4', label: 'Good' },
  { rating: 5, emoji: '5', label: 'Great' },
];

interface Reflection {
  rating: number;
  note: string;
}

interface Props {
  todayReflection: Reflection | null;
  onSubmit: (rating: number, note: string) => void;
}

export default function MCReflection({ todayReflection, onSubmit }: Props) {
  const [selectedRating, setSelectedRating] = useState<number | null>(todayReflection?.rating || null);
  const [note, setNote] = useState(todayReflection?.note || '');
  const [submitted, setSubmitted] = useState(!!todayReflection);

  const handleSubmit = () => {
    if (!selectedRating) return;
    onSubmit(selectedRating, note);
    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.4 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#E1306C]/10 flex items-center justify-center">
          <Heart size={16} className="text-[#E1306C]" />
        </div>
        <h2 className="text-white font-bold text-base">How Was Your Day?</h2>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Check size={20} className="text-emerald-400" />
            </div>
            <p className="text-white font-medium text-sm">Thanks for reflecting!</p>
            <p className="text-gray-500 text-xs mt-1">Your insights help you grow.</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.rating}
                  onClick={() => setSelectedRating(mood.rating)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200 ${
                    selectedRating === mood.rating
                      ? 'bg-[#E1306C]/10 border border-[#E1306C]/20 scale-110'
                      : 'bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    selectedRating === mood.rating ? 'bg-[#E1306C]/20 text-[#E1306C]' : 'bg-white/[0.04] text-gray-500'
                  }`}>
                    {mood.rating}
                  </div>
                  <span className={`text-[10px] font-medium ${
                    selectedRating === mood.rating ? 'text-[#E1306C]' : 'text-gray-600'
                  }`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence>
              {selectedRating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Quick note about your day (optional)..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-[#E1306C]/30 resize-none mb-3"
                  />
                  <button
                    onClick={handleSubmit}
                    className="w-full py-2.5 bg-[#E1306C] text-white rounded-lg text-sm font-semibold hover:bg-[#E1306C]/80 transition-colors"
                  >
                    Save Reflection
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
