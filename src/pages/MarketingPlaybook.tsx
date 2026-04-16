import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Target,
  Zap,
  MessageSquare,
  Lightbulb,
  Calendar,
  Users,
  CheckCircle2,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { foundationSections } from '../data/playbook/foundation';
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

const sectionIcons = [Target, Zap, MessageSquare, Lightbulb, Calendar, Users];

export default function MarketingPlaybook() {
  const navigate = useNavigate();
  const [viewedPlatforms, setViewedPlatforms] = useState<Set<string>>(new Set());
  const foundationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('playbook_viewed_platforms');
    if (stored) {
      setViewedPlatforms(new Set(JSON.parse(stored)));
    }
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
              How to Generate Real Leads on Social Media — Without Guessing, Gimmicks, or Wasting Money
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
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#2979FF]/30" />
              <span className="text-[#2979FF] font-semibold text-sm uppercase tracking-widest">Part One</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#2979FF]/30" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-['Montserrat'] text-center mt-4 mb-2">
              The Foundation
            </h2>
            <p className="text-gray-400 text-center text-lg">
              Core frameworks that work on every platform
            </p>
          </motion.div>

          <div className="space-y-12">
            {foundationSections.map((section, idx) => {
              const Icon = sectionIcons[idx % sectionIcons.length];
              return (
                <motion.div
                  key={section.id}
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
                        <p className="text-[#2979FF] font-medium mt-1">{section.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-gray-300 leading-relaxed mb-4 text-[15px]">
                      {paragraph}
                    </p>
                  ))}

                  {section.items && (
                    <div className={`grid gap-3 mt-6 ${section.items.length > 4 ? 'md:grid-cols-2' : ''}`}>
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {section.numbered ? (
                              <span className="flex-shrink-0 w-7 h-7 bg-[#2979FF]/15 text-[#2979FF] rounded-lg flex items-center justify-center text-sm font-bold">
                                {iIdx + 1}
                              </span>
                            ) : (
                              <div className="flex-shrink-0 w-1.5 h-1.5 mt-2.5 bg-[#2979FF] rounded-full" />
                            )}
                            <div>
                              <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                              <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-24 mb-16"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#2979FF]/30" />
              <span className="text-[#2979FF] font-semibold text-sm uppercase tracking-widest">Part Two</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#2979FF]/30" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-['Montserrat'] text-center mt-4 mb-2">
              Platform Playbooks
            </h2>
            <p className="text-gray-400 text-center text-lg">
              Pick your platform and get a step-by-step game plan
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
        </div>
      </div>
    </div>
  );
}
