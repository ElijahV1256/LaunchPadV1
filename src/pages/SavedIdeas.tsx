import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BusinessIdea } from '../services/openai';
import {
  Rocket,
  Sparkles,
  TrendingUp,
  DollarSign,
  Loader2,
  BookmarkCheck,
  ArrowLeft,
  Edit3,
  Save,
  X,
  Trash2,
} from 'lucide-react';

interface SavedIdea {
  id: string;
  original_idea_id: string;
  idea_data: BusinessIdea;
  created_at: string;
}

export default function SavedIdeas() {
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [modifying, setModifying] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadSavedIdeas();
    }
  }, [currentUser]);

  const loadSavedIdeas = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_ideas')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedIdeas(data || []);
    } catch (err) {
      console.error('Failed to load saved ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (idea: SavedIdea) => {
    setEditingId(idea.id);
    setEditName(idea.idea_data.name);
    setEditDescription(idea.idea_data.description);
    setAiPrompt('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
    setAiPrompt('');
  };

  const handleModifyWithAI = async (ideaId: string) => {
    if (!aiPrompt.trim() || !currentUser) return;

    setModifying(true);
    try {
      const idea = savedIdeas.find(i => i.id === ideaId);
      if (!idea) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-business-ideas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId: currentUser.id,
            modifyIdea: {
              name: editName,
              description: editDescription,
              prompt: aiPrompt,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to modify idea with AI');

      const data = await response.json();
      if (data.modified) {
        setEditName(data.modified.name);
        setEditDescription(data.modified.description);
        setAiPrompt('');
      }
    } catch (err) {
      console.error('Failed to modify with AI:', err);
    } finally {
      setModifying(false);
    }
  };

  const handleSaveEdit = async (ideaId: string) => {
    if (!currentUser) return;

    setSavingId(ideaId);
    try {
      const idea = savedIdeas.find(i => i.id === ideaId);
      if (!idea) return;

      const updatedIdeaData = {
        ...idea.idea_data,
        name: editName,
        description: editDescription,
      };

      const { error } = await supabase
        .from('saved_ideas')
        .update({
          idea_data: updatedIdeaData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ideaId);

      if (error) throw error;

      setSavedIdeas(prev =>
        prev.map(i =>
          i.id === ideaId ? { ...i, idea_data: updatedIdeaData } : i
        )
      );

      setEditingId(null);
      setEditName('');
      setEditDescription('');
    } catch (err) {
      console.error('Failed to save edit:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (ideaId: string) => {
    if (!currentUser || !confirm('Are you sure you want to remove this saved idea?')) return;

    setDeletingId(ideaId);
    try {
      const { error } = await supabase
        .from('saved_ideas')
        .delete()
        .eq('id', ideaId);

      if (error) throw error;

      setSavedIdeas(prev => prev.filter(i => i.id !== ideaId));
    } catch (err) {
      console.error('Failed to delete idea:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewRoadmap = (ideaId: string) => {
    navigate(`/first-revenue?ideaKey=${ideaId}`);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-400';
    if (difficulty <= 3) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-[#2979FF] animate-spin mx-auto mb-4" size={48} />
          <p className="text-white text-xl">Loading your saved ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Rocket className="text-[#2979FF]" size={32} />
              <span className="text-2xl font-bold text-white font-['Montserrat']">Launch Pad</span>
            </button>

            <button
              onClick={() => navigate('/ideas')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
            >
              <ArrowLeft size={20} />
              Back to Ideas
            </button>
          </div>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookmarkCheck className="text-purple-400" size={48} />
              <h1 className="text-5xl font-bold text-white font-['Montserrat']">Your Saved Ideas</h1>
            </div>
            <p className="text-gray-400 text-lg">
              {savedIdeas.length === 0
                ? 'No saved ideas yet. Go back and save some ideas you like!'
                : `You have ${savedIdeas.length} saved ${savedIdeas.length === 1 ? 'idea' : 'ideas'}`}
            </p>
          </div>
        </div>

        {savedIdeas.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkCheck className="text-gray-500 mx-auto mb-4" size={64} />
            <p className="text-gray-400 text-xl mb-6">Start saving ideas to see them here</p>
            <button
              onClick={() => navigate('/ideas')}
              className="px-6 py-3 bg-[#2979FF] hover:bg-[#2979FF]/80 text-white rounded-lg font-semibold transition-all"
            >
              Browse Ideas
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedIdeas.map((savedIdea) => (
              <div
                key={savedIdea.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 flex flex-col"
              >
                {editingId === savedIdea.id ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Edit3 className="text-purple-400" size={20} />
                        <h3 className="text-lg font-bold text-white">Editing</h3>
                      </div>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2 mb-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                      placeholder="Idea name"
                    />

                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-4 py-3 mb-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 resize-none"
                      rows={6}
                      placeholder="Idea description"
                    />

                    <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-purple-400" size={16} />
                        <span className="text-sm font-semibold text-purple-400">Modify with AI</span>
                      </div>
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !modifying) {
                            handleModifyWithAI(savedIdea.id);
                          }
                        }}
                        className="w-full px-3 py-2 mb-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-400"
                        placeholder="e.g., Make it focus more on sustainability"
                      />
                      <button
                        onClick={() => handleModifyWithAI(savedIdea.id)}
                        disabled={!aiPrompt.trim() || modifying}
                        className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 transition-all disabled:opacity-50"
                      >
                        {modifying ? (
                          <>
                            <Loader2 className="inline animate-spin mr-2" size={14} />
                            Modifying...
                          </>
                        ) : (
                          'Apply AI Changes'
                        )}
                      </button>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleSaveEdit(savedIdea.id)}
                        disabled={savingId === savedIdea.id}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Save size={16} />
                        {savingId === savedIdea.id ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-purple-400" size={24} />
                      <h3 className="text-2xl font-bold text-white font-['Montserrat']">
                        {savedIdea.idea_data.name}
                      </h3>
                    </div>

                    <p className="text-gray-300 mb-6 leading-relaxed flex-1">
                      {savedIdea.idea_data.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Difficulty:</span>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < savedIdea.idea_data.difficulty ? 'bg-purple-400' : 'bg-gray-600'
                              }`}
                            />
                          ))}
                          <span className={`font-semibold ${getDifficultyColor(savedIdea.idea_data.difficulty)}`}>
                            {savedIdea.idea_data.difficulty}/5
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Cost Range:</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="text-purple-400" size={16} />
                          <span className="text-white font-semibold">{savedIdea.idea_data.costRange}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartEdit(savedIdea)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                        title="Edit idea"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(savedIdea.id)}
                        disabled={deletingId === savedIdea.id}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all disabled:opacity-50"
                        title="Remove from saved"
                      >
                        {deletingId === savedIdea.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => handleViewRoadmap(savedIdea.original_idea_id)}
                        className="flex-1 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <TrendingUp size={20} />
                        View Roadmap
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
