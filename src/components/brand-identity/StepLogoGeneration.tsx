import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Loader2, RefreshCw, Upload, X, Quote } from 'lucide-react';

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

const ENTREPRENEUR_QUOTES = [
  { text: "Your brand is what other people say about you when you're not in the room.", author: "Jeff Bezos" },
  { text: "The best investment you can make is in yourself.", author: "Warren Buffett" },
  { text: "Don't find customers for your products, find products for your customers.", author: "Seth Godin" },
  { text: "If people like you, they'll listen to you. But if they trust you, they'll do business with you.", author: "Zig Ziglar" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Your personal brand is a promise to your clients. A promise of quality, consistency, competency, and reliability.", author: "Jason Hartman" },
  { text: "You don't need more time. You need more focus.", author: "Alex Hormozi" },
  { text: "The bottleneck is never resources, it's resourcefulness.", author: "Alex Hormozi" },
  { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett" },
  { text: "Someone's sitting in the shade today because someone planted a tree a long time ago.", author: "Warren Buffett" },
  { text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg" },
  { text: "Make something people want.", author: "Paul Graham" },
  { text: "If you're not embarrassed by the first version of your product, you've launched too late.", author: "Reid Hoffman" },
  { text: "Sell the problem you solve, not the product you make.", author: "Alex Hormozi" },
  { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
];

const LOADING_MESSAGES = [
  'Studying your brand DNA...',
  'Blending colors and personality...',
  'Sketching concepts...',
  'Refining the details...',
  'Almost there...',
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
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteFading, setQuoteFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);

  const shuffledQuotes = useMemo(() => {
    const arr = [...ENTREPRENEUR_QUOTES];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  useEffect(() => {
    if (!generating) {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 8 + 2, 92));
    }, 800);
    return () => clearInterval(interval);
  }, [generating]);

  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setLoadingMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [generating]);

  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setQuoteFading(true);
      setTimeout(() => {
        setQuoteIdx((prev) => (prev + 1) % shuffledQuotes.length);
        setQuoteFading(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [generating, shuffledQuotes]);

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
        <div className="mb-8">
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#2979FF]/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#06D6A0]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative px-8 py-12 flex flex-col items-center text-center space-y-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-white/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-t-[#2979FF] border-r-[#2979FF]/40 border-b-transparent border-l-transparent animate-spin" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={20} className="text-[#2979FF] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-white font-semibold text-lg tracking-wide">
                  {LOADING_MESSAGES[loadingMessageIdx]}
                </p>
                <div className="w-64 mx-auto">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2979FF] to-[#06D6A0] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full max-w-md pt-4 border-t border-white/5">
                <div className={`transition-all duration-500 ${quoteFading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                  <Quote size={20} className="text-[#2979FF]/40 mx-auto mb-3" />
                  <blockquote className="text-gray-300 text-base leading-relaxed italic mb-3">
                    "{shuffledQuotes[quoteIdx]?.text}"
                  </blockquote>
                  <p className="text-sm font-semibold text-[#2979FF]/80">
                    -- {shuffledQuotes[quoteIdx]?.author}
                  </p>
                </div>
              </div>
            </div>
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
