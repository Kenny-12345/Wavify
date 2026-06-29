/**
 * TrackRow.jsx
 * A horizontal track list item (like Spotify's track list).
 */
import { useState } from 'react';
import { Play, Pause, Heart, MoreHorizontal, Plus, ListPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { formatDuration } from '../../services/mockData';
import toast from 'react-hot-toast';
import ContextMenu from './ContextMenu';

export default function TrackRow({ track, index, queue = [], showIndex = true, showAlbum = true }) {
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue, playNext } = usePlayer();
  const { isSongLiked, toggleLikeSong, playlists, addSongToPlaylist } = useLibrary();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const isCurrentTrack = currentTrack?.id === track.id;
  const liked = isSongLiked(track.id);

  const handlePlay = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track, queue.length ? queue : [track]);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggleLikeSong(track.id);
    toast.success(liked ? 'Removed from Liked Songs' : '❤️ Added to Liked Songs');
  };

  const menuItems = [
    {
      label: 'Play Next',
      icon: Play,
      onClick: () => { playNext(track); toast.success('Playing next'); },
    },
    {
      label: 'Add to Queue',
      icon: Plus,
      onClick: () => { addToQueue(track); toast.success('Added to queue'); },
    },
    ...(playlists.length ? [
      { type: 'divider' },
      { label: 'Add to Playlist', type: 'submenu', items: playlists.map(p => ({
        label: p.name,
        onClick: () => { addSongToPlaylist(p.id, track.id); toast.success(`Added to "${p.name}"`); },
      }))},
    ] : []),
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onContextMenu={handleContextMenu}
        onClick={handlePlay}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer group ${
          isCurrentTrack ? 'bg-white/10' : 'hover:bg-white/5'
        }`}
      >
        {/* Index / Play indicator */}
        {showIndex && (
          <div className="w-6 flex items-center justify-center flex-shrink-0">
            {isCurrentTrack ? (
              <div className="flex items-end gap-0.5 h-4">
                {isPlaying
                  ? [1,2,3].map(i => <div key={i} className="eq-bar" style={{ animationDelay: `${i*0.2}s` }} />)
                  : <Pause className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                }
              </div>
            ) : (
              <>
                <span className="text-sm text-muted group-hover:hidden">{index + 1}</span>
                <Play className="w-3.5 h-3.5 text-primary hidden group-hover:block" fill="currentColor" />
              </>
            )}
          </div>
        )}

        {/* Thumbnail */}
        <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden bg-surface-800">
          <img
            src={track.thumbnail}
            alt={track.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=♪'; }}
          />
        </div>

        {/* Title & Artist */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isCurrentTrack ? '' : 'text-primary'}`}
            style={isCurrentTrack ? { color: 'var(--accent)' } : {}}
          >
            {track.title}
          </p>
          <p className="text-xs text-muted truncate">{track.artist}</p>
        </div>

        {/* Album */}
        {showAlbum && (
          <p className="hidden md:block text-sm text-muted truncate w-36 flex-shrink-0">{track.album}</p>
        )}

        {/* Like */}
        <button
          onClick={handleLike}
          className={`p-1.5 rounded transition-all hover:scale-110 opacity-0 group-hover:opacity-100 ${liked ? 'opacity-100' : ''} ${liked ? '' : 'text-muted hover:text-primary'}`}
          style={liked ? { color: 'var(--accent)' } : {}}
        >
          <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
        </button>

        {/* Duration */}
        <span className="text-sm text-muted w-10 text-right tabular-nums flex-shrink-0">
          {formatDuration(track.duration)}
        </span>

        {/* More */}
        <button
          onClick={(e) => { e.stopPropagation(); handleContextMenu(e); }}
          className="p-1.5 opacity-0 group-hover:opacity-100 text-muted hover:text-primary transition-all rounded"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </motion.div>

      {showMenu && (
        <ContextMenu
          items={menuItems}
          position={menuPos}
          onClose={() => setShowMenu(false)}
        />
      )}
    </>
  );
}
