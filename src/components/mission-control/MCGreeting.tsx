import { motion } from 'framer-motion';
import { Rocket, Calendar } from 'lucide-react';
import { DAILY_TIPS } from '../../data/mission-control';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDaysSinceLaunch(launchDate: Date | null): number | null {
  if (!launchDate) return null;
  const now = new Date();
  const diff = Math.floor((now.getTime() - launchDate.getTime()) / 86400000);
  return Math.max(0, diff);
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDailyTip(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

interface Props {
  userName: string;
  businessName: string;
  launchDate: Date | null;
}

export default function MCGreeting({ userName, businessName, launchDate }: Props) {
  const daysSince = getDaysSinceLaunch(launchDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0e2a4a] via-[#0a1e38] to-[#060d19] p-6 sm:p-8"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2979FF]/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#06D6A0]/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#2979FF]/15 flex items-center justify-center">
                <Rocket className="text-[#2979FF]" size={20} />
              </div>
              <span className="text-[#2979FF] text-xs font-bold tracking-widest uppercase">Mission Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
              {getGreeting()}, {userName}
            </h1>
          </div>

          {daysSince !== null && businessName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06D6A0]/10 border border-[#06D6A0]/15"
            >
              <Calendar size={14} className="text-[#06D6A0]" />
              <span className="text-[#06D6A0] text-sm font-semibold">
                Day {daysSince} since you launched {businessName}
              </span>
            </motion.div>
          )}
        </div>

        <p className="text-gray-500 text-sm mb-5">{formatDate()}</p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
        >
          <div className="absolute top-3 left-3 w-1 h-[calc(100%-24px)] rounded-full bg-gradient-to-b from-[#2979FF] to-[#06D6A0] opacity-60" />
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed italic pl-3">
            "{getDailyTip()}"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
