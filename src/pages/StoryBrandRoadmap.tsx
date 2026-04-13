import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Home, Loader2, CheckCircle2, ChevronDown, ChevronUp,
  Sparkles, Rocket, MessageSquare, Users, Trophy,
  ArrowRight, Lightbulb, PenLine, Megaphone, Target, Heart, Zap,
} from 'lucide-react';
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

const STAGE_META = [
  {
    icon: MessageSquare,
    color: '#2979FF',
    gradient: 'from-[#2979FF]/20 to-[#2979FF]/5',
    borderColor: 'border-[#2979FF]/30',
    activeColor: 'bg-[#2979FF]',
    tagline: 'Get crystal clear on what you do and who you help',
    stepIcons: [Target, Lightbulb, PenLine],
  },
  {
    icon: Users,
    color: '#06D6A0',
    gradient: 'from-[#06D6A0]/20 to-[#06D6A0]/5',
    borderColor: 'border-[#06D6A0]/30',
    activeColor: 'bg-[#06D6A0]',
    tagline: 'Show people how your business fits into their story',
    stepIcons: [Megaphone, Heart, Users],
  },
  {
    icon: Trophy,
    color: '#FFB800',
    gradient: 'from-[#FFB800]/20 to-[#FFB800]/5',
    borderColor: 'border-[#FFB800]/30',
    activeColor: 'bg-[#FFB800]',
    tagline: 'Paint the picture of success your customers will experience',
    stepIcons: [Zap, Trophy, Sparkles],
  },
];

