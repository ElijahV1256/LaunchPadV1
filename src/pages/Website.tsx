import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Home, Loader2 } from 'lucide-react';
import BookDiscoveryCall from '../components/BookDiscoveryCall';

export default function Website() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>('');

  useEffect(() => {
    if (!currentUser || !ideaKey) {
      navigate('/dashboard');
      return;
    }
    loadBrandData();
  }, [currentUser, ideaKey]);

  const loadBrandData = async () => {
    try {
      const { data: brand, error: brandError } = await supabase
        .from('brand_identity')
        .select('selected_name')
        .eq('user_id', currentUser!.id)
        .eq('idea_key', ideaKey)
        .maybeSingle();

      if (brandError) throw brandError;
      if (!brand?.selected_name) {
        setError('Please complete Brand Identity first');
        return;
      }

      setBrandName(brand.selected_name);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <Loader2 className="text-[#2979FF] animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            {error.includes('Brand Identity') && ideaKey && (
              <button
                onClick={() => navigate(`/brand-identity?ideaKey=${ideaKey}`)}
                className="px-6 py-3 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/90"
              >
                Go to Brand Identity
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F]">
      <nav className="container mx-auto px-6 py-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <Home size={20} />
          <span>Dashboard</span>
        </button>
      </nav>

      <div className="container mx-auto px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Website</h1>
            <p className="text-gray-400">Get a custom website for {brandName}</p>
          </div>

          <BookDiscoveryCall businessName={brandName} />
        </div>
      </div>
    </div>
  );
}
