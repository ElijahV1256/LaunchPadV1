import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowRight, CheckCircle, Star, Target, TrendingUp, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export default function Homepage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [lastProgress, setLastProgress] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      loadLastProgress();
    }
  }, [currentUser]);

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

      const [brandData, marketingData, operationsData] = await Promise.all([
        supabase.from('brand_identity').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
        supabase.from('marketing_assets').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
        supabase.from('profit_loss_entries').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).limit(1),
      ]);

      let currentStage = null;
      let stageName = '';
      let link = '';
      let isComplete = false;

      const brandComplete = brandData.data && brandData.data.selected_name && brandData.data.brand_colors && brandData.data.logo_data?.selected;
      const marketingComplete = marketingData.data && marketingData.data.completed_steps && marketingData.data.completed_steps.length >= 4;
      const operationsStarted = operationsData.data && operationsData.data.length > 0;

      const hasAnyProgress = brandData.data || marketingData.data || operationsStarted;

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
      } else if (!operationsStarted) {
        currentStage = 'Operations';
        stageName = 'Operations & Tracking';
        link = `/operations?ideaKey=${ideaKey}`;
      } else {
        currentStage = 'Completed';
        stageName = 'All stages complete!';
        link = `/operations?ideaKey=${ideaKey}`;
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

  const handleGetStarted = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed, onboarding_answers')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (!profile || !profile.onboarding_completed) {
        navigate('/onboarding');
        return;
      }

      const { data: ideas } = await supabase
        .from('business_ideas')
        .select('*')
        .eq('user_id', currentUser.id)
        .limit(1);

      if (!ideas || ideas.length === 0) {
        navigate('/ideas');
        return;
      }

      if (lastProgress && lastProgress.link) {
        navigate(lastProgress.link);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error determining start point:', err);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6F8] via-white to-[#F4F6F8]">
      <nav className="sticky top-0 z-50 bg-[#F4F6F8]/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Rocket className="text-[#2979FF] animate-bounce-subtle" size={32} />
              <span className="text-2xl font-bold text-[#0A192F] font-['Montserrat']">Launch Pad</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-gray-700 hover:text-[#0A192F] transition-colors font-medium">Features</a>
              <a href="#testimonials" className="text-gray-700 hover:text-[#0A192F] transition-colors font-medium">Testimonials</a>
              {currentUser ? (
                <>
                  <button
                    onClick={() => navigate('/ideas')}
                    className="px-4 py-2 text-gray-700 hover:text-[#0A192F] transition-colors font-medium"
                  >
                    Generate Ideas
                  </button>
                  <button
                    onClick={() => navigate('/local')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-lg font-semibold hover:from-blue-200 hover:to-purple-200 transition-all inline-flex items-center gap-2"
                  >
                    <MapPin size={18} />
                    Local Opportunities
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all"
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-gray-700 hover:text-[#0A192F] transition-colors font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className="px-6 py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all inline-flex items-center gap-2"
                  >
                    Move Forward
                    <ArrowRight size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 animate-bounce-subtle">
            <Rocket className="text-[#2979FF]" size={80} />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-[#0A192F] mb-6 font-['Montserrat'] leading-tight">
            From Idea to Revenue<br />Powered by AI
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-semibold">
            Your dream, your plan, your first dollar.
          </p>
          <p className="text-lg text-gray-600 mb-8">
            No experience required. Get your personalized roadmap to launch.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold text-xl hover:bg-[#2979FF]/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-2"
          >
            Start Free
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      <section className="bg-[#F4F6F8] py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A192F] mb-6 text-center font-['Montserrat']">
              Most people dream of starting a business — but get stuck.
            </h2>
            <p className="text-xl text-gray-700 text-center max-w-3xl mx-auto leading-relaxed">
              They don't know where to start. Launch Pad gives you the clarity and steps to move from dream to done.
            </p>
            <div className="mt-12 flex justify-center">
              <div className="relative w-full max-w-2xl">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 via-[#2979FF] to-[#2979FF] transform -translate-y-1/2"></div>
                <div className="relative flex justify-between items-center">
                  <div className="bg-gray-200 rounded-full p-6">
                    <Target className="text-gray-500" size={48} />
                  </div>
                  <div className="bg-[#2979FF] rounded-full p-6 animate-pulse">
                    <Rocket className="text-[#0A192F]" size={48} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gradient-to-br from-[#F4F6F8] to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A192F] mb-4 text-center font-['Montserrat']">
              A clear path to your first customer.
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-[#F4F6F8] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="bg-[#2979FF]/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-[#0A192F]">1</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0A192F] mb-4 font-['Montserrat']">
                  Tell us what you love
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  What do you enjoy and what problems do you want to solve? Share your interests and passions.
                </p>
              </div>

              <div className="bg-[#F4F6F8] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="bg-[#2979FF]/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-[#0A192F]">2</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0A192F] mb-4 font-['Montserrat']">
                  Get AI-powered ideas
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Launch Pad creates business ideas and a simple roadmap just for you. No guessing, just action.
                </p>
              </div>

              <div className="bg-[#F4F6F8] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="bg-[#2979FF]/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-[#0A192F]">3</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0A192F] mb-4 font-['Montserrat']">
                  Follow your plan
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Check off the steps and make your first dollar. Simple, clear, and achievable.
                </p>
              </div>
            </div>
            <div className="text-center mt-12">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold text-xl hover:bg-[#2979FF]/90 transition-all shadow-lg inline-flex items-center gap-2"
              >
                Get My Plan
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F4F6F8]">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-100 rounded-2xl p-8 border-2 border-gray-300">
                <h3 className="text-2xl font-bold text-gray-600 mb-4 font-['Montserrat']">
                  Without Launch Pad…
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  You stay stuck with ideas and no plan. Dreams remain dreams, and opportunities slip away.
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#2979FF]/20 to-[#2979FF]/10 rounded-2xl p-8 border-2 border-[#2979FF]">
                <h3 className="text-2xl font-bold text-[#0A192F] mb-4 font-['Montserrat']">
                  With Launch Pad…
                </h3>
                <p className="text-[#0A192F] leading-relaxed text-lg font-semibold">
                  You wake up to new income, confidence, and momentum. Your ideas become reality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-gradient-to-br from-[#0A192F] to-[#0A192F]">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-[#F4F6F8] mb-4 text-center font-['Montserrat']">
              Real people. Real launches.
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-[#F4F6F8]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex gap-1 mb-4">
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                </div>
                <p className="text-[#F4F6F8] mb-4 leading-relaxed">
                  "I used Launch Pad and made my first $50 sale in 48 hours. The roadmap was so clear!"
                </p>
                <p className="text-[#2979FF] font-semibold">— Sarah, new entrepreneur</p>
              </div>

              <div className="bg-[#F4F6F8]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex gap-1 mb-4">
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                </div>
                <p className="text-[#F4F6F8] mb-4 leading-relaxed">
                  "Finally, something that takes my idea and turns it into real action steps. Game changer."
                </p>
                <p className="text-[#2979FF] font-semibold">— Marcus, side hustler</p>
              </div>

              <div className="bg-[#F4F6F8]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex gap-1 mb-4">
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                  <Star className="text-[#2979FF] fill-[#2979FF]" size={20} />
                </div>
                <p className="text-[#F4F6F8] mb-4 leading-relaxed">
                  "No more overwhelm. Launch Pad showed me exactly what to do next. I'm finally moving forward!"
                </p>
                <p className="text-[#2979FF] font-semibold">— Jessica, creative freelancer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0A192F]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-[#F4F6F8] mb-4 font-['Montserrat']">
              Your idea deserves to launch.
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Get the step-by-step plan to make your first $1 today.
            </p>
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold text-xl hover:bg-[#2979FF]/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-2"
            >
              Start Free
              <Sparkles size={24} />
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-[#0A192F] border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <Rocket className="text-[#2979FF] animate-bounce-subtle" size={32} />
                <span className="text-xl font-bold text-[#F4F6F8] font-['Montserrat']">Launch Pad</span>
              </div>
              <div className="flex gap-6 text-gray-400">
                <a href="#" className="hover:text-white transition-colors">About</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            <div className="mt-8 text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} Launch Pad. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
