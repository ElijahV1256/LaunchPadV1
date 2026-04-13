import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Home, Loader2, CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles, Rocket, CreditCard as Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Stage {
  name: string;
  goal: string;
  steps: string[];
}

interface StoryBrandRoadmapData {
  id: string;
  title: string;
  subtitle: string;
  stages: Stage[];
  completed: string[];
  step_answers: Record<string, string>;
}

const STEP_PRAISE_MESSAGES = [
  "Your story's getting clearer 🔥",
  "That's how heroes start 🚀",
  "Keep guiding your customers 🙌",
  "Momentum looks good 💪",
];

const STAGE_PRAISE_MESSAGES = [
  "Stage 1 complete — Your message is crystal clear ✨",
  "Stage 2 complete — You're inviting people into your story 🎯",
  "Stage 3 complete — You're delivering transformation 🌟",
];

export default function StoryBrandRoadmap() {
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey') || '';

  const [data, setData] = useState<StoryBrandRoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set([0]));
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCompletedStage, setLastCompletedStage] = useState<number | null>(null);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [stepAnswer, setStepAnswer] = useState<string>('');
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    loadData();
  }, [ideaKey]);

  useEffect(() => {
    if (data) {
      const totalSteps = data.stages.reduce((acc, stage) => acc + stage.steps.length, 0);
      if (data.completed.length === totalSteps && totalSteps > 0) {
        triggerCelebration();
      }
    }
  }, [data?.completed.length]);

  const loadData = async () => {
    if (!currentUser || !ideaKey) return;

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-storybrand-roadmap?ideaKey=${ideaKey}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to load roadmap');
      }

      const roadmapData = await response.json();
      setData(roadmapData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAiHelp = async (step: string) => {
    if (!data) return;

    setLoadingAi(true);
    setAiSuggestion('');

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
            step,
            businessName: 'StoryBrand Marketing',
            businessDescription: 'Building your business story using the StoryBrand framework',
            currentAnswer: stepAnswer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get AI help');
      }

      const { suggestion } = await response.json();
      setAiSuggestion(suggestion);
    } catch (err) {
      console.error('Failed to get AI help:', err);
      setAiSuggestion('Sorry, AI assistance is temporarily unavailable. Please try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSaveAnswer = async (step: string, stageIndex: number) => {
    if (!data || !stepAnswer.trim()) return;

    const isAlreadyCompleted = data.completed.includes(step);
    const newCompleted = isAlreadyCompleted ? data.completed : [...data.completed, step];
    const newStepAnswers = { ...data.step_answers, [step]: stepAnswer };

    setData({ ...data, completed: newCompleted, step_answers: newStepAnswers });
    setEditingStep(null);
    setStepAnswer('');
    setAiSuggestion('');

    showToast(STEP_PRAISE_MESSAGES[Math.floor(Math.random() * STEP_PRAISE_MESSAGES.length)]);

    const stageSteps = data.stages[stageIndex].steps;
    const stageCompleted = stageSteps.every((s) => newCompleted.includes(s));

    if (stageCompleted && lastCompletedStage !== stageIndex) {
      setLastCompletedStage(stageIndex);
      setTimeout(() => {
        showToast(STAGE_PRAISE_MESSAGES[stageIndex] || `Stage ${stageIndex + 1} complete! 🎉`);
      }, 500);
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/toggle-storybrand-step`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ideaKey, step, done: true, answer: stepAnswer }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save answer');
      }
    } catch (err) {
      console.error('Failed to save answer:', err);
      setData({ ...data, completed: data.completed, step_answers: data.step_answers });
    }
  };

  const handleEditStep = async (step: string) => {
    if (!data) return;
    const answer = data.step_answers?.[step] || '';
    setEditingStep(step);
    setStepAnswer(answer);
  };

  const handleAnswerChange = (step: string, value: string) => {
    setStepAnswer(value);

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      if (!data || !value.trim()) return;

      const newStepAnswers = { ...data.step_answers, [step]: value };
      setData({ ...data, step_answers: newStepAnswers });

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/toggle-storybrand-step`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ideaKey, step, done: data.completed.includes(step), answer: value }),
          }
        );
      } catch (err) {
        console.error('Failed to autosave answer:', err);
      }
    }, 1000);

    setAutoSaveTimeout(timeout);
  };

  const toggleStage = (index: number) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStages(newExpanded);
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const getStageProgress = (stageIndex: number): number => {
    if (!data) return 0;
    const stage = data.stages[stageIndex];
    const completedInStage = stage.steps.filter((step) => data.completed.includes(step)).length;
    return Math.round((completedInStage / stage.steps.length) * 100);
  };

  const getOverallProgress = (): number => {
    if (!data) return 0;
    const totalSteps = data.stages.reduce((acc, stage) => acc + stage.steps.length, 0);
    return totalSteps > 0 ? Math.round((data.completed.length / totalSteps) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] flex items-center justify-center">
        <Loader2 className="text-[#2979FF] animate-spin" size={48} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Failed to load roadmap</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = getOverallProgress();

  const scrollToStage = (index: number) => {
    stageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!expandedStages.has(index)) {
      toggleStage(index);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F]">
      <div className="flex">
        <div className="hidden lg:block w-72 fixed left-0 top-0 h-screen bg-[#0A192F]/80 backdrop-blur-sm border-r border-white/10 p-6 overflow-y-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>

          <div className="mb-6">
            <h2 className="text-white font-bold text-lg mb-2">StoryBrand Roadmap</h2>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#2979FF] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{progress}%</span>
            </div>
          </div>

          <nav className="space-y-2">
            {data?.stages.map((stage, idx) => {
              const stageProgress = getStageProgress(idx);
              const isCompleted = stageProgress === 100;
              const isActive = stageProgress > 0 && stageProgress < 100;

              return (
                <button
                  key={idx}
                  onClick={() => scrollToStage(idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    isCompleted
                      ? 'bg-[#06D6A0]/10 border border-[#06D6A0]/30 text-[#06D6A0]'
                      : isActive
                      ? 'bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF]'
                      : 'bg-white/5 border border-white/10 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isCompleted ? 'bg-[#06D6A0]/20' : isActive ? 'bg-[#2979FF]/20' : 'bg-white/10'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{stage.name}</div>
                    </div>
                    {isCompleted && <CheckCircle2 size={16} className="text-[#06D6A0] flex-shrink-0" />}
                  </div>
                  <div className="ml-9">
                    <div className="text-xs opacity-70 truncate mb-1">{stage.goal}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-full transition-all ${isCompleted ? 'bg-[#06D6A0]' : 'bg-[#2979FF]'}`}
                          style={{ width: `${stageProgress}%` }}
                        />
                      </div>
                      <span className="text-xs">{stageProgress}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 lg:ml-72 py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Rocket className="text-[#2979FF] animate-bounce" size={32} />
                <span className="text-2xl font-bold text-white font-['Montserrat']">Launch Pad</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Home size={20} />
                Dashboard
              </button>
            </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-['Montserrat']">
            {data.title}
          </h1>
          <p className="text-xl text-gray-300 mb-4">{data.subtitle}</p>
          <p className="text-gray-400 italic">You have what it takes. We're just giving you the plan.</p>
        </div>

        <div className="mb-8 lg:hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-300 font-semibold">Overall Progress</span>
            <span className="text-[#0A192F] bg-[#2979FF] px-3 py-1 rounded-full font-bold text-sm">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-[#F4F6F8] rounded-full h-4 overflow-hidden">
            <div
              className="bg-[#2979FF] h-4 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {data.stages.map((stage, stageIndex) => {
            const stageProgress = getStageProgress(stageIndex);
            const isExpanded = expandedStages.has(stageIndex);
            const isCompleted = stageProgress === 100;

            return (
              <div
                key={stageIndex}
                ref={(el) => (stageRefs.current[stageIndex] = el)}
                className={`bg-white/5 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all ${
                  isCompleted ? 'border-[#2979FF]/30' : 'border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleStage(stageIndex)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2979FF]/20 text-[#2979FF] font-bold">
                      {stageIndex + 1}
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white">{stage.name}</h3>
                      <p className="text-sm text-gray-400">{stage.goal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#2979FF]">{stageProgress}%</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="text-gray-400" size={24} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={24} />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="space-y-3">
                      {stage.steps.map((step, stepIndex) => {
                        const isStepCompleted = data.completed.includes(step);
                        const isEditing = editingStep === step;
                        const answer = data.step_answers?.[step] || '';

                        return (
                          <div
                            key={stepIndex}
                            className={`p-4 rounded-lg transition-all ${
                              isStepCompleted
                                ? 'bg-[#2979FF]/10 border border-[#2979FF]/30'
                                : 'bg-white/5 border border-white/10'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {isStepCompleted ? (
                                  <CheckCircle2 className="text-[#2979FF]" size={20} />
                                ) : (
                                  <Circle className="text-gray-500" size={20} />
                                )}
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`font-medium mb-2 ${
                                    isStepCompleted ? 'text-gray-400' : 'text-white'
                                  }`}
                                >
                                  {step}
                                </p>

                                {isEditing ? (
                                  <div className="mt-2 space-y-3">
                                    <textarea
                                      value={stepAnswer}
                                      onChange={(e) => handleAnswerChange(step, e.target.value)}
                                      placeholder="Enter your answer..."
                                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] resize-none"
                                      rows={3}
                                      autoFocus
                                    />

                                    {aiSuggestion && (
                                      <div className="p-3 bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg">
                                        <div className="flex items-start gap-2 mb-2">
                                          <Sparkles className="text-[#2979FF] flex-shrink-0 mt-0.5" size={16} />
                                          <p className="text-sm font-semibold text-[#2979FF]">AI Suggestion</p>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{aiSuggestion}</p>
                                      </div>
                                    )}

                                    <div className="flex gap-2 flex-wrap">
                                      <button
                                        onClick={() => handleSaveAnswer(step, stageIndex)}
                                        disabled={!stepAnswer.trim()}
                                        className="px-4 py-2 bg-[#2979FF] text-[#0A192F] rounded-lg font-semibold text-sm hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        Save & Complete
                                      </button>
                                      <button
                                        onClick={() => handleGetAiHelp(step)}
                                        disabled={loadingAi}
                                        className="px-4 py-2 bg-[#2979FF]/20 border border-[#2979FF]/30 text-[#2979FF] rounded-lg font-semibold text-sm hover:bg-[#2979FF]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                      >
                                        {loadingAi ? (
                                          <>
                                            <Loader2 className="animate-spin" size={14} />
                                            Getting help...
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles size={14} />
                                            Get AI Help
                                          </>
                                        )}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingStep(null);
                                          setStepAnswer('');
                                          setAiSuggestion('');
                                        }}
                                        className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg font-semibold text-sm hover:bg-white/20 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-2">
                                    {isStepCompleted && answer && (
                                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg mb-3">
                                        <p className="text-gray-300 text-sm">{answer}</p>
                                      </div>
                                    )}
                                    <button
                                      onClick={() => handleEditStep(step)}
                                      className={`flex items-center gap-2 text-sm transition-colors ${
                                        isStepCompleted
                                          ? 'px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10'
                                          : 'text-gray-400 hover:text-white'
                                      }`}
                                    >
                                      {isStepCompleted ? (
                                        <>
                                          <Edit3 size={14} />
                                          Edit answer
                                        </>
                                      ) : (
                                        '+ Add your answer'
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showCelebration && (
          <div className="mb-8 bg-gradient-to-r from-[#2979FF]/20 to-[#2979FF]/10 backdrop-blur-sm border border-[#2979FF]/30 rounded-2xl p-8 text-center">
            <Sparkles className="text-[#2979FF] mx-auto mb-4" size={64} />
            <h2 className="text-3xl font-bold text-white mb-4 font-['Montserrat']">
              You did it! Your story is live 🎉
            </h2>
            <p className="text-gray-300 mb-6">
              Every hero needs a guide — and you're following yours. Keep telling your story!
            </p>
            <button
              onClick={() => navigate(`/first-revenue?ideaKey=${ideaKey}`)}
              className="px-8 py-4 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold text-lg hover:bg-[#2979FF]/90 transition-all duration-300"
            >
              Continue to First Dollar →
            </button>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#2979FF] text-[#0A192F] px-6 py-3 rounded-full font-semibold shadow-lg animate-fade-in-up">
            {toast}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
