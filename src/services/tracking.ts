import { supabase } from '../config/supabase';
import confetti from 'canvas-confetti';

export type MilestoneType =
  | 'account_created'
  | 'profile_completed'
  | 'idea_selected'
  | 'first_step_completed'
  | 'stage_completed'
  | 'first_customer'
  | 'first_revenue';

export type ActivityType =
  | 'step_completed'
  | 'idea_generated'
  | 'roadmap_viewed'
  | 'ai_help_used'
  | 'plan_generated';

const MILESTONE_MESSAGES: Record<MilestoneType, string> = {
  account_created: 'Welcome to Launch Pad! Your journey begins now.',
  profile_completed: 'Profile complete! You\'re ready to discover ideas.',
  idea_selected: 'Great choice! Let\'s build your roadmap.',
  first_step_completed: 'First step done! You\'re making progress.',
  stage_completed: 'Stage complete! You\'re closer to your goal.',
  first_customer: 'Your first customer! This is huge!',
  first_revenue: 'You made your first dollar! Congratulations!',
};

export async function trackMilestone(
  milestoneType: MilestoneType,
  milestoneData?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from('user_milestones')
      .select('id')
      .eq('user_id', user.id)
      .eq('milestone_type', milestoneType)
      .maybeSingle();

    if (existing) return;

    await supabase.from('user_milestones').insert({
      user_id: user.id,
      milestone_type: milestoneType,
      milestone_data: milestoneData || {},
    });

    triggerCelebration(milestoneType);
  } catch (err) {
    console.error('Failed to track milestone:', err);
  }
}

export async function trackActivity(
  activityType: ActivityType,
  activityData?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('user_activities').insert({
      user_id: user.id,
      activity_type: activityType,
      activity_data: activityData || {},
    });
  } catch (err) {
    console.error('Failed to track activity:', err);
  }
}

export async function updateUserMetrics(metrics: {
  messages_sent?: number;
  replies_received?: number;
  customers_acquired?: number;
  revenue_earned?: number;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_metrics')
        .update({
          ...metrics,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      await supabase.from('user_metrics').insert({
        user_id: user.id,
        ...metrics,
      });
    }
  } catch (err) {
    console.error('Failed to update metrics:', err);
  }
}

export async function getUserMetrics() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    return data;
  } catch (err) {
    console.error('Failed to get metrics:', err);
    return null;
  }
}

export async function getRecentActivities(limit: number = 5) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  } catch (err) {
    console.error('Failed to get activities:', err);
    return [];
  }
}

export async function getMilestones() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('user_milestones')
      .select('*')
      .eq('user_id', user.id)
      .order('achieved_at', { ascending: false });

    return data || [];
  } catch (err) {
    console.error('Failed to get milestones:', err);
    return [];
  }
}

function triggerCelebration(milestoneType: MilestoneType) {
  const duration = milestoneType === 'first_revenue' ? 5000 : 3000;
  const particleCount = milestoneType === 'first_revenue' ? 200 : 100;

  confetti({
    particleCount,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#2979FF', '#00D4FF', '#FFD700'],
  });

  if (milestoneType === 'first_revenue') {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 250);
  }

  const message = MILESTONE_MESSAGES[milestoneType];
  if (message) {
    setTimeout(() => {
      alert(`🎉 ${message}`);
    }, 500);
  }
}
