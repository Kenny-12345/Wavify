/**
 * GenrePage.jsx
 */
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { GENRES, FEATURED_SONGS, getSongsByGenre } from '../../services/mockData';
import { usePlayer } from '../../context/PlayerContext';
import TrackRow from '../../components/ui/TrackRow';
import toast from 'react-hot-toast';

export default function GenrePage() {
  const { id } = useParams();
  const { playTrack } = usePlayer();

  const genre = GENRES.find(g => g.id === id);
  if (!genre) return <div className="flex items-center justify-center h-64"><p className="text-muted">Genre not found</p></div>;

  const songs = getSongsByGenre(genre.name);
  const allGenreSongs = songs.length ? songs : FEATURED_SONGS.slice(0, 10);

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div className={`relative h-52 bg-gradient-to-br ${genre.color} flex items-end p-8`}>
        <div className="absolute inset-0 opacity-20" style={{ background: 'url("data:image/svg+xml,%3Csvg...%3E") center/cover' }} />
        <div>
          <p className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-1">Genre</p>
          <h1 className="text-5xl font-black text-white">{genre.name}</h1>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 px-6 py-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => allGenreSongs.length ? playTrack(allGenreSongs[0], allGenreSongs) : toast('No songs')}
          className="w-14 h-14 rounded-full flex items-center justify-center text-black shadow-glow hover:scale-105 transition-all"
          style={{ background: 'var(--accent)' }}
        >
          <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
        </motion.button>
      </div>

      {/* Track list */}
      <div className="px-6 pb-8">
        <h2 className="text-xl font-bold text-primary mb-4">Top Songs</h2>
        <div className="space-y-1">
          {allGenreSongs.map((song, i) => (
            <TrackRow key={song.id} track={song} index={i} queue={allGenreSongs} />
          ))}
        </div>
      </div>
    </div>
  );
}
