import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import LegalStepLayout from '../../components/legal/LegalStepLayout';
import { useLegalProgress } from '../../components/legal/useLegalProgress';
import { NEXT_INSURANCE_LINK, THIMBLE_LINK } from '../../data/legal-steps';

const INSURANCE_TYPES = [
  {
    name: 'General Liability',
    description: 'Covers third-party injuries, property damage, and advertising claims. This is the most common policy for small businesses.',
    needed: 'Almost every business needs this.',
  },
  {
    name: 'Professional Liability (E&O)',
    description: 'Protects against claims of negligence, mistakes, or failure to deliver professional services.',
    needed: 'Consultants, freelancers, and service-based businesses.',
  },
  {
    name: 'Business Owner\'s Policy (BOP)',
    description: 'Bundles general liability with property insurance at a discount. Great value if you have equipment or a physical location.',
    needed: 'Businesses with inventory, equipment, or an office.',
  },
  {
    name: 'Workers\' Compensation',
    description: 'Covers employee injuries and illnesses on the job. Required by law in most states once you hire employees.',
    needed: 'Required if you have employees.',
  },
];

const PROVIDERS = [
  {
    name: 'Next Insurance',
    link: NEXT_INSURANCE_LINK,
    tagline: 'Best overall for small businesses',
    color: '#2979FF',
    features: [
      'Policies starting around $30/month',
      'Instant certificate of insurance',
      'Tailored by industry',
      'Easy online claims process',
    ],
    bestFor: 'Most small businesses. Wide coverage options with industry-specific plans.',
  },
  {
    name: 'Thimble',
    link: THIMBLE_LINK,
    tagline: 'Best for flexible, on-demand coverage',
    color: '#E1306C',
    features: [
      'Pay by the hour, day, or month',
      'No long-term commitments',
      'Instant proof of insurance',
      'Great for project-based work',
    ],
    bestFor: 'Freelancers and businesses that need flexible or short-term coverage.',
  },
];

export default function BusinessInsurance() {
  const { completedSteps, loading, markComplete } = useLegalProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center">
        <Loader2 className="text-[#E1306C] animate-spin" size={32} />
      </div>
    );
  }

  return (
    <LegalStepLayout stepKey="insurance" completedSteps={completedSteps} onMarkComplete={markComplete}>
      <div className="space-y-8">

        <div>
          <h2 className="text-white font-bold text-lg mb-1">Why Business Insurance Matters</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your LLC protects your personal assets from business debts. Insurance protects your business itself. Even a single lawsuit or accident can wipe out a small business without coverage.
          </p>
        </div>

        <div className="rounded-xl border border-[#E1306C]/15 bg-[#E1306C]/[0.04] p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-[#E1306C] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">Many clients require it</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Before hiring you, many clients, landlords, and platforms will ask for a Certificate of Insurance (COI). Having coverage ready shows you're professional and prepared.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-1">Types of Business Insurance</h2>
          <p className="text-gray-500 text-sm mb-5">Here are the most common types. You may need one or several depending on your business.</p>

          <div className="space-y-3">
            {INSURANCE_TYPES.map((type, i) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck size={16} className="text-[#E1306C] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">{type.name}</p>
                    <p className="text-gray-500 text-sm leading-relaxed mb-2">{type.description}</p>
                    <p className="text-gray-400 text-xs">
                      <span className="text-gray-300 font-medium">Who needs it: </span>{type.needed}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-1">Recommended Providers</h2>
          <p className="text-gray-500 text-sm mb-5">Both offer fast online quotes and instant certificates.</p>

          <div className="space-y-4">
            {PROVIDERS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border overflow-hidden"
                style={{
                  borderColor: `${p.color}20`,
                  background: `linear-gradient(135deg, ${p.color}06 0%, transparent 100%)`,
                }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck size={16} style={{ color: p.color }} />
                        <h3 className="text-white font-bold text-base">{p.name}</h3>
                      </div>
                      <p className="text-gray-500 text-sm">{p.tagline}</p>
                    </div>
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={{ backgroundColor: `${p.color}15`, color: p.color }}
                    >
                      Get Quote
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-gray-400 text-sm">
                        <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <p className="text-gray-500 text-sm pt-3 border-t border-white/[0.05]">
                    <span className="text-gray-300 font-medium">Best for: </span>{p.bestFor}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">Start with General Liability</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                If you're not sure what you need, start with a general liability policy. It covers the most common risks and you can always add more coverage later as your business grows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LegalStepLayout>
  );
}
