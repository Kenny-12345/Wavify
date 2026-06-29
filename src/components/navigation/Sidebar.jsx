/**
 * Sidebar.jsx
 * Desktop left navigation sidebar.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Library, Heart, Clock, Music, Plus, ChevronRight, Pin } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Your Library' },
];

const libraryItems = [
  { to: '/liked-songs', icon: Heart, label: 'Liked Songs', gradient: 'from-indigo-500 to-purple-600' },
  { to: '/history', icon: Clock, label: 'Recent History', gradient: 'from-gray-500 to-gray-700' },
];

export default function Sidebar() {
  const { playlists, createPlaylist } = useLibrary();
  const { isAuthenticated } = useAuth();
  const { playTrack } = usePlayer();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreatePlaylist = () => {
    const name = `My Playlist #${playlists.length + 1}`;
    const playlist = createPlaylist(name);
    toast.success(`"${name}" created!`);
    navigate(`/playlist/${playlist.id}`);
  };

  const pinnedPlaylists = playlists.filter(p => p.pinned);
  const regularPlaylists = playlists.filter(p => !p.pinned);

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">Wavify</span>
        </NavLink>
      </div>

      {/* Main Nav */}
      <nav className="px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'text-primary bg-white/10'
                  : 'text-secondary hover:text-primary hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} style={isActive ? { color: 'var(--accent)' } : {}} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-white/5" />

      {/* Library section */}
      <div className="px-3 space-y-1">
        {libraryItems.map(({ to, icon: Icon, label, gradient }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive ? 'text-primary bg-white/10' : 'text-secondary hover:text-primary hover:bg-white/5'
              }`
            }
          >
            <div className={`w-7 h-7 rounded bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            {label}
          </NavLink>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-white/5" />

      {/* Playlists */}
      <div className="px-3 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Playlists</span>
          <button
            onClick={handleCreatePlaylist}
            className="p-1 rounded hover:bg-white/10 transition-colors text-muted hover:text-primary"
            title="Create playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {/* Pinned */}
          {pinnedPlaylists.map(playlist => (
            <PlaylistItem key={playlist.id} playlist={playlist} pinned />
          ))}

          {/* Regular */}
          {regularPlaylists.map(playlist => (
            <PlaylistItem key={playlist.id} playlist={playlist} />
          ))}

          {playlists.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-muted">No playlists yet.</p>
              <button
                onClick={handleCreatePlaylist}
                className="mt-2 text-xs font-medium hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Create your first
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlaylistItem({ playlist, pinned }) {
  return (
    <NavLink
      to={`/playlist/${playlist.id}`}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
          isActive ? 'text-primary bg-white/10' : 'text-secondary hover:text-primary hover:bg-white/5'
        }`
      }
    >
      {/* Cover */}
      <div className="w-8 h-8 rounded flex-shrink-0 overflow-hidden bg-surface-700 flex items-center justify-center">
        {playlist.cover ? (
          <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover" />
        ) : (
          <Music className="w-4 h-4 text-muted" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-medium">{playlist.name}</p>
          {pinned && <Pin className="w-3 h-3 text-muted flex-shrink-0" />}
        </div>
        <p className="text-xs text-muted">{playlist.songIds.length} songs</p>
      </div>
    </NavLink>
  );
}
