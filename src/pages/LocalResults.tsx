import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Star, DollarSign, Rocket } from 'lucide-react';
import { useEffect } from 'react';

interface OpportunityCategory {
  category: string;
  score: number;
  supply: number;
  ratingAvg: number;
  reviewsAvg: number;
  why: string;
  suggestedPriceRange: string;
}

interface ResultsData {
  top: OpportunityCategory[];
  meta: {
    lat: number;
    lng: number;
    radiusMiles: number;
    zip: string | null;
  };
}

export default function LocalResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results as ResultsData;
  const zip = location.state?.zip;
  const radius = location.state?.radius;

  useEffect(() => {
    if (!results) {
      navigate('/local');
    }
  }, [results, navigate]);

  if (!results) {
    return null;
  }

  const locationText = zip || `${results.meta.lat.toFixed(4)}, ${results.meta.lng.toFixed(4)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 mb-6 mx-auto hover:opacity-80 transition-opacity"
        >
          <Rocket className="text-[#2979FF] animate-bounce" size={40} />
          <span className="text-3xl font-bold text-[#0A192F] font-['Montserrat']">Launch Pad</span>
        </button>
        <button
          onClick={() => navigate('/local')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to search
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Local Opportunities near {locationText}
          </h1>
          <p className="text-gray-600">
            Within {radius} miles · {results.top.length} opportunities found
          </p>
        </div>

        {results.top.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-600">
              We couldn't find enough data. Try a larger radius or another location.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.top.map((opportunity, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {opportunity.category}
                    </h3>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      Opportunity Score: {Math.round(opportunity.score * 100)}/100
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {opportunity.why}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Users className="w-4 h-4" />
                      Competitors
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{opportunity.supply}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Star className="w-4 h-4" />
                      Avg Rating
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{opportunity.ratingAvg}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Users className="w-4 h-4" />
                      Avg Reviews
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{opportunity.reviewsAvg}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <DollarSign className="w-4 h-4" />
                      Price Range
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{opportunity.suggestedPriceRange}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                    Generate my first step
                  </button>
                  <button className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>Nice — here are your best local bets.</strong> These opportunities are ranked by demand vs. supply in your area.
          </p>
        </div>
      </div>
    </div>
  );
}
