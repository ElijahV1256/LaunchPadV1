import { motion } from 'framer-motion';
import { Users, Trophy, Calendar as CalendarIcon, MessageCircle } from 'lucide-react';
import { COMMUNITY_WINS } from '../../data/mission-control';

export default function MCCommunity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#06D6A0]/10 flex items-center justify-center">
          <Users size={16} className="text-[#06D6A0]" />
        </div>
        <h2 className="text-white font-bold text-base">Community Pulse</h2>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Recent Wins</p>
          <div className="space-y-2">
            {COMMUNITY_WINS.slice(0, 3).map((win, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06D6A0]/20 to-[#2979FF]/20 flex items-center justify-center flex-shrink-0">
                  <Trophy size={13} className="text-[#06D6A0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-sm">
                    <span className="text-white font-semibold">{win.name}</span> {win.text}
                  </p>
                  <p className="text-gray-600 text-xs">{win.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button className="flex items-center gap-3 p-3 rounded-xl bg-[#2979FF]/[0.06] border border-[#2979FF]/10 hover:border-[#2979FF]/20 transition-all text-left group">
            <CalendarIcon size={16} className="text-[#2979FF] flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">Live Q&A Session</p>
              <p className="text-gray-500 text-xs">This Thursday at 2pm EST</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl bg-[#06D6A0]/[0.06] border border-[#06D6A0]/10 hover:border-[#06D6A0]/20 transition-all text-left group">
            <MessageCircle size={16} className="text-[#06D6A0] flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">Community Forum</p>
              <p className="text-gray-500 text-xs">12 new discussions</p>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
