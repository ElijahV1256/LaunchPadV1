import { motion } from 'framer-motion';
import {
  FileText,
  UserPlus,
  Share2,
  Receipt,
  MessageSquare,
  Zap,
} from 'lucide-react';

const ACTIONS = [
  { label: 'Send Estimate', icon: FileText, color: '#2979FF', bg: 'from-[#2979FF]/10 to-[#2979FF]/5' },
  { label: 'Add Customer', icon: UserPlus, color: '#06D6A0', bg: 'from-[#06D6A0]/10 to-[#06D6A0]/5' },
  { label: 'Post to Social', icon: Share2, color: '#E1306C', bg: 'from-[#E1306C]/10 to-[#E1306C]/5' },
  { label: 'Record Transaction', icon: Receipt, color: '#F59E0B', bg: 'from-[#F59E0B]/10 to-[#F59E0B]/5' },
  { label: 'Message a Lead', icon: MessageSquare, color: '#8B5CF6', bg: 'from-[#8B5CF6]/10 to-[#8B5CF6]/5' },
];

export default function MCQuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#2979FF]/10 flex items-center justify-center">
          <Zap size={16} className="text-[#2979FF]" />
        </div>
        <h2 className="text-white font-bold text-base">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.97 }}
              className={`group flex flex-col items-center gap-2.5 p-4 rounded-xl bg-gradient-to-b ${action.bg} border border-white/[0.04] hover:border-white/[0.1] transition-all duration-200`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Icon size={18} style={{ color: action.color }} />
              </div>
              <span className="text-gray-400 text-xs font-medium text-center leading-tight group-hover:text-gray-300 transition-colors">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
