/**
 * FavoritesPage.jsx
 * Shows all favorited items: songs, albums, artists, playlists.
 */
import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { getSongById, getAlbumById, getArtistById, CURATED_PLAYLISTS } from '../../services/mockData';
import TrackRow from '../../components/ui/TrackRow';
import { AlbumCard, ArtistCard, PlaylistCard } from '../../components/ui/Cards';
import { Link } from 'react-router-dom';

export default function FavoritesPage() {
  const { likedSongs, likedAlbums, likedArtists, likedPlaylists, playlists } = useLibrary();

  const songs = useMemo(() => likedSongs.map(getSongById).filter(Boolean), [likedSongs]);
  const albums = useMemo(() => likedAlbums.map(getAlbumById).filter(Boolean), [likedAlbums]);
  const artists = useMemo(() => likedArtists.map(getArtistById).filter(Boolean), [likedArtists]);
  const favPlaylists = useMemo(() => {
    return likedPlaylists.map(id => {
      return playlists.find(p => p.id === id) || CURATED_PLAYLISTS.find(p => p.id === id);
    }).filter(Boolean);
  }, [likedPlaylists, playlists]);

  return (
    <div className="px-6 py-6 page-wrapper">
      <h1 className="text-2xl font-bold text-primary mb-8 flex items-center gap-2">
        <Heart className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="currentColor" />
        Your Favorites
      </h1>

      {/* Liked Songs */}
      {songs.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">Songs</h2>
            <Link to="/liked-songs" className="text-sm text-muted hover:text-primary transition-colors">See all</Link>
          </div>
          <div className="space-y-1">
            {songs.slice(0, 5).map((song, i) => (
              <TrackRow key={song.id} track={song} index={i} queue={songs} />
            ))}
          </div>
        </section>
      )}

      {/* Liked Albums */}
      {albums.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-primary mb-4">Albums</h2>
          <div className="flex flex-wrap gap-4">
            {albums.map(album => <AlbumCard key={album.id} album={album} />)}
          </div>
        </section>
      )}

      {/* Liked Artists */}
      {artists.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-primary mb-4">Artists</h2>
          <div className="flex flex-wrap gap-4">
            {artists.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
          </div>
        </section>
      )}

      {/* Liked Playlists */}
      {favPlaylists.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-primary mb-4">Playlists</h2>
          <div className="flex flex-wrap gap-4">
            {favPlaylists.map(playlist => <PlaylistCard key={playlist.id} playlist={playlist} />)}
          </div>
        </section>
      )}

      {/* Empty state */}
      {songs.length === 0 && albums.length === 0 && artists.length === 0 && favPlaylists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Heart className="w-16 h-16 text-muted mb-4" />
          <p className="text-xl font-semibold text-primary mb-2">Nothing here yet</p>
          <p className="text-muted">Like songs, albums, and artists to find them here.</p>
        </div>
      )}
    </div>
  );
}
