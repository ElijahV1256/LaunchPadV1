import { ArrowRight, ArrowLeft } from 'lucide-react';

interface StepPersonalityProps {
  selectedPersonalities: string[];
  onToggle: (personality: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const PERSONALITIES = [
  { emoji: '\uD83D\uDCAA', label: 'Bold & Confident' },
  { emoji: '\uD83E\uDD1D', label: 'Warm & Trustworthy' },
  { emoji: '\u26A1', label: 'Fast & Energetic' },
  { emoji: '\uD83E\uDDE0', label: 'Smart & Expert' },
  { emoji: '\uD83C\uDFAF', label: 'Direct & No-Nonsense' },
  { emoji: '\u2728', label: 'Premium & Elevated' },
  { emoji: '\uD83D\uDE0A', label: 'Friendly & Approachable' },
  { emoji: '\uD83D\uDD25', label: 'Disruptive & Bold' },
];

export default function StepPersonality({
  selectedPersonalities,
  onToggle,
  onNext,
  onBack,
}: StepPersonalityProps) {
  const isSelected = (label: string) => selectedPersonalities.includes(label);
  const canSelect = selectedPersonalities.length < 2;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 font-['Montserrat'] tracking-tight">
          What does your brand feel like?
        </h2>
        <p className="text-gray-400 text-lg">
          Great brands make people feel something. Pick up to 2.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {PERSONALITIES.map((p) => {
          const selected = isSelected(p.label);
          const disabled = !selected && !canSelect;

          return (
            <button
              key={p.label}
              onClick={() => !disabled && onToggle(p.label)}
              disabled={disabled}
              className={`relative p-5 rounded-xl transition-all duration-200 text-center group ${
                selected
                  ? 'bg-[#2979FF]/15 border-2 border-[#2979FF] shadow-lg shadow-[#2979FF]/10 scale-[1.02]'
                  : disabled
                  ? 'bg-white/3 border border-white/5 opacity-40 cursor-not-allowed'
                  : 'bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 hover:scale-[1.02]'
              }`}
            >
              <div className="text-3xl mb-2">{p.emoji}</div>
              <div className={`text-sm font-semibold transition-colors ${
                selected ? 'text-white' : 'text-gray-300 group-hover:text-white'
              }`}>
                {p.label}
              </div>
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#2979FF] rounded-full flex items-center justify-center">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedPersonalities.length > 0 && (
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {selectedPersonalities.map((p) => (
              <span
                key={p}
                className="px-4 py-1.5 bg-[#2979FF]/20 border border-[#2979FF]/30 text-[#2979FF] rounded-full text-sm font-semibold"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-4 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={selectedPersonalities.length === 0}
          className="flex-1 py-4 bg-[#06D6A0] text-white rounded-xl font-bold text-lg hover:bg-[#06D6A0]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          Continue
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
