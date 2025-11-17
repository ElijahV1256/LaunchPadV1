import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BusinessIdea } from '../services/openai';
import { Rocket, Sparkles, TrendingUp, DollarSign, AlertCircle, Loader2, RefreshCw, PlusCircle, Lightbulb, ArrowRight, CheckCircle2, MapPin, Settings, X, Clock, Briefcase, Bookmark, BookmarkCheck } from 'lucide-react';
import { trackMilestone, trackActivity } from '../services/tracking';

export default function Ideas() {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [showKeywordInput, setShowKeywordInput] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [generatingWithKeywords, setGeneratingWithKeywords] = useState(false);
  const [showCustomIdeaForm, setShowCustomIdeaForm] = useState(false);
  const [customIdeaName, setCustomIdeaName] = useState('');
  const [customIdeaDescription, setCustomIdeaDescription] = useState('');
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [savingCustomIdea, setSavingCustomIdea] = useState(false);
  const [lastProgress, setLastProgress] = useState<any>(null);
  const [showLocalServices, setShowLocalServices] = useState(false);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState({
    passionateProblems: '',
    energizingWork: '',
    lifestyle: ''
  });
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [problemsUnsure, setProblemsUnsure] = useState(false);
  const [workUnsure, setWorkUnsure] = useState(false);
  const [lifestyleUnsure, setLifestyleUnsure] = useState(false);
  const [lastUsedKeywords, setLastUsedKeywords] = useState<string>('');
  const [savedIdeaIds, setSavedIdeaIds] = useState<Set<string>>(new Set());
  const [savingIdeaId, setSavingIdeaId] = useState<string | null>(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadIdeas();
      loadLastProgress();
      loadUserPlan();
      loadUserPreferences();
      loadSavedIdeas();
    }
  }, [currentUser]);

  const loadUserPlan = async () => {
    if (!currentUser) return;

    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (data) {
        setUserPlan(data.plan || 'free');
      }
    } catch (err) {
      console.error('Failed to load user plan:', err);
    }
  };

  const loadUserPreferences = async () => {
    if (!currentUser) return;

    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('interests, problems, budget')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (data) {
        const isProblemsUnsure = data.interests === "I'm not sure";
        const isWorkUnsure = data.problems === "I'm not sure";
        const isLifestyleUnsure = !data.budget || data.budget === "Not specified";

        setPreferences({
          passionateProblems: isProblemsUnsure ? '' : (data.interests || ''),
          energizingWork: isWorkUnsure ? '' : (data.problems || ''),
          lifestyle: isLifestyleUnsure ? '' : (data.budget || '')
        });

        setProblemsUnsure(isProblemsUnsure);
        setWorkUnsure(isWorkUnsure);
        setLifestyleUnsure(isLifestyleUnsure);
      }
    } catch (err) {
      console.error('Failed to load user preferences:', err);
    }
  };

  const savePreferences = async () => {
    if (!currentUser) return;

    setSavingPreferences(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          interests: problemsUnsure || !preferences.passionateProblems ? "I'm not sure" : preferences.passionateProblems,
          problems: workUnsure || !preferences.energizingWork ? "I'm not sure" : preferences.energizingWork,
          budget: lifestyleUnsure || !preferences.lifestyle ? "Not specified" : preferences.lifestyle,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setLastUsedKeywords('');
      setShowPreferencesModal(false);
      handleRegenerate();
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  const loadSavedIdeas = async () => {
    if (!currentUser) return;

    try {
      const { data } = await supabase
        .from('saved_ideas')
        .select('original_idea_id')
        .eq('user_id', currentUser.id);

      if (data) {
        setSavedIdeaIds(new Set(data.map(item => item.original_idea_id)));
      }
    } catch (err) {
      console.error('Failed to load saved ideas:', err);
    }
  };

  const handleSaveIdea = async (idea: BusinessIdea) => {
    if (!currentUser) return;

    setSavingIdeaId(idea.id);
    try {
      const isSaved = savedIdeaIds.has(idea.id);

      if (isSaved) {
        // Unsave
        const { error } = await supabase
          .from('saved_ideas')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('original_idea_id', idea.id);

        if (error) throw error;

        setSavedIdeaIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(idea.id);
          return newSet;
        });
      } else {
        // Save
        const { error } = await supabase
          .from('saved_ideas')
          .insert({
            user_id: currentUser.id,
            original_idea_id: idea.id,
            idea_data: idea,
          });

        if (error) throw error;

        setSavedIdeaIds(prev => new Set(prev).add(idea.id));
      }
    } catch (err: any) {
      console.error('Failed to save/unsave idea:', err);
      setError(err.message || 'Failed to save idea');
    } finally {
      setSavingIdeaId(null);
    }
  };

  const loadLastProgress = async () => {
    if (!currentUser) return;

    try {
      const { data: ideas } = await supabase
        .from('business_ideas')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!ideas || ideas.length === 0) return;

      const latestIdea = ideas[0];
      const ideaKey = latestIdea.idea_id;

      const [brandData, marketingData, websiteData, operationsData] = await Promise.all([
        supabase.from('brand_identity').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
        supabase.from('marketing_assets').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
        supabase.from('websites').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
        supabase.from('profit_loss_entries').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).limit(1),
      ]);

      let currentStage = null;
      let stageName = '';
      let link = '';
      let isComplete = false;

      const brandComplete = brandData.data && brandData.data.selected_name && brandData.data.brand_colors && brandData.data.logo_data?.selected;
      const marketingComplete = marketingData.data && marketingData.data.completed_steps && marketingData.data.completed_steps.length >= 4;
      const websiteComplete = websiteData.data && websiteData.data.completed_steps && websiteData.data.completed_steps.length >= 5;
      const operationsStarted = operationsData.data && operationsData.data.length > 0;

      const hasAnyProgress = brandData.data || marketingData.data || websiteData.data || operationsStarted;

      if (!hasAnyProgress) {
        return;
      }

      if (!brandComplete) {
        currentStage = 'Brand Identity';
        stageName = 'Brand Identity';
        link = `/brand-identity?ideaKey=${ideaKey}`;
      } else if (!marketingComplete) {
        currentStage = 'Marketing Assets';
        stageName = 'Marketing Assets';
        link = `/marketing-assets?ideaKey=${ideaKey}`;
      } else if (!websiteComplete) {
        currentStage = 'Website Builder';
        stageName = 'Website Builder';
        link = `/build-site?ideaKey=${ideaKey}`;
      } else if (!operationsStarted) {
        currentStage = 'Scale & Optimize';
        stageName = 'Scale & Optimize';
        link = `/scale-optimize?ideaKey=${ideaKey}`;
      } else {
        currentStage = 'Completed';
        stageName = 'All stages complete!';
        link = `/scale-optimize?ideaKey=${ideaKey}`;
        isComplete = true;
      }

      setLastProgress({
        ideaName: latestIdea.name,
        currentStage,
        stageName,
        link,
        isComplete,
      });
    } catch (err) {
      console.error('Failed to load last progress:', err);
    }
  };

  const loadIdeas = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError('');

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('updated_at')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      const { data: existingIdeas } = await supabase
        .from('business_ideas')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (existingIdeas && existingIdeas.length > 0) {
        const profileUpdatedAt = profile?.updated_at ? new Date(profile.updated_at) : null;
        const ideasCreatedAt = new Date(existingIdeas[0].created_at);

        if (profileUpdatedAt && profileUpdatedAt > ideasCreatedAt) {
          await generateNewIdeas();
          setLoading(false);
          return;
        }

        const loadedIdeas: BusinessIdea[] = existingIdeas.map((row) => ({
          id: row.idea_id,
          name: row.name,
          description: row.description,
          difficulty: row.difficulty,
          costRange: row.cost_range,
        }));
        setIdeas(loadedIdeas);
        setLoading(false);
        return;
      }

      await generateNewIdeas();
    } catch (err: any) {
      setError(err.message || 'Failed to load ideas');
      setLoading(false);
    }
  };

  const generateNewIdeas = async (customKeywords?: string) => {
    if (!currentUser) return;

    try {
      console.log('Starting idea generation...');
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('No authentication token');
      }

      const previousIdeaNames = ideas.map((idea) => idea.name);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // Increased timeout

      console.log('Calling edge function...');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-business-ideas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            keywords: customKeywords,
            previousIdeas: previousIdeaNames,
            openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log('Response received:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Edge function error:', errorData);
        throw new Error(errorData.error || 'Failed to generate ideas');
      }

      const result = await response.json();
      console.log('Ideas generated:', result);

      if (!result.ideas || result.ideas.length === 0) {
        throw new Error('No ideas were generated');
      }

      setIdeas(result.ideas);
    } catch (err: any) {
      console.error('Generate ideas error:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message || 'Failed to generate ideas');
      }
      throw err;
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError('');

    try {
      await generateNewIdeas(lastUsedKeywords || undefined);
    } catch (err) {
      console.error('Failed to regenerate ideas:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleLocalServices = () => {
    if (userPlan === 'free') {
      navigate('/pricing');
      return;
    }
    navigate('/local-opportunities');
  };

  const handleGenerateWithKeywords = async () => {
    if (!keywords.trim()) return;

    setGeneratingWithKeywords(true);
    setError('');

    try {
      await generateNewIdeas(keywords);
      setLastUsedKeywords(keywords);
      setShowKeywordInput(false);
      setKeywords('');
    } catch (err) {
      console.error('Failed to generate ideas with keywords:', err);
    } finally {
      setGeneratingWithKeywords(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!customIdeaName.trim()) return;

    setGeneratingDescription(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-roadmap-helper`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            step: `Generate a clear, compelling 2-3 sentence business description for a business called "${customIdeaName}". Focus on what the business does, who it serves, and what value it provides.`,
            businessName: customIdeaName,
            businessDescription: '',
            currentAnswer: '',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const { suggestion } = await response.json();
      setCustomIdeaDescription(suggestion);
    } catch (err) {
      console.error('Failed to generate description:', err);
      setError('Failed to generate description. Please try again.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleSaveCustomIdea = async () => {
    if (!customIdeaName.trim() || !customIdeaDescription.trim()) return;

    setSavingCustomIdea(true);
    setError('');

    try {
      const customIdea: BusinessIdea = {
        id: `custom-${Date.now()}`,
        name: customIdeaName,
        description: customIdeaDescription,
        difficulty: 3,
        costRange: 'Variable',
      };

      const { error: insertError } = await supabase
        .from('business_ideas')
        .insert({
          user_id: currentUser?.id,
          idea_id: customIdea.id,
          name: customIdea.name,
          description: customIdea.description,
          difficulty: customIdea.difficulty,
          cost_range: customIdea.costRange,
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      setIdeas([customIdea, ...ideas.slice(0, 2)]);
      setShowCustomIdeaForm(false);
      setCustomIdeaName('');
      setCustomIdeaDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to save custom idea');
    } finally {
      setSavingCustomIdea(false);
    }
  };

  const handleViewRoadmap = (ideaId: string) => {
    trackMilestone('idea_selected', { ideaId });
    trackActivity('idea_generated', { ideaId });
    navigate(`/first-revenue?ideaKey=${ideaId}`);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-400';
    if (difficulty <= 3) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-[#2979FF] animate-spin mx-auto mb-4" size={48} />
          <p className="text-white text-xl">Generating your personalized business ideas...</p>
          <p className="text-gray-400 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Rocket className="text-[#2979FF]" size={32} />
              <span className="text-2xl font-bold text-white font-['Montserrat']">Launch Pad</span>
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/saved-ideas')}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold hover:bg-purple-500/30 transition-all duration-300"
              >
                <BookmarkCheck size={16} />
                Saved Ideas
                {savedIdeaIds.size > 0 && (
                  <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {savedIdeaIds.size}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg text-sm font-semibold hover:bg-orange-500/30 transition-all duration-300"
              >
                <Settings size={16} />
                Get to Know You
              </button>
              <button
                onClick={() => setShowCustomIdeaForm(!showCustomIdeaForm)}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-semibold hover:bg-green-500/30 transition-all duration-300"
              >
                <PlusCircle size={16} />
                Add Idea
              </button>
              <button
                onClick={handleLocalServices}
                className="relative flex items-center gap-1.5 px-4 py-2 bg-[#06D6A0]/20 border border-[#06D6A0]/30 text-[#06D6A0] rounded-lg text-sm font-semibold hover:bg-[#06D6A0]/30 transition-all duration-300"
              >
                <MapPin size={16} />
                Local Services
                {userPlan === 'free' && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#EF476F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowKeywordInput(!showKeywordInput)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2979FF]/20 border border-[#2979FF]/30 text-[#2979FF] rounded-lg text-sm font-semibold hover:bg-[#2979FF]/30 transition-all duration-300"
              >
                <Sparkles size={16} />
                AI Keywords
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <RefreshCw className={regenerating ? 'animate-spin' : ''} size={16} />
                Regenerate
              </button>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-['Montserrat']">
              Your AI-picked business ideas
            </h1>
            <p className="text-lg text-gray-400">
              Here are 3 ideas tailored to you. Pick one to see your roadmap!
            </p>
            {lastUsedKeywords && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#2979FF]/20 border border-[#2979FF]/30 rounded-lg">
                <Sparkles className="text-[#2979FF]" size={16} />
                <span className="text-sm text-[#2979FF] font-medium">
                  Generated with keywords: <span className="font-bold">{lastUsedKeywords}</span>
                </span>
                <button
                  onClick={() => setLastUsedKeywords('')}
                  className="ml-2 text-[#2979FF] hover:text-[#2979FF]/80 transition-colors"
                  title="Clear keywords and use profile preferences"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {lastProgress && (
              <div className="mt-6">
                <div className={`backdrop-blur-sm border rounded-xl p-5 ${
                  lastProgress.isComplete
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30'
                    : 'bg-gradient-to-br from-[#2979FF]/20 to-purple-500/20 border-[#2979FF]/30'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle2 className={lastProgress.isComplete ? "text-green-400" : "text-[#06D6A0]"} size={18} />
                    <h3 className="text-white font-semibold text-sm">
                      {lastProgress.isComplete ? 'Journey Complete!' : 'Continue Your Journey'}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-4 text-center">
                    {lastProgress.isComplete ? (
                      <>
                        You've completed all stages for <span className="text-white font-semibold">{lastProgress.ideaName}</span>!
                      </>
                    ) : (
                      <>
                        You're working on <span className="text-white font-semibold">{lastProgress.ideaName}</span> - {lastProgress.stageName}
                      </>
                    )}
                  </p>
                  <button
                    onClick={() => navigate(lastProgress.link)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 mx-auto ${
                      lastProgress.isComplete
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-[#2979FF] text-white hover:bg-[#2979FF]/90'
                    }`}
                  >
                    {lastProgress.isComplete ? 'View Progress' : 'Resume Where I Left Off'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4">

        {showCustomIdeaForm && (
          <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-start gap-2 mb-4">
              <Lightbulb className="text-green-400 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 font-['Montserrat']">
                  Add Your Own Business Idea
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Have a business idea already? Enter it here and we'll help you build a roadmap for it.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={customIdeaName}
                      onChange={(e) => setCustomIdeaName(e.target.value)}
                      placeholder="e.g., Local Coffee Shop, Online Tutoring Service..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-gray-300 text-sm font-medium">
                        Business Description
                      </label>
                      {customIdeaName.trim() && (
                        <button
                          onClick={handleGenerateDescription}
                          disabled={generatingDescription}
                          className="flex items-center gap-1 text-[#2979FF] text-sm hover:underline disabled:opacity-50"
                        >
                          {generatingDescription ? (
                            <>
                              <Loader2 className="animate-spin" size={14} />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles size={14} />
                              AI Generate
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <textarea
                      value={customIdeaDescription}
                      onChange={(e) => setCustomIdeaDescription(e.target.value)}
                      placeholder="Describe what your business does, who it serves, and what value it provides..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] resize-none"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveCustomIdea}
                      disabled={!customIdeaName.trim() || !customIdeaDescription.trim() || savingCustomIdea}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    >
                      {savingCustomIdea ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <PlusCircle size={20} />
                          Add Idea
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomIdeaForm(false);
                        setCustomIdeaName('');
                        setCustomIdeaDescription('');
                      }}
                      className="px-6 py-3 bg-white/10 text-gray-300 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showKeywordInput && (
          <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-start gap-2 mb-4">
              <Sparkles className="text-[#2979FF] mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 font-['Montserrat']">
                  Generate Ideas with AI Keywords
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Enter any keywords or focus areas to generate fresh business ideas. These ideas are generated independently and don't require completing the onboarding questions.
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerateWithKeywords()}
                    placeholder="e.g., sustainability, local services, online education..."
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                  />
                  <button
                    onClick={handleGenerateWithKeywords}
                    disabled={!keywords.trim() || generatingWithKeywords}
                    className="px-6 py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                  >
                    {generatingWithKeywords ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="text-red-400 font-bold mb-2">Failed to Generate Ideas</h3>
                <p className="text-red-300 mb-3">{error}</p>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {regenerating ? 'Retrying...' : 'Try Again'}
                </button>
              </div>
            </div>
          </div>
        )}

        {ideas.length === 0 && !error && !loading && (
          <div className="text-center py-12">
            <Sparkles className="text-gray-500 mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-lg">No ideas generated yet.</p>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="mt-4 px-6 py-3 bg-[#2979FF] hover:bg-[#2979FF]/80 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {regenerating ? 'Generating...' : 'Generate Ideas'}
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-[#2979FF]" size={24} />
                <h3 className="text-2xl font-bold text-white font-['Montserrat']">{idea.name}</h3>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed flex-1">{idea.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Difficulty:</span>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < idea.difficulty ? 'bg-[#2979FF]' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                    <span className={`font-semibold ${getDifficultyColor(idea.difficulty)}`}>
                      {idea.difficulty}/5
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cost Range:</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="text-[#2979FF]" size={16} />
                    <span className="text-white font-semibold">{idea.costRange}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleSaveIdea(idea)}
                  disabled={savingIdeaId === idea.id}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all duration-300 ${
                    savedIdeaIds.has(idea.id)
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  } disabled:opacity-50`}
                  title={savedIdeaIds.has(idea.id) ? 'Saved' : 'Save idea'}
                >
                  {savedIdeaIds.has(idea.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                </button>
                <button
                  onClick={() => handleViewRoadmap(idea.id)}
                  className="flex-1 py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <TrendingUp size={20} />
                  View Roadmap
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Go to Dashboard →
          </button>
        </div>
        </div>
      </div>

      {showPreferencesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0D2847] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Settings className="text-orange-400" size={24} />
                <h2 className="text-2xl font-bold text-white">Get to Know You</h2>
              </div>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-300 mb-6">
              Update your preferences to get fresh business ideas tailored to your current interests and goals.
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-white font-semibold">
                    <Lightbulb size={18} className="text-[#2979FF]" />
                    1️⃣ What kind of problems are you passionate about solving?
                  </label>
                  <button
                    type="button"
                    onClick={() => setProblemsUnsure(!problemsUnsure)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-300 ${
                      problemsUnsure
                        ? 'bg-[#2979FF] text-white'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    I'm not sure
                  </button>
                </div>
                <textarea
                  value={preferences.passionateProblems}
                  onChange={(e) => setPreferences({ ...preferences, passionateProblems: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] transition-colors resize-none"
                  rows={3}
                  placeholder="e.g., helping people manage their finances, making healthy food accessible, organizing busy families..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-white font-semibold">
                    <AlertCircle size={18} className="text-[#2979FF]" />
                    2️⃣ What type of work energizes you most?
                  </label>
                  <button
                    type="button"
                    onClick={() => setWorkUnsure(!workUnsure)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-300 ${
                      workUnsure
                        ? 'bg-[#2979FF] text-white'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    I'm not sure
                  </button>
                </div>
                <textarea
                  value={preferences.energizingWork}
                  onChange={(e) => setPreferences({ ...preferences, energizingWork: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] transition-colors resize-none"
                  rows={3}
                  placeholder="e.g., working with my hands, teaching others, creating content, solving technical problems..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-white font-semibold">
                    <Briefcase size={18} className="text-[#2979FF]" />
                    3️⃣ What kind of lifestyle do you want your business to support?
                  </label>
                  <button
                    type="button"
                    onClick={() => setLifestyleUnsure(!lifestyleUnsure)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-300 ${
                      lifestyleUnsure
                        ? 'bg-[#2979FF] text-white'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    I'm not sure
                  </button>
                </div>
                <textarea
                  value={preferences.lifestyle}
                  onChange={(e) => setPreferences({ ...preferences, lifestyle: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] transition-colors resize-none"
                  rows={3}
                  placeholder="e.g., flexible schedule to spend time with family, location independence to travel, high income potential..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={savePreferences}
                disabled={savingPreferences}
                className="flex-1 px-6 py-3 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {savingPreferences ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving & Regenerating...
                  </>
                ) : (
                  'Save & Generate New Ideas'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
