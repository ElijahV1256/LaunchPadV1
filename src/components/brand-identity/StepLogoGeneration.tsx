import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Loader2, RefreshCw, Upload, X } from 'lucide-react';

interface LogoConcept {
  name: string;
  description: string;
  imageUrl: string;
  prompt: string;
}

interface StepLogoGenerationProps {
  concepts: LogoConcept[];
  selectedLogo: LogoConcept | null;
  generating: boolean;
  uploadedLogoUrl: string | null;
  uploadingLogo: boolean;
  onSelectLogo: (logo: LogoConcept) => void;
  onRegenerate: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveUpload: () => void;
  onNext: () => void;
  onBack: () => void;
}

const LOADING_MESSAGES = [
  'Studying your industry...',
  'Applying your brand personality...',
  'Crafting your concepts...',
  'Putting on the finishing touches...',
];

export default function StepLogoGeneration({
  concepts,
  selectedLogo,
  generating,
  uploadedLogoUrl,
  uploadingLogo,
  onSelectLogo,
  onRegenerate,
  onUpload,
  onRemoveUpload,
  onNext,
  onBack,
}: StepLogoGenerationProps) {
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setLoadingMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [generating]);

  useEffect(() => {
    if (concepts.length > 0 && !generating) {
      setRevealedCount(0);
      const interval = setInterval(() => {
        setRevealedCount((prev) => {
          if (prev >= concepts.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [concepts, generating]);

  const hasSelection = selectedLogo !== null || uploadedLogoUrl !== null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 font-['Montserrat'] tracking-tight">
          Your logo. Built in seconds.
        </h2>
        <p className="text-gray-400 text-lg">
          {concepts.length} concepts generated from your name, colors, and personality.
        </p>
      </div>

      {generating && (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-white/5 border border-white/10 animate-pulse"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center space-y-2">
            <Loader2 size={28} className="animate-spin text-[#2979FF] mx-auto" />
            <p className="text-white font-medium text-lg transition-all duration-500">
              {LOADING_MESSAGES[loadingMessageIdx]}
            </p>
          </div>
        </div>
      )}

      {!generating && concepts.length > 0 && (
        <>
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={onRegenerate}
              className="text-sm text-[#2979FF] hover:text-[#2979FF]/80 flex items-center gap-1.5 font-medium transition-colors"
            >
              <RefreshCw size={14} />
              Try Different Styles
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {concepts.map((concept, idx) => {
              const isSelected = selectedLogo?.name === concept.name && !uploadedLogoUrl;
              const isRevealed = idx < revealedCount;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectLogo(concept)}
                  className={`text-left rounded-xl transition-all duration-300 overflow-hidden group ${
                    isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  } ${
                    isSelected
                      ? 'ring-2 ring-[#2979FF] shadow-lg shadow-[#2979FF]/20'
                      : 'hover:ring-1 hover:ring-white/20'
                  }`}
                >
                  <div className="aspect-square bg-white flex items-center justify-center p-4 overflow-hidden">
                    <img
                      src={concept.imageUrl}
                      alt={concept.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className={`p-3 transition-colors ${
                    isSelected ? 'bg-[#2979FF]/15' : 'bg-white/5'
                  }`}>
                    <p className="text-sm font-semibold text-white">{concept.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{concept.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {!generating && (
        <div className="mb-6">
          {uploadedLogoUrl ? (
            <div className="p-4 bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-xl flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                <img src={uploadedLogoUrl} alt="Uploaded" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Your uploaded logo</p>
                <p className="text-gray-400 text-xs">This will be used for your brand</p>
              </div>
              <button
                onClick={onRemoveUpload}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-all cursor-pointer text-sm">
                {uploadingLogo ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Or upload your own logo
                  </>
                )}
                <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
              </label>
            </div>
          )}
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
          disabled={!hasSelection}
          className="flex-1 py-4 bg-[#06D6A0] text-white rounded-xl font-bold text-lg hover:bg-[#06D6A0]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          Continue
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
