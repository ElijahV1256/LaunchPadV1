import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ExternalLink,
  Star,
  Users,
  Award,
  Phone,
  ShieldCheck,
  DollarSign,
  FileText,
  Mail,
  Zap,
  ChevronDown,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import LegalStepLayout from '../../components/legal/LegalStepLayout';
import { useLegalProgress } from '../../components/legal/useLegalProgress';
import { NORTHWEST_LINK } from '../../data/legal-steps';

const LLC_STEPS = [
  {
    title: 'Choose your business name',
    description: 'Search your state\'s business name database to make sure it\'s available. Your name must be unique in your state and include "LLC" at the end.',
  },
  {
    title: 'File Articles of Organization',
    description: 'This is the official document that creates your LLC. It\'s filed with your state\'s Secretary of State office. Northwest handles this for you.',
  },
  {
    title: 'Designate a Registered Agent',
    description: 'Every LLC needs a registered agent -- someone who receives legal documents on your behalf. Northwest provides this free for the first year.',
  },
  {
    title: 'Create an Operating Agreement',
    description: 'This document outlines how your LLC will be run, ownership percentages, and profit distribution. Northwest includes a template.',
  },
];

const NORTHWEST_BENEFITS = [
  { icon: ShieldCheck, title: 'Privacy protection', description: 'Their address goes on public records, not yours. Keep your home address private.' },
  { icon: DollarSign, title: '$39 + state fees', description: 'Flat rate with no hidden upsells, no surprise charges, no recurring fees for formation.' },
  { icon: Star, title: 'Free registered agent (1st year)', description: 'Registered agent service included free for your first year, then $125/year.' },
  { icon: Phone, title: 'Real people answer the phone', description: 'Actual lawyers and paralegals on staff -- not chatbots or overseas call centers.' },
  { icon: Zap, title: 'Same-day filing', description: 'In most states, your LLC is filed the same day. No multi-week waits.' },
  { icon: Mail, title: 'Legal mail scanning', description: 'They scan and forward any legal correspondence so you never miss important documents.' },
];

const INCLUDED = [
  'LLC formation filing',
  'Registered agent service (1 year free)',
  'Operating agreement template',
  'Legal mail scanning & forwarding',
];

const FAQ = [
  {
    q: 'How long does LLC formation take?',
    a: 'With Northwest, most states process same-day. Some states take 1-2 weeks depending on their processing times. You\'ll get confirmation as soon as it\'s approved.',
  },
  {
    q: 'Do I really need an LLC, or can I just be a sole proprietor?',
    a: 'You can operate as a sole proprietor, but you have zero personal asset protection. If your business gets sued, your personal savings, house, and car could be at risk. An LLC creates a legal barrier between your business and personal assets.',
  },
  {
    q: 'What is a registered agent?',
    a: 'A registered agent is a person or company designated to receive legal documents (like lawsuits or state notices) on behalf of your business. Every state requires one. Using a service like Northwest means your home address stays off public records.',
  },
  {
    q: 'What\'s the total cost breakdown?',
    a: 'Northwest charges $39 for formation. State filing fees vary from $50-$500 depending on your state. Your EIN is free from the IRS. An operating agreement template is included. Total: roughly $89-$539 depending on your state.',
  },
  {
    q: 'Can I form an LLC myself without a service?',
    a: 'Yes, you can file directly with your state\'s Secretary of State. However, you\'ll need to figure out the correct forms, act as your own registered agent (putting your home address on public record), and create your own operating agreement. Most people find the $39 worth the convenience and privacy.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Freelance Designer',
    text: 'I was intimidated by the legal side of starting my business. Northwest made it so simple -- I had my LLC in less than a day.',
  },
  {
    name: 'James K.',
    role: 'E-commerce Owner',
    text: 'The privacy protection alone is worth it. My home address isn\'t plastered all over public records.',
  },
  {
    name: 'Maria L.',
    role: 'Consultant',
    text: 'I called with questions and got a real person who actually knew what they were talking about. Refreshing.',
  },
];