const STEP_PLACEHOLDERS: Record<number, string[]> = {
  0: [
    'Think about the #1 thing your customer wants when they find you...',
    'What frustration keeps your ideal customer up at night?',
    'In one sentence, how do you solve their problem?',
  ],
  1: [
    'What would you say to a friend to get them interested?',
    'What makes people trust you over the competition?',
    'How do you make it easy for someone to say yes?',
  ],
  2: [
    'What does life look like AFTER they work with you?',
    'What will your customer be able to do that they couldn\'t before?',
    'How will they feel about themselves after the transformation?',
  ],
};

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
      if (!response.ok) throw new Error('Failed to get AI help');
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

    const stageSteps = data.stages[stageIndex].steps;
    const stageCompleted = stageSteps.every((s) => newCompleted.includes(s));
    if (stageCompleted && lastCompletedStage !== stageIndex) {
      setLastCompletedStage(stageIndex);
      const stageMeta = STAGE_META[stageIndex];
      showToast(`Stage ${stageIndex + 1} complete -- ${data.stages[stageIndex].name}`);
      if (stageIndex < data.stages.length - 1) {
        setTimeout(() => {
          const newExpanded = new Set(expandedStages);
          newExpanded.add(stageIndex + 1);
          setExpandedStages(newExpanded);
          stageRefs.current[stageIndex + 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 600);
      }
    } else {
      showToast('Answer saved!');
    }

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
          body: JSON.stringify({ ideaKey, step, done: true, answer: stepAnswer }),
        }
      );
    } catch (err) {
      console.error('Failed to save answer:', err);
      setData({ ...data, completed: data.completed, step_answers: data.step_answers });
    }
  };

  const handleEditStep = (step: string) => {
    if (!data) return;
    const answer = data.step_answers?.[step] || '';
    setEditingStep(step);
    setStepAnswer(answer);
    setAiSuggestion('');
  };

  const handleAnswerChange = (step: string, value: string) => {
    setStepAnswer(value);
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
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
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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

  const scrollToStage = (index: number) => {
    stageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!expandedStages.has(index)) toggleStage(index);
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
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = getOverallProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F]">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block w-72 fixed left-0 top-0 h-screen bg-[#0A192F]/80 backdrop-blur-sm border-r border-white/10 p-6 overflow-y-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>

          <div className="mb-6">
            <h2 className="text-white font-bold text-lg mb-2">Your Story</h2>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2979FF] to-[#06D6A0] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-bold text-white">{progress}%</span>
            </div>
            <p className="text-xs text-gray-500">{data.completed.length} of {data.stages.reduce((a, s) => a + s.steps.length, 0)} steps done</p>
          </div>

          <nav className="space-y-3">
            {data.stages.map((stage, idx) => {
              const meta = STAGE_META[idx] || STAGE_META[0];
              const stageProgress = getStageProgress(idx);
              const isCompleted = stageProgress === 100;
              const Icon = meta.icon;

              return (
                <button
                  key={idx}
                  onClick={() => scrollToStage(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all group hover:scale-[1.02] ${
                    isCompleted
                      ? `bg-gradient-to-r ${meta.gradient} border ${meta.borderColor}`
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-lg"
                      style={{ backgroundColor: `${meta.color}20` }}
                    >
                      <Icon size={16} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${isCompleted ? 'text-white' : 'text-gray-300'}`}>
                        {stage.name}
                      </div>
                    </div>
                    {isCompleted && <CheckCircle2 size={16} style={{ color: meta.color }} />}
                  </div>
                  <div className="ml-11">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${stageProgress}%`, backgroundColor: meta.color }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{stageProgress}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-72 py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Rocket className="text-[#2979FF]" size={28} />
                <span className="text-xl font-bold text-white font-['Montserrat']">Launch Pad</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Home size={18} />
                Dashboard
              </button>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-['Montserrat']">
                {data.title}
              </h1>
              <p className="text-lg text-gray-400 max-w-xl mx-auto">
                {data.subtitle}
              </p>
            </div>

            {/* Mobile progress */}
            <div className="mb-8 lg:hidden bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-300 font-semibold text-sm">Your Progress</span>
                <span className="text-white bg-[#2979FF]/20 px-3 py-1 rounded-full font-bold text-sm">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#2979FF] to-[#06D6A0] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stages */}
            <div className="space-y-6 mb-8">
              {data.stages.map((stage, stageIndex) => {
                const meta = STAGE_META[stageIndex] || STAGE_META[0];
                const stageProgress = getStageProgress(stageIndex);
                const isExpanded = expandedStages.has(stageIndex);
                const isCompleted = stageProgress === 100;
                const StageIcon = meta.icon;

                return (
                  <div
                    key={stageIndex}
                    ref={(el) => (stageRefs.current[stageIndex] = el)}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 border ${
                      isCompleted ? meta.borderColor : isExpanded ? 'border-white/15' : 'border-white/10'
                    } ${isExpanded ? 'bg-white/[0.03]' : 'bg-white/[0.02]'}`}
                  >
                    <button
                      onClick={() => toggleStage(stageIndex)}
                      className="w-full px-6 py-5 flex items-center gap-4 hover:bg-white/[0.03] transition-all"
                    >
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 transition-transform"
                        style={{ backgroundColor: `${meta.color}15` }}
                      >
                        <StageIcon size={22} style={{ color: meta.color }} />
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
                            Stage {stageIndex + 1}
                          </span>
                          {isCompleted && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
                              Complete
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white truncate">{stage.name}</h3>
                        <p className="text-sm text-gray-500 truncate hidden sm:block">{meta.tagline}</p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-20 bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${stageProgress}%`, backgroundColor: meta.color }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-400 w-8 text-right">{stageProgress}%</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="text-gray-500" size={20} />
                        ) : (
                          <ChevronDown className="text-gray-500" size={20} />
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
                            const StepIcon = meta.stepIcons[stepIndex] || Target;
                            const placeholder = STEP_PLACEHOLDERS[stageIndex]?.[stepIndex] || 'Write your answer...';

                            return (
                              <div
                                key={stepIndex}
                                className={`rounded-xl transition-all duration-300 ${
                                  isEditing
                                    ? `bg-gradient-to-b ${meta.gradient} border ${meta.borderColor}`
                                    : isStepCompleted
                                    ? 'bg-white/[0.04] border border-white/10'
                                    : 'bg-white/[0.02] border border-white/8 hover:border-white/15'
                                }`}
                              >
                                <div className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5 transition-all ${
                                        isStepCompleted ? 'scale-100' : 'scale-90 opacity-60'
                                      }`}
                                      style={{ backgroundColor: isStepCompleted ? `${meta.color}20` : 'rgba(255,255,255,0.05)' }}
                                    >
                                      {isStepCompleted ? (
                                        <CheckCircle2 size={16} style={{ color: meta.color }} />
                                      ) : (
                                        <StepIcon size={16} className="text-gray-500" />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className={`font-medium text-[15px] leading-snug ${isStepCompleted ? 'text-gray-300' : 'text-white'}`}>
                                        {step}
                                      </p>

                                      {isEditing ? (
                                        <div className="mt-3 space-y-3">
                                          <textarea
                                            value={stepAnswer}
                                            onChange={(e) => handleAnswerChange(step, e.target.value)}
                                            placeholder={placeholder}
                                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/25 resize-none text-sm leading-relaxed"
                                            rows={3}
                                            autoFocus
                                          />

                                          {aiSuggestion && (
                                            <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Sparkles size={14} style={{ color: meta.color }} />
                                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>AI Suggestion</p>
                                              </div>
                                              <p className="text-gray-300 text-sm leading-relaxed">{aiSuggestion}</p>
                                              <button
                                                onClick={() => {
                                                  setStepAnswer(aiSuggestion);
                                                  handleAnswerChange(step, aiSuggestion);
                                                }}
                                                className="mt-2 text-xs font-semibold hover:underline"
                                                style={{ color: meta.color }}
                                              >
                                                Use this suggestion
                                              </button>
                                            </div>
                                          )}

                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => handleSaveAnswer(step, stageIndex)}
                                              disabled={!stepAnswer.trim()}
                                              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                              style={{ backgroundColor: meta.color }}
                                            >
                                              <CheckCircle2 size={14} />
                                              Save & Complete
                                            </button>
                                            <button
                                              onClick={() => handleGetAiHelp(step)}
                                              disabled={loadingAi}
                                              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40 flex items-center gap-2"
                                            >
                                              {loadingAi ? (
                                                <Loader2 className="animate-spin" size={14} />
                                              ) : (
                                                <Sparkles size={14} />
                                              )}
                                              {loadingAi ? 'Thinking...' : 'AI Help'}
                                            </button>
                                            <button
                                              onClick={() => {
                                                setEditingStep(null);
                                                setStepAnswer('');
                                                setAiSuggestion('');
                                              }}
                                              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="mt-2">
                                          {isStepCompleted && answer ? (
                                            <div className="flex items-start gap-2">
                                              <p className="flex-1 text-sm text-gray-400 leading-relaxed">{answer}</p>
                                              <button
                                                onClick={() => handleEditStep(step)}
                                                className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                                              >
                                                <PenLine size={14} />
                                              </button>
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => handleEditStep(step)}
                                              className="flex items-center gap-2 text-sm font-medium transition-all rounded-lg px-3 py-2 -ml-3 hover:bg-white/5"
                                              style={{ color: meta.color }}
                                            >
                                              <ArrowRight size={14} />
                                              Answer this step
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
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
              <div className="mb-8 bg-gradient-to-r from-[#FFB800]/10 via-[#06D6A0]/10 to-[#2979FF]/10 border border-white/10 rounded-2xl p-8 text-center">
                <Trophy className="text-[#FFB800] mx-auto mb-4" size={56} />
                <h2 className="text-3xl font-bold text-white mb-3 font-['Montserrat']">
                  Your story is complete!
                </h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  You now have a clear, compelling message that will connect with your customers. Time to put it to work.
                </p>
                <button
                  onClick={() => navigate(`/first-revenue?ideaKey=${ideaKey}`)}
                  className="px-8 py-4 bg-[#06D6A0] text-white rounded-xl font-bold text-lg hover:bg-[#06D6A0]/90 transition-all flex items-center gap-2 mx-auto"
                >
                  Continue to First Dollar
                  <ArrowRight size={20} />
                </button>
              </div>
            )}

            {toast && (
              <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-semibold shadow-2xl text-sm">
                {toast}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
