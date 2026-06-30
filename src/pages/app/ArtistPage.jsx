/**
 * ArtistPage.jsx
 * Artist profile page with biography, popular songs, albums, similar artists.
 */
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Heart, UserCheck, UserPlus, Share2, MoreHorizontal } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { getArtistById, getSongsByArtist, ARTISTS, ALBUMS, formatNumber } from '../../services/mockData';
import TrackRow from '../../components/ui/TrackRow';
import { AlbumCard, ArtistCard } from '../../components/ui/Cards';
import toast from 'react-hot-toast';

export default function ArtistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { playTrack } = usePlayer();
  const { isFollowing, toggleFollowArtist, isArtistLiked, toggleLikeArtist } = useLibrary();

  const stateArtist = location.state?.artist;
  const mockArtist = getArtistById(id);
  const artist = stateArtist || mockArtist;

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted">Artist not found</p>
      </div>
    );
  }

  const songs = artist.popularSongObjects || getSongsByArtist(artist.id);
  const albums = ALBUMS.filter(a => a.artistId === artist.id);
  const following = isFollowing(artist.id);
  const liked = isArtistLiked(artist.id);

  // Similar artists: same genres, different artist
  const similarArtists = ARTISTS.filter(a =>
    a.id !== artist.id &&
    a.genres.some(g => artist.genres.includes(g))
  ).slice(0, 6);

  const handleFollow = () => {
    toggleFollowArtist(artist.id);
    toast.success(following ? `Unfollowed ${artist.name}` : `Following ${artist.name}! 🎵`);
  };

  const handleLike = () => {
    toggleLikeArtist(artist.id);
    toast.success(liked ? 'Removed from favorites' : `❤️ ${artist.name} added to favorites`);
  };

  const handlePlay = () => {
    if (songs.length) playTrack(songs[0], songs);
    else toast('No songs available');
  };

  return (
    <div className="page-wrapper">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={artist.banner || artist.image}
          alt={artist.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=282828&color=fff&size=800`; }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-primary) 0%, rgba(0,0,0,0.3) 60%, transparent)' }} />

        {/* Artist name over image */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          {artist.verified && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-400">Verified Artist</span>
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-black text-white">{artist.name}</h1>
          <p className="text-white/60 mt-1">{formatNumber(artist.monthlyListeners)} monthly listeners</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 px-6 py-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handlePlay}
          className="w-14 h-14 rounded-full flex items-center justify-center text-black font-bold shadow-glow hover:scale-105 transition-all"
          style={{ background: 'var(--accent)' }}
        >
          <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
        </motion.button>

        <button
          onClick={handleFollow}
          className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all hover:scale-105 ${
            following ? 'border-white/20 text-primary' : 'border-white/20 text-secondary hover:text-primary hover:border-white/40'
          }`}
        >
          {following ? (
            <span className="flex items-center gap-1.5"><UserCheck className="w-4 h-4" />Following</span>
          ) : (
            <span className="flex items-center gap-1.5"><UserPlus className="w-4 h-4" />Follow</span>
          )}
        </button>

        <button
          onClick={handleLike}
          className={`p-2 rounded-full transition-all hover:scale-110 ${liked ? '' : 'text-muted hover:text-primary'}`}
          style={liked ? { color: 'var(--accent)' } : {}}
        >
          <Heart className="w-6 h-6" fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="px-6 pb-8 space-y-10">
        {/* Popular Songs */}
        {songs.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-primary mb-4">Popular</h2>
            <div className="space-y-1">
              {songs.map((song, i) => (
                <TrackRow key={song.id} track={song} index={i} queue={songs} showAlbum={false} />
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-primary mb-4">Albums</h2>
            <div className="flex flex-wrap gap-4">
              {albums.map(album => <AlbumCard key={album.id} album={album} />)}
            </div>
          </section>
        )}

        {/* Biography */}
        {artist.bio && (
          <section>
            <h2 className="text-xl font-bold text-primary mb-4">About</h2>
            <div
              className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-6"
            >
              <img
                src={artist.image}
                alt={artist.name}
                className="w-32 h-32 rounded-xl object-cover flex-shrink-0"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=282828&color=fff&size=128`; }}
              />
              <div>
                <p className="text-sm text-secondary leading-relaxed">{artist.bio}</p>
                <p className="mt-3 text-sm font-semibold text-primary">{formatNumber(artist.followers)} followers</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {artist.genres.map(g => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Similar Artists */}
        {similarArtists.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-primary mb-4">Fans Also Like</h2>
            <div className="flex flex-wrap gap-4">
              {similarArtists.map(a => <ArtistCard key={a.id} artist={a} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
