import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Sparkles, Rocket } from 'lucide-react';

export default function ProSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 mb-6 mx-auto hover:opacity-80 transition-opacity"
        >
          <Rocket className="text-[#2979FF] animate-bounce" size={40} />
          <span className="text-3xl font-bold text-[#0A192F] font-['Montserrat']">Launch Pad</span>
        </button>
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Welcome to Pro
          </div>

          <h1 className="text-3xl font-bold mb-4">
            You're all set!
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Your 7-day free trial has started. You now have access to all Pro features, including Local Opportunities.
          </p>

          <div className="space-y-3 mb-8">
            <button
              onClick={() => navigate('/local')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200"
            >
              Explore Local Opportunities
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border border-gray-200 py-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Your trial ends in 7 days. Cancel anytime from your profile.
          </p>
        </div>
      </div>
    </div>
  );
}
