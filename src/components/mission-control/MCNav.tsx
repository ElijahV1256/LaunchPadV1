import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  User,
  LogOut,
  FileText,
  Shield,
  Globe,
  BarChart3,
  Palette,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_LINKS = [
  { label: 'Playbook', path: '/playbook', icon: FileText },
  { label: 'Brand', path: '/brand-identity', icon: Palette },
  { label: 'Website', path: '/website', icon: Globe },
  { label: 'Legal', path: '/legal', icon: Shield },
  { label: 'Operations', path: '/operations', icon: BarChart3 },
];

export default function MCNav() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch {}
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-[#060d19]/80 backdrop-blur-xl border-b border-white/[0.04]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Rocket className="text-[#2979FF]" size={22} />
            <span className="text-lg font-bold text-white hidden sm:inline">Launch Pad</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-300 text-sm font-medium rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  <Icon size={14} />
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden flex items-center gap-1 px-3 py-1.5 text-gray-400 text-sm rounded-lg hover:bg-white/[0.04] transition-all"
              >
                Navigate
                <ChevronDown size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/[0.08] bg-[#0a1e38] shadow-2xl py-1 z-50">
                  {NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.path}
                        onClick={() => { navigate(link.path); setMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
                      >
                        <Icon size={14} />
                        {link.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-300 text-sm rounded-lg hover:bg-white/[0.04] transition-all"
            >
              <User size={15} />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-300 text-sm rounded-lg hover:bg-white/[0.04] transition-all"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
