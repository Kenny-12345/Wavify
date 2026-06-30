/**
 * PlaylistPage.jsx
 * User and curated playlist page with full management.
 */
import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Shuffle, Heart, MoreHorizontal, Pencil, Trash2, Copy, Pin, Search, Clock } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { FEATURED_SONGS, CURATED_PLAYLISTS, getSongById, formatDuration } from '../../services/mockData';
import TrackRow from '../../components/ui/TrackRow';
import toast from 'react-hot-toast';

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const {
    playlists, updatePlaylist, deletePlaylist, duplicatePlaylist,
    removeSongFromPlaylist,
    isPlaylistLiked, toggleLikePlaylist,
  } = useLibrary();

  const [showMenu, setShowMenu] = useState(false);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState('');
  const [searchInPlaylist, setSearchInPlaylist] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'title' | 'artist' | 'duration'

  const location = useLocation();
  
  // Find playlist — check user playlists first, then state, then mock curated
  const userPlaylist = playlists.find(p => p.id === id);
  const statePlaylist = location.state?.playlist;
  const curatedPlaylist = CURATED_PLAYLISTS.find(p => p.id === id);
  const playlist = userPlaylist || statePlaylist || curatedPlaylist;

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted">Playlist not found</p>
      </div>
    );
  }

  const isUserPlaylist = Boolean(userPlaylist);
  const liked = isPlaylistLiked(playlist.id);

  // Get all songs in playlist
  const allSongs = useMemo(() => {
    if (playlist.songObjects) return playlist.songObjects;
    return (playlist.songIds || []).map(songId => getSongById(songId)).filter(Boolean);
  }, [playlist]);

  // Filter + sort
  const filteredSongs = useMemo(() => {
    let songs = allSongs;
    if (searchInPlaylist) {
      const q = searchInPlaylist.toLowerCase();
      songs = songs.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'title') songs = [...songs].sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'artist') songs = [...songs].sort((a, b) => a.artist.localeCompare(b.artist));
    if (sortBy === 'duration') songs = [...songs].sort((a, b) => a.duration - b.duration);
    return songs;
  }, [allSongs, searchInPlaylist, sortBy]);

  const totalDuration = allSongs.reduce((acc, s) => acc + s.duration, 0);

  const handlePlay = () => {
    if (filteredSongs.length) playTrack(filteredSongs[0], filteredSongs);
    else toast('No songs in this playlist');
  };

  const handleShuffle = () => {
    if (filteredSongs.length) {
      const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  const handleRename = () => {
    if (newName.trim()) {
      updatePlaylist(playlist.id, { name: newName.trim() });
      toast.success('Playlist renamed');
    }
    setEditName(false);
    setNewName('');
  };

  const handleDelete = () => {
    deletePlaylist(playlist.id);
    toast.success('Playlist deleted');
    navigate('/library');
  };

  const handleDuplicate = () => {
    duplicatePlaylist(playlist.id);
    toast.success('Playlist duplicated');
  };

  const handlePin = () => {
    updatePlaylist(playlist.id, { pinned: !playlist.pinned });
    toast.success(playlist.pinned ? 'Unpinned' : 'Pinned to sidebar');
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div
        className="relative flex flex-col md:flex-row items-end gap-6 px-6 py-8"
        style={{ background: 'linear-gradient(to bottom, rgba(80,80,80,0.3) 0%, transparent)' }}
      >
        {/* Cover */}
        <div className="w-52 h-52 rounded-2xl shadow-2xl overflow-hidden flex-shrink-0 bg-surface-700">
          {playlist.cover ? (
            <img
              src={playlist.cover}
              alt={playlist.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/208?text=♪'; }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-6xl"
              style={{ background: 'linear-gradient(135deg, var(--accent-dark), var(--accent-light))' }}
            >
              🎵
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">Playlist</p>

          {/* Name (editable for user playlists) */}
          {editName ? (
            <div className="flex items-center gap-2 mb-3">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setEditName(false); setNewName(''); } }}
                className="text-3xl font-black bg-transparent outline-none text-primary border-b-2 border-accent"
                style={{ borderColor: 'var(--accent)' }}
              />
              <button onClick={handleRename} className="text-sm font-medium px-3 py-1 rounded-lg" style={{ background: 'var(--accent)', color: 'black' }}>Save</button>
            </div>
          ) : (
            <h1 className="text-3xl md:text-5xl font-black text-primary mb-3 line-clamp-2">{playlist.name}</h1>
          )}

          {playlist.description && (
            <p className="text-sm text-muted mb-2">{playlist.description}</p>
          )}
          <p className="text-sm text-muted">{allSongs.length} songs · {formatDuration(totalDuration)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 px-6 pb-4">
        <motion.button whileTap={{ scale: 0.95 }} onClick={handlePlay}
          className="w-14 h-14 rounded-full flex items-center justify-center text-black shadow-glow hover:scale-105 transition-all"
          style={{ background: 'var(--accent)' }}
        >
          <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
        </motion.button>

        <button onClick={handleShuffle} className="p-3 text-muted hover:text-primary transition-all hover:scale-110">
          <Shuffle className="w-6 h-6" />
        </button>

        <button
          onClick={() => { toggleLikePlaylist(playlist.id); toast.success(liked ? 'Removed from favorites' : '❤️ Added to favorites'); }}
          className={`p-3 transition-all hover:scale-110 ${liked ? '' : 'text-muted hover:text-primary'}`}
          style={liked ? { color: 'var(--accent)' } : {}}
        >
          <Heart className="w-6 h-6" fill={liked ? 'currentColor' : 'none'} />
        </button>

        {/* More options (user playlists only) */}
        {isUserPlaylist && (
          <div className="relative ml-1">
            <button
              onClick={() => setShowMenu(prev => !prev)}
              className="p-2 text-muted hover:text-primary rounded-full hover:bg-white/10 transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-0 mt-2 w-44 rounded-xl shadow-2xl py-1 z-50"
                  style={{ background: '#282828', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {[
                    { icon: Pencil, label: 'Rename', onClick: () => { setNewName(playlist.name); setEditName(true); setShowMenu(false); } },
                    { icon: Copy, label: 'Duplicate', onClick: () => { handleDuplicate(); setShowMenu(false); } },
                    { icon: Pin, label: playlist.pinned ? 'Unpin' : 'Pin', onClick: () => { handlePin(); setShowMenu(false); } },
                    { icon: Trash2, label: 'Delete', onClick: () => { handleDelete(); setShowMenu(false); }, danger: true },
                  ].map(({ icon: Icon, label, onClick, danger }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors hover:bg-white/8 ${danger ? 'text-red-400 hover:text-red-300' : 'text-secondary hover:text-primary'}`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs text-secondary bg-transparent border border-white/10 rounded-lg px-2 py-1 outline-none cursor-pointer"
          >
            <option value="default">Default order</option>
            <option value="title">Title</option>
            <option value="artist">Artist</option>
            <option value="duration">Duration</option>
          </select>
        </div>
      </div>

      {/* Search inside playlist */}
      {allSongs.length > 5 && (
        <div className="px-6 mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search in playlist..."
              value={searchInPlaylist}
              onChange={(e) => setSearchInPlaylist(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm text-primary placeholder:text-muted outline-none"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>
      )}

      {/* Track list header */}
      <div className="flex items-center gap-3 px-6 py-2 mb-1 border-b border-white/5 text-xs text-muted">
        <span className="w-6 text-center">#</span>
        <span className="flex-1">Title</span>
        <span className="hidden md:block w-36">Album</span>
        <Clock className="w-3.5 h-3.5 ml-auto" />
      </div>

      {/* Tracks */}
      <div className="px-3 pb-8">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song, i) => (
            <TrackRow key={`${song.id}-${i}`} track={song} index={i} queue={filteredSongs} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-4xl mb-4">🎵</p>
            <p className="text-muted text-center">
              {allSongs.length === 0
                ? "This playlist is empty. Add songs to get started!"
                : "No songs match your search."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
