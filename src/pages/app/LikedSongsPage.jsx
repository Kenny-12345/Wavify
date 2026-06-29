/**
 * LikedSongsPage.jsx
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Shuffle, Heart, Clock } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { getSongById, formatDuration } from '../../services/mockData';
import TrackRow from '../../components/ui/TrackRow';
import toast from 'react-hot-toast';

export default function LikedSongsPage() {
  const { playTrack } = usePlayer();
  const { likedSongs } = useLibrary();

  const songs = useMemo(() =>
    likedSongs.map(getSongById).filter(Boolean),
  [likedSongs]);

  const totalDuration = songs.reduce((acc, s) => acc + (s.duration || 0), 0);

  const handlePlay = () => songs.length ? playTrack(songs[0], songs) : toast('No liked songs yet');
  const handleShuffle = () => {
    if (!songs.length) { toast('No liked songs yet'); return; }
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div
        className="flex flex-col md:flex-row items-end gap-6 px-6 py-8"
        style={{ background: 'linear-gradient(to bottom, rgba(80,60,120,0.5) 0%, transparent)' }}
      >
        <div
          className="w-52 h-52 rounded-2xl shadow-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)' }}
        >
          <Heart className="w-24 h-24 text-white" fill="currentColor" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">Playlist</p>
          <h1 className="text-5xl font-black text-primary mb-3">Liked Songs</h1>
          <p className="text-sm text-muted">{songs.length} songs · {formatDuration(totalDuration)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 px-6 pb-6">
        <motion.button whileTap={{ scale: 0.95 }} onClick={handlePlay}
          className="w-14 h-14 rounded-full flex items-center justify-center text-black shadow-glow hover:scale-105 transition-all"
          style={{ background: 'var(--accent)' }}
        >
          <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
        </motion.button>
        <button onClick={handleShuffle} className="p-3 text-muted hover:text-primary transition-all hover:scale-110">
          <Shuffle className="w-6 h-6" />
        </button>
      </div>

      {/* Track list */}
      <div className="flex items-center gap-3 px-6 py-2 mb-1 border-b border-white/5 text-xs text-muted">
        <span className="w-6 text-center">#</span>
        <span className="flex-1">Title</span>
        <span className="hidden md:block w-36">Album</span>
        <Clock className="w-3.5 h-3.5 ml-auto" />
      </div>

      <div className="px-3 pb-8">
        {songs.length > 0 ? (
          songs.map((song, i) => (
            <TrackRow key={song.id} track={song} index={i} queue={songs} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Heart className="w-16 h-16 text-muted mb-4" />
            <p className="text-xl font-semibold text-primary mb-2">Songs you like will appear here</p>
            <p className="text-muted text-center">Save songs by tapping the heart icon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
