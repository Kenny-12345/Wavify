/**
 * GenrePage.jsx
 */
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { GENRES } from '../../services/mockData';
import { searchMusic } from '../../services/youtubeService';
import { usePlayer } from '../../context/PlayerContext';
import TrackRow from '../../components/ui/TrackRow';
import toast from 'react-hot-toast';

export default function GenrePage() {
  const { id } = useParams();
  const { playTrack } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const genre = GENRES.find(g => g.id === id);

  useEffect(() => {
    async function loadGenreSongs() {
      if (!genre) return;
      setIsLoading(true);
      try {
        const results = await searchMusic(genre.searchTerm);
        setSongs(results);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load genre');
      } finally {
        setIsLoading(false);
      }
    }
    loadGenreSongs();
  }, [genre]);

  if (!genre) return <div className="flex items-center justify-center h-64"><p className="text-muted">Genre not found</p></div>;

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
          onClick={() => songs.length ? playTrack(songs[0], songs) : toast('No songs available')}
          className="w-14 h-14 rounded-full flex items-center justify-center text-black shadow-glow hover:scale-105 transition-all"
          style={{ background: 'var(--accent)' }}
        >
          <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
        </motion.button>
      </div>

      {/* Track list */}
      <div className="px-6 pb-8">
        <h2 className="text-xl font-bold text-primary mb-4">Top Songs in {genre.name}</h2>
        {isLoading ? (
          <div className="text-white/50 py-8">Loading {genre.name} hits...</div>
        ) : (
          <div className="space-y-1">
            {songs.map((song, i) => (
              <TrackRow key={song.id} track={song} index={i} queue={songs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
