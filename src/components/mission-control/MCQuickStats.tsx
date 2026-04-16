import { motion } from 'framer-motion';
import {
  DollarSign,
  UserPlus,
  Mail,
  Star,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { QUICK_STATS } from '../../data/mission-control';

const ICON_MAP: Record<string, React.ElementType> = {
  'dollar-sign': DollarSign,
  'user-plus': UserPlus,
  mail: Mail,
  star: Star,
  calendar: Calendar,
};

export default function MCQuickStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {QUICK_STATS.map((stat, i) => {
        const Icon = ICON_MAP[stat.icon] || DollarSign;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
            className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#2979FF]/[0.03] rounded-full blur-2xl translate-x-1/3 -translate-y-1/3 group-hover:bg-[#2979FF]/[0.06] transition-colors" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#2979FF]/10 flex items-center justify-center">
                  <Icon size={15} className="text-[#2979FF]" />
                </div>
                {stat.trend && (
                  <div className={`flex items-center gap-0.5 text-xs font-semibold ${stat.up ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {stat.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {stat.trend}
                  </div>
                )}
              </div>
              <p className="text-white text-xl sm:text-2xl font-bold mb-0.5">{stat.value}</p>
              <p className="text-gray-500 text-xs">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
