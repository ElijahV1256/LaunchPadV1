import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Sparkles, Rocket } from 'lucide-react';
import { supabase } from '../config/supabase';

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    setLoading(true);
    setSelectedPlan(plan);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 mb-8 mx-auto hover:opacity-80 transition-opacity"
        >
          <Rocket className="text-[#2979FF] animate-bounce" size={40} />
          <span className="text-3xl font-bold text-[#0A192F] font-['Montserrat']">Launch Pad</span>
        </button>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Launch Pad Pro
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Unlock Your Full Potential
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to find, validate, and launch your first business
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`bg-white rounded-2xl shadow-lg p-8 cursor-pointer transition-all ${
              selectedPlan === 'monthly' ? 'ring-2 ring-blue-600' : 'hover:shadow-xl'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Monthly</h3>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
              }`}>
                {selectedPlan === 'monthly' && (
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                )}
              </div>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-bold">$15</span>
              <span className="text-gray-600">/month</span>
            </div>
          </div>

          <div
            onClick={() => setSelectedPlan('yearly')}
            className={`bg-white rounded-2xl shadow-lg p-8 cursor-pointer transition-all relative ${
              selectedPlan === 'yearly' ? 'ring-2 ring-blue-600' : 'hover:shadow-xl'
            }`}
          >
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Save 45%
            </div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Yearly</h3>
                <p className="text-gray-600">Best value for serious builders</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === 'yearly' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
              }`}>
                {selectedPlan === 'yearly' && (
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                )}
              </div>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-bold">$99</span>
              <span className="text-gray-600">/year</span>
              <p className="text-sm text-gray-500 mt-1">That's $8.25/month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h3 className="text-xl font-bold mb-6">Everything included:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Local Opportunities analyzer',
              'Unlimited ideas & roadmaps',
              'First-revenue checklists',
              'StoryBrand messaging framework',
              'Business plan builder',
              'AI-powered coaching',
              'Priority support',
              '7-day free trial',
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleCheckout(selectedPlan)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>Start 7-day free trial</>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          No credit card required for trial · Cancel anytime
        </p>
      </div>
    </div>
  );
}
