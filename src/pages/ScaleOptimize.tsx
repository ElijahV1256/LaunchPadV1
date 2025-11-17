import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import {
  Home,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Users,
  Send,
  Sparkles,
  Loader2,
  ThumbsUp,
  Star,
  Package,
  DollarSign,
  Target,
  Heart
} from 'lucide-react';

interface Feedback {
  id: string;
  customer_name: string;
  feedback_text: string;
  rating: number;
  source: string;
  created_at: string;
  ai_analysis?: {
    sentiment: string;
    key_points: string[];
    suggestions: string[];
  };
}

interface UpsellIdea {
  id: string;
  upsell_type: 'product' | 'service' | 'tier';
  title: string;
  description: string;
  estimated_price: number;
  target_audience: string;
  implementation_difficulty: 'easy' | 'medium' | 'hard';
  ai_confidence: number;
  created_at: string;
}

interface CommunityPost {
  id: string;
  user_id: string;
  post_type: 'success_story' | 'template' | 'question' | 'answer';
  title: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_email?: string;
}

export default function ScaleOptimize() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feedback' | 'upsells' | 'community'>('feedback');

  // Feedback state
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [newFeedback, setNewFeedback] = useState({ customer_name: '', feedback_text: '', rating: 5, source: 'manual' });
  const [analyzingFeedback, setAnalyzingFeedback] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Upsell state
  const [upsells, setUpsells] = useState<UpsellIdea[]>([]);
  const [generatingUpsells, setGeneratingUpsells] = useState(false);

  // Community state
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState({ post_type: 'question', title: '', content: '' });
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    if (!ideaKey) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [ideaKey]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadFeedbacks(),
        loadUpsells(),
        loadCommunityPosts()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbacks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('scale_optimization')
      .select('feedback_entries, feedback_analysis')
      .eq('idea_key', ideaKey)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data && data.feedback_entries) {
      setFeedbacks(Array.isArray(data.feedback_entries) ? data.feedback_entries : []);
    }
  };

  const loadUpsells = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('scale_optimization')
      .select('upsell_ideas')
      .eq('idea_key', ideaKey)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data && data.upsell_ideas) {
      setUpsells(Array.isArray(data.upsell_ideas) ? data.upsell_ideas : []);
    }
  };

  const loadCommunityPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('scale_optimization')
      .select('community_posts')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data && data.community_posts) {
      setCommunityPosts(Array.isArray(data.community_posts) ? data.community_posts : []);
    }
  };

  const handleAddFeedback = async () => {
    if (!newFeedback.customer_name.trim() || !newFeedback.feedback_text.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('customer_feedback')
        .insert([{
          user_id: user.id,
          idea_key: ideaKey,
          customer_name: newFeedback.customer_name,
          feedback_text: newFeedback.feedback_text,
          rating: newFeedback.rating,
          source: newFeedback.source
        }]);

      if (!error) {
        setNewFeedback({ customer_name: '', feedback_text: '', rating: 5, source: 'manual' });
        setShowFeedbackForm(false);
        await loadFeedbacks();
      }
    } catch (error) {
      console.error('Failed to add feedback:', error);
    }
  };

  const handleAnalyzeFeedback = async (feedbackId: string) => {
    setAnalyzingFeedback(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-feedback`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feedbackId })
        }
      );

      if (response.ok) {
        await loadFeedbacks();
      }
    } catch (error) {
      console.error('Failed to analyze feedback:', error);
    } finally {
      setAnalyzingFeedback(false);
    }
  };

  const handleGenerateUpsells = async () => {
    setGeneratingUpsells(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found');
        alert('Please log in to generate upsells');
        return;
      }

      console.log('Generating upsells for ideaKey:', ideaKey);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-upsells`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ideaKey })
        }
      );

      const responseData = await response.json();
      console.log('Upsell generation response:', responseData);

      if (response.ok) {
        alert('Upsells generated successfully!');
        await loadUpsells();
      } else {
        console.error('Upsell generation failed:', responseData);
        alert(`Failed to generate upsells: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to generate upsells:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setGeneratingUpsells(false);
    }
  };

  const handleAddPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('community_posts')
        .insert([{
          user_id: user.id,
          post_type: newPost.post_type,
          title: newPost.title,
          content: newPost.content,
          likes_count: 0,
          comments_count: 0
        }]);

      if (!error) {
        setNewPost({ post_type: 'question', title: '', content: '' });
        setShowPostForm(false);
        await loadCommunityPosts();
      }
    } catch (error) {
      console.error('Failed to add post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const post = communityPosts.find(p => p.id === postId);
      if (!post) return;

      const { error } = await supabase
        .from('community_posts')
        .update({ likes_count: post.likes_count + 1 })
        .eq('id', postId);

      if (!error) {
        await loadCommunityPosts();
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#0A192F] flex items-center justify-center">
        <Loader2 className="text-[#2979FF] animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#0A192F]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-[#06D6A0]" size={40} />
            <h1 className="text-4xl font-bold text-white font-['Montserrat']">
              Scale & Optimize
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Analyze feedback, discover upsell opportunities, and connect with the community.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
              activeTab === 'feedback'
                ? 'text-[#2979FF] border-b-2 border-[#2979FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare size={20} />
            Feedback Loop
          </button>
          <button
            onClick={() => setActiveTab('upsells')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
              activeTab === 'upsells'
                ? 'text-[#2979FF] border-b-2 border-[#2979FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lightbulb size={20} />
            Upsell Ideas
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
              activeTab === 'community'
                ? 'text-[#2979FF] border-b-2 border-[#2979FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users size={20} />
            Community
          </button>
        </div>

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Customer Feedback</h2>
              <button
                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-all"
              >
                <MessageSquare size={20} />
                Add Feedback
              </button>
            </div>

            {showFeedbackForm && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Add Customer Feedback</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={newFeedback.customer_name}
                      onChange={(e) => setNewFeedback({ ...newFeedback, customer_name: e.target.value })}
                      placeholder="Enter customer name"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={newFeedback.feedback_text}
                      onChange={(e) => setNewFeedback({ ...newFeedback, feedback_text: e.target.value })}
                      placeholder="What did the customer say?"
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Rating (1-5)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setNewFeedback({ ...newFeedback, rating })}
                          className={`p-2 rounded-lg transition-all ${
                            newFeedback.rating >= rating
                              ? 'text-yellow-400'
                              : 'text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          <Star size={24} fill={newFeedback.rating >= rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddFeedback}
                      className="flex items-center gap-2 px-6 py-3 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-all"
                    >
                      <Send size={18} />
                      Submit
                    </button>
                    <button
                      onClick={() => setShowFeedbackForm(false)}
                      className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {feedbacks.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
                  <MessageSquare className="text-gray-500 mx-auto mb-4" size={48} />
                  <p className="text-gray-400 text-lg">No feedback yet. Add your first customer feedback!</p>
                </div>
              ) : (
                feedbacks.map((feedback) => (
                  <div key={feedback.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{feedback.customer_name}</h3>
                        <div className="flex gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < feedback.rating ? 'text-yellow-400' : 'text-gray-600'}
                              fill={i < feedback.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      {!feedback.ai_analysis && (
                        <button
                          onClick={() => handleAnalyzeFeedback(feedback.id)}
                          disabled={analyzingFeedback}
                          className="flex items-center gap-2 px-4 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-all disabled:opacity-50"
                        >
                          {analyzingFeedback ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Sparkles size={18} />
                          )}
                          Analyze
                        </button>
                      )}
                    </div>
                    <p className="text-gray-300 mb-4">{feedback.feedback_text}</p>
                    {feedback.ai_analysis && (
                      <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="text-[#2979FF]" size={20} />
                          <h4 className="text-white font-bold">AI Analysis</h4>
                        </div>
                        <p className="text-gray-300 mb-3">
                          <span className="font-semibold text-white">Sentiment:</span> {feedback.ai_analysis.sentiment}
                        </p>
                        {feedback.ai_analysis.key_points && feedback.ai_analysis.key_points.length > 0 && (
                          <div className="mb-3">
                            <p className="font-semibold text-white mb-2">Key Points:</p>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                              {feedback.ai_analysis.key_points.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feedback.ai_analysis.suggestions && feedback.ai_analysis.suggestions.length > 0 && (
                          <div>
                            <p className="font-semibold text-white mb-2">Suggestions:</p>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                              {feedback.ai_analysis.suggestions.map((suggestion, i) => (
                                <li key={i}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-gray-500 text-xs mt-4">{new Date(feedback.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Upsells Tab */}
        {activeTab === 'upsells' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Upsell Opportunities</h2>
              <button
                onClick={handleGenerateUpsells}
                disabled={generatingUpsells}
                className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-all disabled:opacity-50"
              >
                {generatingUpsells ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Ideas
                  </>
                )}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {upsells.length === 0 ? (
                <div className="col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
                  <Lightbulb className="text-gray-500 mx-auto mb-4" size={48} />
                  <p className="text-gray-400 text-lg mb-4">No upsell ideas yet. Generate AI-powered suggestions!</p>
                </div>
              ) : (
                upsells.map((upsell) => (
                  <div key={upsell.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${
                        upsell.upsell_type === 'product' ? 'bg-blue-500/20 text-blue-400' :
                        upsell.upsell_type === 'service' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        <Package size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-white">{upsell.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            upsell.implementation_difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                            upsell.implementation_difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {upsell.implementation_difficulty}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-3">{upsell.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-[#06D6A0]">
                            <DollarSign size={16} />
                            <span className="font-semibold">${upsell.estimated_price}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <Target size={16} />
                            <span>{upsell.target_audience}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs text-gray-500">AI Confidence:</span>
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div
                              className="bg-[#2979FF] h-2 rounded-full transition-all"
                              style={{ width: `${upsell.ai_confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#2979FF] font-semibold">{upsell.ai_confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Community Hub</h2>
              <button
                onClick={() => setShowPostForm(!showPostForm)}
                className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-all"
              >
                <MessageSquare size={20} />
                New Post
              </button>
            </div>

            {showPostForm && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Create a Post</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Post Type
                    </label>
                    <select
                      value={newPost.post_type}
                      onChange={(e) => setNewPost({ ...newPost, post_type: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2979FF]"
                    >
                      <option value="question">Question</option>
                      <option value="success_story">Success Story</option>
                      <option value="template">Template Share</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="Enter post title"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Content
                    </label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Share your thoughts..."
                      rows={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddPost}
                      className="flex items-center gap-2 px-6 py-3 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-all"
                    >
                      <Send size={18} />
                      Post
                    </button>
                    <button
                      onClick={() => setShowPostForm(false)}
                      className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {communityPosts.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
                  <Users className="text-gray-500 mx-auto mb-4" size={48} />
                  <p className="text-gray-400 text-lg">No posts yet. Be the first to share!</p>
                </div>
              ) : (
                communityPosts.map((post) => (
                  <div key={post.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            post.post_type === 'success_story' ? 'bg-green-500/20 text-green-400' :
                            post.post_type === 'template' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {post.post_type.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{post.title}</h3>
                        <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center gap-2 hover:text-red-400 transition-colors"
                          >
                            <Heart size={16} />
                            <span>{post.likes_count}</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <MessageSquare size={16} />
                            <span>{post.comments_count} comments</span>
                          </div>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
