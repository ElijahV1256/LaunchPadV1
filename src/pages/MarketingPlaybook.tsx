import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Target,
  Zap,
  MessageSquare,
  Lightbulb,
  Calendar,
  Users,
  CheckCircle2,
  Star,
  ArrowDown,
  Shield,
  X,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { foundationSections, introSection } from '../data/playbook/foundation';
import type { FoundationSection } from '../data/playbook/foundation';
import { platforms } from '../data/playbook/platforms';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.84 4.84 0 01-1-.11z" />
  </svg>
);

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-8 h-8" />,
  facebook: <Facebook className="w-8 h-8" />,
  tiktok: <TikTokIcon />,
  youtube: <Youtube className="w-8 h-8" />,
  linkedin: <Linkedin className="w-8 h-8" />,
  twitter: <Twitter className="w-8 h-8" />,
};

const sectionIcons: Record<string, typeof Target> = {
  'core-formula': Zap,
  'content-framework': MessageSquare,
  'hook-templates': Lightbulb,
  '90-day-plan': Calendar,
  'lead-capture': Target,
  'one-rule': Star,
};

function SectionDivider({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mb-16"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#2979FF]/30" />
        <span className="text-[#2979FF] font-semibold text-sm uppercase tracking-widest">{label}</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#2979FF]/30" />
      </div>
    </motion.div>
  );
}

