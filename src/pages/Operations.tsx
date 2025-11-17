import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import {
  Home,
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  Calendar,
  DollarSign,
  Bell,
  Sparkles,
  X,
  Check,
  AlertCircle,
  BarChart3,
  Edit,
  Trash2
} from 'lucide-react';

interface PLEntry {
  id: string;
  entry_date: string;
  entry_type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
}

interface Goal {
  id: string;
  goal_type: 'leads' | 'customers' | 'revenue';
  target_value: number;
  current_value: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
}

interface Reminder {
  id: string;
  reminder_type: 'manual' | 'ai_generated';
  title: string;
  message: string;
  is_read: boolean;
  is_dismissed: boolean;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
  created_at: string;
}

export default function Operations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');
  const [loading, setLoading] = useState(true);
  const [plEntries, setPlEntries] = useState<PLEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [activeTab, setActiveTab] = useState<'profit-loss' | 'goals' | 'reminders'>('profit-loss');

  const [newEntry, setNewEntry] = useState({
    entry_type: 'income' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    entry_date: new Date().toISOString().split('T')[0]
  });

  const [newGoal, setNewGoal] = useState({
    goal_type: 'revenue' as 'leads' | 'customers' | 'revenue',
    target_value: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  useEffect(() => {
    if (!ideaKey) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [ideaKey]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const [entriesRes, goalsRes, remindersRes] = await Promise.all([
        supabase.from('profit_loss_entries').select('*').eq('user_id', user.id).eq('idea_key', ideaKey).order('entry_date', { ascending: false }),
        supabase.from('business_goals').select('*').eq('user_id', user.id).eq('idea_key', ideaKey),
        supabase.from('reminders').select('*').eq('user_id', user.id).eq('idea_key', ideaKey).eq('is_dismissed', false).order('created_at', { ascending: false })
      ]);

      if (entriesRes.data) setPlEntries(entriesRes.data);
      if (goalsRes.data) setGoals(goalsRes.data);
      if (remindersRes.data) setReminders(remindersRes.data);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load operations data:', err);
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!newEntry.category || !newEntry.amount) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('profit_loss_entries').insert({
        user_id: user.id,
        idea_key: ideaKey,
        entry_type: newEntry.entry_type,
        category: newEntry.category,
        description: newEntry.description,
        amount: parseFloat(newEntry.amount),
        entry_date: newEntry.entry_date
      });

      if (error) throw error;

      setNewEntry({
        entry_type: 'income',
        category: '',
        description: '',
        amount: '',
        entry_date: new Date().toISOString().split('T')[0]
      });
      setShowAddEntry(false);
      loadData();
    } catch (err) {
      console.error('Failed to add entry:', err);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('profit_loss_entries').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const addGoal = async () => {
    if (!newGoal.target_value || !newGoal.end_date) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('business_goals').insert({
        user_id: user.id,
        idea_key: ideaKey,
        goal_type: newGoal.goal_type,
        target_value: parseFloat(newGoal.target_value),
        current_value: 0,
        period: newGoal.period,
        start_date: newGoal.start_date,
        end_date: newGoal.end_date
      });

      if (error) throw error;

      setNewGoal({
        goal_type: 'revenue',
        target_value: '',
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
      });
      setShowAddGoal(false);
      loadData();
    } catch (err) {
      console.error('Failed to add goal:', err);
    }
  };

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      const { error } = await supabase.from('business_goals').update({ current_value: newValue }).eq('id', goalId);
      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  const dismissReminder = async (id: string) => {
    try {
      const { error } = await supabase.from('reminders').update({ is_dismissed: true }).eq('id', id);
      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Failed to dismiss reminder:', err);
    }
  };

  const markReminderRead = async (id: string) => {
    try {
      const { error } = await supabase.from('reminders').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Failed to mark reminder as read:', err);
    }
  };

  const calculateSummary = (period: 'week' | 'month' | 'year') => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const filtered = plEntries.filter(e => new Date(e.entry_date) >= startDate);
    const income = filtered.filter(e => e.entry_type === 'income').reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
    const expenses = filtered.filter(e => e.entry_type === 'expense').reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
    const profit = income - expenses;

    return { income, expenses, profit };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#1a2942] to-[#0A192F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF]"></div>
      </div>
    );
  }

  const weekSummary = calculateSummary('week');
  const monthSummary = calculateSummary('month');
  const yearSummary = calculateSummary('year');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#1a2942] to-[#0A192F]">
      <nav className="bg-[#0A192F]/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-[#06D6A0]" size={28} />
              Operations & Tracking
            </h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2"
            >
              <Home size={20} />
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('profit-loss')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'profit-loss'
                ? 'bg-[#2979FF] text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <DollarSign className="inline mr-2" size={20} />
            Profit & Loss
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'goals'
                ? 'bg-[#2979FF] text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Target className="inline mr-2" size={20} />
            Goals
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
              activeTab === 'reminders'
                ? 'bg-[#2979FF] text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Bell className="inline mr-2" size={20} />
            Reminders
            {reminders.filter(r => !r.is_read).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {reminders.filter(r => !r.is_read).length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'profit-loss' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Calendar size={20} />
                  This Week
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Income:</span>
                    <span className="text-emerald-400 font-bold">${weekSummary.income.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Expenses:</span>
                    <span className="text-red-400 font-bold">${weekSummary.expenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-white font-semibold">Profit:</span>
                    <span className={`font-bold text-lg ${weekSummary.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${weekSummary.profit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Calendar size={20} />
                  This Month
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Income:</span>
                    <span className="text-emerald-400 font-bold">${monthSummary.income.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Expenses:</span>
                    <span className="text-red-400 font-bold">${monthSummary.expenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-white font-semibold">Profit:</span>
                    <span className={`font-bold text-lg ${monthSummary.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${monthSummary.profit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Calendar size={20} />
                  This Year
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Income:</span>
                    <span className="text-emerald-400 font-bold">${yearSummary.income.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Expenses:</span>
                    <span className="text-red-400 font-bold">${yearSummary.expenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-white font-semibold">Profit:</span>
                    <span className={`font-bold text-lg ${yearSummary.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${yearSummary.profit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                <button
                  onClick={() => setShowAddEntry(!showAddEntry)}
                  className="px-4 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Entry
                </button>
              </div>

              {showAddEntry && (
                <div className="mb-6 bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2 text-sm">Type</label>
                      <select
                        value={newEntry.entry_type}
                        onChange={(e) => setNewEntry({ ...newEntry, entry_type: e.target.value as 'income' | 'expense' })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white mb-2 text-sm">Category</label>
                      <input
                        type="text"
                        value={newEntry.category}
                        onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                        placeholder="e.g., Sales, Ads, Materials"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white mb-2 text-sm">Description</label>
                    <input
                      type="text"
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                      placeholder="Optional description"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2 text-sm">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newEntry.amount}
                        onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 text-sm">Date</label>
                      <input
                        type="date"
                        value={newEntry.entry_date}
                        onChange={(e) => setNewEntry({ ...newEntry, entry_date: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addEntry}
                      className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-all"
                    >
                      Save Entry
                    </button>
                    <button
                      onClick={() => setShowAddEntry(false)}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {plEntries.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No entries yet. Add your first transaction above.</p>
                ) : (
                  plEntries.map((entry) => (
                    <div key={entry.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        {entry.entry_type === 'income' ? (
                          <TrendingUp className="text-emerald-400" size={24} />
                        ) : (
                          <TrendingDown className="text-red-400" size={24} />
                        )}
                        <div>
                          <div className="text-white font-semibold">{entry.category}</div>
                          <div className="text-gray-400 text-sm">{entry.description}</div>
                          <div className="text-gray-500 text-xs">{new Date(entry.entry_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xl font-bold ${entry.entry_type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {entry.entry_type === 'income' ? '+' : '-'}${parseFloat(entry.amount.toString()).toFixed(2)}
                        </span>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Business Goals</h2>
                <button
                  onClick={() => setShowAddGoal(!showAddGoal)}
                  className="px-4 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Goal
                </button>
              </div>

              {showAddGoal && (
                <div className="mb-6 bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2 text-sm">Goal Type</label>
                      <select
                        value={newGoal.goal_type}
                        onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value as 'leads' | 'customers' | 'revenue' })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        <option value="leads">Leads</option>
                        <option value="customers">Customers</option>
                        <option value="revenue">Revenue</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white mb-2 text-sm">Period</label>
                      <select
                        value={newGoal.period}
                        onChange={(e) => setNewGoal({ ...newGoal, period: e.target.value as 'weekly' | 'monthly' | 'yearly' })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white mb-2 text-sm">Target Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                      placeholder="Enter target"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2 text-sm">Start Date</label>
                      <input
                        type="date"
                        value={newGoal.start_date}
                        onChange={(e) => setNewGoal({ ...newGoal, start_date: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 text-sm">End Date</label>
                      <input
                        type="date"
                        value={newGoal.end_date}
                        onChange={(e) => setNewGoal({ ...newGoal, end_date: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addGoal}
                      className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-all"
                    >
                      Save Goal
                    </button>
                    <button
                      onClick={() => setShowAddGoal(false)}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {goals.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No goals set yet. Add your first goal above.</p>
                ) : (
                  goals.map((goal) => {
                    const progress = (goal.current_value / goal.target_value) * 100;
                    return (
                      <div key={goal.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-white font-bold text-lg capitalize">{goal.goal_type} Goal</h3>
                            <p className="text-gray-400 text-sm capitalize">{goal.period} Target</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-[#2979FF] font-bold text-2xl">
                              {goal.goal_type === 'revenue' ? '$' : ''}{goal.current_value.toFixed(goal.goal_type === 'revenue' ? 2 : 0)}
                            </div>
                            <div className="text-gray-400 text-sm">
                              of {goal.goal_type === 'revenue' ? '$' : ''}{goal.target_value.toFixed(goal.goal_type === 'revenue' ? 2 : 0)}
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#2979FF] to-[#06D6A0] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{progress.toFixed(1)}% Complete</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step={goal.goal_type === 'revenue' ? '0.01' : '1'}
                            placeholder="Update progress"
                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const val = parseFloat((e.target as HTMLInputElement).value);
                                if (!isNaN(val)) {
                                  updateGoalProgress(goal.id, val);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              const val = parseFloat(input.value);
                              if (!isNaN(val)) {
                                updateGoalProgress(goal.id, val);
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-all"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-[#06D6A0]" />
                AI Suggestions & Reminders
              </h2>

              <div className="space-y-4">
                {reminders.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No reminders at the moment. Check back soon for AI-powered suggestions!</p>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`bg-white/5 border rounded-lg p-4 transition-all ${
                        reminder.is_read ? 'border-white/10' : 'border-[#2979FF]/50 bg-[#2979FF]/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3 flex-1">
                          {reminder.priority === 'high' && <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />}
                          {reminder.priority === 'medium' && <Bell className="text-[#2979FF] flex-shrink-0 mt-1" size={20} />}
                          {reminder.priority === 'low' && <Sparkles className="text-[#06D6A0] flex-shrink-0 mt-1" size={20} />}
                          <div className="flex-1">
                            <h3 className="text-white font-bold">{reminder.title}</h3>
                            <p className="text-gray-300 text-sm mt-1">{reminder.message}</p>
                            <p className="text-gray-500 text-xs mt-2">{new Date(reminder.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-2">
                          {!reminder.is_read && (
                            <button
                              onClick={() => markReminderRead(reminder.id)}
                              className="p-2 text-[#06D6A0] hover:bg-[#06D6A0]/20 rounded-lg transition-all"
                              title="Mark as read"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => dismissReminder(reminder.id)}
                            className="p-2 text-gray-400 hover:bg-white/20 rounded-lg transition-all"
                            title="Dismiss"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                      {reminder.action_url && (
                        <button
                          onClick={() => navigate(reminder.action_url!)}
                          className="mt-2 px-4 py-2 bg-[#2979FF] text-white rounded-lg text-sm font-semibold hover:bg-[#2979FF]/90 transition-all"
                        >
                          Take Action
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Continue to Scale & Optimize */}
        <div className="mt-8 bg-gradient-to-r from-[#06D6A0]/10 to-[#2979FF]/10 border border-[#2979FF]/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Scale?</h3>
              <p className="text-gray-300">
                Analyze feedback, discover upsell opportunities, and connect with the community.
              </p>
            </div>
            <button
              onClick={() => navigate(`/scale-optimize?ideaKey=${ideaKey}`)}
              className="px-8 py-3 bg-[#2979FF] text-white rounded-lg font-bold text-lg hover:bg-[#2979FF]/90 transition-all duration-300 whitespace-nowrap"
            >
              Scale & Optimize →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
