import { motion } from 'framer-motion';
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Loader2,
} from 'lucide-react';
import LegalStepLayout from '../../components/legal/LegalStepLayout';
import { useLegalProgress } from '../../components/legal/useLegalProgress';
import { NORTHWEST_LINK } from '../../data/legal-steps';

const EIN_USES = [
  'Open a business bank account',
  'File business taxes',
  'Hire employees',
  'Apply for business credit cards and loans',
  'Set up payroll',
];

const EIN_STEPS = [
  {
    title: 'Go to the IRS website',
    description: 'Visit the official IRS EIN application page. It\'s completely free -- never pay a third party for this.',
  },
  {
    title: 'Select your entity type',
    description: 'Choose "Limited Liability Company" when asked about your business structure.',
  },
  {
    title: 'Enter your LLC details',
    description: 'You\'ll need your LLC name, address, responsible party name, and SSN of the owner.',
  },
  {
    title: 'Receive your EIN instantly',
    description: 'If you apply online during business hours (Mon-Fri, 7am-10pm ET), you get your EIN immediately.',
  },
];

export default function GetEIN() {
  const { completedSteps, loading, markComplete } = useLegalProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center">
        <Loader2 className="text-[#FF6B35] animate-spin" size={32} />
      </div>
    );
  }

  return (
    <LegalStepLayout stepKey="ein" completedSteps={completedSteps} onMarkComplete={markComplete}>
      <div className="space-y-8">

        <div>
          <h2 className="text-white font-bold text-lg mb-1">What is an EIN?</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            An EIN (Employer Identification Number) is a unique 9-digit number assigned by the IRS to your business. Think of it as your business's Social Security number. You need it for almost everything business-related.
          </p>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-gray-300 text-sm font-semibold mb-3">You'll use your EIN to:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EIN_USES.map((use) => (
                <div key={use} className="flex items-center gap-2 text-gray-400 text-sm">
                  <CheckCircle2 size={13} className="text-[#FF6B35] flex-shrink-0" />
                  {use}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">Good news: It's completely free</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                The IRS does not charge anything for an EIN. If a website is asking you to pay, you're on the wrong site. Use the official IRS link below.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-1">How to Get Your EIN</h2>
          <p className="text-gray-500 text-sm mb-5">Takes about 5 minutes online. Here's the process:</p>

          <div className="space-y-3">
            {EIN_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <span className="w-7 h-7 rounded-full bg-[#FF6B35]/10 flex items-center justify-center text-[11px] font-bold text-[#FF6B35] flex-shrink-0 mt-0.5">
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

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-xl text-sm font-bold hover:bg-[#e55f2f] transition-all shadow-lg shadow-[#FF6B35]/15"
          >
            Apply for Free EIN at IRS.gov
            <ExternalLink size={15} />
          </a>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-start gap-3">
            <Clock size={18} className="text-[#2979FF] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">When can I apply?</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                The IRS online application is available Monday through Friday, 7:00 a.m. to 10:00 p.m. Eastern Time. If you apply outside those hours, you can fax or mail Form SS-4 instead, but online is instant.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2979FF]/10 bg-[#2979FF]/[0.03] p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-[#2979FF] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">Prefer someone to handle it?</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Northwest Registered Agent can obtain your EIN for you as part of their service. It's optional and comes at an additional fee, but some people prefer the convenience.
              </p>
              <a
                href={NORTHWEST_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#2979FF] text-sm font-medium mt-2 hover:underline"
              >
                Learn more at Northwest
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-5">
          <div className="flex items-start gap-3">
            <FileText size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">What you'll need handy</p>
              <ul className="text-gray-400 text-sm leading-relaxed space-y-1 mt-2">
                <li>- Your LLC's legal name (exactly as filed)</li>
                <li>- Your LLC's mailing address</li>
                <li>- The responsible party's name and SSN</li>
                <li>- Your state of formation</li>
                <li>- The date your LLC was formed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </LegalStepLayout>
  );
}