function FoundationCard({ section }: { section: FoundationSection }) {
  const Icon = sectionIcons[section.id] || Target;

  if (section.id === 'one-rule') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#2979FF]/10 to-transparent" />
        <div className="relative border border-[#2979FF]/20 rounded-2xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-xl flex items-center justify-center">
              <Star className="text-[#2979FF]" size={22} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white font-['Montserrat']">
              {section.title}
            </h3>
          </div>

          {section.paragraphs?.map((p, i) => (
            <p key={i} className={`leading-relaxed text-[15px] ${i === 0 ? 'text-2xl md:text-3xl font-extrabold text-white font-[\'Montserrat\'] mb-4' : 'text-gray-300 mb-4'}`}>
              {p}
            </p>
          ))}

          {section.items && (
            <div className="grid sm:grid-cols-2 gap-3 my-6">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.05] border border-white/[0.08] rounded-xl p-4">
                  <CheckCircle2 className="text-[#2979FF] flex-shrink-0" size={18} />
                  <span className="text-white font-medium text-sm">{item.title}</span>
                </div>
              ))}
            </div>
          )}

          {section.callout && (
            <div className="mt-6 text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-white font-['Montserrat'] mb-2">
                {section.callout.title}
              </p>
              {section.callout.body.map((line, i) => (
                <p key={i} className="text-xl text-[#2979FF] font-semibold">{line}</p>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 md:p-8 hover:border-[#2979FF]/20 transition-colors"
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="flex-shrink-0 w-12 h-12 bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-xl flex items-center justify-center">
          <Icon className="text-[#2979FF]" size={22} />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white font-['Montserrat']">
            {section.title}
          </h3>
          {section.subtitle && (
            <p className="text-gray-400 font-medium mt-1 text-[15px]">{section.subtitle}</p>
          )}
        </div>
      </div>

      {section.formula && (
        <div className="bg-gradient-to-r from-[#2979FF]/10 to-teal-500/10 border border-[#2979FF]/20 rounded-xl p-5 mb-5">
          <p className="text-white font-mono text-sm md:text-base font-semibold text-center leading-relaxed">
            {section.formula}
          </p>
        </div>
      )}

      {section.formulaPlain && (
        <p className="text-gray-300 leading-relaxed mb-4 text-[15px] italic">{section.formulaPlain}</p>
      )}

      {section.questions && (
        <div className="mb-4">
          <p className="text-gray-300 text-[15px] mb-3">Every piece of content you make should answer at least one of these questions for your ideal customer:</p>
          <div className="space-y-2">
            {section.questions.map((q, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.05] rounded-lg p-3">
                <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-[#2979FF] rounded-full" />
                <span className="text-gray-300 text-sm">{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {section.paragraphs?.map((p, i) => (
        <p key={i} className={`leading-relaxed mb-4 text-[15px] ${section.id === 'content-framework' && i === 0 ? 'text-xl font-bold text-[#2979FF]' : section.id === 'lead-capture' && i === 0 ? 'text-lg font-bold text-white' : 'text-gray-300'}`}>
          {p}
        </p>
      ))}

      {section.items && (
        <div className={`grid gap-3 mt-4 ${section.items.length > 4 && !section.numbered ? 'md:grid-cols-2' : ''}`}>
          {section.items.map((item, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-start gap-3">
                {section.numbered ? (
                  <span className="flex-shrink-0 w-8 h-8 bg-[#2979FF]/15 text-[#2979FF] rounded-lg flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                ) : (
                  <div className="flex-shrink-0 w-1.5 h-1.5 mt-2.5 bg-[#2979FF] rounded-full" />
                )}
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {section.numbered ? `"${item.title}"` : item.title}
                  </h4>
                  {item.description && (
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  )}
                  {item.example && (
                    <p className="text-gray-500 text-xs mt-2 italic">
                      Example: "{item.example}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {section.phases && (
        <div className="space-y-6 mt-4">
          {section.phases.map((phase, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#2979FF]/15 text-[#2979FF] rounded-lg flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <h4 className="text-white font-bold text-lg">{phase.title}</h4>
              </div>
              {phase.description && (
                <p className="text-gray-300 text-sm leading-relaxed ml-[52px] mb-3">{phase.description}</p>
              )}
              {phase.bullets && (
                <div className="ml-[52px] space-y-2">
                  {phase.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.05] rounded-lg p-3">
                      <ChevronRight className="text-[#2979FF] flex-shrink-0 mt-0.5" size={14} />
                      <span className="text-gray-400 text-sm">{bullet}</span>
                    </div>
                  ))}
                </div>
              )}
              {i < section.phases!.length - 1 && (
                <div className="ml-[18px] mt-3 h-4 border-l-2 border-dashed border-[#2979FF]/20" />
              )}
            </div>
          ))}
        </div>
      )}

      {section.funnelSteps && (
        <div className="space-y-0 mt-4">
          {section.funnelSteps.map((step, i) => (
            <div key={i}>
              <div className="flex items-start gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#2979FF]/15 text-[#2979FF] rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed pt-1">{step}</p>
              </div>
              {i < section.funnelSteps!.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="text-[#2979FF]/30" size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {section.callout && (
        <div className="mt-6 bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-xl p-5 text-center">
          <p className="text-white font-bold text-lg">{section.callout.title}</p>
          {section.callout.body.map((line, i) => (
            <p key={i} className="text-gray-300 text-sm mt-1">{line}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function MarketingPlaybook() {
  const navigate = useNavigate();
  const [viewedPlatforms, setViewedPlatforms] = useState<Set<string>>(new Set());
  const [showLegalPopup, setShowLegalPopup] = useState(false);
  const foundationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('playbook_viewed_platforms');
    if (stored) {
      setViewedPlatforms(new Set(JSON.parse(stored)));
    }
  }, []);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('legal_popup_dismissed');
    if (dismissed) return;
    const timer = setTimeout(() => setShowLegalPopup(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0F2340]">
      <nav className="sticky top-0 z-50 bg-[#0A192F]/90 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-2">
              <Rocket className="text-[#2979FF]" size={24} />
              <span className="text-lg font-bold text-white font-['Montserrat']">Launch Pad</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <BookOpen size={16} />
              <span className="hidden sm:inline">{viewedPlatforms.size}/6 viewed</span>
            </div>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#2979FF]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-6 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-full text-[#2979FF] text-sm font-medium mb-6">
              <BookOpen size={16} />
              Premium Resource
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white font-['Montserrat'] mb-6 leading-tight">
              The Launchpad<br />Marketing Playbook
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              How to Generate Real Leads on Social Media &mdash; Without Guessing, Gimmicks, or Wasting Money
            </p>
            <button
              onClick={() => foundationRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-all"
            >
              Start Reading
              <ChevronRight size={18} />
            </button>
          </motion.div>
        </div>
      </header>

      <div ref={foundationRef} className="container mx-auto px-6 pb-24">
        <div className="max-w-4xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 md:p-8 mb-12"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                <Target className="text-red-400" size={22} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white font-['Montserrat'] pt-2">
                {introSection.title}
              </h3>
            </div>

            {introSection.paragraphs.map((p, i) => (
              <p key={i} className={`leading-relaxed mb-4 text-[15px] ${i === 1 ? 'text-xl font-bold text-white' : 'text-gray-300'}`}>
                {p}
              </p>
            ))}

            <p className="text-gray-300 text-[15px] mb-3">Your job on social media is simple:</p>
            <div className="space-y-2 mb-5">
              {introSection.threeThings.map((thing, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                  <span className="flex-shrink-0 w-7 h-7 bg-[#2979FF]/15 text-[#2979FF] rounded-lg flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-white font-medium text-sm pt-0.5">{thing}</span>
                </div>
              ))}
            </div>

            <p className="text-[#2979FF] font-bold text-lg">{introSection.closing}</p>
          </motion.div>

          <SectionDivider label="The Foundation" />

          <div className="space-y-12">
            {foundationSections.map((section) => (
              <FoundationCard key={section.id} section={section} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-24 mb-6"
          >
            <SectionDivider label="Pick Your Platform" />
            <h2 className="text-3xl md:text-4xl font-bold text-white font-['Montserrat'] text-center mb-2">
              Platform Playbooks
            </h2>
            <p className="text-gray-400 text-center text-lg mb-4">
              Click any platform below to get the full playbook
            </p>
            <p className="text-center text-sm text-gray-500 mb-10">
              The question isn&rsquo;t whether this works. The question is: are you going to do it?
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {platforms.map((platform, idx) => {
              const isViewed = viewedPlatforms.has(platform.slug);
              return (
                <motion.button
                  key={platform.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  onClick={() => navigate(`/playbook/${platform.slug}`)}
                  className="group relative text-left bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300"
                >
                  {isViewed && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="text-emerald-400" size={18} />
                    </div>
                  )}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                    style={{ backgroundColor: platform.colorLight, color: platform.color }}
                  >
                    {platformIcons[platform.icon]}
                  </div>
                  <h3 className="text-lg font-bold text-white font-['Montserrat'] mb-1">
                    {platform.name}
                  </h3>
                  <p className="text-sm font-medium mb-4" style={{ color: platform.color }}>
                    {platform.tagline}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-white transition-colors">
                    <span>View Playbook</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-16"
          >
            <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-5 px-6 py-6 rounded-2xl border border-[#06D6A0]/10 bg-gradient-to-r from-[#06D6A0]/[0.06] to-transparent hover:border-[#06D6A0]/20 transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="w-12 h-12 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Shield className="text-[#06D6A0]" size={24} />
              </div>
              <div className="flex-1 min-w-0 relative">
                <h3 className="text-white font-bold text-base mb-1">Make Your Business Legal</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Form your LLC, get an EIN, and legally set up your business — step by step.
                </p>
              </div>
              <button
                onClick={() => navigate('/legal')}
                className="relative flex items-center gap-2 px-6 py-3 bg-[#06D6A0] text-[#060d19] rounded-xl text-sm font-semibold hover:bg-[#05c490] transition-all shadow-lg shadow-[#06D6A0]/15 whitespace-nowrap group/btn"
              >
                Start Legal Setup
                <ArrowRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showLegalPopup && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-2xl"
          >
            <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5 rounded-2xl border border-[#06D6A0]/15 bg-[#0c1e30]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
              <button
                onClick={() => {
                  setShowLegalPopup(false);
                  sessionStorage.setItem('legal_popup_dismissed', 'true');
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#06D6A0]/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="w-11 h-11 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="text-[#06D6A0]" size={22} />
              </div>
              <div className="flex-1 min-w-0 relative pr-4">
                <h3 className="text-white font-bold text-sm mb-0.5">Make Your Business Legal</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Form your LLC, get an EIN, and set up your business the right way.
                </p>
              </div>
              <button
                onClick={() => navigate('/legal')}
                className="relative flex items-center gap-2 px-5 py-2.5 bg-[#06D6A0] text-[#060d19] rounded-xl text-sm font-semibold hover:bg-[#05c490] transition-all shadow-lg shadow-[#06D6A0]/15 whitespace-nowrap group/btn"
              >
                Start Legal Setup
                <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
