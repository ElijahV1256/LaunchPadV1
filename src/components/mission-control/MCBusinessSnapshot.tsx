import { motion } from 'framer-motion';
import { Building2, Globe, ExternalLink } from 'lucide-react';

interface Props {
  businessName: string;
  logoUrl: string | null;
  websiteSubdomain: string | null;
}

export default function MCBusinessSnapshot({ businessName, logoUrl, websiteSubdomain }: Props) {
  if (!businessName) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
          <Building2 size={16} className="text-[#F59E0B]" />
        </div>
        <h2 className="text-white font-bold text-base">Your Business</h2>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {logoUrl ? (
          <img src={logoUrl} alt={businessName} className="w-14 h-14 rounded-xl object-cover border border-white/[0.06]" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2979FF]/20 to-[#06D6A0]/20 flex items-center justify-center border border-white/[0.06]">
            <span className="text-white text-xl font-bold">{businessName.charAt(0)}</span>
          </div>
        )}
        <div>
          <h3 className="text-white font-bold text-lg">{businessName}</h3>
          {websiteSubdomain && (
            <a
              href={`https://${websiteSubdomain}.launchlink.co`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#2979FF] text-sm hover:underline"
            >
              <Globe size={12} />
              {websiteSubdomain}.launchlink.co
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Google Business', placeholder: 'Not connected' },
          { label: 'Instagram', placeholder: 'Not connected' },
          { label: 'Facebook', placeholder: 'Not connected' },
          { label: 'Stripe', placeholder: 'Not connected' },
        ].map((item) => (
          <div key={item.label} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <p className="text-gray-500 text-[11px] mb-0.5">{item.label}</p>
            <p className="text-gray-600 text-xs">{item.placeholder}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
