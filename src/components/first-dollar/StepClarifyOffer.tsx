import { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import StepShell from './StepShell';
import LoadingOverlay from './LoadingOverlay';

interface PricingOption {
  label: string;
  price: string;
  description: string;
  recommended?: boolean;
}

interface StepData {
  offer: string;
  price: string;
  offer_sentence: string;
  pricing_options: PricingOption[];
}

interface Props {
  data: StepData;
  onUpdate: (fields: Partial<StepData>) => void;
  onNext: () => void;
  onBack?: () => void;
  callAI: (action: string, extra?: Record<string, unknown>) => Promise<unknown>;
  businessName: string;
}

export default function StepClarifyOffer({ data, onUpdate, onNext, onBack, callAI, businessName }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Crafting your offer...');
  const [selectedPrice, setSelectedPrice] = useState<string>(data.price || '');
  const [offerSuggestions, setOfferSuggestions] = useState<string[]>([]);

  const handleOfferHelp = async () => {
    setLoadingMsg('Brainstorming offers for you...');
    setLoading(true);
    try {
      const result = await callAI('offer_suggest') as { suggestions: string[] };
      setOfferSuggestions(result.suggestions || []);
    } catch (err) {
      console.error('Failed to get offer suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceHelp = async () => {
    if (!data.offer.trim()) return;
    setLoadingMsg('Crafting your pricing...');
    setLoading(true);
    try {
      const result = await callAI('pricing', { offer: data.offer }) as {
        options: PricingOption[];
        offerSentence: string;
      };
      onUpdate({
        pricing_options: result.options || [],
        offer_sentence: result.offerSentence || '',
      });
      const recommended = result.options?.find((o: PricingOption) => o.recommended);
      if (recommended) {
        setSelectedPrice(recommended.price);
        onUpdate({ price: recommended.price });
      }
    } catch (err) {
      console.error('Failed to get pricing:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectPricingOption = (option: PricingOption) => {
    setSelectedPrice(option.price);
    onUpdate({ price: option.price });
  };

  const canProceed = data.offer.trim() && (data.price.trim() || selectedPrice);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingOverlay message={loadingMsg} />}
      </AnimatePresence>

      <StepShell
        stepNumber={1}
        headline="What are you selling and what does it cost?"
        subtext={`Let's nail your offer for ${businessName}. Two fields. That's it.`}
        onBack={onBack}
        showBack={!!onBack}
      >
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-300">What I'm offering</label>
              <button
                onClick={handleOfferHelp}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#2979FF]/15 border border-[#2979FF]/30 text-[#2979FF] rounded-lg hover:bg-[#2979FF]/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Sparkles size={13} />
                Suggest Offers
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g., Logo design for small businesses, 30-min coaching call..."
              value={data.offer}
              onChange={(e) => onUpdate({ offer: e.target.value })}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20 transition-all text-base"
            />
            <AnimatePresence>
              {offerSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2.5 space-y-2"
                >
                  {offerSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onUpdate({ offer: suggestion });
                        setOfferSuggestions([]);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                        data.offer === suggestion
                          ? 'border-[#2979FF] bg-[#2979FF]/10 text-white'
                          : 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-300">My price</label>
              <button
                onClick={handlePriceHelp}
                disabled={!data.offer.trim() || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#2979FF]/15 border border-[#2979FF]/30 text-[#2979FF] rounded-lg hover:bg-[#2979FF]/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Sparkles size={13} />
                Help Me Price This
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g., $50, $97, $200"
              value={data.price || selectedPrice}
              onChange={(e) => {
                setSelectedPrice(e.target.value);
                onUpdate({ price: e.target.value });
              }}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20 transition-all text-base"
            />
          </div>

          <AnimatePresence>
            {data.pricing_options && data.pricing_options.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {data.pricing_options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => selectPricingOption(option)}
                    className={`relative p-4 rounded-xl border text-left transition-all ${
                      (data.price || selectedPrice) === option.price
                        ? 'border-[#2979FF] bg-[#2979FF]/10 ring-1 ring-[#2979FF]/50'
                        : option.recommended
                          ? 'border-[#2979FF]/40 bg-[#2979FF]/5'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                    }`}
                  >
                    {option.recommended && (
                      <span className="absolute -top-2.5 left-3 px-2 py-0.5 text-[10px] font-bold uppercase bg-[#2979FF] text-white rounded-full tracking-wider">
                        Recommended
                      </span>
                    )}
                    <div className="text-white font-bold text-lg mb-0.5">{option.price}</div>
                    <div className="text-xs text-gray-400 font-medium mb-1">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                    {(data.price || selectedPrice) === option.price && (
                      <Check size={16} className="absolute top-3 right-3 text-[#2979FF]" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {data.offer_sentence && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-xl p-4"
              >
                <p className="text-xs font-semibold text-[#2979FF] mb-1">Your offer in one sentence:</p>
                <p className="text-white text-sm font-medium leading-relaxed">"{data.offer_sentence}"</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={onNext}
            disabled={!canProceed}
            className="w-full py-4 bg-[#2979FF] text-white rounded-xl font-bold text-base hover:bg-[#2979FF]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Lock In My Offer
          </button>
        </div>
      </StepShell>
    </>
  );
}
