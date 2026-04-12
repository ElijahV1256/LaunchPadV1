import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  message: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0A192F]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-[#0F2847] border border-white/10 rounded-2xl p-8 text-center max-w-sm w-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2979FF]/20 mb-4"
        >
          <Sparkles className="text-[#2979FF]" size={24} />
        </motion.div>
        <p className="text-white font-semibold text-lg">{message}</p>
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-[#2979FF]"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
