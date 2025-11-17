import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Home, Loader2, Download, Rocket, Sparkles, CheckCircle2 } from 'lucide-react';

interface MasterSheetData {
  businessName: string;
  businessDescription: string;
  storyBrandAnswers: Record<string, string>;
  firstRevenueAnswers: Record<string, string>;
  storyBrandStages: Array<{ name: string; steps: string[] }>;
  firstRevenueStages: Array<{ name: string; steps: string[] }>;
}

export default function MasterSheet() {
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey') || '';

  const [data, setData] = useState<MasterSheetData | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [ideaKey]);

  const loadData = async () => {
    if (!currentUser || !ideaKey) return;

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const [storyBrandResponse, firstRevenueResponse] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-storybrand-roadmap?ideaKey=${ideaKey}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        ),
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-first-revenue?ideaKey=${ideaKey}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        ),
      ]);

      if (!storyBrandResponse.ok || !firstRevenueResponse.ok) {
        throw new Error('Failed to load data');
      }

      const storyBrandData = await storyBrandResponse.json();
      const firstRevenueData = await firstRevenueResponse.json();

      setData({
        businessName: firstRevenueData.businessName || 'Your Business',
        businessDescription: firstRevenueData.businessDescription || '',
        storyBrandAnswers: storyBrandData.step_answers || {},
        firstRevenueAnswers: firstRevenueData.step_answers || {},
        storyBrandStages: storyBrandData.stages || [],
        firstRevenueStages: firstRevenueData.stages || [],
      });
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = () => {
    window.print();
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
          <p className="text-red-400 text-xl mb-4">Failed to load master sheet</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Rocket className="text-[#2979FF] animate-bounce" size={32} />
            <span className="text-2xl font-bold text-white font-['Montserrat']">Launch Pad</span>
          </button>
          <div className="flex gap-4">
            <button
              onClick={downloadAsPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#2979FF] text-[#0A192F] rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors"
            >
              <Download size={18} />
              Download PDF
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Home size={20} />
              Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 print:bg-white print:border-gray-300">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="text-[#2979FF] print:text-blue-600" size={32} />
              <h1 className="text-4xl font-bold text-white print:text-gray-900 font-['Montserrat']">
                Business Master Plan
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-[#2979FF] print:text-blue-600 mb-2">
              {data.businessName}
            </h2>
            {data.businessDescription && (
              <p className="text-gray-300 print:text-gray-700 max-w-2xl mx-auto">
                {data.businessDescription}
              </p>
            )}
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-[#2979FF]/30 print:border-blue-600/30">
                <CheckCircle2 className="text-[#2979FF] print:text-blue-600" size={24} />
                <h3 className="text-2xl font-bold text-white print:text-gray-900">
                  StoryBrand Framework
                </h3>
              </div>
              {data.storyBrandStages.map((stage, stageIndex) => (
                <div key={stageIndex} className="mb-6">
                  <h4 className="text-xl font-semibold text-[#2979FF] print:text-blue-600 mb-3">
                    Stage {stageIndex + 1}: {stage.name}
                  </h4>
                  <div className="space-y-4">
                    {stage.steps.map((step, stepIndex) => {
                      const answer = data.storyBrandAnswers[step];
                      if (!answer) return null;

                      return (
                        <div
                          key={stepIndex}
                          className="bg-white/5 print:bg-gray-50 border border-white/10 print:border-gray-300 rounded-lg p-4"
                        >
                          <p className="text-white print:text-gray-900 font-medium mb-2">
                            {step}
                          </p>
                          <p className="text-gray-300 print:text-gray-700 leading-relaxed">
                            {answer}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>

            <section className="print:break-before-page">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-[#2979FF]/30 print:border-blue-600/30">
                <CheckCircle2 className="text-[#2979FF] print:text-blue-600" size={24} />
                <h3 className="text-2xl font-bold text-white print:text-gray-900">
                  First Revenue Plan
                </h3>
              </div>
              {data.firstRevenueStages.map((stage, stageIndex) => (
                <div key={stageIndex} className="mb-6">
                  <h4 className="text-xl font-semibold text-[#2979FF] print:text-blue-600 mb-3">
                    Stage {stageIndex + 1}: {stage.name}
                  </h4>
                  <div className="space-y-4">
                    {stage.steps.map((step, stepIndex) => {
                      const answer = data.firstRevenueAnswers[step];
                      if (!answer) return null;

                      return (
                        <div
                          key={stepIndex}
                          className="bg-white/5 print:bg-gray-50 border border-white/10 print:border-gray-300 rounded-lg p-4"
                        >
                          <p className="text-white print:text-gray-900 font-medium mb-2">
                            {step}
                          </p>
                          <p className="text-gray-300 print:text-gray-700 leading-relaxed">
                            {answer}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 print:border-gray-300 text-center">
            <p className="text-gray-400 print:text-gray-600 text-sm">
              Generated by Launch Pad - Your guide to building a successful business
            </p>
          </div>
        </div>

        <div className="mt-8 text-center print:hidden">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
