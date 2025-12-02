import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Rocket,
  LogOut,
  Sparkles,
  TrendingUp,
  User,
  Target,
  FileText,
  MapPin,
  Trophy,
  Clock,
  ArrowRight,
  Award,
  MessageSquare,
  Users,
  DollarSign,
  BarChart3,
  Globe,
} from 'lucide-react';
import { BusinessIdea, RoadmapStage } from '../services/openai';
import { getRecentActivities, getMilestones, getUserMetrics } from '../services/tracking';

interface RoadmapWithIdea {
  roadmap: {
    id: string;
    stages: RoadmapStage[];
    completed_steps: string[];
  };
  idea: BusinessIdea;
}

interface UserActivity {
  id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
}

interface Milestone {
  id: string;
  milestone_type: string;
  milestone_data: any;
  achieved_at: string;
}

export default function Dashboard() {
  const [roadmapData, setRoadmapData] = useState<RoadmapWithIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [userPlan, setUserPlan] = useState('free');

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  const loadAllData = async () => {
    if (!currentUser) return;

    try {
      const [ideaData, activitiesData, milestonesData, metricsData, profileData] =
        await Promise.all([
          loadRoadmapData(),
          getRecentActivities(5),
          getMilestones(),
          getUserMetrics(),
          loadUserProfile(),
        ]);

      setActivities(activitiesData);
      setMilestones(milestonesData);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    if (!currentUser) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (data) {
      setUserPlan(data.plan);
    }

    const email = currentUser.email || '';
    const name = email.split('@')[0];
    setUserName(name.charAt(0).toUpperCase() + name.slice(1));
  };

  const loadRoadmapData = async () => {
    if (!currentUser) return;

    const { data: ideas } = await supabase
      .from('business_ideas')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!ideas || ideas.length === 0) {
      return;
    }

    const latestIdea = ideas[0];
    const ideaKey = latestIdea.idea_id;

    const [roadmapData, firstRevenueData, brandData, marketingData, websiteData] = await Promise.all([
      supabase.from('roadmaps').select('*').eq('user_id', currentUser.id).eq('idea_id', ideaKey).maybeSingle(),
      supabase.from('first_dollar').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
      supabase.from('brand_identity').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
      supabase.from('marketing_assets').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
      supabase.from('websites').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
    ]);

    const hasAnyProgress = roadmapData.data || firstRevenueData.data || brandData.data || marketingData.data || websiteData.data;

    if (hasAnyProgress) {
      const data = {
        roadmap: {
          id: roadmapData.data?.id || '',
          stages: roadmapData.data?.stages || [],
          completed_steps: roadmapData.data?.completed_steps || [],
        },
        idea: {
          id: latestIdea.idea_id,
          name: latestIdea.name,
          description: latestIdea.description,
          difficulty: latestIdea.difficulty,
          costRange: latestIdea.cost_range,
        },
      };
      setRoadmapData(data);
      return data;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  const getNextAction = () => {
    if (!roadmapData) return null;

    const completed = new Set(roadmapData.roadmap.completed_steps);

    for (const [stageIndex, stage] of roadmapData.roadmap.stages.entries()) {
      for (const [stepIndex, step] of stage.steps.entries()) {
        const stepId = `${stageIndex}-${stepIndex}`;
        if (!completed.has(stepId)) {
          return {
            stage: stage.stage,
            task: step,
            link: `/first-revenue?ideaKey=${roadmapData.idea.id}`,
          };
        }
      }
    }

    return null;
  };

  const getProgress = (): number => {
    if (!roadmapData) return 0;

    const totalSteps = roadmapData.roadmap.stages.reduce(
      (acc, stage) => acc + stage.steps.length,
      0
    );
    const completedSteps = roadmapData.roadmap.completed_steps.length;

    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  const getStepsToFirstDollar = () => {
    if (!roadmapData) return 0;
    const totalSteps = roadmapData.roadmap.stages.reduce(
      (acc, stage) => acc + stage.steps.length,
      0
    );
    return totalSteps - roadmapData.roadmap.completed_steps.length;
  };

  const formatActivityText = (activity: UserActivity) => {
    const activityTypes: Record<string, string> = {
      step_completed: 'Completed a step',
      idea_generated: 'Generated new ideas',
      roadmap_viewed: 'Viewed roadmap',
      ai_help_used: 'Used AI help',
      plan_generated: 'Generated business plan',
    };
    return activityTypes[activity.activity_type] || 'Activity';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] flex items-center justify-center">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  const progress = getProgress();
  const nextAction = getNextAction();
  const stepsToFirstDollar = getStepsToFirstDollar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F]">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Rocket className="text-[#2979FF]" size={32} />
            <span className="text-2xl font-bold text-white font-['Montserrat']">Launch Pad</span>
          </button>
          <div className="flex items-center gap-4">
            {userPlan === 'pro' && (
              <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full">
                PRO
              </div>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              <User size={18} />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {!roadmapData ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
              <Target className="text-[#2979FF] mx-auto mb-6" size={64} />
              <h2 className="text-3xl font-bold text-white mb-4 font-['Montserrat']">
                No idea yet. Generate ideas to get your roadmap.
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Start your journey by creating personalized business ideas tailored to your skills
                and interests
              </p>
              <button
                onClick={() => navigate('/ideas')}
                className="px-8 py-4 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold text-lg hover:bg-[#2979FF]/90 transition-all duration-300"
              >
                Generate Ideas
              </button>
            </div>
          ) : roadmapData.roadmap.stages.length === 0 ? (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                <Target className="text-[#2979FF] mx-auto mb-6" size={64} />
                <h2 className="text-3xl font-bold text-white mb-4 font-['Montserrat']">
                  No idea yet. Generate ideas to get your roadmap.
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  Start your journey by creating personalized business ideas tailored to your skills
                  and interests
                </p>
                <button
                  onClick={() => navigate('/ideas')}
                  className="px-8 py-4 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold text-lg hover:bg-[#2979FF]/90 transition-all duration-300"
                >
                  Generate Ideas
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#2979FF]/20 to-purple-500/20 backdrop-blur-sm border border-[#2979FF]/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="text-[#2979FF]" size={24} />
                  <h2 className="text-2xl font-bold text-white font-['Montserrat']">
                    In Progress
                  </h2>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{roadmapData.idea.name}</h3>
                  <p className="text-gray-300 mb-4">{roadmapData.idea.description}</p>
                  <button
                    onClick={() => navigate(`/first-revenue?ideaKey=${roadmapData.idea.id}`)}
                    className="w-full py-3 bg-[#2979FF] text-white rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all duration-300"
                  >
                    Continue Journey
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#2979FF]/20 to-purple-500/20 backdrop-blur-sm border border-[#2979FF]/30 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="text-[#2979FF]" size={28} />
                  <h1 className="text-3xl md:text-4xl font-bold text-white font-['Montserrat']">
                    Welcome back, {userName}!
                  </h1>
                </div>
                <p className="text-xl text-gray-200 mb-6">
                  Here's your next step toward your first customer
                </p>

                {nextAction && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="text-[#2979FF]" size={20} />
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                        Next Recommended Action
                      </h3>
                    </div>
                    <p className="text-white text-lg mb-4 font-medium">{nextAction.task}</p>
                    <button
                      onClick={() => navigate(nextAction.link)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all duration-300"
                    >
                      Go Now
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-[#2979FF] mb-1">{progress}%</div>
                    <div className="text-sm text-gray-300">Progress</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-[#2979FF] mb-1">
                      {stepsToFirstDollar}
                    </div>
                    <div className="text-sm text-gray-300">Steps to $1</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-[#2979FF] mb-1">
                      {milestones.length}
                    </div>
                    <div className="text-sm text-gray-300">Milestones</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-[#2979FF] mb-1">
                      ${metrics?.revenue_earned || 0}
                    </div>
                    <div className="text-sm text-gray-300">Earned</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Rocket className="text-[#2979FF]" size={24} />
                    <h2 className="text-2xl font-bold text-white font-['Montserrat']">
                      Current Idea
                    </h2>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{roadmapData.idea.name}</h3>
                  <p className="text-gray-300 mb-4">{roadmapData.idea.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Overall Progress</span>
                      <span className="text-[#2979FF] font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#2979FF] to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/first-revenue?ideaKey=${roadmapData.idea.id}`)}
                    className="w-full py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all duration-300"
                  >
                    Continue Journey
                  </button>
                </div>

                {metrics && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="text-[#2979FF]" size={24} />
                      <h2 className="text-2xl font-bold text-white font-['Montserrat']">
                        Your Metrics
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="text-blue-400" size={20} />
                          <span className="text-gray-300">Messages Sent</span>
                        </div>
                        <span className="text-white font-bold text-lg">
                          {metrics.messages_sent}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <ArrowRight className="text-green-400" size={20} />
                          <span className="text-gray-300">Replies</span>
                        </div>
                        <span className="text-white font-bold text-lg">
                          {metrics.replies_received}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="text-purple-400" size={20} />
                          <span className="text-gray-300">Customers</span>
                        </div>
                        <span className="text-white font-bold text-lg">
                          {metrics.customers_acquired}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <DollarSign className="text-yellow-400" size={20} />
                          <span className="text-gray-300">Revenue</span>
                        </div>
                        <span className="text-white font-bold text-lg">
                          ${metrics.revenue_earned}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {activities.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Clock className="text-[#2979FF]" size={24} />
                      <h2 className="text-2xl font-bold text-white font-['Montserrat']">
                        Recent Activity
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <p className="text-gray-300">{formatActivityText(activity)}</p>
                          <span className="text-sm text-gray-500">
                            {formatDate(activity.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {milestones.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Trophy className="text-yellow-400" size={24} />
                      <h2 className="text-2xl font-bold text-white font-['Montserrat']">
                        Milestones
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {milestones.slice(0, 5).map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg"
                        >
                          <Award className="text-yellow-400" size={20} />
                          <div className="flex-1">
                            <p className="text-white font-medium capitalize">
                              {milestone.milestone_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatDate(milestone.achieved_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Montserrat']">
                  Quick Actions
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => navigate(`/storybrand-wizard?ideaKey=${roadmapData.idea.id}`)}
                    className="p-6 bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-400/30 rounded-lg hover:from-pink-500/30 hover:to-rose-500/30 transition-all text-left group"
                  >
                    <FileText
                      className="text-pink-400 mb-3 group-hover:scale-110 transition-transform"
                      size={32}
                    />
                    <h3 className="text-lg font-bold text-white mb-2">Marketing Assets</h3>
                    <p className="text-gray-300 text-sm">Generate flyers, social posts & more</p>
                  </button>
                  <button
                    onClick={() => navigate(`/build-site?ideaKey=${roadmapData.idea.id}`)}
                    className="p-6 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-400/30 rounded-lg hover:from-violet-500/30 hover:to-fuchsia-500/30 transition-all text-left group"
                  >
                    <Globe
                      className="text-violet-400 mb-3 group-hover:scale-110 transition-transform"
                      size={32}
                    />
                    <h3 className="text-lg font-bold text-white mb-2">Build Website</h3>
                    <p className="text-gray-300 text-sm">Create & publish a one-page site</p>
                  </button>
                  <button
                    onClick={() => navigate(`/operations?ideaKey=${roadmapData.idea.id}`)}
                    className="p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-lg hover:from-emerald-500/30 hover:to-teal-500/30 transition-all text-left group"
                  >
                    <BarChart3
                      className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform"
                      size={32}
                    />
                    <h3 className="text-lg font-bold text-white mb-2">Operations & Tracking</h3>
                    <p className="text-gray-300 text-sm">Track profit, goals & get AI insights</p>
                  </button>
                  <button
                    onClick={() => navigate('/local')}
                    className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all text-left group relative overflow-hidden"
                  >
                    {userPlan === 'free' && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        PRO
                      </div>
                    )}
                    <MapPin
                      className="text-blue-400 mb-3 group-hover:scale-110 transition-transform"
                      size={32}
                    />
                    <h3 className="text-lg font-bold text-white mb-2">Local Opportunities</h3>
                    <p className="text-gray-300 text-sm">Find winning niches in your area</p>
                  </button>
                </div>
              </div>

              {userPlan === 'free' && (
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-2xl p-8 text-center">
                  <Trophy className="text-yellow-400 mx-auto mb-4" size={48} />
                  <h2 className="text-2xl font-bold text-white mb-2 font-['Montserrat']">
                    Upgrade to Pro
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Unlock local opportunity scanning, advanced features, and priority support
                  </p>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-300"
                  >
                    View Plans
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
