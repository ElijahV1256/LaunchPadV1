import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Rocket,
  CheckCircle2,
  XCircle,
  Users,
  BarChart3,
  Zap,
  Target,
  Calendar,
  Star,
  ChevronRight,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { platforms, PlatformData } from '../data/playbook/platforms';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'w-6 h-6'}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.84 4.84 0 01-1-.11z" />
  </svg>
);

const platformIconMap: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-6 h-6" />,
  facebook: <Facebook className="w-6 h-6" />,
  tiktok: <TikTokIcon className="w-6 h-6" />,
  youtube: <Youtube className="w-6 h-6" />,
  linkedin: <Linkedin className="w-6 h-6" />,
  twitter: <Twitter className="w-6 h-6" />,
};

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45 }}
      className={`bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ icon: Icon, title, color }: { icon: typeof Target; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon size={20} />
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-white font-['Montserrat']">{title}</h2>
    </div>
  );
}

export default function PlatformPlaybook() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<PlatformData | null>(null);

  useEffect(() => {
    const found = platforms.find((p) => p.slug === slug);
    if (!found) {
      navigate('/playbook');
      return;
    }
    setPlatform(found);

    const stored = localStorage.getItem('playbook_viewed_platforms');
    const viewed: string[] = stored ? JSON.parse(stored) : [];
    if (!viewed.includes(found.slug)) {
      viewed.push(found.slug);
      localStorage.setItem('playbook_viewed_platforms', JSON.stringify(viewed));
    }

    window.scrollTo(0, 0);
  }, [slug, navigate]);

  if (!platform) return null;

  const currentIndex = platforms.findIndex((p) => p.slug === slug);
  const nextPlatform = platforms[(currentIndex + 1) % platforms.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0F2340]">
      <nav className="sticky top-0 z-50 bg-[#0A192F]/90 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/playbook')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Playbook</span>
            </button>
            <div className="flex items-center gap-2">
              <Rocket className="text-[#2979FF]" size={24} />
              <span className="text-lg font-bold text-white font-['Montserrat']">Launch Pad</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: platform.color }}>
              {platformIconMap[platform.icon]}
              <span className="hidden sm:inline font-semibold text-sm">{platform.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute top-10 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-15"
            style={{ backgroundColor: platform.color }}
          />
        </div>
        <div className="relative container mx-auto px-6 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
              style={{ backgroundColor: platform.colorLight, color: platform.color }}
            >
              {platformIconMap[platform.icon]}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white font-['Montserrat'] mb-3">
              {platform.name}
            </h1>
            <p className="text-xl md:text-2xl font-medium" style={{ color: platform.color }}>
              {platform.tagline}
            </p>
          </motion.div>
        </div>
      </header>

      <div className="container mx-auto px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="grid md:grid-cols-2 gap-5">
            <SectionCard>
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2 className="text-emerald-400" size={22} />
                <h2 className="text-lg font-bold text-white font-['Montserrat']">Best For</h2>
              </div>
              <ul className="space-y-3">
                {platform.bestFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-emerald-400 rounded-full" />
                    <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-2 mb-5">
                <XCircle className="text-red-400" size={22} />
                <h2 className="text-lg font-bold text-white font-['Montserrat']">NOT Best For</h2>
              </div>
              <ul className="space-y-3">
                {platform.notFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-red-400 rounded-full" />
                    <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <SectionCard>
            <SectionTitle icon={Users} title="Who This Platform Is Best For" color={platform.color} />
            <div className="grid sm:grid-cols-2 gap-3">
              {platform.whoIsItFor.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
                  <CheckCircle2 size={16} style={{ color: platform.color }} />
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle icon={BarChart3} title="Content Mix (Weekly Breakdown)" color={platform.color} />
            <div className="space-y-4">
              {platform.contentMix.map((item, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">{item.type}</h3>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                    >
                      {item.frequency}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle icon={Zap} title="The Formula: Hook → Value → CTA" color={platform.color} />
            <div className="space-y-4">
              {[
                { label: 'Hook', emoji: '1', text: platform.formula.hook },
                { label: 'Value', emoji: '2', text: platform.formula.content },
                { label: 'CTA', emoji: '3', text: platform.formula.cta },
              ].map((part, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                  >
                    {part.emoji}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">{part.label}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{part.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle icon={Target} title="Lead Generation Strategy" color={platform.color} />
            <div className="space-y-4">
              {platform.leadGenSteps.map((step) => (
                <div key={step.step} className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2"
                    style={{ borderColor: platform.color, color: platform.color }}
                  >
                    {step.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-white font-semibold mb-1">{step.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle icon={Calendar} title="Posting Cadence" color={platform.color} />
            <div className="space-y-2">
              {platform.postingCadence.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] rounded-xl px-5 py-3.5"
                >
                  <span className="text-white font-semibold text-sm w-28 flex-shrink-0">{item.day}</span>
                  <div className="w-px h-5 bg-white/10" />
                  <span className="text-gray-400 text-sm">{item.content}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${platform.color}15, ${platform.color}08)`,
              border: `1px solid ${platform.color}30`,
            }}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} style={{ color: platform.color }} />
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: platform.color }}>
                  30-Day Kickstart Plan
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white font-['Montserrat'] mb-6">
                Your First Month on {platform.name}
              </h2>

              <div className="space-y-6">
                {platform.kickstartPlan.map((week, wIdx) => (
                  <div key={wIdx}>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: `${platform.color}25`, color: platform.color }}
                      >
                        {wIdx + 1}
                      </div>
                      <h3 className="text-white font-bold text-lg">{week.week}</h3>
                    </div>
                    <div className="ml-11 space-y-2">
                      {week.tasks.map((task, tIdx) => (
                        <div key={tIdx} className="flex items-start gap-3">
                          <div
                            className="flex-shrink-0 w-5 h-5 mt-0.5 rounded border flex items-center justify-center"
                            style={{ borderColor: `${platform.color}40` }}
                          >
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: `${platform.color}60` }} />
                          </div>
                          <span className="text-gray-300 text-sm leading-relaxed">{task}</span>
                        </div>
                      ))}
                    </div>
                    {wIdx < platform.kickstartPlan.length - 1 && (
                      <div className="ml-[18px] mt-3 h-4 border-l-2 border-dashed" style={{ borderColor: `${platform.color}20` }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2979FF]/10 to-transparent" />
            <div className="relative border border-[#2979FF]/20 rounded-2xl p-8 md:p-10 text-center">
              <Star className="text-[#2979FF] mx-auto mb-4" size={36} />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#2979FF] mb-3">
                The One Rule That Beats Every Tactic
              </h2>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white font-['Montserrat'] mb-4">
                {platform.oneRule.title}
              </h3>
              <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto text-lg">
                {platform.oneRule.description}
              </p>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
            <button
              onClick={() => navigate('/playbook')}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-all font-medium"
            >
              <ArrowLeft size={18} />
              Back to Playbook
            </button>
            <button
              onClick={() => navigate(`/playbook/${nextPlatform.slug}`)}
              className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 transition-all font-semibold"
            >
              Next: {nextPlatform.name}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
