import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Bookmark, ArrowLeft, Trash2, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface SavedName {
  id: string;
  name: string;
  tagline: string;
  description: string;
  is_selected: boolean;
  created_at: string;
}

export default function SavedNames() {
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');
  const [savedNames, setSavedNames] = useState<SavedName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && ideaKey) {
      loadSavedNames();
    }
  }, [currentUser, ideaKey]);

  const loadSavedNames = async () => {
    if (!currentUser || !ideaKey) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('saved_business_names')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('idea_key', ideaKey)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setSavedNames(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved names');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;

    try {
      setDeletingId(id);
      const { error: deleteError } = await supabase
        .from('saved_business_names')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (deleteError) throw deleteError;

      setSavedNames(prev => prev.filter(name => name.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete name');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelect = async (selectedName: SavedName) => {
    if (!currentUser || !ideaKey) return;

    try {
      setSelectingId(selectedName.id);

      await supabase
        .from('saved_business_names')
        .update({ is_selected: false })
        .eq('user_id', currentUser.id)
        .eq('idea_key', ideaKey);

      const { error: updateError } = await supabase
        .from('saved_business_names')
        .update({ is_selected: true })
        .eq('id', selectedName.id)
        .eq('user_id', currentUser.id);

      if (updateError) throw updateError;

      const { data: existingBrand } = await supabase
        .from('brand_identity')
        .select('business_names')
        .eq('user_id', currentUser.id)
        .eq('idea_key', ideaKey)
        .maybeSingle();

      const nameEntry = {
        name: selectedName.name,
        tagline: selectedName.tagline,
        reason: selectedName.description
      };

      let updatedBusinessNames = existingBrand?.business_names || [];
      const nameExists = Array.isArray(updatedBusinessNames) &&
        updatedBusinessNames.some((n: any) => n.name === selectedName.name);

      if (!nameExists) {
        updatedBusinessNames = [...updatedBusinessNames, nameEntry];
      }

      const { error: brandError } = await supabase
        .from('brand_identity')
        .upsert({
          user_id: currentUser.id,
          idea_key: ideaKey,
          business_names: updatedBusinessNames,
          selected_name: selectedName.name,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,idea_key'
        });

      if (brandError) throw brandError;

      navigate(`/brand-identity?ideaKey=${ideaKey}`);
    } catch (err: any) {
      setError(err.message || 'Failed to select name');
    } finally {
      setSelectingId(null);
    }
  };

  if (!ideaKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">No business idea specified</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-3 bg-[#2979FF] text-white rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/brand-identity?ideaKey=${ideaKey}`)}
          className="flex items-center gap-2 text-[#2979FF] hover:text-[#2979FF]/80 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back to Brand Identity
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="text-[#2979FF]" size={32} />
            <h1 className="text-3xl font-bold text-white font-['Montserrat']">
              Saved Business Names
            </h1>
          </div>
          <p className="text-gray-400">
            Select a name to use for your business
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#2979FF]" size={48} />
          </div>
        ) : savedNames.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
            <Bookmark className="text-gray-500 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-white mb-2 font-['Montserrat']">
              No saved names yet
            </h2>
            <p className="text-gray-400 mb-6">
              Save business names from the Brand Identity page to see them here
            </p>
            <button
              onClick={() => navigate(`/brand-identity?ideaKey=${ideaKey}`)}
              className="px-6 py-3 bg-[#2979FF] text-white rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all"
            >
              Go to Brand Identity
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedNames.map((savedName) => (
              <div
                key={savedName.id}
                className={`bg-white/5 backdrop-blur-sm border rounded-xl p-6 transition-all ${
                  savedName.is_selected
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {savedName.is_selected && (
                        <CheckCircle2 className="text-green-400" size={20} />
                      )}
                      <h3 className="text-2xl font-bold text-white font-['Montserrat']">
                        {savedName.name}
                      </h3>
                    </div>
                    <p className="text-[#2979FF] italic mb-2 text-lg">
                      {savedName.tagline}
                    </p>
                    {savedName.description && (
                      <p className="text-gray-400 text-sm">
                        {savedName.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!savedName.is_selected && (
                      <button
                        onClick={() => handleSelect(savedName)}
                        disabled={selectingId === savedName.id}
                        className="px-4 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {selectingId === savedName.id ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Selecting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            Select
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(savedName.id)}
                      disabled={deletingId === savedName.id}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {deletingId === savedName.id ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
