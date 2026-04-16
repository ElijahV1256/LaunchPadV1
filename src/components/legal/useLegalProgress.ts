import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';

export function useLegalProgress() {
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      const { data } = await supabase
        .from('legal_progress')
        .select('completed_steps')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setCompletedSteps(data.completed_steps || []);
      }
    } catch (err) {
      console.error('Failed to load legal progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = useCallback(async (stepKey: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newCompleted = [...new Set([...completedSteps, stepKey])];
      setCompletedSteps(newCompleted);

      const { data: existing } = await supabase
        .from('legal_progress')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('legal_progress')
          .update({ completed_steps: newCompleted, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('legal_progress')
          .insert({ user_id: user.id, completed_steps: newCompleted, current_step: stepKey });
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }, [completedSteps]);

  return { completedSteps, loading, markComplete };
}
