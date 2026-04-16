import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  MapPin,
  Search,
  ScrollText,
  Loader2,
} from 'lucide-react';
import LegalStepLayout from '../../components/legal/LegalStepLayout';
import { useLegalProgress } from '../../components/legal/useLegalProgress';

const COMMON_LICENSES = [
  {
    name: 'General Business License',
    description: 'Most cities and counties require a basic business license or "business tax certificate" to operate. Fees range from $50-$400/year.',
    level: 'City / County',
  },
  {
    name: 'Professional License',
    description: 'Required for regulated professions like real estate, cosmetology, accounting, healthcare, and legal services.',
    level: 'State',
  },
  {
    name: 'Sales Tax Permit',
    description: 'If you sell physical products (and in some states, certain services), you need a sales tax permit to collect and remit sales tax.',
    level: 'State',
  },
  {
    name: 'Home Occupation Permit',
    description: 'If you run your business from home, many cities require a special permit. This is usually inexpensive and easy to get.',
    level: 'City',
  },
  {
    name: 'Health Department Permit',
    description: 'Required for food service, beauty/personal care, and certain retail businesses.',
    level: 'City / County',
  },
  {
    name: 'DBA / "Doing Business As"',
    description: 'If you operate under a name different from your LLC\'s legal name, you\'ll need to register a DBA (also called a fictitious name).',
    level: 'County / State',
  },
];

const WHERE_TO_CHECK = [
  {
    name: 'Secretary of State',
    description: 'Your state\'s main business filing authority. Handles state-level licenses and business registrations.',
    searchTip: 'Search "[Your State] Secretary of State business"',
  },
  {
    name: 'City / County Clerk',
    description: 'Handles local business licenses, permits, and zoning approvals.',
    searchTip: 'Search "[Your City] business license application"',
  },
  {
    name: 'State Licensing Board',
    description: 'If your profession is regulated, check your state\'s specific licensing board.',
    searchTip: 'Search "[Your State] [profession] license requirements"',
  },
  {
    name: 'SBA License Tool',
    description: 'The U.S. Small Business Administration has a free tool that helps you find federal, state, and local license requirements.',
    searchTip: 'Visit sba.gov/licenses-and-permits',
  },
];

export default function LocalLicenses() {
  const { completedSteps, loading, markComplete } = useLegalProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center">
        <Loader2 className="text-[#8B5CF6] animate-spin" size={32} />
      </div>
    );
  }

  return (
    <LegalStepLayout stepKey="licenses" completedSteps={completedSteps} onMarkComplete={markComplete}>
      <div className="space-y-8">

        <div>
          <h2 className="text-white font-bold text-lg mb-1">Requirements Vary by Location</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            The licenses and permits you need depend on three things: your state, your city/county, and your industry. There's no one-size-fits-all answer, but this guide will help you find exactly what you need.
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">Don't skip this step</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Operating without required licenses can result in fines, forced closure, or legal issues. It's worth spending 30 minutes researching what your specific business needs.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-1">Common Licenses & Permits</h2>
          <p className="text-gray-500 text-sm mb-5">You may need one or more of these depending on your business type.</p>

          <div className="space-y-3">
            {COMMON_LICENSES.map((license, i) => (
              <motion.div
                key={license.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <ScrollText size={16} className="text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">{license.name}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{license.description}</p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 px-2 py-1 rounded-md bg-white/[0.04] text-gray-500 text-[11px] font-medium whitespace-nowrap">
                    {license.level}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-1">Where to Check</h2>
          <p className="text-gray-500 text-sm mb-5">Use these resources to find your specific requirements.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHERE_TO_CHECK.map((source, i) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-[#8B5CF6]" />
                  <p className="text-white font-semibold text-sm">{source.name}</p>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">{source.description}</p>
                <div className="flex items-center gap-1.5 text-[#8B5CF6] text-xs font-medium">
                  <Search size={11} />
                  {source.searchTip}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h4 className="text-white font-semibold text-sm mb-3">Quick Action Checklist</h4>
          <ul className="space-y-2">
            {[
              'Search your state\'s Secretary of State website for state-level requirements',
              'Call or visit your city/county clerk\'s office for local licenses',
              'Check if your profession requires a specific license in your state',
              'Determine if you need a sales tax permit',
              'Check zoning requirements if operating from home',
              'Set calendar reminders for renewal dates',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-400 text-sm">
                <CheckCircle2 size={13} className="text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">You're almost done!</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                This is the last step in making your business legal. Once you've identified and obtained your required licenses, you're fully set up to operate legally and confidently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LegalStepLayout>
  );
}