export default function FormLLC() {
  const { completedSteps, loading, markComplete } = useLegalProgress();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showWhyNorthwest, setShowWhyNorthwest] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center">
        <Loader2 className="text-[#06D6A0] animate-spin" size={32} />
      </div>
    );
  }

  return (
    <LegalStepLayout stepKey="form-llc" completedSteps={completedSteps} onMarkComplete={markComplete}>
      <div className="space-y-10">

        <div>
          <h2 className="text-white font-bold text-lg mb-1">What's Involved</h2>
          <p className="text-gray-500 text-sm mb-5">Four things need to happen to form your LLC. A service handles most of it for you.</p>

          <div className="space-y-3">
            {LLC_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <span className="w-7 h-7 rounded-full bg-[#06D6A0]/10 flex items-center justify-center text-[11px] font-bold text-[#06D6A0] flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">{step.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/15 bg-gradient-to-br from-[#06D6A0]/[0.06] to-transparent p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#06D6A0]/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-gray-400 text-sm">4.8 stars</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-500" />
                <span className="text-gray-400 text-sm">100K+ businesses formed</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={14} className="text-gray-500" />
                <span className="text-gray-400 text-sm">BBB A+</span>
              </div>
            </div>

            <h3 className="text-white font-bold text-xl mb-2">We recommend Northwest Registered Agent</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-lg">
              After researching dozens of formation services, Northwest stands out for transparency, privacy, and genuine human support.
            </p>

            <a
              href={NORTHWEST_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#06D6A0] text-[#060d19] rounded-xl text-sm font-bold hover:bg-[#05c490] transition-all shadow-lg shadow-[#06D6A0]/15 mb-4"
            >
              Form My LLC with Northwest
              <ExternalLink size={15} />
            </a>

            <button
              onClick={() => setShowWhyNorthwest(!showWhyNorthwest)}
              className="flex items-center gap-1.5 text-[#06D6A0] text-sm font-medium hover:underline"
            >
              Why we recommend Northwest
              <ChevronDown size={14} className={`transition-transform ${showWhyNorthwest ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showWhyNorthwest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-6 pb-2">
                <div>
                  <h3 className="text-white font-bold text-lg mb-5">Why We Recommend Northwest Registered Agent</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {NORTHWEST_BENEFITS.map((b) => {
                      const Icon = b.icon;
                      return (
                        <div key={b.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                          <div className="w-9 h-9 rounded-lg bg-[#06D6A0]/10 flex items-center justify-center flex-shrink-0">
                            <Icon size={16} className="text-[#06D6A0]" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm mb-0.5">{b.title}</p>
                            <p className="text-gray-500 text-[13px] leading-relaxed">{b.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <h4 className="text-white font-semibold text-sm mb-3">What's included</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {INCLUDED.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                        <CheckCircle2 size={14} className="text-[#06D6A0] flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center py-4">
                  <a
                    href={NORTHWEST_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#06D6A0] text-[#060d19] rounded-xl text-sm font-bold hover:bg-[#05c490] transition-all shadow-lg shadow-[#06D6A0]/15"
                  >
                    Start My LLC for $39 + State Fees
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <h3 className="text-white font-bold text-lg mb-5">What Others Are Saying</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <MessageCircle size={16} className="text-gray-600 mb-3" />
                <p className="text-gray-300 text-sm leading-relaxed mb-3">"{t.text}"</p>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-gray-600 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-1">Frequently Asked Questions</h3>
          <p className="text-gray-500 text-sm mb-5">Everything you need to know about forming your LLC.</p>

          <div className="space-y-2">
            {FAQ.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-white text-sm font-medium pr-4">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 flex-shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h4 className="text-white font-semibold text-sm mb-3">How Much Does It Actually Cost?</h4>
          <div className="space-y-2">
            {[
              { label: 'Northwest formation fee', value: '$39' },
              { label: 'State filing fee', value: '$50 - $500 (varies)' },
              { label: 'EIN from IRS', value: 'Free' },
              { label: 'Operating agreement', value: 'Included' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-gray-400 text-sm">{row.label}</span>
                <span className={`text-sm font-semibold ${row.value === 'Free' || row.value === 'Included' ? 'text-emerald-400' : 'text-white'}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LegalStepLayout>
  );
}
