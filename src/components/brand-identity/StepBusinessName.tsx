import { useState } from 'react';
import { Loader2, Sparkles, RefreshCw, ArrowRight, Wand2 } from 'lucide-react';

interface NameOption {
  name: string;
  reason: string;
  vibe: string;
}

interface StepBusinessNameProps {
  businessDescription: string;
  names: NameOption[];
  selectedName: string | null;
  customName: string;
  generating: boolean;
  businessIdeaContext?: string;
  onDescriptionChange: (desc: string) => void;
  onGenerate: () => void;
  onSelectName: (name: string) => void;
  onCustomNameChange: (name: string) => void;
  onUseCustomName: () => void;
  onNext: () => void;
}

const VIBE_COLORS: Record<string, string> = {
  'Bold': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Friendly': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Premium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Clever': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Professional': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

export default function StepBusinessName({
  businessDescription,
  names,
  selectedName,
  customName,
  generating,
  businessIdeaContext,
  onDescriptionChange,
  onGenerate,
  onSelectName,
  onCustomNameChange,
  onUseCustomName,
  onNext,
}: StepBusinessNameProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const handleAISuggest = async () => {
    setGeneratingAI(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: businessIdeaContext || undefined,
          prompt: businessIdeaContext
            ? 'Based on this business idea, write a single compelling sentence describing what this business does and who it serves. Be specific and concise.'
            : 'Generate a single compelling sentence describing a unique small business idea. Include what the business does and who it serves. Be specific and creative.',
        }),
      });
      const result = await response.json();
      if (result.suggestion) {
        onDescriptionChange(result.suggestion);
      }
    } catch (err) {
      console.error('Error generating AI suggestion:', err);
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 font-['Montserrat'] tracking-tight">
          Let's name your empire.
        </h2>
        <p className="text-gray-400 text-lg">
          Your name is your first impression. Make it unforgettable.
        </p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <textarea
            value={businessDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe your business in one sentence..."
            rows={3}
            className="w-full px-5 py-4 pr-14 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-1 focus:ring-[#2979FF]/50 text-lg resize-none transition-all"
          />
          <button
            onClick={handleAISuggest}
            disabled={generatingAI}
            className="absolute right-3 top-3 p-2.5 rounded-lg bg-[#2979FF]/15 border border-[#2979FF]/30 text-[#2979FF] hover:bg-[#2979FF]/25 hover:border-[#2979FF]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Let AI write this for you"
          >
            {generatingAI ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
            )}
          </button>
          <p className="text-xs text-gray-500 mt-1.5 ml-1">
            Not sure what to write? Click the wand to let AI help.
          </p>
        </div>

        <button
          onClick={onGenerate}
          disabled={generating || !businessDescription.trim()}
          className="w-full py-4 bg-[#2979FF] text-white rounded-xl font-bold text-lg hover:bg-[#2979FF]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
        >
          {generating ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              Crafting names...
            </>
          ) : (
            <>
              <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
              Generate Names
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {names.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400 font-medium">Pick your favorite:</p>
              <button
                onClick={onGenerate}
                disabled={generating}
                className="text-sm text-[#2979FF] hover:text-[#2979FF]/80 flex items-center gap-1.5 font-medium transition-colors"
              >
                <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
                Regenerate
              </button>
            </div>

            <div className="space-y-3">
              {names.map((option, idx) => {
                const isSelected = selectedName === option.name;
                const vibeStyle = VIBE_COLORS[option.vibe] || VIBE_COLORS['Professional'];

                return (
                  <button
                    key={idx}
                    onClick={() => onSelectName(option.name)}
                    className={`w-full text-left p-5 rounded-xl transition-all duration-200 group ${
                      isSelected
                        ? 'bg-[#2979FF]/15 border-2 border-[#2979FF] shadow-lg shadow-[#2979FF]/10'
                        : 'bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20'
                    }`}
                    style={{
                      animationDelay: `${idx * 80}ms`,
                      animation: 'fadeInUp 0.4s ease-out both',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-xl font-bold mb-1.5 transition-colors ${
                          isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                        }`}>
                          {option.name}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{option.reason}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${vibeStyle}`}>
                        {option.vibe}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
          >
            {showCustom ? 'Hide custom name' : 'Use my own name'}
          </button>

          {showCustom && (
            <div className="flex gap-3 mt-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => onCustomNameChange(e.target.value)}
                placeholder="Type your business name..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customName.trim()) onUseCustomName();
                }}
              />
              <button
                onClick={onUseCustomName}
                disabled={!customName.trim()}
                className="px-6 py-3 bg-[#06D6A0] text-white rounded-xl font-semibold hover:bg-[#06D6A0]/90 transition-all disabled:opacity-40"
              >
                Use This
              </button>
            </div>
          )}
        </div>

        {selectedName && (
          <button
            onClick={onNext}
            className="w-full py-4 bg-[#06D6A0] text-white rounded-xl font-bold text-lg hover:bg-[#06D6A0]/90 transition-all flex items-center justify-center gap-2 group"
          >
            Continue
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
