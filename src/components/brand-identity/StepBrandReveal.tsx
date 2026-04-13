import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Download, RefreshCw, Loader2 } from 'lucide-react';

interface StepBrandRevealProps {
  businessName: string;
  tagline: string | null;
  personality: string[];
  colors: { primary: string; secondary: string; accent: string };
  logoUrl: string;
  generatingTagline: boolean;
  generatingGuide: boolean;
  onRegenerateTagline: () => void;
  onDownloadGuide: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function StepBrandReveal({
  businessName,
  tagline,
  personality,
  colors,
  logoUrl,
  generatingTagline,
  generatingGuide,
  onRegenerateTagline,
  onDownloadGuide,
  onContinue,
  onBack,
}: StepBrandRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setRevealed(true), 300);
    const t2 = setTimeout(() => setCardRevealed(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`text-center mb-10 transition-all duration-700 ${
        revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 font-['Montserrat'] tracking-tight">
          Meet your brand.
        </h2>
      </div>

      <div className={`transition-all duration-700 delay-300 ${
        cardRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      }`}>
        <div className="bg-gradient-to-b from-white/8 to-white/3 backdrop-blur-sm border border-white/15 rounded-2xl p-8 md:p-10 mb-8 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl overflow-hidden flex items-center justify-center mb-6 shadow-lg">
              <img
                src={logoUrl}
                alt={businessName}
                className="w-full h-full object-contain"
              />
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 font-['Montserrat']">
              {businessName}
            </h3>

            {tagline && (
              <p className="text-lg text-gray-300 italic mb-6">"{tagline}"</p>
            )}
            {!tagline && !generatingTagline && (
              <p className="text-lg text-gray-500 italic mb-6">Generating tagline...</p>
            )}
            {generatingTagline && (
              <div className="flex items-center gap-2 text-gray-400 mb-6">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Creating tagline...</span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-full ring-2 ring-white/20 shadow-md"
                style={{ backgroundColor: colors.primary }}
                title={`Primary: ${colors.primary}`}
              />
              <div
                className="w-10 h-10 rounded-full ring-2 ring-white/20 shadow-md"
                style={{ backgroundColor: colors.secondary }}
                title={`Secondary: ${colors.secondary}`}
              />
              <div
                className="w-10 h-10 rounded-full ring-2 ring-white/20 shadow-md"
                style={{ backgroundColor: colors.accent }}
                title={`Accent: ${colors.accent}`}
              />
            </div>

            {personality.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap justify-center mb-6">
                {personality.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 bg-white/10 border border-white/15 rounded-full text-sm text-gray-300 font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`space-y-4 transition-all duration-500 delay-700 ${
        cardRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onDownloadGuide}
            disabled={generatingGuide}
            className="py-3.5 px-6 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generatingGuide ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={18} />
                Download Brand Guide
              </>
            )}
          </button>

          <button
            onClick={onRegenerateTagline}
            disabled={generatingTagline}
            className="py-3.5 px-6 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generatingTagline ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Regenerate Tagline
              </>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Your brand assets are saved automatically.
        </p>

        <div className="flex gap-4 pt-2">
          <button
            onClick={onBack}
            className="px-6 py-4 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-4 bg-[#2979FF] text-white rounded-xl font-bold text-lg hover:bg-[#2979FF]/90 transition-all flex items-center justify-center gap-2 group"
          >
            Continue to Messaging
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
