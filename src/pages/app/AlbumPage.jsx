/**
 * AlbumPage.jsx
 */
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Shuffle, Heart, Clock } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { getAlbumById, getArtistById, getSongsByAlbum, formatDuration } from '../../services/mockData';
import TrackRow from '../../components/ui/TrackRow';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AlbumPage() {
  const { id } = useParams();
  const { playTrack, toggleShuffle } = usePlayer();
  const { isAlbumLiked, toggleLikeAlbum } = useLibrary();

  const album = getAlbumById(id);
  if (!album) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted">Album not found</p>
      </div>
    );
  }

  const songs = getSongsByAlbum(album.id);
  const artist = getArtistById(album.artistId);
  const liked = isAlbumLiked(album.id);
  const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0);

  const handlePlay = () => {
    if (songs.length) playTrack(songs[0], songs);
    else toast('No songs available');
  };

  const handleShuffle = () => {
    if (songs.length) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  const handleLike = () => {
    toggleLikeAlbum(album.id);
    toast.success(liked ? 'Removed from favorites' : `❤️ "${album.title}" added to favorites`);
  };

  return (
    <div className="page-wrapper">
      {/* Album header */}
      <div className="flex flex-col md:flex-row items-end gap-6 px-6 py-8" style={{ background: 'linear-gradient(to bottom, rgba(100,100,100,0.3) 0%, transparent)' }}>
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          src={album.cover}
          alt={album.title}
          className="w-52 h-52 rounded-2xl shadow-2xl object-cover flex-shrink-0"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/208?text=Album'; }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Album</p>
          <h1 className="text-3xl md:text-5xl font-black text-primary mb-3 line-clamp-2">{album.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            {artist && (
              <>
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <Link
                  to={`/artist/${artist.id}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {artist.name}
                </Link>
                <span className="text-muted">·</span>
              </>
            )}
            <span className="text-sm text-muted">{album.year}</span>
            <span className="text-muted">·</span>
            <span className="text-sm text-muted">{songs.length} songs, {formatDuration(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 px-6 pb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handlePlay}
          className="w-14 h-14 rounded-full flex items-center justify-center text-black shadow-glow hover:scale-105 transition-all"
          style={{ background: 'var(--accent)' }}
        >
          <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
        </motion.button>

        <button
          onClick={handleShuffle}
          className="p-3 text-muted hover:text-primary transition-all hover:scale-110"
          title="Shuffle"
        >
          <Shuffle className="w-6 h-6" />
        </button>

        <button
          onClick={handleLike}
          className={`p-3 transition-all hover:scale-110 ${liked ? '' : 'text-muted hover:text-primary'}`}
          style={liked ? { color: 'var(--accent)' } : {}}
        >
          <Heart className="w-6 h-6" fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Track list header */}
      <div className="flex items-center gap-3 px-6 py-2 mb-2 border-b border-white/5 text-xs text-muted">
        <span className="w-6 text-center">#</span>
        <span className="flex-1">Title</span>
        <Clock className="w-3.5 h-3.5 ml-auto" />
      </div>

      {/* Tracks */}
      <div className="px-3 pb-8">
        {songs.length > 0 ? (
          songs.map((song, i) => (
            <TrackRow key={song.id} track={song} index={i} queue={songs} showAlbum={false} />
          ))
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted">No songs available for this album yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
