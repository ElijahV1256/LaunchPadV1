import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface PaletteOption {
  paletteName: string;
  mood: string;
  primary: string;
  secondary: string;
  accent: string;
}

interface StepColorPaletteProps {
  palettes: PaletteOption[];
  selectedIndex: number | null;
  loading: boolean;
  onSelectPalette: (index: number) => void;
  onCustomizeColor: (field: 'primary' | 'secondary' | 'accent', value: string) => void;
  onRegenerate: () => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepColorPalette({
  palettes,
  selectedIndex,
  loading,
  onSelectPalette,
  onCustomizeColor,
  onRegenerate,
  onNext,
  onBack,
}: StepColorPaletteProps) {
  const [showCustomize, setShowCustomize] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (palettes.length > 0 && !loading) {
      const timer = setTimeout(() => setRevealed(true), 200);
      return () => clearTimeout(timer);
    }
    setRevealed(false);
  }, [palettes, loading]);

  const selectedPalette = selectedIndex !== null ? palettes[selectedIndex] : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 font-['Montserrat'] tracking-tight">
          Your colors tell your story.
        </h2>
        <p className="text-gray-400 text-lg">
          We picked these based on your industry and personality.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white/5 border border-white/10 animate-pulse"
            >
              <div className="flex gap-4 mb-3">
                <div className="w-16 h-16 rounded-full bg-white/10" />
                <div className="w-16 h-16 rounded-full bg-white/10" />
                <div className="w-16 h-16 rounded-full bg-white/10" />
              </div>
              <div className="h-4 bg-white/10 rounded w-40 mb-2" />
              <div className="h-3 bg-white/5 rounded w-64" />
            </div>
          ))}
          <div className="text-center">
            <Loader2 size={24} className="animate-spin text-[#2979FF] mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Generating palettes based on your brand...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-end mb-2">
            <button
              onClick={onRegenerate}
              className="text-sm text-[#2979FF] hover:text-[#2979FF]/80 flex items-center gap-1.5 font-medium transition-colors"
            >
              <RefreshCw size={14} />
              New palettes
            </button>
          </div>

          {palettes.map((palette, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => onSelectPalette(idx)}
                className={`w-full text-left p-6 rounded-xl transition-all duration-300 ${
                  revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                } ${
                  isSelected
                    ? 'bg-[#2979FF]/15 border-2 border-[#2979FF] shadow-lg shadow-[#2979FF]/10'
                    : 'bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20'
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-5 mb-3">
                  <div
                    className="w-14 h-14 rounded-full ring-2 ring-white/10 transition-transform hover:scale-110"
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div
                    className="w-14 h-14 rounded-full ring-2 ring-white/10 transition-transform hover:scale-110"
                    style={{ backgroundColor: palette.secondary }}
                  />
                  <div
                    className="w-14 h-14 rounded-full ring-2 ring-white/10 transition-transform hover:scale-110"
                    style={{ backgroundColor: palette.accent }}
                  />
                </div>
                <h3 className={`text-lg font-bold mb-1 transition-colors ${
                  isSelected ? 'text-white' : 'text-gray-200'
                }`}>
                  {palette.paletteName}
                </h3>
                <p className="text-sm text-gray-400">{palette.mood}</p>
              </button>
            );
          })}

          {selectedPalette && (
            <div className="pt-2">
              <button
                onClick={() => setShowCustomize(!showCustomize)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-medium"
              >
                {showCustomize ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Customize colors
              </button>

              {showCustomize && (
                <div className="mt-4 p-5 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  {(['primary', 'secondary', 'accent'] as const).map((field) => (
                    <div key={field} className="flex items-center gap-4">
                      <label className="text-sm text-gray-300 capitalize w-24">{field}</label>
                      <input
                        type="color"
                        value={selectedPalette[field]}
                        onChange={(e) => onCustomizeColor(field, e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-sm text-gray-400 font-mono">{selectedPalette[field]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="px-6 py-4 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={selectedIndex === null}
          className="flex-1 py-4 bg-[#06D6A0] text-white rounded-xl font-bold text-lg hover:bg-[#06D6A0]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          Continue
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
