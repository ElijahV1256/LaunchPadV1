import { useNavigate, useLocation } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const HIDDEN_PATHS = [
  '/',
  '/auth',
  '/onboarding',
  '/ideas',
  '/dashboard',
  '/profile',
  '/pricing',
  '/pro-success',
  '/saved-ideas',
  '/saved-names',
  '/brand-identity',
  '/logo-editor',
  '/first-revenue',
  '/build-site',
  '/mission-control',
  '/nano-generator',
  '/storybrand-wizard',
  '/storybrand-roadmap',
  '/master-sheet',
  '/resources',
  '/local',
  '/local/results',
];

export default function MissionControlFAB() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isHidden =
    HIDDEN_PATHS.includes(pathname) ||
    pathname.startsWith('/roadmap/');

  if (isHidden) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      onClick={() => navigate('/mission-control')}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-[#2979FF] text-white text-sm font-semibold shadow-lg shadow-[#2979FF]/25 hover:bg-[#3d88ff] hover:shadow-[#2979FF]/35 hover:scale-105 transition-all duration-200 group"
      aria-label="Go to Mission Control"
    >
      <Rocket size={16} className="group-hover:-rotate-12 transition-transform duration-200" />
      <span className="hidden sm:inline">Mission Control</span>
    </motion.button>
  );
}
