/**
 * Cards.jsx — AlbumCard, ArtistCard, PlaylistCard, TrackCard, GenreCard
 * All card components in one file for simplicity.
 */
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Heart, Check } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { getSongsByAlbum, getSongsByArtist, formatNumber } from '../../services/mockData';
import { FEATURED_SONGS } from '../../services/mockData';
import toast from 'react-hot-toast';

// ─── Shared Play Button overlay ────────────────────────────────────────────────
function PlayOverlay({ onClick }) {
  return (
    <div className="card-hover-overlay rounded-xl">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl text-black"
        style={{ background: 'var(--accent)' }}
      >
        <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
      </motion.button>
    </div>
  );
}

// ─── Album Card ────────────────────────────────────────────────────────────────
export function AlbumCard({ album }) {
  const { playTrack } = usePlayer();
  const { isAlbumLiked, toggleLikeAlbum } = useLibrary();
  const liked = isAlbumLiked(album.id);

  const handlePlay = (e) => {
    e.preventDefault();
    const songs = album.songObjects || getSongsByAlbum(album.id);
    if (songs.length) playTrack(songs[0], songs);
    else toast('No songs available for this album');
  };

  return (
    <Link to={`/album/${album.id}`} state={{ album }} className="block flex-shrink-0">
      <motion.div
        whileHover={{ y: -4 }}
        className="glass-card rounded-xl p-3 w-44 cursor-pointer group"
      >
        <div className="relative mb-3 rounded-lg overflow-hidden aspect-square bg-surface-800">
          <img
            src={album.cover}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/176?text=♪'; }}
          />
          <PlayOverlay onClick={handlePlay} />
        </div>
        <p className="text-sm font-semibold text-primary truncate">{album.title}</p>
        <p className="text-xs text-muted truncate">{album.year} · {album.genre}</p>
      </motion.div>
    </Link>
  );
}

// ─── Artist Card ───────────────────────────────────────────────────────────────
export function ArtistCard({ artist }) {
  const { playTrack } = usePlayer();
  const { isFollowing, toggleFollowArtist } = useLibrary();
  const following = isFollowing(artist.id);

  const handlePlay = (e) => {
    e.preventDefault();
    const songs = artist.popularSongObjects || getSongsByArtist(artist.id);
    if (songs.length) playTrack(songs[0], songs);
    else toast('No songs available for this artist');
  };

  return (
    <Link to={`/artist/${artist.id}`} state={{ artist }} className="block flex-shrink-0">
      <motion.div
        whileHover={{ y: -4 }}
        className="glass-card rounded-xl p-3 w-44 cursor-pointer group text-center"
      >
        <div className="relative mb-3 rounded-full overflow-hidden aspect-square bg-surface-800 mx-auto w-32">
          <img
            src={artist.image}
            alt={artist.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=282828&color=fff&size=128`; }}
          />
          <PlayOverlay onClick={handlePlay} />
        </div>
        <p className="text-sm font-semibold text-primary truncate">{artist.name}</p>
        <p className="text-xs text-muted">{formatNumber(artist.monthlyListeners)} listeners</p>
      </motion.div>
    </Link>
  );
}

// ─── Playlist Card ─────────────────────────────────────────────────────────────
export function PlaylistCard({ playlist }) {
  const { playTrack } = usePlayer();

  const handlePlay = (e) => {
    e.preventDefault();
    const songs = playlist.songObjects || (playlist.songIds || []).map(id => FEATURED_SONGS.find(s => s.id === id)).filter(Boolean);
    if (songs.length) playTrack(songs[0], songs);
    else toast('No songs in this playlist');
  };

  return (
    <Link to={`/playlist/${playlist.id}`} state={{ playlist }} className="block flex-shrink-0">
      <motion.div
        whileHover={{ y: -4 }}
        className="glass-card rounded-xl p-3 w-44 cursor-pointer group"
      >
        <div className="relative mb-3 rounded-lg overflow-hidden aspect-square bg-surface-800">
          <img
            src={playlist.cover || `https://via.placeholder.com/176/1db954/fff?text=${encodeURIComponent(playlist.name[0])}`}
            alt={playlist.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/176?text=♪'; }}
          />
          <PlayOverlay onClick={handlePlay} />
        </div>
        <p className="text-sm font-semibold text-primary truncate">{playlist.name}</p>
        <p className="text-xs text-muted truncate">{(playlist.songObjects || playlist.songIds || []).length} songs</p>
      </motion.div>
    </Link>
  );
}

// ─── Genre Card ────────────────────────────────────────────────────────────────
export function GenreCard({ genre }) {
  return (
    <Link to={`/genre/${genre.id}`} className="block flex-shrink-0">
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`relative rounded-2xl overflow-hidden cursor-pointer w-44 h-28 bg-gradient-to-br ${genre.color} flex items-end p-4 shadow-lg`}
      >
        <span className="text-white font-bold text-lg">{genre.name}</span>
      </motion.div>
    </Link>
  );
}

// ─── Track Card (vertical card) ────────────────────────────────────────────────
export function TrackCard({ track, queue = [] }) {
  const { playTrack } = usePlayer();
  const { isSongLiked, toggleLikeSong } = useLibrary();
  const liked = isSongLiked(track.id);

  const handlePlay = (e) => {
    e.preventDefault();
    playTrack(track, queue.length ? queue : [track]);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card rounded-xl p-3 w-44 cursor-pointer group"
    >
      <div className="relative mb-3 rounded-lg overflow-hidden aspect-square bg-surface-800" onClick={handlePlay}>
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/176?text=♪'; }}
        />
        <PlayOverlay onClick={handlePlay} />
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary truncate">{track.title}</p>
          <p className="text-xs text-muted truncate">{track.artist}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleLikeSong(track.id); toast.success(liked ? 'Removed from Liked Songs' : '❤️ Liked!'); }}
          className={`p-1 flex-shrink-0 transition-all hover:scale-110 ${liked ? '' : 'text-muted hover:text-primary'}`}
          style={liked ? { color: 'var(--accent)' } : {}}
        >
          <Heart className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.div>
  );
}
