import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import {
  TrendingUp,
  Users,
  Target,
  MessageSquare,
  Calendar,
  BarChart3,
  DollarSign,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface MarketingStrategy {
  id: string;
  business_name: string;
  overview: {
    executive_summary: string;
    primary_goal: string;
    key_objectives: string[];
  };
  target_audience: {
    primary_persona: {
      name: string;
      demographics: string;
      psychographics: string;
      behaviors: string;
    };
    secondary_personas: Array<{
      name: string;
      demographics: string;
    }>;
    audience_size_estimate: string;
  };
  unique_selling_points: {
    main_usp: string;
    supporting_usps: string[];
    competitive_advantages: string[];
    value_proposition_statement: string;
  };
  marketing_channels: {
    priority_channels: Array<{
      name: string;
      rationale: string;
      strategy: string;
      tactics: string[];
      budget_allocation: string;
      expected_roi: string;
    }>;
    content_themes: string[];
  };
  content_strategy: {
    content_pillars: string[];
    content_types: Array<{
      type: string;
      frequency: string;
      topics: string[];
    }>;
    distribution_plan: string;
  };
  launch_plan: {
    phase_1_first_30_days: {
      focus: string;
      actions: Array<{
        action: string;
        deadline: string;
        success_metric: string;
      }>;
    };
    phase_2_days_31_60: {
      focus: string;
      actions: Array<{
        action: string;
        deadline: string;
        success_metric: string;
      }>;
    };
    phase_3_days_61_90: {
      focus: string;
      actions: Array<{
        action: string;
        deadline: string;
        success_metric: string;
      }>;
    };
  };
  metrics: {
    primary_kpis: Array<{
      metric: string;
      target: string;
      measurement_frequency: string;
    }>;
    secondary_metrics: string[];
    tracking_tools: string[];
  };
  budget_recommendations: {
    total_monthly_budget: string;
    allocation: Array<{
      category: string;
      percentage: string;
      amount: string;
      rationale: string;
    }>;
    bootstrap_alternatives: string[];
  };
}

export default function MarketingStrategy() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const websiteId = searchParams.get('website');

  const [strategy, setStrategy] = useState<MarketingStrategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    loadStrategy();
  }, [websiteId]);

  const loadStrategy = async () => {
    if (!websiteId) {
      navigate('/dashboard');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('marketing_strategies')
        .select('*')
        .eq('website_id', websiteId)
        .maybeSingle();

      if (error) throw error;
      setStrategy(data);
    } catch (err: any) {
      console.error('Error loading strategy:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateStrategy = async () => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      console.log('Generating strategy for website ID:', websiteId);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-marketing-strategy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ websiteId }),
        }
      );

      const result = await response.json();
      console.log('Response status:', response.status);
      console.log('Response body:', result);

      if (!response.ok) {
        const errorMsg = result.error || 'Failed to generate strategy';
        console.error('Strategy generation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      setStrategy(result.strategy);
      await loadStrategy();
      alert('Marketing strategy generated successfully!');
    } catch (err: any) {
      console.error('Error generating strategy:', err);
      alert(`Failed to generate marketing strategy: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2979FF] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading marketing strategy...</p>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Website</span>
          </button>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-[#2979FF]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp size={40} className="text-[#2979FF]" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Generate Your Marketing Strategy</h1>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Get a comprehensive, data-driven marketing strategy tailored to your business.
              This includes audience analysis, channel recommendations, content plans, and a 90-day launch roadmap.
            </p>
            <button
              onClick={generateStrategy}
              disabled={generating}
              className="px-8 py-4 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {generating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating Strategy...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Marketing Strategy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'audience', label: 'Target Audience', icon: Users },
    { id: 'positioning', label: 'Positioning', icon: Target },
    { id: 'channels', label: 'Marketing Channels', icon: MessageSquare },
    { id: 'content', label: 'Content Strategy', icon: Calendar },
    { id: 'launch', label: '90-Day Plan', icon: CheckCircle2 },
    { id: 'metrics', label: 'Metrics & KPIs', icon: BarChart3 },
    { id: 'budget', label: 'Budget', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Website</span>
        </button>

        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Marketing Strategy</h1>
            <p className="text-gray-400">{strategy.business_name}</p>
          </div>
          <button
            onClick={generateStrategy}
            disabled={generating}
            className="px-6 py-3 bg-white/5 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Regenerate Strategy
              </>
            )}
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#2979FF] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {strategy.overview.executive_summary}
                </p>
              </div>

              <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Primary Goal</h3>
                <p className="text-gray-300">{strategy.overview.primary_goal}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Key Objectives</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {strategy.overview.key_objectives.map((objective, index) => (
                    <div
                      key={index}
                      className="bg-white/5 border border-white/10 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#06D6A0]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#06D6A0] font-bold">{index + 1}</span>
                        </div>
                        <p className="text-gray-300">{objective}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audience' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Target Audience Analysis</h2>

              <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="text-[#2979FF]" size={24} />
                  Primary Persona: {strategy.target_audience.primary_persona.name}
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-[#2979FF] mb-2">Demographics</h4>
                    <p className="text-gray-300 text-sm">
                      {strategy.target_audience.primary_persona.demographics}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#2979FF] mb-2">Psychographics</h4>
                    <p className="text-gray-300 text-sm">
                      {strategy.target_audience.primary_persona.psychographics}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#2979FF] mb-2">Behaviors</h4>
                    <p className="text-gray-300 text-sm">
                      {strategy.target_audience.primary_persona.behaviors}
                    </p>
                  </div>
                </div>
              </div>

              {strategy.target_audience.secondary_personas && strategy.target_audience.secondary_personas.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Secondary Personas</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {strategy.target_audience.secondary_personas.map((persona, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{persona.name}</h4>
                        <p className="text-gray-400 text-sm">{persona.demographics}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Market Size Estimate</h4>
                <p className="text-gray-300">{strategy.target_audience.audience_size_estimate}</p>
              </div>
            </div>
          )}

          {activeTab === 'positioning' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Unique Selling Points & Positioning</h2>

              <div className="bg-gradient-to-r from-[#2979FF]/20 to-[#06D6A0]/20 border border-[#2979FF]/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Main USP</h3>
                <p className="text-gray-200 text-lg">{strategy.unique_selling_points.main_usp}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Supporting USPs</h3>
                <div className="space-y-3">
                  {strategy.unique_selling_points.supporting_usps.map((usp, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start gap-3">
                      <CheckCircle2 className="text-[#06D6A0] flex-shrink-0 mt-1" size={20} />
                      <p className="text-gray-300">{usp}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Competitive Advantages</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {strategy.unique_selling_points.competitive_advantages.map((advantage, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-gray-300">{advantage}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-[#06D6A0]">
                  Value Proposition Statement
                </h3>
                <p className="text-gray-200 text-lg italic">
                  "{strategy.unique_selling_points.value_proposition_statement}"
                </p>
              </div>
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Marketing Channels Strategy</h2>

              <div className="space-y-4">
                {strategy.marketing_channels.priority_channels.map((channel, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold">{channel.name}</h3>
                      <div className="flex gap-3">
                        <div className="px-3 py-1 bg-[#2979FF]/20 rounded-full text-sm">
                          {channel.budget_allocation} budget
                        </div>
                        <div className="px-3 py-1 bg-[#06D6A0]/20 rounded-full text-sm">
                          {channel.expected_roi} ROI
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="font-semibold text-[#2979FF] mb-2">Rationale</h4>
                        <p className="text-gray-300 text-sm">{channel.rationale}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#2979FF] mb-2">Strategy</h4>
                        <p className="text-gray-300 text-sm">{channel.strategy}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-[#2979FF] mb-2">Key Tactics</h4>
                      <ul className="space-y-2">
                        {channel.tactics.map((tactic, tIndex) => (
                          <li key={tIndex} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-[#06D6A0] mt-1">•</span>
                            <span>{tactic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Content Themes</h3>
                <div className="flex flex-wrap gap-3">
                  {strategy.marketing_channels.content_themes.map((theme, index) => (
                    <div key={index} className="px-4 py-2 bg-white/10 rounded-full text-sm">
                      {theme}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Content Strategy</h2>

              <div>
                <h3 className="text-xl font-semibold mb-4">Content Pillars</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {strategy.content_strategy.content_pillars.map((pillar, index) => (
                    <div key={index} className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-[#2979FF] rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      </div>
                      <p className="font-semibold">{pillar}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Content Types & Frequency</h3>
                <div className="space-y-4">
                  {strategy.content_strategy.content_types.map((content, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold">{content.type}</h4>
                        <div className="px-3 py-1 bg-[#06D6A0]/20 rounded-full text-sm">
                          {content.frequency}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Topic Ideas:</p>
                        <div className="flex flex-wrap gap-2">
                          {content.topics.map((topic, tIndex) => (
                            <span key={tIndex} className="px-3 py-1 bg-white/10 rounded text-sm text-gray-300">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Distribution Plan</h3>
                <p className="text-gray-300">{strategy.content_strategy.distribution_plan}</p>
              </div>
            </div>
          )}

          {activeTab === 'launch' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">90-Day Launch Plan</h2>

              {[
                { key: 'phase_1_first_30_days', title: 'Phase 1: First 30 Days', color: '#2979FF' },
                { key: 'phase_2_days_31_60', title: 'Phase 2: Days 31-60', color: '#06D6A0' },
                { key: 'phase_3_days_61_90', title: 'Phase 3: Days 61-90', color: '#EF4565' },
              ].map((phase, phaseIndex) => {
                const phaseData = strategy.launch_plan[phase.key as keyof typeof strategy.launch_plan];
                return (
                  <div key={phaseIndex} className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: phase.color }}
                      />
                      <h3 className="text-xl font-semibold">{phase.title}</h3>
                    </div>
                    <p className="text-gray-300 mb-4">
                      <span className="font-semibold">Focus: </span>
                      {phaseData.focus}
                    </p>
                    <div className="space-y-3">
                      {phaseData.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold flex-1">{action.action}</p>
                            <span
                              className="px-3 py-1 rounded-full text-xs ml-3"
                              style={{ backgroundColor: `${phase.color}20` }}
                            >
                              {action.deadline}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            <span className="font-medium">Success Metric: </span>
                            {action.success_metric}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Metrics & KPIs</h2>

              <div>
                <h3 className="text-xl font-semibold mb-4">Primary KPIs</h3>
                <div className="space-y-3">
                  {strategy.metrics.primary_kpis.map((kpi, index) => (
                    <div key={index} className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{kpi.metric}</h4>
                          <p className="text-sm text-gray-300">Target: {kpi.target}</p>
                        </div>
                        <div className="px-3 py-1 bg-[#2979FF] rounded-full text-xs">
                          {kpi.measurement_frequency}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Secondary Metrics</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {strategy.metrics.secondary_metrics.map((metric, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle2 className="text-[#06D6A0]" size={16} />
                      <span className="text-sm text-gray-300">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Recommended Tracking Tools</h3>
                <div className="flex flex-wrap gap-3">
                  {strategy.metrics.tracking_tools.map((tool, index) => (
                    <div key={index} className="px-4 py-2 bg-[#06D6A0]/20 rounded-full">
                      {tool}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Budget Recommendations</h2>

              <div className="bg-gradient-to-r from-[#2979FF]/20 to-[#06D6A0]/20 border border-[#2979FF]/30 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-400 mb-2">Recommended Monthly Budget</p>
                <p className="text-4xl font-bold">{strategy.budget_recommendations.total_monthly_budget}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Budget Allocation</h3>
                <div className="space-y-3">
                  {strategy.budget_recommendations.allocation.map((item, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{item.category}</h4>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-[#2979FF]/20 rounded-full text-sm">
                            {item.percentage}
                          </span>
                          <span className="px-3 py-1 bg-[#06D6A0]/20 rounded-full text-sm font-semibold">
                            {item.amount}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{item.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-[#06D6A0]">
                  Bootstrap Alternatives
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  Low-cost alternatives for businesses with limited budgets:
                </p>
                <ul className="space-y-2">
                  {strategy.budget_recommendations.bootstrap_alternatives.map((alternative, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="text-[#06D6A0] flex-shrink-0 mt-0.5" size={16} />
                      <span>{alternative}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
