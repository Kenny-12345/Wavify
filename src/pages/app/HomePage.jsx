/**
 * HomePage.jsx
 * Main home page with all Spotify-like sections.
 */
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { usePlayer } from '../../context/PlayerContext';
import {
  GENRES,
  getSongById,
} from '../../services/mockData';
import { getTopCharts, getDynamicPlaylists } from '../../services/youtubeService';
import SectionRow from '../../components/ui/SectionRow';
import { TrackCard, AlbumCard, ArtistCard, PlaylistCard, GenreCard } from '../../components/ui/Cards';
import TrackRow from '../../components/ui/TrackRow';
import { Play } from 'lucide-react';

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner({ song }) {
  const { playTrack } = usePlayer();

  if (!song) return null;

  return (
    <div className="relative h-72 md:h-80 overflow-hidden">
      <img
        src={song.thumbnail}
        alt={song.title}
        className="w-full h-full object-cover scale-110 blur-sm"
        onError={(e) => { e.target.src = 'https://via.placeholder.com/1280x320?text=Wavify'; }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
      <div className="absolute inset-0 flex items-center px-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">Featured</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 line-clamp-1">{song.title}</h1>
          <p className="text-lg text-white/70 mb-6">{song.artist}</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => playTrack(song, FEATURED_SONGS)}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-black text-sm hover:opacity-90 transition-all shadow-glow"
            style={{ background: 'var(--accent)' }}
          >
            <Play className="w-4 h-4" fill="currentColor" />
            Play Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Quick access grid (top of home page) ─────────────────────────────────────
function QuickAccess({ songs }) {
  const { playTrack } = usePlayer();
  const items = songs.slice(0, 6);

  return (
    <div className="px-6 mt-6 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {items.map(song => (
          <button
            key={song.id}
            onClick={() => playTrack(song, songs)}
            className="flex items-center gap-3 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-150 group"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <img
              src={song.thumbnail}
              alt={song.title}
              className="w-12 h-12 object-cover flex-shrink-0"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=♪'; }}
            />
            <span className="text-sm font-semibold text-primary truncate pr-2 text-left">{song.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { recentlyPlayed, likedSongs, followedArtists, getMostPlayed } = useLibrary();
  const [charts, setCharts] = useState([]);
  const [dynamicPlaylists, setDynamicPlaylists] = useState([]);
  const [dynamicAlbums, setDynamicAlbums] = useState([]);
  const [dynamicArtists, setDynamicArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const top100 = await getTopCharts(100);
        setCharts(top100);
        
        const playlists = await getDynamicPlaylists();
        setDynamicPlaylists(playlists);

        // Derive unique albums from top 100
        const albumsMap = new Map();
        const artistsMap = new Map();
        
        top100.forEach(song => {
          if (!albumsMap.has(song.albumId)) {
            albumsMap.set(song.albumId, {
              id: song.albumId,
              title: song.album,
              artist: song.artist,
              artistId: song.artistId,
              year: song.year,
              genre: song.genre,
              cover: song.thumbnail,
              songObjects: top100.filter(s => s.albumId === song.albumId)
            });
          }
          if (!artistsMap.has(song.artistId)) {
            artistsMap.set(song.artistId, {
              id: song.artistId,
              name: song.artist,
              image: song.thumbnail,
              banner: song.thumbnail,
              monthlyListeners: Math.floor(Math.random() * 50000000) + 1000000,
              genres: [song.genre],
              popularSongObjects: top100.filter(s => s.artistId === song.artistId)
            });
          }
        });
        
        setDynamicAlbums(Array.from(albumsMap.values()));
        setDynamicArtists(Array.from(artistsMap.values()));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Personalized: recently played songs
  const recentSongs = useMemo(() =>
    recentlyPlayed.slice(0, 10).map(getSongById).filter(Boolean),
  [recentlyPlayed]);

  // Personalized: most played
  const mostPlayedIds = useMemo(() => getMostPlayed(10), [getMostPlayed]);
  const mostPlayedSongs = useMemo(() =>
    mostPlayedIds.map(getSongById).filter(Boolean),
  [mostPlayedIds]);

  // Personalized: followed artists' songs
  const followedArtistSongs = useMemo(() => {
    if (!followedArtists.length || !charts.length) return [];
    return charts.filter(s => followedArtists.includes(s.artistId));
  }, [followedArtists, charts]);

  // Personalized: liked songs
  const likedSongObjects = useMemo(() =>
    likedSongs.slice(0, 10).map(getSongById).filter(Boolean),
  [likedSongs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full pt-32 pb-8 page-wrapper text-white/50">
        Loading live charts...
      </div>
    );
  }

  // Use top chart song for featured hero
  const featuredSong = charts[0];
  const quickAccessSongs = charts.slice(1, 7);
  const topChartRow = charts.slice(0, 12);
  const newReleasesRow = charts.filter(s => s.year === new Date().getFullYear()).slice(0, 12);
  if (newReleasesRow.length < 6) newReleasesRow.push(...charts.slice(12, 24));

  return (
    <div className="pb-8 page-wrapper">
      {/* Hero */}
      <HeroBanner song={featuredSong} />

      {/* Greeting + Quick Access */}
      <div className="px-6 mt-6 mb-2">
        <h2 className="text-2xl font-bold text-primary">{greeting}, {user?.name?.split(' ')[0] || 'there'}!</h2>
      </div>

      {/* Quick access grid */}
      <QuickAccess songs={quickAccessSongs} />

      {/* Recently Played */}
      {recentSongs.length > 0 && (
        <SectionRow title="Continue Listening" seeAllLink="/history">
          {recentSongs.map(song => (
            <TrackCard key={song.id} track={song} queue={recentSongs} />
          ))}
        </SectionRow>
      )}

      {/* Made For You / Top Charts */}
      <SectionRow title="🎵 Global Top Charts" seeAllLink="/search">
        {topChartRow.map(song => (
          <TrackCard key={song.id} track={song} queue={topChartRow} />
        ))}
      </SectionRow>

      {/* New Releases */}
      <SectionRow title="🆕 New Releases" seeAllLink="/search">
        {newReleasesRow.map(song => (
          <TrackCard key={song.id} track={song} queue={newReleasesRow} />
        ))}
      </SectionRow>

      {/* Popular Playlists */}
      {dynamicPlaylists.length > 0 && (
        <SectionRow title="🔥 Trending Playlists" seeAllLink="/library">
          {dynamicPlaylists.map(playlist => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </SectionRow>
      )}

      {/* Top Songs — track list style */}
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary">⭐ Trending Now</h2>
        </div>
        <div className="space-y-1">
          {charts.slice(0, 8).map((song, i) => (
            <TrackRow key={song.id} track={song} index={i} queue={charts.slice(0, 8)} />
          ))}
        </div>
      </section>

      {/* Recommended Albums */}
      {dynamicAlbums.length > 0 && (
        <SectionRow title="💿 Trending Albums" seeAllLink="/library">
          {dynamicAlbums.slice(0, 8).map(album => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </SectionRow>
      )}

      {/* Featured Artists */}
      {dynamicArtists.length > 0 && (
        <SectionRow title="🎤 Popular Artists" seeAllLink="/search">
          {dynamicArtists.slice(0, 8).map(artist => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </SectionRow>
      )}

      {/* Genres */}
      <SectionRow title="🎸 Browse Genres" seeAllLink="/search">
        {GENRES.map(genre => (
          <GenreCard key={genre.id} genre={genre} />
        ))}
      </SectionRow>

      {/* Most Played (personalized) */}
      {mostPlayedSongs.length > 0 && (
        <SectionRow title="🏆 Your Most Played">
          {mostPlayedSongs.map(song => (
            <TrackCard key={song.id} track={song} queue={mostPlayedSongs} />
          ))}
        </SectionRow>
      )}

      {/* Liked Songs shortcut */}
      {likedSongObjects.length > 0 && (
        <SectionRow title="❤️ Your Favorites" seeAllLink="/liked-songs">
          {likedSongObjects.map(song => (
            <TrackCard key={song.id} track={song} queue={likedSongObjects} />
          ))}
        </SectionRow>
      )}

      {/* Followed artists songs */}
      {followedArtistSongs.length > 0 && (
        <SectionRow title="🔔 From Artists You Follow">
          {followedArtistSongs.map(song => (
            <TrackCard key={song.id} track={song} queue={followedArtistSongs} />
          ))}
        </SectionRow>
      )}

      {/* Daily Mix */}
      <SectionRow title="🎲 Daily Mix" seeAllLink="/library">
        {[...charts].sort(() => Math.random() - 0.5).slice(0, 8).map(song => (
          <TrackCard key={song.id} track={song} queue={charts} />
        ))}
      </SectionRow>

      {/* Because You Listened To */}
      {recentSongs.length > 0 && charts.length > 0 && (
        <SectionRow title={`💡 Because You Listened To ${recentSongs[0]?.artist}`}>
          {charts.filter(s => s.genre === recentSongs[0]?.genre || s.artist === recentSongs[0]?.artist).slice(0, 8).map(song => (
            <TrackCard key={song.id} track={song} queue={charts} />
          ))}
        </SectionRow>
      )}
    </div>
  );
}
