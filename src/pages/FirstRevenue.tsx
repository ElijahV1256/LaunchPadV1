import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Home, CheckCircle2, Circle, Copy, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { trackMilestone, trackActivity } from '../services/tracking';

interface Step {
  id: string;
  label: string;
}

interface FirstDollarData {
  id: string;
  user_id: string;
  idea_key: string;
  offer_one_liner: string | null;
  price: string | null;
  target_person: string | null;
  tiny_proof_url: string | null;
  steps: Step[];
  completed: string[];
  created_at: string;
  updated_at: string;
}

const TOAST_MESSAGES = [
  "Nice! That's real momentum. 🚀",
  "You're on fire—keep going! 🔥",
  "This is how it starts. 🙌",
  "Another step toward your first $1. 💰",
  "Look at you go! 💪",
  "Keep pushing forward! ⚡",
];

export default function FirstRevenue() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const ideaKey = searchParams.get('ideaKey') || '';
  const [ideaName, setIdeaName] = useState<string>('Your Idea');
  const [ideaDescription, setIdeaDescription] = useState<string>('');

  const [data, setData] = useState<FirstDollarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const [offerOneLiner, setOfferOneLiner] = useState('');
  const [price, setPrice] = useState('');
  const [targetPerson, setTargetPerson] = useState('');
  const [tinyProofUrl, setTinyProofUrl] = useState('');
  const [proofDone, setProofDone] = useState(false);
  const [sentMessage, setSentMessage] = useState(false);
  const [delivered, setDelivered] = useState(false);

  const [saving, setSaving] = useState(false);
  const [generatingOffer, setGeneratingOffer] = useState(false);
  const [generatingPrice, setGeneratingPrice] = useState(false);
  const [generatingCustomer, setGeneratingCustomer] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const extractFirstName = (fullText: string): string => {
    if (!fullText) return '';
    const match = fullText.match(/^([A-Z][a-z]+)/);
    return match ? match[1] : fullText.split(',')[0].split(' ')[0];
  };

  useEffect(() => {
    console.log('FirstRevenue useEffect - currentUser:', currentUser, 'ideaKey:', ideaKey);

    if (!currentUser) {
      console.log('No user found, stopping load');
      setLoading(false);
      return;
    }

    if (!ideaKey) {
      console.log('No ideaKey found, showing error');
      setError('No idea selected. Please go back to the dashboard and select an idea.');
      setLoading(false);
      return;
    }

    console.log('Loading data for ideaKey:', ideaKey);
    loadBusinessIdea();
    loadData();
  }, [currentUser, ideaKey]);

  const loadBusinessIdea = async () => {
    try {
      const { data: businessIdea, error: ideaError } = await supabase
        .from('business_ideas')
        .select('name, description')
        .eq('user_id', currentUser!.id)
        .eq('idea_id', ideaKey)
        .maybeSingle();

      if (ideaError) {
        console.error('Error loading business idea:', ideaError);
        return;
      }

      if (businessIdea) {
        setIdeaName(businessIdea.name);
        setIdeaDescription(businessIdea.description);
      }
    } catch (err) {
      console.error('Failed to load business idea:', err);
    }
  };

  const loadData = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/first-dollar-init`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ideaKey, ideaName }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to load data: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Loaded data:', result);
      setData(result);
      setOfferOneLiner(result.offer_one_liner || '');
      setPrice(result.price || '');
      setTargetPerson(result.target_person || '');
      setTinyProofUrl(result.tiny_proof_url || '');
      setSentMessage(result.completed.includes('reach-out'));
      setDelivered(result.completed.includes('deliver'));
      setProofDone(result.completed.includes('make-proof'));
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveField = async (fields: any) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/first-dollar-save`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ideaKey, ...fields }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const toggleStep = async (stepId: string, done: boolean) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/first-dollar-toggle`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ideaKey, stepId, done }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to toggle step');
      }

      const result = await response.json();
      setData({ ...data!, completed: result.completed });

      showToast(TOAST_MESSAGES[Math.floor(Math.random() * TOAST_MESSAGES.length)]);

      if (done) {
        trackActivity('first_dollar_step_completed', { stepId, ideaKey });
      }

      if (result.completed.length === data?.steps.length) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        trackMilestone('first_dollar_all_completed', { ideaKey });
      }
    } catch (err) {
      console.error('Failed to toggle step:', err);
    }
  };

  const handleSaveOffer = async () => {
    if (!offerOneLiner.trim() || !price.trim()) return;
    setSaving(true);
    await saveField({ offer_one_liner: offerOneLiner, price });
    await toggleStep('define-offer', true);
    setSaving(false);
  };

  const handleSavePerson = async () => {
    if (!targetPerson.trim()) return;
    setSaving(true);
    await saveField({ target_person: targetPerson });
    await toggleStep('pick-person', true);
    setSaving(false);
  };

  const generateAIAnswer = async (question: string, context: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-roadmap-helper`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            step: question,
            businessName: ideaName,
            businessDescription: context,
            openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AI generation error:', errorData);
        throw new Error(errorData.error || 'Failed to generate AI answer');
      }

      const result = await response.json();
      return result.suggestion;
    } catch (err) {
      console.error('Failed to generate AI answer:', err);
      throw err;
    }
  };

  const handleGenerateOffer = async () => {
    setGeneratingOffer(true);
    setAiError(null);
    try {
      console.log('Generating offer for:', ideaName);
      const answer = await generateAIAnswer(
        `What service or product should I offer for this business? Give a concise, specific answer (10-15 words max) that describes what I'm offering.`,
        `Business: ${ideaName}. Description: ${ideaDescription}`
      );
      console.log('Generated offer:', answer);
      setOfferOneLiner(answer);
    } catch (error: any) {
      console.error('Error generating offer:', error);
      setAiError(error.message || 'Failed to generate answer');
    } finally {
      setGeneratingOffer(false);
    }
  };

  const handleGeneratePrice = async () => {
    setGeneratingPrice(true);
    setAiError(null);
    try {
      console.log('Generating price for:', offerOneLiner);
      const answer = await generateAIAnswer(
        `What is a good starting price for "${offerOneLiner || ideaName}"? Give only a price range (e.g., "$50-$100" or "$25").`,
        `Business: ${ideaName}. Description: ${ideaDescription}. Offer: ${offerOneLiner}`
      );
      console.log('Generated price:', answer);
      setPrice(answer);
    } catch (error: any) {
      console.error('Error generating price:', error);
      setAiError(error.message || 'Failed to generate answer');
    } finally {
      setGeneratingPrice(false);
    }
  };

  const handleGenerateCustomer = async () => {
    setGeneratingCustomer(true);
    setAiError(null);
    try {
      console.log('Generating customer for:', offerOneLiner);
      const answer = await generateAIAnswer(
        `Who would be an ideal first customer for "${offerOneLiner || ideaName}"? Give a specific example persona (15-20 words max) like "John, a small gym owner" or "Sarah, a busy freelance designer".`,
        `Business: ${ideaName}. Description: ${ideaDescription}. Offer: ${offerOneLiner}. Price: ${price}`
      );
      console.log('Generated customer:', answer);
      setTargetPerson(answer);
    } catch (error: any) {
      console.error('Error generating customer:', error);
      setAiError(error.message || 'Failed to generate answer');
    } finally {
      setGeneratingCustomer(false);
    }
  };

  const handleGenerateProof = async () => {
    setGeneratingProof(true);
    setAiError(null);
    try {
      console.log('Generating proof idea for:', offerOneLiner);
      const answer = await generateAIAnswer(
        `What is a simple way to create proof or a demo for "${offerOneLiner || ideaName}"? Give a specific, actionable example (15-20 words max) like "Create a Canva mockup" or "Film a 30-second demo video".`,
        `Business: ${ideaName}. Description: ${ideaDescription}. Offer: ${offerOneLiner}. Customer: ${targetPerson}`
      );
      console.log('Generated proof idea:', answer);
      setTinyProofUrl(answer);
    } catch (error: any) {
      console.error('Error generating proof:', error);
      setAiError(error.message || 'Failed to generate answer');
    } finally {
      setGeneratingProof(false);
    }
  };

  const handleSaveProof = async () => {
    setSaving(true);
    await saveField({ tiny_proof_url: tinyProofUrl });
    await toggleStep('make-proof', true);
    setProofDone(true);
    setSaving(false);
  };

  const handleToggleSent = async (checked: boolean) => {
    setSentMessage(checked);
    await toggleStep('reach-out', checked);
  };

  const handleToggleDelivered = async (checked: boolean) => {
    setDelivered(checked);
    await toggleStep('deliver', checked);
  };

  const copyMessage = () => {
    const message = `Hey ${targetPerson || '[name]'}, I'm trying a new idea: ${offerOneLiner || '[offer]'}. Want to try it this week for ${price || '[price]'}? Totally fine if not — I'd love your feedback either way.`;
    navigator.clipboard.writeText(message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="text-red-400 text-xl mb-4">Failed to load data</div>
          <div className="text-gray-400 mb-6">{error}</div>
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

  if (!data) {
    return null;
  }

  const progressPct = data.steps.length > 0 ? Math.round((data.completed.length / data.steps.length) * 100) : 0;
  const allComplete = data.completed.length === data.steps.length;

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'define-offer', label: 'Clarify Offer', icon: '1️⃣' },
    { id: 'build-proof', label: 'Build Proof', icon: '2️⃣' },
    { id: 'reach-out', label: 'Reach Out', icon: '3️⃣' },
    { id: 'deliver', label: 'Deliver', icon: '4️⃣' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F]">
      <div className="flex">
        <div className="hidden lg:block w-64 fixed left-0 top-0 h-screen bg-[#0A192F]/80 backdrop-blur-sm border-r border-white/10 p-6 overflow-y-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>

          <div className="mb-6">
            <h2 className="text-white font-bold text-lg mb-2">First Dollar</h2>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#2979FF] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{progressPct}%</span>
            </div>
          </div>

          <nav className="space-y-2">
            {sections.map((section, idx) => {
              const isCompleted = data?.completed.includes(section.id);
              const isActive = !isCompleted && (idx === 0 || data?.completed.includes(sections[idx - 1].id));

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    isCompleted
                      ? 'bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF]'
                      : isActive
                      ? 'bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF]'
                      : 'bg-white/5 border border-white/10 text-gray-500'
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{section.label}</div>
                    <div className="text-xs opacity-70">
                      {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Locked'}
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 size={16} className="text-[#2979FF]" />
                  )}
                </button>
              );
            })}

            <button
              onClick={() => navigate(`/brand-identity?ideaKey=${ideaKey}`)}
              className="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 bg-[#2979FF]/10 border border-[#2979FF]/30 text-white hover:bg-[#2979FF]/20"
            >
              <span className="text-xl">{allComplete ? '🎉' : '⏭️'}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm">{allComplete ? 'Next Phase' : 'Skip Ahead'}</div>
                <div className="text-xs opacity-70">Brand Identity</div>
              </div>
            </button>
          </nav>
        </div>

        <div className="flex-1 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-6 lg:hidden flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Home size={20} />
              <span>Back to Dashboard</span>
            </button>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-[#2979FF]/20 rounded-2xl flex items-center justify-center text-3xl">
              💵
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 font-['Montserrat']">
                First Dollar Roadmap
              </h1>
              <p className="text-[#2979FF] text-sm font-semibold">{ideaName}</p>
            </div>
          </div>
          <p className="text-gray-300 text-lg">
            Follow these 5 simple steps to earn your first dollar as fast as possible.
          </p>

          {aiError && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">
                <strong>AI Generation Error:</strong> {aiError}
              </p>
            </div>
          )}
        </div>

        <div className="mb-8 lg:hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-[#2979FF] transition-all duration-300 flex items-center justify-end pr-2"
            style={{ width: `${progressPct}%` }}
          >
            {progressPct > 15 && (
              <span className="text-[#2B2D42] text-xs font-bold">{progressPct}%</span>
            )}
          </div>
        </div>

        {allComplete && (
          <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4 font-['Montserrat']">
              You did it! Phase 1 Complete 🎉
            </h2>
            <p className="text-gray-300 mb-6">
              You've completed the first dollar flow! Ready to build your brand identity?
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate(`/brand-identity?ideaKey=${ideaKey}`)}
                className="px-6 py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold text-lg hover:bg-[#2979FF]/90 transition-all duration-300"
              >
                Next: Brand & Identity →
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all duration-300"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div ref={(el) => (sectionRefs.current[0] = el)} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {data.completed.includes('define-offer') ? (
                  <CheckCircle2 className="text-[#2979FF]" size={24} />
                ) : (
                  <Circle className="text-gray-500" size={24} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#2979FF]/20 rounded-lg flex items-center justify-center text-[#2979FF] font-bold text-sm">1</div>
                  <h3 className="text-xl font-bold text-white">Clarify Your Offer</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Keep it simple: What are you offering and how much does it cost?
                </p>
                <p className="text-[#2979FF] text-sm mb-4">
                  🎯 Example: "I'll design a 1-page landing site for $75 to help small gyms get more leads."
                </p>
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-300">What's your offer?</label>
                        <button
                          onClick={handleGenerateOffer}
                          disabled={generatingOffer}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-[#2979FF]/20 border border-[#2979FF]/30 text-[#2979FF] rounded hover:bg-[#2979FF]/30 disabled:opacity-50 transition-all"
                        >
                          <Sparkles size={12} />
                          {generatingOffer ? 'Generating...' : 'AI Generate'}
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g., 30-min dog walk, Logo design, Resume review"
                        value={offerOneLiner}
                        onChange={(e) => setOfferOneLiner(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06D6A0] focus:ring-2 focus:ring-[#06D6A0]/20 transition-all"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-300">How much will you charge?</label>
                        <button
                          onClick={handleGeneratePrice}
                          disabled={generatingPrice || !offerOneLiner.trim()}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-[#2979FF]/20 border border-[#2979FF]/30 text-[#2979FF] rounded hover:bg-[#2979FF]/30 disabled:opacity-50 transition-all"
                        >
                          <Sparkles size={12} />
                          {generatingPrice ? 'Generating...' : 'AI Generate'}
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g., $15, $50, $200"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06D6A0] focus:ring-2 focus:ring-[#06D6A0]/20 transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveOffer}
                    disabled={!offerOneLiner.trim() || !price.trim() || saving}
                    className="px-8 py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : data.completed.includes('define-offer') ? '✓ Saved' : 'Save & Continue'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {data.completed.includes('pick-person') ? (
                  <CheckCircle2 className="text-[#2979FF]" size={24} />
                ) : (
                  <Circle className="text-gray-500" size={24} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#2979FF]/20 rounded-lg flex items-center justify-center text-[#2979FF] font-bold text-sm">2</div>
                  <h3 className="text-xl font-bold text-white">Find Your First Customer</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  You just need ONE person. Who do you know that needs what you're offering?
                </p>
                <p className="text-[#2979FF] text-sm mb-4">
                  🎯 Example: "The local gym owner who keeps posting blurry flyers."
                </p>
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-300">Who's your first customer?</label>
                      <button
                        onClick={handleGenerateCustomer}
                        disabled={generatingCustomer || !offerOneLiner.trim()}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-[#2979FF]/20 border border-[#2979FF]/30 text-[#2979FF] rounded hover:bg-[#2979FF]/30 disabled:opacity-50 transition-all"
                      >
                        <Sparkles size={12} />
                        {generatingCustomer ? 'Generating...' : 'AI Generate'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g., John from the gym, Sarah my neighbor"
                      value={targetPerson}
                      onChange={(e) => setTargetPerson(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06D6A0] focus:ring-2 focus:ring-[#06D6A0]/20 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSavePerson}
                    disabled={!targetPerson.trim() || saving}
                    className="px-8 py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : data.completed.includes('pick-person') ? '✓ Saved' : 'Save & Continue'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div ref={(el) => (sectionRefs.current[1] = el)} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {data.completed.includes('make-proof') ? (
                  <CheckCircle2 className="text-[#2979FF]" size={24} />
                ) : (
                  <Circle className="text-gray-500" size={24} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#2979FF]/20 rounded-lg flex items-center justify-center text-[#2979FF] font-bold text-sm">3</div>
                  <h3 className="text-xl font-bold text-white">Build Your Proof</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Create something quick to show you can deliver: a Canva mockup, sample, or simple demo.
                </p>
                <p className="text-[#2979FF] text-sm mb-4">
                  🎯 Goal: Have one visual thing to show when you message someone.
                </p>
                <div className="space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-300">Link to your proof (optional)</label>
                      <button
                        onClick={handleGenerateProof}
                        disabled={generatingProof || !offerOneLiner.trim()}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-[#2979FF]/20 border border-[#2979FF]/30 text-[#2979FF] rounded hover:bg-[#2979FF]/30 disabled:opacity-50 transition-all"
                      >
                        <Sparkles size={12} />
                        {generatingProof ? 'Generating...' : 'AI Generate Idea'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g., Canva link, Google Drive, Instagram post"
                      value={tinyProofUrl}
                      onChange={(e) => setTinyProofUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06D6A0] focus:ring-2 focus:ring-[#06D6A0]/20 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSaveProof}
                    disabled={saving}
                    className="px-8 py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : data.completed.includes('make-proof') ? '✓ Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div ref={(el) => (sectionRefs.current[2] = el)} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {data.completed.includes('reach-out') ? (
                  <CheckCircle2 className="text-[#2979FF]" size={24} />
                ) : (
                  <Circle className="text-gray-500" size={24} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#2979FF]/20 rounded-lg flex items-center justify-center text-[#2979FF] font-bold text-sm">4</div>
                  <h3 className="text-xl font-bold text-white">Make Your Pitch</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Send them a quick message. Don't overthink it — just reach out.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-300">Your message template</label>
                    <button
                      onClick={copyMessage}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#2979FF] text-[#0A192F] rounded-lg text-sm font-semibold hover:bg-[#2979FF]/90 transition-colors"
                    >
                      {copiedMessage ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={`Hey ${extractFirstName(targetPerson) || '[Name]'}! Hope you're doing well.\n\nI'm trying something new and immediately thought of you. ${offerOneLiner || '[What you offer]'} for around ${price || '[price]'}.\n\nWanna try it out this week? Totally cool if you're not interested — either way, I'd love to hear what you think!`}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 resize-none focus:outline-none"
                    rows={5}
                  />
                </div>
                <button
                  onClick={() => handleToggleSent(!sentMessage)}
                  className={`w-full px-6 py-3 rounded-lg font-bold transition-all mt-4 ${
                    sentMessage
                      ? 'bg-[#2979FF] text-[#0A192F]'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {sentMessage ? '✓ Message Sent!' : 'Mark as Sent'}
                </button>
              </div>
            </div>
          </div>

          <div ref={(el) => (sectionRefs.current[3] = el)} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {data.completed.includes('deliver') ? (
                  <CheckCircle2 className="text-[#2979FF]" size={24} />
                ) : (
                  <Circle className="text-gray-500" size={24} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#2979FF]/20 rounded-lg flex items-center justify-center text-[#2979FF] font-bold text-sm">5</div>
                  <h3 className="text-xl font-bold text-white">Deliver & Learn</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Do what you promised, then ask for feedback. Learn what works and what doesn't.
                </p>
                <p className="text-[#2979FF] text-sm mb-4">
                  🎯 Goal: Learn what people actually value — that's your signal to improve or scale.
                </p>
                <button
                  onClick={() => handleToggleDelivered(!delivered)}
                  className={`w-full px-6 py-3 rounded-lg font-bold transition-all ${
                    delivered
                      ? 'bg-[#2979FF] text-[#0A192F]'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {delivered ? '✓ Delivered!' : 'Mark as Delivered'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <CheckCircle2 className="text-[#2979FF]" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#2979FF]/20 rounded-lg flex items-center justify-center text-[#2979FF] font-bold text-sm">6</div>
                  <h3 className="text-xl font-bold text-white">Celebrate & Document</h3>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  Screenshot that first payment. Write down what worked. Share your "first dollar story" — it inspires others and keeps you motivated.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(`/brand-identity?ideaKey=${ideaKey}`)}
            className="px-8 py-4 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold text-lg hover:bg-[#2979FF]/90 transition-all duration-300 inline-flex items-center gap-2"
          >
            {allComplete ? 'Next: Brand & Identity →' : 'Skip to Brand & Identity →'}
          </button>
        </div>

        {toast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#2979FF] text-[#0A192F] px-6 py-3 rounded-full font-semibold shadow-lg animate-fade-in-up z-50">
            {toast}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
