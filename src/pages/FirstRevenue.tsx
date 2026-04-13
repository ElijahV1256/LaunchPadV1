import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Home, DollarSign, ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { trackMilestone, trackActivity } from '../services/tracking';
import StepClarifyOffer from '../components/first-dollar/StepClarifyOffer';
import StepFindCustomer from '../components/first-dollar/StepFindCustomer';
import StepBuildProof from '../components/first-dollar/StepBuildProof';
import StepMakePitch from '../components/first-dollar/StepMakePitch';
import StepDeliverLearn from '../components/first-dollar/StepDeliverLearn';
import StepCelebrate from '../components/first-dollar/StepCelebrate';

interface ProgressData {
  id: string;
  user_id: string;
  idea_key: string;
  business_name: string;
  offer: string;
  price: string;
  offer_sentence: string;
  pricing_options: Array<{ label: string; price: string; description: string; recommended?: boolean }>;
  customer_suggestions: string[];
  first_customer_name: string;
  credibility_type: string;
  credibility_statement: string;
  pitch: string;
  outcome: string;
  revenue: number;
  origin_story: string;
  follow_up_message: string;
  next_action: string;
  current_step: number;
  completed: boolean;
}

const STEP_LABELS = [
  'Clarify Offer',
  'Find Customer',
  'Build Proof',
  'Make Pitch',
  'Deliver & Learn',
  'Celebrate',
];

