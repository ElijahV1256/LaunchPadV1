import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link2,
  CreditCard,
  Calendar,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  BarChart2,
  Users,
  Check,
  Loader2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  'credit-card': CreditCard,
  calendar: Calendar,
  mail: Mail,
  'map-pin': MapPin,
  instagram: Instagram,
  facebook: Facebook,
  'bar-chart-2': BarChart2,
  users: Users,
};

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  connected: boolean;
}

interface Props {
  integrations: Integration[];
}

export default function MCIntegrations({ integrations }: Props) {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  const handleConnect = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      setConnectedIds((prev) => new Set(prev).add(id));
      setConnectingId(null);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.4 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
          <Link2 size={16} className="text-[#8B5CF6]" />
        </div>
        <h2 className="text-white font-bold text-base">Integrations</h2>
        <span className="ml-auto text-xs text-gray-600">
          {connectedIds.size} of {integrations.length} connected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {integrations.map((item, i) => {
          const Icon = ICON_MAP[item.icon] || Link2;
          const isConnected = connectedIds.has(item.id);
          const isConnecting = connectingId === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${item.color}12` }}
              >
                <Icon size={16} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.name}</p>
                <p className="text-gray-600 text-[11px] truncate">{item.description}</p>
              </div>
              {isConnected ? (
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold flex-shrink-0">
                  <Check size={12} />
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(item.id)}
                  disabled={isConnecting}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all flex-shrink-0 disabled:opacity-50"
                >
                  {isConnecting ? <Loader2 size={12} className="animate-spin" /> : 'Connect'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
