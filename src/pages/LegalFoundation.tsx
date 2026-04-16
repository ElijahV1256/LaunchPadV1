import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  ChevronRight,
  Shield,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Building2,
  FileCheck,
  Hash,
  Landmark,
  ShieldCheck,
  ScrollText,
  Loader2,
  Star,
  Users,
  Award,
  Rocket,
} from 'lucide-react';
import { LEGAL_STEPS, NORTHWEST_LINK } from '../data/legal-steps';
import { useLegalProgress } from '../components/legal/useLegalProgress';

const ICON_MAP: Record<string, React.ElementType> = {
  building: Building2,
  'file-check': FileCheck,
  hash: Hash,
  landmark: Landmark,
  'shield-check': ShieldCheck,
  'scroll-text': ScrollText,
};

export default function LegalFoundation() {
  const navigate = useNavigate();
  const { completedSteps, loading } = useLegalProgress();
  const completedCount = completedSteps.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#06D6A0]/10 flex items-center justify-center">
              <Loader2 className="text-[#06D6A0] animate-spin" size={32} />
            </div>
            <div className="absolute -inset-3 rounded-3xl bg-[#06D6A0]/5 animate-pulse" />
          </div>
          <p className="text-gray-500 text-sm">Loading your legal checklist...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d19]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 pb-20">

        <nav className="flex items-center gap-1.5 text-sm mb-10">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
            <Home size={14} />
            Dashboard
          </button>
          <ChevronRight size={13} className="text-gray-700" />
          <span className="text-gray-300 font-medium">Legal</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#06D6A0]/[0.06] via-transparent to-[#2979FF]/[0.04] p-8 sm:p-10 mb-10"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#06D6A0]/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2979FF]/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#06D6A0]/15 flex items-center justify-center">
                <Shield className="text-[#06D6A0]" size={22} />
              </div>
              <div>
                <p className="text-[#06D6A0] text-xs font-semibold tracking-wider uppercase">Legal Foundation</p>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3 max-w-lg leading-tight">
              Make Your Business Legal
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
              The step-by-step path from idea to legit business -- without the legal headaches.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href={NORTHWEST_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#06D6A0] text-[#060d19] rounded-xl text-sm font-bold hover:bg-[#05c490] transition-all shadow-lg shadow-[#06D6A0]/15"
              >
                Start My LLC with Northwest Registered Agent
                <ExternalLink size={15} />
              </a>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  4.8 stars
                </span>
                <span className="flex items-center gap-1">
                  <Users size={13} />
                  100K+ formed
                </span>
                <span className="flex items-center gap-1">
                  <Award size={13} />
                  BBB A+
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {completedCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">Your progress</p>
              <p className="text-gray-500 text-sm">{completedCount} of {LEGAL_STEPS.length} complete</p>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#06D6A0] to-[#2979FF] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / LEGAL_STEPS.length) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {LEGAL_STEPS.map((step, i) => {
            const Icon = ICON_MAP[step.icon] || Building2;
            const isDone = completedSteps.includes(step.key);

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <motion.button
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  onClick={() => navigate(step.path)}
                  className="group relative w-full text-left rounded-2xl border overflow-hidden transition-all duration-300 h-full"
                  style={{
                    background: isDone
                      ? `linear-gradient(135deg, ${step.color}10 0%, transparent 100%)`
                      : 'rgba(255,255,255,0.015)',
                    borderColor: isDone ? `${step.color}25` : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${step.color}12` }}
                      >
                        <Icon size={20} style={{ color: step.color }} />
                      </div>
                      {isDone ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <CheckCircle2 size={18} className="text-emerald-400" />
                        </motion.div>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[11px] font-bold text-gray-500">
                          {step.number}
                        </span>
                      )}
                    </div>

                    <h3 className="text-white font-bold text-[15px] mb-1.5 leading-snug">{step.title}</h3>
                    <p className="text-gray-500 text-[13px] leading-relaxed mb-5">{step.description}</p>

                    <div
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                      style={{
                        backgroundColor: `${step.color}12`,
                        color: step.color,
                      }}
                    >
                      {isDone ? 'Review' : 'Start Step'}
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/10 bg-gradient-to-r from-[#06D6A0]/[0.05] to-transparent p-6 sm:p-8"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#06D6A0]/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

          <div className="relative">
            <h3 className="text-white font-bold text-lg mb-2">How Much Does It Actually Cost?</h3>
            <p className="text-gray-500 text-sm mb-6">Transparent breakdown -- no hidden fees.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Northwest formation fee', value: '$39', note: 'One-time' },
                { label: 'State filing fee', value: '$50 - $500', note: 'Varies by state' },
                { label: 'EIN from IRS', value: 'Free', note: 'Do it yourself' },
                { label: 'Operating agreement', value: 'Included', note: 'With Northwest' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div>
                    <p className="text-white text-sm font-medium">{item.label}</p>
                    <p className="text-gray-600 text-xs">{item.note}</p>
                  </div>
                  <span className={`text-sm font-bold ${item.value === 'Free' || item.value === 'Included' ? 'text-emerald-400' : 'text-white'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-10"
        >
          <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-5 px-6 py-6 rounded-2xl border border-[#2979FF]/10 bg-gradient-to-r from-[#2979FF]/[0.06] to-transparent hover:border-[#2979FF]/20 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2979FF]/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="w-12 h-12 bg-[#2979FF]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Rocket size={24} className="text-[#2979FF]" />
            </div>
            <div className="flex-1 min-w-0 relative">
              <h3 className="text-white font-bold text-base mb-1">Ready for Mission Control?</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your daily command center -- track stats, manage priorities, and run your business from one dashboard.
              </p>
            </div>
            <button
              onClick={() => navigate('/mission-control')}
              className="relative flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-xl text-sm font-semibold hover:bg-[#3d88ff] transition-all shadow-lg shadow-[#2979FF]/15 whitespace-nowrap group/btn"
            >
              Open Mission Control
              <ArrowRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>

        <p className="text-center text-gray-600 text-[11px] mt-10">
          Some links in this section are affiliate partnerships. We only recommend tools we trust.
        </p>
      </div>
    </div>
  );
}
