import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Loader2, TrendingUp, Rocket } from 'lucide-react';
import { supabase } from '../config/supabase';

export default function LocalOpportunities() {
  const navigate = useNavigate();
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [zip, setZip] = useState('');
  const [radius, setRadius] = useState(5);
  const [useLocation, setUseLocation] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    checkPlanStatus();
  }, []);

  const checkPlanStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-plan`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const isProUser = data.plan === 'pro' || (data.trial_end && new Date(data.trial_end) > new Date());
        setIsPro(isProUser);
        if (!isProUser) {
          setShowPaywall(true);
        }
      } else {
        setIsPro(false);
        setShowPaywall(true);
      }
    } catch (error) {
      console.error('Error checking plan status:', error);
      setIsPro(false);
      setShowPaywall(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!zip && !useLocation) {
      alert('Please enter a ZIP code or use your location');
      return;
    }

    setAnalyzing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      let body: any = { radiusMiles: radius };

      if (useLocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        body.lat = position.coords.latitude;
        body.lng = position.coords.longitude;
      } else {
        body.zip = zip;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/local-opportunities`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.status === 402) {
        setShowPaywall(true);
        setAnalyzing(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze opportunities');
      }

      navigate('/local/results', { state: { results: data, zip: body.zip, radius } });
    } catch (error: any) {
      console.error('Error analyzing opportunities:', error);
      alert(error.message || 'Failed to analyze opportunities');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (showPaywall || !isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 mb-6 mx-auto hover:opacity-80 transition-opacity"
            >
              <Rocket className="text-[#2979FF] animate-bounce" size={40} />
              <span className="text-3xl font-bold text-[#0A192F] font-['Montserrat']">Launch Pad</span>
            </button>
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-4">
              Unlock Local Opportunities
            </h1>
            <p className="text-lg text-gray-600 text-center mb-8">
              Discover high-demand, low-competition niches in your area
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Top niches ranked by opportunity score</p>
                  <p className="text-sm text-gray-600">See exactly where demand exceeds supply</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Competitor snapshot</p>
                  <p className="text-sm text-gray-600">Understand the competitive landscape</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">First customer script</p>
                  <p className="text-sm text-gray-600">Get actionable next steps to start earning</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200"
            >
              Start 7-day trial
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 mb-6 mx-auto hover:opacity-80 transition-opacity"
          >
            <Rocket className="text-[#2979FF] animate-bounce" size={40} />
            <span className="text-3xl font-bold text-[#0A192F] font-['Montserrat']">Launch Pad</span>
          </button>
          <h1 className="text-3xl font-bold text-center mb-2">
            Find winning ideas in your ZIP
          </h1>
          <p className="text-gray-600 text-center mb-8">
            We scan nearby businesses to find high-demand, low-competition niches
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => {
                      setZip(e.target.value);
                      setUseLocation(false);
                    }}
                    placeholder="Enter ZIP code"
                    disabled={useLocation}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <button
                  onClick={() => {
                    setUseLocation(!useLocation);
                    if (!useLocation) setZip('');
                  }}
                  className={`w-full py-2 px-4 rounded-lg border transition-colors ${
                    useLocation
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {useLocation ? 'Using current location' : 'Use my location'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search radius: {radius} miles
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3 miles</span>
                <span>10 miles</span>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing || (!zip && !useLocation)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing opportunities...
                </>
              ) : (
                'Find opportunities'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
