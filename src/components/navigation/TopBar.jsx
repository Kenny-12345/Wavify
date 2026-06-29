/**
 * TopBar.jsx
 * Top navigation bar with search, user menu, theme toggle.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Sun, Moon, ChevronLeft, ChevronRight, LogOut, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';

export default function TopBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Pre-fill search query from URL
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      if (q) setSearchQuery(q);
    }
  }, [location]);

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3"
      style={{
        background: `linear-gradient(to bottom, var(--bg-primary) 0%, transparent 100%)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Nav arrows */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-secondary hover:text-primary"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-secondary hover:text-primary"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            id="global-search"
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            className="w-full pl-10 pr-4 py-2 rounded-full text-sm outline-none transition-all duration-200 text-primary placeholder:text-muted"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)';
              if (location.pathname !== '/search') navigate('/search');
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-secondary hover:text-primary"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(prev => !prev)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <Avatar user={user} size="sm" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-primary truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <MenuLink to="/profile" icon={User} label="Profile" onClick={() => setShowUserMenu(false)} />
                  <MenuLink to="/settings" icon={Settings} label="Settings" onClick={() => setShowUserMenu(false)} />
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuLink({ to, icon: Icon, label, onClick }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => { navigate(to); onClick?.(); }}
      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-white/5 transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
