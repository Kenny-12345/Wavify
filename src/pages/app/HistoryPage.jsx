/**
 * HistoryPage.jsx
 */
import { useMemo } from 'react';
import { Trash2, Clock } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { getSongById } from '../../services/mockData';
import TrackRow from '../../components/ui/TrackRow';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const { recentlyPlayed, clearHistory } = useLibrary();
  const songs = useMemo(() => recentlyPlayed.map(getSongById).filter(Boolean), [recentlyPlayed]);

  return (
    <div className="px-6 py-6 page-wrapper">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Clock className="w-6 h-6" style={{ color: 'var(--accent)' }} />
          Listening History
        </h1>
        {songs.length > 0 && (
          <button
            onClick={() => { clearHistory(); toast.success('History cleared'); }}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>

      {songs.length > 0 ? (
        <div className="space-y-1">
          {songs.map((song, i) => (
            <TrackRow key={`${song.id}-${i}`} track={song} index={i} queue={songs} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Clock className="w-16 h-16 text-muted mb-4" />
          <p className="text-xl font-semibold text-primary mb-2">No listening history</p>
          <p className="text-muted">Songs you play will appear here.</p>
        </div>
      )}
    </div>
  );
}
