import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { ATTENTION_ITEMS } from '../../data/mission-control';

export default function MCAttention() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
          <AlertCircle size={16} className="text-[#EF4444]" />
        </div>
        <h2 className="text-white font-bold text-base">Needs Your Attention</h2>
        <span className="ml-auto text-xs text-gray-600 bg-white/[0.04] px-2 py-0.5 rounded-full">
          {ATTENTION_ITEMS.length} items
        </span>
      </div>

      <div className="space-y-2">
        {ATTENTION_ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.06 }}
            className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{item.title}</p>
              <p className="text-gray-600 text-xs truncate">{item.subtitle}</p>
            </div>
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all hover:opacity-80"
              style={{ backgroundColor: `${item.color}15`, color: item.color }}
            >
              {item.action}
              <ArrowRight size={11} />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
