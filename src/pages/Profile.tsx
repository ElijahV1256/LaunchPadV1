import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateBusinessPlan, BusinessPlanData } from '../services/openai';
import { User, FileText, Loader2, Sparkles, Home, LogOut, CreditCard as Edit2, Lightbulb, DollarSign, Clock, Rocket, CheckCircle2, Circle, ArrowRight, Target } from 'lucide-react';

export default function Profile() {
  const [businessPlans, setBusinessPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    interests: '',
    problems: '',
    budget: '<$500',
    availability: 'part-time',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    loadProgressData();
  }, []);

  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);

    try {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      const { data: plansData } = await supabase
        .from('business_plans')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      const { data: roadmapsData } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', currentUser.id);

      if (roadmapsData && roadmapsData.length > 0) {
        const ideasPromises = roadmapsData.map(async (roadmap: any) => {
          const { data: idea } = await supabase
            .from('business_ideas')
            .select('name, description')
            .eq('idea_id', roadmap.idea_id)
            .maybeSingle();
          return { ...roadmap, business_ideas: idea };
        });
        const enrichedRoadmaps = await Promise.all(ideasPromises);
        setRoadmaps(enrichedRoadmaps);
      }

      setUserProfile(profileData);
      if (profileData) {
        setProfileForm({
          interests: profileData.interests || '',
          problems: profileData.problems || '',
          budget: profileData.budget || '<$500',
          availability: profileData.availability || 'part-time',
        });
      }
      setBusinessPlans(plansData || []);
      if (!roadmapsData || roadmapsData.length === 0) {
        setRoadmaps([]);
      }

      if (plansData && plansData.length > 0) {
        setSelectedPlan(plansData[0]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (roadmap: any) => {
    setGenerating(true);

    try {
      const businessName = roadmap.business_ideas.name;
      const businessDescription = roadmap.business_ideas.description;
      const stepAnswers = roadmap.step_answers || {};

      const planData = await generateBusinessPlan(
        businessName,
        businessDescription,
        stepAnswers
      );

      const existingPlan = businessPlans.find((p) => p.idea_id === roadmap.idea_id);

      if (existingPlan) {
        const { data } = await supabase
          .from('business_plans')
          .update({
            plan_name: planData.planName,
            plan_data: planData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPlan.id)
          .select()
          .single();

        setSelectedPlan(data);
      } else {
        const { data } = await supabase
          .from('business_plans')
          .insert({
            user_id: currentUser!.id,
            idea_id: roadmap.idea_id,
            plan_name: planData.planName,
            plan_data: planData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        setSelectedPlan(data);
      }

      await loadData();
    } catch (err) {
      console.error('Failed to generate business plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/auth');
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    setSavingProfile(true);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: currentUser.id,
            interests: profileForm.interests,
            problems: profileForm.problems,
            budget: profileForm.budget,
            availability: profileForm.availability,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )
        .select();

      if (error) {
        console.error('Supabase error:', error);
        alert(`Failed to save profile: ${error.message}`);
        return;
      }

      console.log('Profile saved successfully:', data);
      setEditingProfile(false);
      await loadData();
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      alert(`Failed to save profile: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setProfileForm({
        interests: userProfile.interests || '',
        problems: userProfile.problems || '',
        budget: userProfile.budget || '<$500',
        availability: userProfile.availability || 'part-time',
      });
    }
    setEditingProfile(false);
  };

  const loadProgressData = async () => {
    if (!currentUser) return;

    try {
      const { data: ideas } = await supabase
        .from('business_ideas')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!ideas || ideas.length === 0) {
        setProgressData({ stages: [], ideaKey: null });
        return;
      }

      const latestIdea = ideas[0];
      const ideaKey = latestIdea.idea_id;

      const [brandData, storyBrandData, firstDollarData, marketingData, websiteData] = await Promise.all([
        supabase.from('brand_identity').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
        supabase.from('storybrand_roadmap').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
        supabase.from('first_dollar').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
        supabase.from('marketing_assets').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
        supabase.from('websites').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
      ]);

      const storyBrandComplete = storyBrandData.data && storyBrandData.data.completed && storyBrandData.data.stages &&
        storyBrandData.data.completed.length === storyBrandData.data.stages.reduce((acc: number, s: { steps: string[] }) => acc + s.steps.length, 0) &&
        storyBrandData.data.completed.length > 0;

      const stages = [
        {
          name: 'Business Idea',
          description: latestIdea.name,
          completed: true,
          link: '/ideas',
          current: false,
        },
        {
          name: 'Brand Identity',
          description: 'Create your brand name, colors, and logo',
          completed: brandData.data?.selected_name && brandData.data?.brand_colors && brandData.data?.logo_data?.selected,
          link: `/brand-identity?ideaKey=${ideaKey}`,
          current: false,
        },
        {
          name: 'StoryBrand Roadmap',
          description: 'Craft your brand messaging',
          completed: storyBrandComplete,
          link: `/storybrand-roadmap?ideaKey=${ideaKey}`,
          current: false,
        },
        {
          name: 'First Dollar',
          description: 'Plan your path to your first customer',
          completed: firstDollarData.data && firstDollarData.data.completed && firstDollarData.data.completed.length > 0,
          link: `/first-revenue?ideaKey=${ideaKey}`,
          current: false,
        },
        {
          name: 'Marketing Assets',
          description: 'Generate flyers, social posts, and templates',
          completed: marketingData.data && marketingData.data.completed_steps?.length === 4,
          link: `/marketing-assets?ideaKey=${ideaKey}`,
          current: false,
        },
        {
          name: 'Book Discovery Call',
          description: 'Get your website built',
          completed: websiteData.data && websiteData.data.completed_steps?.length >= 5,
          link: `/website?ideaKey=${ideaKey}`,
          current: false,
        },
        {
          name: 'Personal Roadmap',
          description: 'Your customized business roadmap',
          completed: false,
          link: `/roadmap/${ideaKey}`,
          current: false,
        },
      ];

      const firstIncomplete = stages.findIndex(s => !s.completed);
      if (firstIncomplete !== -1) {
        stages[firstIncomplete].current = true;
      }

      setProgressData({ stages, ideaKey, ideaName: latestIdea.name });
    } catch (err) {
      console.error('Failed to load progress data:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] flex items-center justify-center">
        <Loader2 className="text-[#2979FF] animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Rocket className="text-[#2979FF] animate-bounce" size={32} />
            <span className="text-2xl font-bold text-white font-['Montserrat']">Launch Pad</span>
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Home size={20} />
              Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <User className="text-[#2979FF]" size={32} />
          <h1 className="text-4xl font-bold text-white">My Profile</h1>
        </div>

        {progressData && progressData.stages.length > 0 && (
          <div className="bg-gradient-to-br from-[#2979FF]/20 to-purple-500/20 backdrop-blur-sm border border-[#2979FF]/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-[#2979FF]" size={28} />
              <div>
                <h2 className="text-2xl font-bold text-white">Your Journey Progress</h2>
                <p className="text-gray-300 text-sm">{progressData.ideaName}</p>
              </div>
            </div>

            <div className="space-y-3">
              {progressData.stages.map((stage: any, idx: number) => (
                <div
                  key={idx}
                  className={`relative p-4 rounded-xl transition-all ${
                    stage.current
                      ? 'bg-[#2979FF]/30 border-2 border-[#2979FF]'
                      : stage.completed
                      ? 'bg-white/5 border border-white/10'
                      : 'bg-white/5 border border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {stage.completed ? (
                        <CheckCircle2 className="text-[#06D6A0]" size={24} />
                      ) : stage.current ? (
                        <div className="w-6 h-6 rounded-full border-2 border-[#2979FF] flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-[#2979FF] animate-pulse"></div>
                        </div>
                      ) : (
                        <Circle className="text-gray-500" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{stage.name}</h3>
                      <p className="text-gray-300 text-sm mb-3">{stage.description}</p>
                      {stage.current && !stage.completed && (
                        <button
                          onClick={() => navigate(stage.link)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors"
                        >
                          Continue Here
                          <ArrowRight size={18} />
                        </button>
                      )}
                      {stage.completed && (
                        <button
                          onClick={() => navigate(stage.link)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-colors text-sm"
                        >
                          View/Edit
                        </button>
                      )}
                    </div>
                  </div>
                  {stage.current && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-[#2979FF] text-white text-xs font-bold rounded-full">
                        CURRENT
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">Overall Progress</span>
                <span className="text-[#2979FF] font-bold">
                  {Math.round((progressData.stages.filter((s: any) => s.completed).length / progressData.stages.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#2979FF] to-[#06D6A0] h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(progressData.stages.filter((s: any) => s.completed).length / progressData.stages.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Account Information</h2>
                {!editingProfile && userProfile && (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{currentUser?.email}</p>
                </div>
              </div>
            </div>

            {userProfile && !editingProfile && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Your Profile</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="text-[#2979FF]" size={20} />
                      <p className="text-gray-400 text-sm font-semibold">Things I like to do</p>
                    </div>
                    <p className="text-white">{userProfile.interests}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="text-[#2979FF]" size={20} />
                      <p className="text-gray-400 text-sm font-semibold">Problems I want to solve</p>
                    </div>
                    <p className="text-white">{userProfile.problems}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="text-[#2979FF]" size={20} />
                      <p className="text-gray-400 text-sm font-semibold">Budget</p>
                    </div>
                    <p className="text-white">{userProfile.budget}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="text-[#2979FF]" size={20} />
                      <p className="text-gray-400 text-sm font-semibold">Availability</p>
                    </div>
                    <p className="text-white capitalize">{userProfile.availability}</p>
                  </div>
                </div>
              </div>
            )}

            {editingProfile && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Edit Your Profile</h2>
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-white text-sm font-semibold mb-2">
                      <Lightbulb className="text-[#2979FF]" size={20} />
                      Things I like to do
                    </label>
                    <textarea
                      value={profileForm.interests}
                      onChange={(e) => setProfileForm({ ...profileForm, interests: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#2979FF] transition-colors resize-none"
                      placeholder="e.g., writing, coding, photography..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-white text-sm font-semibold mb-2">
                      <Lightbulb className="text-[#2979FF]" size={20} />
                      Problems I want to solve
                    </label>
                    <textarea
                      value={profileForm.problems}
                      onChange={(e) => setProfileForm({ ...profileForm, problems: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#2979FF] transition-colors resize-none"
                      placeholder="e.g., help people learn new skills..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-white text-sm font-semibold mb-2">
                      <DollarSign className="text-[#2979FF]" size={20} />
                      Budget to start
                    </label>
                    <select
                      value={profileForm.budget}
                      onChange={(e) => setProfileForm({ ...profileForm, budget: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#2979FF] transition-colors"
                    >
                      <option value="<$500" className="bg-[#0A192F]">&lt;$500</option>
                      <option value="$500-$2000" className="bg-[#0A192F]">$500-$2000</option>
                      <option value="$2000-$5000" className="bg-[#0A192F]">$2000-$5000</option>
                      <option value=">$5000" className="bg-[#0A192F]">&gt;$5000</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-white text-sm font-semibold mb-2">
                      <Clock className="text-[#2979FF]" size={20} />
                      Time availability
                    </label>
                    <select
                      value={profileForm.availability}
                      onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#2979FF] transition-colors"
                    >
                      <option value="part-time" className="bg-[#0A192F]">Part-time (evenings/weekends)</option>
                      <option value="full-time" className="bg-[#0A192F]">Full-time commitment</option>
                      <option value="side-hustle" className="bg-[#0A192F]">Side hustle (few hours/week)</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="flex-1 py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={savingProfile}
                      className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Your Roadmaps</h2>
              <div className="space-y-3">
                {roadmaps.length === 0 ? (
                  <p className="text-gray-400">No roadmaps created yet</p>
                ) : (
                  roadmaps.map((roadmap) => {
                    const answersCount = Object.keys(roadmap.step_answers || {}).length;
                    const hasPlan = businessPlans.some((p) => p.idea_id === roadmap.idea_id);

                    return (
                      <div
                        key={roadmap.id}
                        className="p-4 bg-white/5 border border-white/10 rounded-lg"
                      >
                        <h3 className="text-white font-semibold mb-2">
                          {roadmap.business_ideas.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          {answersCount} step{answersCount !== 1 ? 's' : ''} answered
                        </p>
                        <button
                          onClick={() => handleGeneratePlan(roadmap)}
                          disabled={generating || answersCount === 0}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            answersCount === 0
                              ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                              : 'bg-[#2979FF] text-[#0A192F] hover:bg-[#2979FF]/90'
                          }`}
                        >
                          <Sparkles size={16} />
                          {generating
                            ? 'Generating...'
                            : hasPlan
                            ? 'Regenerate Business Plan'
                            : 'Generate Business Plan'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="text-[#2979FF]" size={24} />
              <h2 className="text-2xl font-bold text-white">Business Plan</h2>
            </div>

            {selectedPlan ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-[#2979FF] mb-2">
                    {selectedPlan.plan_data.planName}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Last updated: {new Date(selectedPlan.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-4">
                  <Section title="Character (The Customer)" content={selectedPlan.plan_data.character} />
                  <Section title="Problem" content={selectedPlan.plan_data.problem} />
                  <Section title="Guide (Your Business)" content={selectedPlan.plan_data.guide} />
                  <Section title="Plan" content={selectedPlan.plan_data.plan} />
                  <Section title="Call to Action" content={selectedPlan.plan_data.callToAction} />
                  <Section title="Success" content={selectedPlan.plan_data.success} />
                  <Section title="Failure" content={selectedPlan.plan_data.failure} />
                  <Section title="Transformation" content={selectedPlan.plan_data.transformation} />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="text-gray-600 mx-auto mb-4" size={48} />
                <p className="text-gray-400 mb-4">No business plan generated yet</p>
                <p className="text-gray-500 text-sm">
                  Answer steps in your roadmap, then generate your business plan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h4 className="text-[#2979FF] font-semibold mb-2">{title}</h4>
      <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
    </div>
  );
}
