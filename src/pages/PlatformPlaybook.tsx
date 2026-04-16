import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Rocket,
  CheckCircle2,
  XCircle,
  BarChart3,
  Zap,
  Target,
  Calendar,
  Star,
  ChevronRight,
  Hash,
  User,
  MessageCircle,
  Lightbulb,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { platforms } from '../data/playbook/platforms';
import type { PlatformData, PlatformSection } from '../data/playbook/platforms';

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

function SectionHeading({ icon: Icon, title, color }: { icon: typeof Target; title: string; color: string }) {
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

function CalloutBox({ callout, color }: { callout: { title: string; body: string[] }; color: string }) {
  return (
    <div
      className="mt-5 rounded-xl p-5 border"
      style={{ backgroundColor: `${color}10`, borderColor: `${color}25` }}
    >
      {callout.title && <p className="text-white font-bold mb-1">{callout.title}</p>}
      {callout.body.map((line, i) => (
        <p key={i} className="text-gray-300 text-sm leading-relaxed">{line}</p>
      ))}
    </div>
  );
}

function renderSection(section: PlatformSection, color: string) {
  switch (section.type) {
    case 'list-grid':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={CheckCircle2} title={section.title} color={color} />
          <div className="grid sm:grid-cols-2 gap-3">
            {section.bullets?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
                <CheckCircle2 size={16} style={{ color }} className="flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
          {section.callout && <CalloutBox callout={section.callout} color={color} />}
        </SectionCard>
      );

    case 'content-mix':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={BarChart3} title={section.title} color={color} />
          <div className="space-y-4">
            {section.contentMix?.map((item, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">{item.type}</h3>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {item.frequency}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          {section.callout && <CalloutBox callout={section.callout} color={color} />}
        </SectionCard>
      );

    case 'formula-steps':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={Zap} title={section.title} color={color} />
          {section.intro && (
            <p className="text-gray-300 text-[15px] leading-relaxed mb-5 italic">{section.intro}</p>
          )}
          <div className="space-y-4">
            {section.formulaSteps?.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {i + 1}
                </div>
                <div className="pt-1">
                  <h4 className="text-white font-semibold mb-1">{step.label}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      );

    case 'hooks':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={Lightbulb} title={section.title} color={color} />
          <div className="space-y-3">
            {section.hooks?.map((hook, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  {i + 1}
                </span>
                <span className="text-gray-300 text-sm leading-relaxed pt-0.5">{hook}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      );

    case 'content-ideas':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={Lightbulb} title={section.title} color={color} />
          <div className="grid sm:grid-cols-2 gap-3">
            {section.bullets?.map((idea, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-gray-300 text-sm">{idea}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      );

    case 'text-section':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={MessageCircle} title={section.title} color={color} />
          {section.intro && (
            <p className="text-gray-300 text-[15px] leading-relaxed mb-5 italic">{section.intro}</p>
          )}
          {section.items?.map((item, i) => (
            item.title && <h3 key={i} className="text-white font-semibold mb-3">{item.title}</h3>
          ))}
          {section.bullets && (
            <div className="space-y-2">
              {section.bullets.map((bullet, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
                  <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-gray-300 text-sm leading-relaxed">{bullet}</span>
                </div>
              ))}
            </div>
          )}
          {section.callout && <CalloutBox callout={section.callout} color={color} />}
        </SectionCard>
      );

    case 'lead-gen':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={Target} title={section.title} color={color} />
          {section.leadGenIntro && (
            <p className="text-gray-300 text-[15px] leading-relaxed mb-4">{section.leadGenIntro}</p>
          )}
          {section.subtitle && (
            <h3 className="text-lg font-bold text-white mb-5">{section.subtitle}</h3>
          )}
          <div className="space-y-4">
            {section.leadGenSteps?.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2"
                  style={{ borderColor: color, color }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-white font-semibold mb-1">{step.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          {section.leadGenReasons && (
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">Why This Works</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {section.leadGenReasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
                    <CheckCircle2 size={16} style={{ color }} className="flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      );

    case 'bio-template':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={User} title={section.title} color={color} />
          {section.intro && (
            <p className="text-gray-300 text-[15px] leading-relaxed mb-5">{section.intro}</p>
          )}
          {section.items && (
            <div className="space-y-3 mb-6">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <span className="text-white font-semibold text-sm">{item.title}: </span>
                    <span className="text-gray-400 text-sm">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {section.bioExample && (
            <div
              className="rounded-xl p-5 border"
              style={{ backgroundColor: `${color}08`, borderColor: `${color}20` }}
            >
              <p className="text-white font-semibold text-sm mb-3">{section.bioExample.label}</p>
              <div className="space-y-1.5">
                {section.bioExample.lines.map((line, i) => (
                  <p key={i} className="text-gray-300 text-sm">{line}</p>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      );

    case 'hashtag':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={Hash} title={section.title} color={color} />
          {section.intro && (
            <p className="text-gray-300 text-[15px] leading-relaxed mb-5">{section.intro}</p>
          )}
          {section.hashtagTiers && (
            <div className="space-y-3">
              {section.hashtagTiers.map((tier, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] rounded-xl px-5 py-4">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {tier.count}
                  </span>
                  <div className="flex-1">
                    <span className="text-white font-semibold text-sm">{tier.tier}</span>
                    <span className="text-gray-500 text-sm"> &mdash; {tier.range}</span>
                  </div>
                  <span className="text-gray-500 text-xs italic">you can rank here</span>
                </div>
              ))}
            </div>
          )}
          {section.callout && <CalloutBox callout={section.callout} color={color} />}
        </SectionCard>
      );

    case 'page-setup':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={User} title={section.title} color={color} />
          {section.intro && (
            <p className="text-gray-300 text-[15px] leading-relaxed mb-5">{section.intro}</p>
          )}
          {section.items && (
            <div className="space-y-3">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <span className="text-white font-semibold text-sm">{item.title}: </span>
                    <span className="text-gray-400 text-sm">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      );

    case 'stats-grid':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={BarChart3} title={section.title} color={color} />
          {section.intro && (
            <p className="text-gray-300 text-[15px] leading-relaxed mb-5">{section.intro}</p>
          )}
          {section.stats && (
            <div className="grid sm:grid-cols-3 gap-3">
              {section.stats.map((stat, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold mb-1" style={{ color }}>{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
          {section.callout && <CalloutBox callout={section.callout} color={color} />}
        </SectionCard>
      );

    case 'cadence':
      return (
        <SectionCard key={section.id}>
          <SectionHeading icon={Calendar} title={section.title} color={color} />
          <div className="space-y-2">
            {section.postingCadence?.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] rounded-xl px-5 py-3.5"
              >
                <span className="text-white font-semibold text-sm w-28 flex-shrink-0">{item.label}</span>
                <div className="w-px h-5 bg-white/10" />
                <span className="text-gray-400 text-sm">{item.content}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      );

    case 'kickstart':
      return (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color}15, ${color}08)`,
            border: `1px solid ${color}30`,
          }}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} style={{ color }} />
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color }}>
                30-Day Kickstart Plan
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white font-['Montserrat'] mb-6">
              {section.title}
            </h2>
            <div className="space-y-6">
              {section.kickstart?.map((week, wIdx) => (
                <div key={wIdx}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: `${color}25`, color }}
                    >
                      {wIdx + 1}
                    </div>
                    <h3 className="text-white font-bold text-lg">{week.week}</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed ml-11">{week.description}</p>
                  {wIdx < (section.kickstart?.length ?? 0) - 1 && (
                    <div className="ml-[18px] mt-3 h-4 border-l-2 border-dashed" style={{ borderColor: `${color}20` }} />
                  )}
                </div>
              ))}
            </div>
            {section.callout && (
              <div className="mt-6">
                <CalloutBox callout={section.callout} color={color} />
              </div>
            )}
          </div>
        </motion.div>
      );

    case 'one-rule':
      return (
        <motion.div
          key={section.id}
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
              {section.title}
            </h2>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white font-['Montserrat'] mb-4">
              {section.oneRule?.title}
            </h3>
            <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto text-lg">
              {section.oneRule?.description}
            </p>
          </div>
        </motion.div>
      );

    default:
      return null;
  }
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
            <p className="text-xl md:text-2xl font-medium mb-6" style={{ color: platform.color }}>
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
                <h2 className="text-lg font-bold text-white font-['Montserrat']">What It Does Best</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{platform.whatItDoes}</p>
            </SectionCard>
            <SectionCard>
              <div className="flex items-center gap-2 mb-5">
                <XCircle className="text-red-400" size={22} />
                <h2 className="text-lg font-bold text-white font-['Montserrat']">What It's NOT For</h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{platform.whatItsNotFor}</p>
            </SectionCard>
          </div>

          {platform.sections.map((section) => renderSection(section, platform.color))}

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
