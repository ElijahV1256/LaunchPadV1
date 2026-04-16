import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building2,
  User,
  Briefcase,
  Loader2,
} from 'lucide-react';
import LegalStepLayout from '../../components/legal/LegalStepLayout';
import { useLegalProgress } from '../../components/legal/useLegalProgress';

const STRUCTURES = [
  {
    name: 'LLC',
    icon: Building2,
    recommended: true,
    color: '#06D6A0',
    pros: [
      'Personal asset protection',
      'Flexible tax options',
      'Simple to set up and maintain',
      'Looks professional to clients',
      'Can add members later',
    ],
    cons: [
      'Small annual state fees',
      'Slightly more paperwork than sole proprietor',
    ],
    bestFor: 'Most new business owners. Offers the best balance of protection and simplicity.',
  },
  {
    name: 'Sole Proprietor',
    icon: User,
    recommended: false,
    color: '#FF6B35',
    pros: [
      'Easiest to start (zero paperwork)',
      'No formation costs',
      'Simple tax filing',
    ],
    cons: [
      'No personal asset protection',
      'Harder to get business credit',
      'Less credible to some clients',
      'You\'re personally liable for everything',
    ],
    bestFor: 'Very small side projects or testing an idea before committing.',
  },
  {
    name: 'S-Corp',
    icon: Briefcase,
    recommended: false,
    color: '#2979FF',
    pros: [
      'Potential tax savings on self-employment tax',
      'Credibility with investors',
      'Pass-through taxation',
    ],
    cons: [
      'Must pay yourself a reasonable salary',
      'More complex bookkeeping required',
      'Stricter IRS requirements',
      'Higher formation and maintenance costs',
    ],
    bestFor: 'Businesses consistently earning $50K+ in profit per year.',
  },
];

export default function LegalStructure() {
  const { completedSteps, loading, markComplete } = useLegalProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center">
        <Loader2 className="text-[#2979FF] animate-spin" size={32} />
      </div>
    );
  }

  return (
    <LegalStepLayout stepKey="structure" completedSteps={completedSteps} onMarkComplete={markComplete}>
      <div className="space-y-8">
        <div className="rounded-xl border border-[#06D6A0]/15 bg-[#06D6A0]/[0.04] p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-[#06D6A0] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">Our recommendation: LLC</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                For most small business owners, an LLC offers the best mix of legal protection, tax flexibility, and simplicity. It's the #1 choice for new businesses in the US.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-1">Compare Your Options</h2>
          <p className="text-gray-500 text-sm mb-6">Each structure has trade-offs. Here's how they stack up.</p>

          <div className="space-y-4">
            {STRUCTURES.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border overflow-hidden"
                  style={{
                    borderColor: s.recommended ? `${s.color}25` : 'rgba(255,255,255,0.06)',
                    background: s.recommended
                      ? `linear-gradient(135deg, ${s.color}08 0%, transparent 100%)`
                      : 'rgba(255,255,255,0.015)',
                  }}
                >
                  {s.recommended && (
                    <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                      Recommended for most businesses
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}12` }}>
                        <Icon size={20} style={{ color: s.color }} />
                      </div>
                      <h3 className="text-white font-bold text-base">{s.name}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
                      <div>
                        <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">Pros</p>
                        <ul className="space-y-1.5">
                          {s.pros.map((pro) => (
                            <li key={pro} className="flex items-start gap-2 text-gray-300 text-sm">
                              <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">Cons</p>
                        <ul className="space-y-1.5">
                          {s.cons.map((con) => (
                            <li key={con} className="flex items-start gap-2 text-gray-400 text-sm">
                              <AlertCircle size={13} className="text-red-400/60 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.05]">
                      <p className="text-gray-500 text-sm">
                        <span className="text-gray-300 font-medium">Best for: </span>
                        {s.bestFor}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[#2979FF]/10 bg-[#2979FF]/[0.03] p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-[#2979FF] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">Not sure? Go with an LLC.</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                You can always convert to an S-Corp later if your profits justify it. An LLC gives you protection from day one and is the easiest to maintain. Ready? Let's form it in the next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LegalStepLayout>
  );
}
