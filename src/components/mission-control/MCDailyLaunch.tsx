import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, ArrowRight } from 'lucide-react';

const PLAYBOOK_TIPS = [
  {
    title: "The 30-Second Elevator Pitch",
    description: "Learn to describe your business in one sentence that makes people lean in and ask 'tell me more.'",
    link: "/playbook",
  },
  {
    title: "Your First 10 Google Reviews",
    description: "The exact script and timing to ask happy customers for reviews without being awkward.",
    link: "/playbook",
  },
  {
    title: "Instagram Reels That Actually Convert",
    description: "A simple 3-step formula for creating short videos that bring in real leads.",
    link: "/playbook",
  },
  {
    title: "The Follow-Up Framework",
    description: "80% of sales happen after the 5th follow-up. Here's the system that makes it effortless.",
    link: "/playbook",
  },
];

export default function MCDailyLaunch() {
  const navigate = useNavigate();
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const tip = PLAYBOOK_TIPS[dayOfYear % PLAYBOOK_TIPS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.4 }}
      className="rounded-2xl border border-[#2979FF]/10 bg-gradient-to-r from-[#2979FF]/[0.05] to-transparent p-5 sm:p-6"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#2979FF]/10 flex items-center justify-center">
          <Lightbulb size={16} className="text-[#2979FF]" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base">Your Daily Launch</h2>
          <p className="text-gray-500 text-xs">From your Marketing Playbook</p>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-3">
        <h3 className="text-white font-semibold text-sm mb-1.5">{tip.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{tip.description}</p>
      </div>

      <button
        onClick={() => navigate(tip.link)}
        className="flex items-center gap-1.5 text-[#2979FF] text-sm font-semibold hover:underline"
      >
        Open Full Lesson
        <ArrowRight size={13} />
      </button>
    </motion.div>
  );
}
