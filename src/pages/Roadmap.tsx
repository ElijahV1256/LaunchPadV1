import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateRoadmap, generateStepPathway, BusinessIdea, RoadmapStage } from '../services/openai';
import { Rocket, CheckCircle2, Circle, Loader2, AlertCircle, ChevronDown, ChevronUp, Home, Sparkles, X } from 'lucide-react';

export default function Roadmap() {
  const [idea, setIdea] = useState<BusinessIdea | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapStage[]>([]);
  const [roadmapId, setRoadmapId] = useState<string>('');
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set([0]));
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPathways, setExpandedPathways] = useState<Map<string, string[]>>(new Map());
  const [loadingPathway, setLoadingPathway] = useState<string | null>(null);
  const [stepAnswers, setStepAnswers] = useState<Record<string, string>>({});
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [tempAnswer, setTempAnswer] = useState<string>('');

  const { ideaId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    loadRoadmap();
  }, [ideaId]);

  const loadRoadmap = async () => {
    if (!currentUser || !ideaId) return;

    setLoading(true);
    setError('');

    try {
      const { data: ideaData, error: ideaError } = await supabase
        .from('business_ideas')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('idea_id', ideaId)
        .maybeSingle();

      if (ideaError) throw ideaError;

      if (!ideaData) {
        setError('Idea not found');
        return;
      }

      const businessIdea: BusinessIdea = {
        id: ideaData.idea_id,
        name: ideaData.name,
        description: ideaData.description,
        difficulty: ideaData.difficulty,
        costRange: ideaData.cost_range,
      };

      setIdea(businessIdea);

      const { data: existingRoadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('idea_id', ideaId)
        .maybeSingle();

      if (roadmapError && roadmapError.code !== 'PGRST116') throw roadmapError;

      if (!existingRoadmap) {
        console.log('No existing roadmap found, generating new one');
        const generatedRoadmap = await generateRoadmap(businessIdea);

        const { data: newRoadmap, error: insertError } = await supabase
          .from('roadmaps')
          .insert({
            user_id: currentUser.id,
            idea_id: ideaId,
            stages: generatedRoadmap,
            completed_steps: [],
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;

        console.log('Created new roadmap with ID:', newRoadmap.id);
        setRoadmap(generatedRoadmap);
        setRoadmapId(newRoadmap.id);
        setCompletedSteps(new Set());
        setStepAnswers({});
      } else {
        console.log('Found existing roadmap:', existingRoadmap.id);
        console.log('Completed steps from DB:', existingRoadmap.completed_steps);
        console.log('Step answers from DB:', existingRoadmap.step_answers);
        setRoadmap(existingRoadmap.stages);
        setRoadmapId(existingRoadmap.id);
        setCompletedSteps(new Set(existingRoadmap.completed_steps || []));
        setStepAnswers(existingRoadmap.step_answers || {});
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load roadmap');
    } finally {
      setLoading(false);
    }
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

  const toggleStep = async (stageIndex: number, stepIndex: number) => {
    const stepId = `${stageIndex}-${stepIndex}`;
    const newCompleted = new Set(completedSteps);

    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }

    setCompletedSteps(newCompleted);

    try {
      const { error: updateError } = await supabase
        .from('roadmaps')
        .update({
          completed_steps: Array.from(newCompleted),
          updated_at: new Date().toISOString(),
        })
        .eq('id', roadmapId);

      if (updateError) {
        console.error('Failed to save progress:', updateError);
        alert(`Failed to save progress: ${updateError.message}`);
        setCompletedSteps(new Set(completedSteps));
      } else {
        console.log('Progress saved successfully');
      }
    } catch (err: any) {
      console.error('Failed to save progress:', err);
      alert(`Failed to save progress: ${err.message}`);
      setCompletedSteps(new Set(completedSteps));
    }
  };

  const saveStepAnswer = async (stepId: string, answer: string) => {
    const newAnswers = { ...stepAnswers, [stepId]: answer };
    setStepAnswers(newAnswers);
    setEditingStep(null);

    try {
      console.log('Saving answer for step:', stepId, 'to roadmap:', roadmapId);
      const { data, error: updateError } = await supabase
        .from('roadmaps')
        .update({
          step_answers: newAnswers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roadmapId)
        .select();

      if (updateError) {
        console.error('Failed to save answer:', updateError);
        alert(`Failed to save your answer: ${updateError.message}`);
        setStepAnswers(stepAnswers);
      } else {
        console.log('Answer saved successfully:', data);
      }
    } catch (err: any) {
      console.error('Failed to save answer:', err);
      alert(`Failed to save your answer: ${err.message}`);
      setStepAnswers(stepAnswers);
    }
  };

  const getStageProgress = (stageIndex: number): number => {
    const stage = roadmap[stageIndex];
    if (!stage) return 0;

    const totalSteps = stage.steps.length;
    const completedCount = stage.steps.filter((_, stepIndex) =>
      completedSteps.has(`${stageIndex}-${stepIndex}`)
    ).length;

    return Math.round((completedCount / totalSteps) * 100);
  };

  const togglePathway = async (stageIndex: number, stepIndex: number) => {
    const stepId = `${stageIndex}-${stepIndex}`;
    const newExpanded = new Map(expandedPathways);

    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
      setExpandedPathways(newExpanded);
      return;
    }

    setLoadingPathway(stepId);

    try {
      const stage = roadmap[stageIndex];
      const step = stage.steps[stepIndex];

      const pathways = await generateStepPathway(
        idea?.name || '',
        idea?.description || '',
        stage.stage,
        step
      );

      newExpanded.set(stepId, pathways);
      setExpandedPathways(newExpanded);
    } catch (err) {
      console.error('Failed to generate pathway:', err);
    } finally {
      setLoadingPathway(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-[#2979FF] animate-spin mx-auto mb-4" size={48} />
          <p className="text-white text-xl">Creating your personalized roadmap...</p>
          <p className="text-gray-400 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-400" size={24} />
            <p className="text-red-400">{error}</p>
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/ideas')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Ideas
            </button>
          </div>
        </div>
      </div>
    );
  }

  const scrollToStage = (index: number) => {
    stageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!expandedStages.has(index)) {
      toggleStage(index);
    }
  };

  const overallProgress = roadmap.length > 0
    ? Math.round(
        (Array.from(completedSteps).length / roadmap.reduce((acc, stage) => acc + stage.steps.length, 0)) * 100
      )
    : 0;

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
            <h2 className="text-white font-bold text-lg mb-2 truncate">{idea?.name}</h2>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#2979FF] transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{overallProgress}%</span>
            </div>
          </div>

          <nav className="space-y-2">
            {roadmap.map((stage, idx) => {
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
                      <div className="font-semibold text-sm truncate">{stage.stage}</div>
                    </div>
                    {isCompleted && <CheckCircle2 size={16} className="text-[#06D6A0] flex-shrink-0" />}
                  </div>
                  <div className="ml-9">
                    <div className="text-xs opacity-70 mb-1">{stage.steps.length} steps</div>
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

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-['Montserrat']">
            {idea?.name}
          </h1>
          <p className="text-xl text-gray-300 mb-6">{idea?.description}</p>
          <h2 className="text-2xl font-bold text-[#2979FF]">Your step-by-step plan to first revenue</h2>
        </div>

        <div className="space-y-4">
          {roadmap.map((stage, stageIndex) => {
            const progress = getStageProgress(stageIndex);
            const isExpanded = expandedStages.has(stageIndex);

            return (
              <div
                key={stageIndex}
                ref={(el) => (stageRefs.current[stageIndex] = el)}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
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
                      <h3 className="text-xl font-bold text-white">{stage.stage}</h3>
                      <p className="text-sm text-gray-400">{stage.steps.length} steps</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#2979FF]">{progress}% complete</p>
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
                        const stepId = `${stageIndex}-${stepIndex}`;
                        const isCompleted = completedSteps.has(stepId);

                        const pathways = expandedPathways.get(stepId);
                        const isLoadingPathway = loadingPathway === stepId;
                        const stepAnswer = stepAnswers[stepId] || '';
                        const isEditing = editingStep === stepId;

                        return (
                          <div key={stepIndex} className="space-y-2">
                            <div
                              className={`p-4 rounded-lg transition-all ${
                                isCompleted
                                  ? 'bg-[#2979FF]/10 border border-[#2979FF]/30'
                                  : 'bg-white/5 border border-white/10'
                              }`}
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <label className="flex items-start gap-3 flex-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isCompleted}
                                    onChange={() => toggleStep(stageIndex, stepIndex)}
                                    className="sr-only"
                                  />
                                  <div className="mt-0.5">
                                    {isCompleted ? (
                                      <CheckCircle2 className="text-[#2979FF]" size={20} />
                                    ) : (
                                      <Circle className="text-gray-500" size={20} />
                                    )}
                                  </div>
                                  <p
                                    className={`flex-1 ${
                                      isCompleted ? 'text-gray-400 line-through' : 'text-white'
                                    }`}
                                  >
                                    {step}
                                  </p>
                                </label>
                                <button
                                  onClick={() => togglePathway(stageIndex, stepIndex)}
                                  disabled={isLoadingPathway}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                                    pathways
                                      ? 'bg-[#2979FF]/20 text-[#2979FF] hover:bg-[#2979FF]/30'
                                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                  }`}
                                >
                                  {isLoadingPathway ? (
                                    <Loader2 className="animate-spin" size={16} />
                                  ) : pathways ? (
                                    <X size={16} />
                                  ) : (
                                    <Sparkles size={16} />
                                  )}
                                  {isLoadingPathway ? 'Generating...' : pathways ? 'Close' : 'Get AI Help'}
                                </button>
                              </div>

                              {isEditing ? (
                                <div className="ml-9 space-y-2">
                                  <textarea
                                    value={tempAnswer}
                                    onChange={(e) => setTempAnswer(e.target.value)}
                                    placeholder="Enter your notes, progress, or insights for this step..."
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2979FF]/50 resize-none"
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => saveStepAnswer(stepId, tempAnswer)}
                                      className="px-4 py-1.5 bg-[#2979FF] text-[#0A192F] rounded-lg font-medium text-sm hover:bg-[#2979FF]/90 transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setTempAnswer('');
                                        setEditingStep(null);
                                      }}
                                      className="px-4 py-1.5 bg-white/10 text-gray-300 rounded-lg font-medium text-sm hover:bg-white/20 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="ml-9">
                                  {stepAnswer ? (
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                      <p className="text-gray-300 text-sm mb-2">{stepAnswer}</p>
                                      <button
                                        onClick={() => {
                                          setTempAnswer(stepAnswer);
                                          setEditingStep(stepId);
                                        }}
                                        className="text-[#2979FF] text-xs hover:underline"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setTempAnswer('');
                                        setEditingStep(stepId);
                                      }}
                                      className="text-gray-400 text-sm hover:text-white transition-colors"
                                    >
                                      + Add your notes or progress
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {pathways && (
                              <div className="ml-9 p-4 bg-[#2979FF]/5 border border-[#2979FF]/20 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <Sparkles className="text-[#2979FF]" size={18} />
                                  <h4 className="text-[#2979FF] font-semibold">AI-Suggested Pathways</h4>
                                </div>
                                <ul className="space-y-2.5">
                                  {pathways.map((pathway, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5">
                                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2979FF] flex-shrink-0" />
                                      <p className="text-gray-200 text-sm leading-relaxed">{pathway}</p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
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

        <div className="mt-12 space-y-4">
          <button
            onClick={() => navigate(`/storybrand-roadmap?ideaKey=${idea?.id}`)}
            className="w-full px-8 py-5 bg-gradient-to-r from-[#2979FF] to-[#2979FF] text-[#0A192F] rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#2979FF]/30"
          >
            Start the 3 Stages (StoryBrand Edition) 🚀
          </button>
          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
