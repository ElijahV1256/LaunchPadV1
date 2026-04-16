import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Landmark,
  Loader2,
} from 'lucide-react';
import LegalStepLayout from '../../components/legal/LegalStepLayout';
import { useLegalProgress } from '../../components/legal/useLegalProgress';
import { BLUEVINE_LINK, MERCURY_LINK, RELAY_LINK } from '../../data/legal-steps';

const REASONS = [
  'Keeps personal and business finances legally separate',
  'Maintains your LLC\'s liability protection',
  'Makes tax filing dramatically simpler',
  'Looks professional on invoices and payments',
  'Required to accept business payments and credit',
  'Easier to track expenses and deductions',
];

const BANKS = [
  {
    name: 'Bluevine',
    link: BLUEVINE_LINK,
    tagline: 'Best for earning interest on your balance',
    color: '#0052FF',
    features: [
      'No monthly fees',
      'Up to 2.0% APY on balances',
      'Free standard wire transfers',
      'Integrates with QuickBooks',
    ],
    bestFor: 'Business owners who want to earn interest on idle cash.',
  },
  {
    name: 'Mercury',
    link: MERCURY_LINK,
    tagline: 'Best for tech-savvy founders',
    color: '#6366F1',
    features: [
      'No monthly fees or minimums',
      'Powerful API and integrations',
      'Team permissions and controls',
      'FDIC insured up to $5M via partner banks',
    ],
    bestFor: 'Founders who want modern banking with strong tech integrations.',
  },
  {
    name: 'Relay',
    link: RELAY_LINK,
    tagline: 'Best for budgeting and profit management',
    color: '#06D6A0',
    features: [
      'No monthly fees, no minimums',
      'Up to 20 separate checking accounts',
      'Built-in profit-first budgeting',
      'Automatic categorization',
    ],
    bestFor: 'Business owners who want to organize money into separate accounts for profit, taxes, and expenses.',
  },
];

const WHAT_YOU_NEED = [
  'Your EIN (from Step 3)',
  'Articles of Organization (from Step 2)',
  'Operating Agreement',
  'Government-issued photo ID',
  'Business address',
];

export default function BusinessBank() {
  const { completedSteps, loading, markComplete } = useLegalProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center">
        <Loader2 className="text-[#1877F2] animate-spin" size={32} />
      </div>
    );
  }

  return (
    <LegalStepLayout stepKey="bank" completedSteps={completedSteps} onMarkComplete={markComplete}>
      <div className="space-y-8">

        <div>
          <h2 className="text-white font-bold text-lg mb-1">Why You Need a Separate Business Account</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            Mixing personal and business money is one of the biggest mistakes new business owners make. It can void your LLC's liability protection and create a tax nightmare.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {REASONS.map((reason) => (
              <div key={reason} className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <CheckCircle2 size={14} className="text-[#1877F2] mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">Important: "Piercing the corporate veil"</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                If you mix personal and business funds, a court can decide your LLC doesn't actually protect your personal assets. This is called "piercing the corporate veil." A separate bank account is your #1 defense.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-1">Recommended Business Banks</h2>
          <p className="text-gray-500 text-sm mb-5">All three are free, online-first, and designed for small businesses.</p>

          <div className="space-y-4">
            {BANKS.map((bank, i) => (
              <motion.div
                key={bank.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border overflow-hidden"
                style={{
                  borderColor: `${bank.color}20`,
                  background: `linear-gradient(135deg, ${bank.color}06 0%, transparent 100%)`,
                }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Landmark size={16} style={{ color: bank.color }} />
                        <h3 className="text-white font-bold text-base">{bank.name}</h3>
                      </div>
                      <p className="text-gray-500 text-sm">{bank.tagline}</p>
                    </div>
                    <a
                      href={bank.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={{ backgroundColor: `${bank.color}15`, color: bank.color }}
                    >
                      Open Account
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {bank.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-gray-400 text-sm">
                        <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <p className="text-gray-500 text-sm pt-3 border-t border-white/[0.05]">
                    <span className="text-gray-300 font-medium">Best for: </span>{bank.bestFor}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h4 className="text-white font-semibold text-sm mb-3">What you'll need to open an account</h4>
          <ul className="space-y-2">
            {WHAT_YOU_NEED.map((item) => (
              <li key={item} className="flex items-center gap-2 text-gray-400 text-sm">
                <CheckCircle2 size={13} className="text-[#1877F2] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </LegalStepLayout>
  );
}
