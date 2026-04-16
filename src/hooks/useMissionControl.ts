import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DailyReflection {
  id: string;
  rating: number;
  note: string;
  reflection_date: string;
}

interface DashboardPreferences {
  hidden_sections: string[];
  section_order: string[];
  onboarding_completed: boolean;
}

interface DailyPriority {
  id: string;
  title: string;
  completed: boolean;
  priority_date: string;
}

interface BrandData {
  selected_name: string | null;
  logo_url: string | null;
}

interface WebsiteData {
  subdomain: string | null;
}

export function useMissionControl() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [launchDate, setLaunchDate] = useState<Date | null>(null);
  const [priorities, setPriorities] = useState<DailyPriority[]>([]);
  const [todayReflection, setTodayReflection] = useState<DailyReflection | null>(null);
  const [preferences, setPreferences] = useState<DashboardPreferences>({
    hidden_sections: [],
    section_order: [],
    onboarding_completed: false,
  });
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    if (!currentUser) return;

    try {
      const [profileRes, brandRes, websiteRes, prefsRes, prioritiesRes, reflectionRes] =
        await Promise.all([
          supabase
            .from('user_profiles')
            .select('first_name, created_at')
            .eq('user_id', currentUser.id)
            .maybeSingle(),
          supabase
            .from('brand_identity')
            .select('selected_name, logo_url')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('websites')
            .select('subdomain')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('dashboard_preferences')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle(),
          supabase
            .from('daily_priorities')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('priority_date', today)
            .order('created_at', { ascending: true }),
          supabase
            .from('daily_reflections')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('reflection_date', today)
            .maybeSingle(),
        ]);

      if (profileRes.data) {
        const name = profileRes.data.first_name || currentUser.email?.split('@')[0] || '';
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        if (profileRes.data.created_at) {
          setLaunchDate(new Date(profileRes.data.created_at));
        }
      } else {
        const email = currentUser.email || '';
        const name = email.split('@')[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }

      if (brandRes.data) {
        setBrandData(brandRes.data);
        setBusinessName(brandRes.data.selected_name || '');
      }

      if (websiteRes.data) {
        setWebsiteData(websiteRes.data);
      }

      if (prefsRes.data) {
        setPreferences({
          hidden_sections: prefsRes.data.hidden_sections || [],
          section_order: prefsRes.data.section_order || [],
          onboarding_completed: prefsRes.data.onboarding_completed || false,
        });
      }

      setPriorities(prioritiesRes.data || []);
      setTodayReflection(reflectionRes.data || null);
    } catch (err) {
      console.error('Failed to load mission control data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const togglePriority = async (id: string) => {
    const item = priorities.find((p) => p.id === id);
    if (!item) return;

    const updated = !item.completed;
    setPriorities((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completed: updated } : p))
    );

    await supabase
      .from('daily_priorities')
      .update({ completed: updated })
      .eq('id', id);
  };

  const addPriority = async (title: string) => {
    if (!currentUser) return;

    const { data } = await supabase
      .from('daily_priorities')
      .insert({ user_id: currentUser.id, title, priority_date: today })
      .select()
      .maybeSingle();

    if (data) {
      setPriorities((prev) => [...prev, data]);
    }
  };

  const submitReflection = async (rating: number, note: string) => {
    if (!currentUser) return;

    const { data } = await supabase
      .from('daily_reflections')
      .upsert(
        { user_id: currentUser.id, rating, note, reflection_date: today },
        { onConflict: 'user_id,reflection_date' }
      )
      .select()
      .maybeSingle();

    if (data) {
      setTodayReflection(data);
    }
  };

  const completeOnboarding = async () => {
    if (!currentUser) return;

    await supabase
      .from('dashboard_preferences')
      .upsert(
        {
          user_id: currentUser.id,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    setPreferences((prev) => ({ ...prev, onboarding_completed: true }));
  };

  return {
    loading,
    userName,
    businessName,
    launchDate,
    priorities,
    todayReflection,
    preferences,
    brandData,
    websiteData,
    togglePriority,
    addPriority,
    submitReflection,
    completeOnboarding,
  };
}
