/**
 * LibraryPage.jsx
 * User's complete library: playlists, liked albums/artists, history.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Music, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { getAlbumById, getArtistById, CURATED_PLAYLISTS } from '../../services/mockData';
import { AlbumCard, ArtistCard, PlaylistCard } from '../../components/ui/Cards';
import toast from 'react-hot-toast';

const TABS = ['Playlists', 'Albums', 'Artists', 'Curated'];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('Playlists');
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const navigate = useNavigate();
  const { playlists, createPlaylist, likedAlbums, likedArtists } = useLibrary();

  const likedAlbumObjects = likedAlbums.map(getAlbumById).filter(Boolean);
  const likedArtistObjects = likedArtists.map(getArtistById).filter(Boolean);

  const handleCreate = () => {
    const name = `My Playlist #${playlists.length + 1}`;
    const playlist = createPlaylist(name);
    toast.success(`"${name}" created!`);
    navigate(`/playlist/${playlist.id}`);
  };

  return (
    <div className="px-6 py-6 page-wrapper">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Your Library</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg hover:bg-white/10 text-muted hover:text-primary transition-colors"
          >
            {view === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-black hover:opacity-90 transition-all"
            style={{ background: 'var(--accent)' }}
          >
            <Plus className="w-4 h-4" />
            New Playlist
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'text-black'
                : 'text-secondary hover:text-primary hover:bg-white/10'
            }`}
            style={activeTab === tab ? { background: 'var(--text-primary)' } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'Playlists' && (
          <div>
            {playlists.length === 0 ? (
              <EmptyState
                icon={Music}
                title="Create your first playlist"
                desc="It's easy, we'll help you."
                actionLabel="Create playlist"
                onAction={handleCreate}
              />
            ) : (
              <div className={view === 'grid' ? 'flex flex-wrap gap-4' : 'space-y-2'}>
                {playlists.map(playlist => (
                  view === 'grid'
                    ? <PlaylistCard key={playlist.id} playlist={playlist} />
                    : <PlaylistListItem key={playlist.id} playlist={playlist} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Albums' && (
          <div>
            {likedAlbumObjects.length === 0 ? (
              <EmptyState icon={Music} title="No saved albums" desc="Save albums to find them here." />
            ) : (
              <div className="flex flex-wrap gap-4">
                {likedAlbumObjects.map(album => <AlbumCard key={album.id} album={album} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Artists' && (
          <div>
            {likedArtistObjects.length === 0 ? (
              <EmptyState icon={Music} title="No saved artists" desc="Follow artists to find them here." />
            ) : (
              <div className="flex flex-wrap gap-4">
                {likedArtistObjects.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Curated' && (
          <div className="flex flex-wrap gap-4">
            {CURATED_PLAYLISTS.map(playlist => <PlaylistCard key={playlist.id} playlist={playlist} />)}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Icon className="w-14 h-14 text-muted mb-4" />
      <p className="text-xl font-semibold text-primary mb-1">{title}</p>
      <p className="text-muted mb-4">{desc}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 rounded-full font-semibold text-sm text-black hover:opacity-90 transition-all"
          style={{ background: 'var(--accent)' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function PlaylistListItem({ playlist }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/playlist/${playlist.id}`)}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group"
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-700 flex items-center justify-center">
        {playlist.cover
          ? <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover" />
          : <Music className="w-5 h-5 text-muted" />}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold text-primary truncate">{playlist.name}</p>
        <p className="text-xs text-muted">{playlist.songIds.length} songs</p>
      </div>
    </button>
  );
}