export default function FirstRevenue() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const ideaKey = searchParams.get('ideaKey') || '';

  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('Your Business');
  const [businessDescription, setBusinessDescription] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    if (!ideaKey) {
      setError('No idea selected. Please go back and select an idea.');
      setLoading(false);
      return;
    }
    loadData();
  }, [currentUser, ideaKey]);

  const loadData = async () => {
    try {
      const { data: idea } = await supabase
        .from('business_ideas')
        .select('name, description')
        .eq('user_id', currentUser!.id)
        .eq('idea_id', ideaKey)
        .maybeSingle();

      if (idea) {
        setBusinessName(idea.name);
        setBusinessDescription(idea.description);
      }

      const { data: existing, error: fetchErr } = await supabase
        .from('first_dollar_progress')
        .select('*')
        .eq('user_id', currentUser!.id)
        .eq('idea_key', ideaKey)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (existing) {
        setProgress(existing);
        setCurrentStep(existing.current_step || 1);
      } else {
        const { data: newRow, error: insertErr } = await supabase
          .from('first_dollar_progress')
          .insert({
            user_id: currentUser!.id,
            idea_key: ideaKey,
            business_name: idea?.name || '',
          })
          .select()
          .single();

        if (insertErr) {
          if (insertErr.code === '23505') {
            const { data: retry } = await supabase
              .from('first_dollar_progress')
              .select('*')
              .eq('user_id', currentUser!.id)
              .eq('idea_key', ideaKey)
              .maybeSingle();
            if (retry) {
              setProgress(retry);
              setCurrentStep(retry.current_step || 1);
            }
          } else {
            throw insertErr;
          }
        } else if (newRow) {
          setProgress(newRow);
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = useCallback(async (fields: Partial<ProgressData>) => {
    if (!progress) return;
    try {
      const { error: updateErr } = await supabase
        .from('first_dollar_progress')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', progress.id);

      if (updateErr) throw updateErr;
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }, [progress]);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedSave = useCallback((fields: Partial<ProgressData>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveProgress(fields);
    }, 500);
  }, [saveProgress]);

  const updateLocal = useCallback((fields: Partial<ProgressData>) => {
    setProgress(prev => prev ? { ...prev, ...fields } : prev);
  }, []);

  const goToStep = useCallback(async (step: number) => {
    setCurrentStep(step);
    await saveProgress({ current_step: step });
    trackActivity('step_completed' as any, { step: step - 1, ideaKey });
  }, [saveProgress, ideaKey]);

  const callAI = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/first-dollar-ai`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          businessName,
          businessDescription,
          offer: progress?.offer || '',
          price: progress?.price || '',
          customerName: progress?.first_customer_name || '',
          credibilityType: progress?.credibility_type || '',
          credibilityStatement: progress?.credibility_statement || '',
          ...extra,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'AI request failed');
    }

    return response.json();
  }, [businessName, businessDescription, progress]);

  const handleStep1Update = useCallback((fields: Partial<ProgressData>) => {
    updateLocal(fields);
    debouncedSave(fields);
  }, [updateLocal, debouncedSave]);

  const handleStep1Next = useCallback(async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await saveProgress({ offer: progress?.offer, price: progress?.price, offer_sentence: progress?.offer_sentence, current_step: 2 });
    setCurrentStep(2);
  }, [progress, saveProgress]);

  const handleStep2Update = useCallback((fields: Partial<ProgressData>) => {
    updateLocal(fields);
    debouncedSave(fields);
  }, [updateLocal, debouncedSave]);

  const handleStep2Next = useCallback(async () => {
    await saveProgress({ first_customer_name: progress?.first_customer_name, current_step: 3 });
    setCurrentStep(3);
  }, [progress, saveProgress]);

  const handleStep3Update = useCallback((fields: Partial<ProgressData>) => {
    updateLocal(fields);
    debouncedSave(fields);
  }, [updateLocal, debouncedSave]);

  const handleStep3Next = useCallback(async () => {
    await saveProgress({ credibility_type: progress?.credibility_type, credibility_statement: progress?.credibility_statement, current_step: 4 });
    setCurrentStep(4);
  }, [progress, saveProgress]);

  const handleStep4Update = useCallback((fields: Partial<ProgressData>) => {
    updateLocal(fields);
    debouncedSave(fields);
  }, [updateLocal, debouncedSave]);

  const handleStep4Next = useCallback(async () => {
    await saveProgress({ pitch: progress?.pitch, current_step: 5 });
    setCurrentStep(5);
  }, [progress, saveProgress]);

  const handleStep5Update = useCallback((fields: Partial<ProgressData>) => {
    updateLocal(fields);
    if (fields.revenue !== undefined || fields.outcome === 'yes') {
      saveProgress(fields);
    }
  }, [updateLocal, saveProgress]);

  const handleStep5Next = useCallback(async () => {
    await saveProgress({
      outcome: progress?.outcome,
      revenue: progress?.revenue,
      current_step: 6,
      completed: true,
    });
    setCurrentStep(6);
    trackMilestone('first_revenue' as any, { ideaKey, revenue: progress?.revenue });
  }, [progress, saveProgress, ideaKey]);

  const handleCelebrationUpdate = useCallback((fields: Partial<ProgressData>) => {
    updateLocal(fields);
    saveProgress({
      origin_story: fields.origin_story,
      follow_up_message: fields.followup_message as any,
      next_action: fields.next_action,
    });
  }, [updateLocal, saveProgress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#2979FF] border-r-transparent mb-4" />
          <p className="text-gray-400">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <p className="text-red-400 text-xl mb-4">Something went wrong</p>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F]">
      <div className="sticky top-0 z-40 bg-[#0A192F]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Home size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-[#2979FF]" />
              <span className="text-white font-semibold text-sm font-['Montserrat']">First Dollar</span>
            </div>

            <span className="text-xs text-gray-500">{currentStep}/6</span>
          </div>

          <div className="flex gap-1.5">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === currentStep;
              const isComplete = stepNum < currentStep;
              return (
                <div key={label} className="flex-1 group relative">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isComplete
                        ? 'bg-[#2979FF]'
                        : isActive
                          ? 'bg-[#2979FF]/60'
                          : 'bg-white/10'
                    }`}
                  />
                  <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap transition-opacity ${
                    isActive ? 'text-[#2979FF] opacity-100' : 'text-gray-600 opacity-0 group-hover:opacity-100'
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 pt-10 pb-20">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <StepClarifyOffer
              key="step1"
              data={{
                offer: progress.offer,
                price: progress.price,
                offer_sentence: progress.offer_sentence,
                pricing_options: progress.pricing_options || [],
              }}
              onUpdate={handleStep1Update}
              onNext={handleStep1Next}
              onBack={() => navigate('/dashboard')}
              callAI={callAI}
              businessName={businessName}
            />
          )}

          {currentStep === 2 && (
            <StepFindCustomer
              key="step2"
              data={{
                first_customer_name: progress.first_customer_name,
                customer_suggestions: progress.customer_suggestions || [],
              }}
              onUpdate={handleStep2Update}
              onNext={handleStep2Next}
              onBack={() => goToStep(1)}
              callAI={callAI}
            />
          )}

          {currentStep === 3 && (
            <StepBuildProof
              key="step3"
              data={{
                credibility_type: progress.credibility_type,
                credibility_statement: progress.credibility_statement,
              }}
              onUpdate={handleStep3Update}
              onNext={handleStep3Next}
              onBack={() => goToStep(2)}
              callAI={callAI}
            />
          )}

          {currentStep === 4 && (
            <StepMakePitch
              key="step4"
              data={{ pitch: progress.pitch }}
              customerName={progress.first_customer_name}
              onUpdate={handleStep4Update}
              onNext={handleStep4Next}
              onBack={() => goToStep(3)}
              callAI={callAI}
            />
          )}

          {currentStep === 5 && (
            <StepDeliverLearn
              key="step5"
              data={{
                outcome: progress.outcome,
                revenue: progress.revenue,
              }}
              customerName={progress.first_customer_name}
              onUpdate={handleStep5Update}
              onNext={handleStep5Next}
              onBack={() => goToStep(4)}
              callAI={callAI}
              price={progress.price}
            />
          )}

          {currentStep === 6 && (
            <StepCelebrate
              key="step6"
              revenue={progress.revenue}
              businessName={businessName}
              celebrationData={{
                origin_story: progress.origin_story,
                followup_message: progress.follow_up_message,
                next_action: progress.next_action,
              }}
              onBack={() => goToStep(5)}
              onContinue={() => navigate(`/website?ideaKey=${ideaKey}&next=playbook`)}
              callAI={callAI}
              onUpdateCelebration={handleCelebrationUpdate}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
