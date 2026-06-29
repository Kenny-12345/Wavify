/**
 * SettingsPage.jsx
 * App settings: theme, accent color, account.
 */
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLibrary } from '../../context/LibraryContext';
import { Moon, Sun, LogOut, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ACCENT_OPTIONS = [
  { name: 'green', label: 'Spotify Green', color: '#1db954' },
  { name: 'purple', label: 'Purple', color: '#9b59b6' },
  { name: 'blue', label: 'Blue', color: '#3b82f6' },
  { name: 'red', label: 'Red', color: '#ef4444' },
  { name: 'orange', label: 'Orange', color: '#f97316' },
  { name: 'pink', label: 'Pink', color: '#ec4899' },
  { name: 'cyan', label: 'Cyan', color: '#06b6d4' },
];

export default function SettingsPage() {
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const { logout } = useAuth();
  const { clearHistory } = useLibrary();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8 page-wrapper">
      <h1 className="text-2xl font-bold text-primary mb-8">Settings</h1>

      {/* Appearance */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Appearance</h2>
        <div className="glass-card rounded-2xl p-5 space-y-5">

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Theme</p>
              <p className="text-xs text-muted">Choose your preferred display mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" style={{ color: 'var(--accent)' }} /> : <Sun className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
              {theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>

          {/* Accent Color */}
          <div>
            <p className="text-sm font-medium text-primary mb-1">Accent Color</p>
            <p className="text-xs text-muted mb-3">Personalize the app's highlight color</p>
            <div className="flex flex-wrap gap-3">
              {ACCENT_OPTIONS.map(option => (
                <button
                  key={option.name}
                  onClick={() => { setAccent(option.name); toast.success(`Theme: ${option.label}`); }}
                  className="group flex flex-col items-center gap-1"
                  title={option.label}
                >
                  <div
                    className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${accent === option.name ? 'ring-2 ring-offset-2 ring-white/50 scale-110' : ''}`}
                    style={{ background: option.color }}
                  />
                  <span className="text-xs text-muted group-hover:text-primary transition-colors">{option.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Data & Privacy</h2>
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <button
            onClick={() => { clearHistory(); toast.success('Listening history cleared'); }}
            className="flex items-center gap-3 w-full text-left text-sm text-secondary hover:text-primary transition-colors py-1 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
            Clear Listening History
          </button>
        </div>
      </section>

      {/* Account */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Account</h2>
        <div className="glass-card rounded-2xl p-5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </section>

      {/* Version */}
      <p className="text-xs text-muted text-center mt-10">Wavify v1.0.0 · School Project · Not for commercial use</p>
    </div>
  );
}
