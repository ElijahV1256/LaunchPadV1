import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProgressData {
  ideaName: string;
  currentStage: string;
  stageName: string;
  link: string;
  isComplete: boolean;
}

export function useLastProgress() {
  const { currentUser } = useAuth();
  const [lastProgress, setLastProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const load = async () => {
      try {
        const { data: ideas } = await supabase
          .from('business_ideas')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!ideas || ideas.length === 0) return;

        const latestIdea = ideas[0];
        const ideaKey = latestIdea.idea_id;

        const [brandData, storyBrandData, firstRevenueData, marketingData, websiteData, roadmapData] =
          await Promise.all([
            supabase.from('brand_identity').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
            supabase.from('storybrand_roadmap').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
            supabase.from('first_dollar').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
            supabase.from('marketing_assets').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
            supabase.from('websites').select('*').eq('user_id', currentUser.id).eq('idea_key', ideaKey).maybeSingle(),
            supabase.from('roadmaps').select('*').eq('user_id', currentUser.id).eq('idea_id', ideaKey).maybeSingle(),
          ]);

        const brandComplete = brandData.data && brandData.data.selected_name && brandData.data.brand_colors && brandData.data.logo_data?.selected;
        const storyBrandComplete = storyBrandData.data && storyBrandData.data.completed && storyBrandData.data.stages &&
          storyBrandData.data.completed.length === storyBrandData.data.stages.reduce((acc: number, s: { steps: string[] }) => acc + s.steps.length, 0) &&
          storyBrandData.data.completed.length > 0;
        const firstRevenueComplete = firstRevenueData.data && firstRevenueData.data.completed && firstRevenueData.data.completed.length >= 5;
        const marketingComplete = marketingData.data && marketingData.data.completed_steps && marketingData.data.completed_steps.length >= 4;
        const websiteComplete = websiteData.data && websiteData.data.completed_steps && websiteData.data.completed_steps.length >= 5;

        const hasAnyProgress = brandData.data || storyBrandData.data || firstRevenueData.data || marketingData.data || websiteData.data || roadmapData.data;
        if (!hasAnyProgress) return;

        let currentStage: string, stageName: string, link: string, isComplete = false;

        if (!brandComplete) {
          currentStage = 'Brand Identity'; stageName = 'Brand Identity'; link = `/brand-identity?ideaKey=${ideaKey}`;
        } else if (!storyBrandComplete) {
          currentStage = 'StoryBrand Roadmap'; stageName = 'StoryBrand Roadmap'; link = `/storybrand-roadmap?ideaKey=${ideaKey}`;
        } else if (!firstRevenueComplete) {
          currentStage = 'First Dollar'; stageName = 'Get Your First Dollar'; link = `/first-revenue?ideaKey=${ideaKey}`;
        } else if (!marketingComplete) {
          currentStage = 'Marketing Assets'; stageName = 'Marketing Assets'; link = `/marketing-assets?ideaKey=${ideaKey}`;
        } else if (!websiteComplete) {
          currentStage = 'Book Discovery Call'; stageName = 'Book Discovery Call'; link = `/website?ideaKey=${ideaKey}`;
        } else {
          currentStage = 'Completed'; stageName = 'All stages complete!'; link = `/roadmap/${ideaKey}`; isComplete = true;
        }

        setLastProgress({ ideaName: latestIdea.name, currentStage, stageName, link, isComplete });
      } catch (err) {
        console.error('Failed to load last progress:', err);
      }
    };

    load();
  }, [currentUser]);

  return lastProgress;
}
