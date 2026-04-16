import { motion } from 'framer-motion';
import { Loader2, Rocket } from 'lucide-react';
import { useMissionControl } from '../hooks/useMissionControl';
import { INTEGRATIONS } from '../data/mission-control';
import MCNav from '../components/mission-control/MCNav';
import MCGreeting from '../components/mission-control/MCGreeting';
import MCQuickStats from '../components/mission-control/MCQuickStats';
import MCPriorities from '../components/mission-control/MCPriorities';
import MCAttention from '../components/mission-control/MCAttention';
import MCDailyLaunch from '../components/mission-control/MCDailyLaunch';
import MCQuickActions from '../components/mission-control/MCQuickActions';
import MCCommunity from '../components/mission-control/MCCommunity';
import MCIntegrations from '../components/mission-control/MCIntegrations';
import MCBusinessSnapshot from '../components/mission-control/MCBusinessSnapshot';
import MCReflection from '../components/mission-control/MCReflection';
import MCOnboardingTour from '../components/mission-control/MCOnboardingTour';

export default function MissionControl() {
  const {
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
  } = useMissionControl();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#2979FF]/10 flex items-center justify-center">
              <Loader2 className="text-[#2979FF] animate-spin" size={32} />
            </div>
            <div className="absolute -inset-3 rounded-3xl bg-[#2979FF]/5 animate-pulse" />
          </div>
          <p className="text-gray-500 text-sm">Loading Mission Control...</p>
        </motion.div>
      </div>
    );
  }

  const showOnboarding = !preferences.onboarding_completed;

  return (
    <div className="min-h-screen bg-[#060d19]">
      {showOnboarding && <MCOnboardingTour onComplete={completeOnboarding} />}

      <MCNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-5">
        <MCGreeting
          userName={userName}
          businessName={businessName}
          launchDate={launchDate}
        />

        <MCQuickStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <MCPriorities
            priorities={priorities}
            onToggle={togglePriority}
            onAdd={addPriority}
          />
          <MCAttention />
        </div>

        <MCDailyLaunch />

        <MCQuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <MCCommunity />
          </div>
          <MCBusinessSnapshot
            businessName={businessName}
            logoUrl={brandData?.logo_url || null}
            websiteSubdomain={websiteData?.subdomain || null}
          />
        </div>

        <MCIntegrations integrations={INTEGRATIONS} />

        <div className="max-w-md mx-auto">
          <MCReflection
            todayReflection={todayReflection}
            onSubmit={submitReflection}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 pt-4"
        >
          <Rocket size={14} className="text-gray-700" />
          <p className="text-gray-700 text-xs">Mission Control by Launch Pad</p>
        </motion.div>
      </div>
    </div>
  );
}
