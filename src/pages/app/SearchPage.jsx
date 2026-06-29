/**
 * SearchPage.jsx
 * Instant search by song, artist, album, genre, playlist.
 */
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { searchMusic } from '../../services/youtubeService';
import { FEATURED_SONGS, ARTISTS, ALBUMS, GENRES, CURATED_PLAYLISTS } from '../../services/mockData';
import TrackRow from '../../components/ui/TrackRow';
import { ArtistCard, AlbumCard, PlaylistCard, GenreCard } from '../../components/ui/Cards';
import { TrackRowSkeleton, CardSkeleton } from '../../components/ui/Skeleton';

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
      handleSearch(debouncedQuery);
    } else {
      setResults(null);
      setSearchParams({});
    }
  }, [debouncedQuery]);

  const handleSearch = async (q) => {
    setLoading(true);
    try {
      const songs = await searchMusic(q, 20);
      const lq = q.toLowerCase();
      const artists = ARTISTS.filter(a =>
        a.name.toLowerCase().includes(lq) ||
        a.genres.some(g => g.toLowerCase().includes(lq))
      );
      const albums = ALBUMS.filter(a =>
        a.title.toLowerCase().includes(lq) ||
        a.artist.toLowerCase().includes(lq) ||
        a.genre.toLowerCase().includes(lq)
      );
      const playlists = CURATED_PLAYLISTS.filter(p =>
        p.name.toLowerCase().includes(lq) ||
        p.description.toLowerCase().includes(lq)
      );
      const genres = GENRES.filter(g => g.name.toLowerCase().includes(lq));
      setResults({ songs, artists, albums, playlists, genres });
    } finally {
      setLoading(false);
    }
  };

  const hasResults = results && (
    results.songs.length || results.artists.length ||
    results.albums.length || results.playlists.length
  );

  return (
    <div className="px-6 py-6 page-wrapper">
      {/* Search input */}
      <div className="relative mb-8 max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums, genres..."
          autoFocus
          className="w-full pl-12 pr-12 py-4 rounded-2xl text-base text-primary placeholder:text-muted outline-none transition-all"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults(null); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* No query — show genres */}
      {!query && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4">Browse by Genre</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {GENRES.map(genre => (
              <GenreCard key={genre.id} genre={genre} />
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Songs</h3>
          <div className="space-y-1 mb-8">
            {Array(5).fill(0).map((_, i) => <TrackRowSkeleton key={i} />)}
          </div>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Artists</h3>
          <div className="flex gap-4 flex-wrap">
            {Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <AnimatePresence mode="wait">
          <motion.div
            key={debouncedQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {!hasResults && (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-primary">No results for "{query}"</p>
                <p className="text-muted mt-1">Try different keywords or check spelling</p>
              </div>
            )}

            {/* Songs */}
            {results.songs.length > 0 && (
              <section className="mb-8">
                <h3 className="text-lg font-bold text-primary mb-3">Songs</h3>
                <div className="space-y-1">
                  {results.songs.map((song, i) => (
                    <TrackRow key={song.id} track={song} index={i} queue={results.songs} />
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {results.artists.length > 0 && (
              <section className="mb-8">
                <h3 className="text-lg font-bold text-primary mb-3">Artists</h3>
                <div className="flex flex-wrap gap-4">
                  {results.artists.map(artist => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            {/* Albums */}
            {results.albums.length > 0 && (
              <section className="mb-8">
                <h3 className="text-lg font-bold text-primary mb-3">Albums</h3>
                <div className="flex flex-wrap gap-4">
                  {results.albums.map(album => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            {results.playlists.length > 0 && (
              <section className="mb-8">
                <h3 className="text-lg font-bold text-primary mb-3">Playlists</h3>
                <div className="flex flex-wrap gap-4">
                  {results.playlists.map(playlist => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              </section>
            )}

            {/* Genres */}
            {results.genres.length > 0 && (
              <section className="mb-8">
                <h3 className="text-lg font-bold text-primary mb-3">Genres</h3>
                <div className="flex flex-wrap gap-4">
                  {results.genres.map(genre => (
                    <GenreCard key={genre.id} genre={genre} />
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
