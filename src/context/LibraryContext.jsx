/**
 * LibraryContext.jsx
 * All user library state: liked songs, playlists, history, following.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { libraryStorage } from '../services/storageService';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [likedSongs, setLikedSongs] = useState(() => libraryStorage.getLikedSongs());
  const [likedAlbums, setLikedAlbums] = useState(() => libraryStorage.getLikedAlbums());
  const [likedArtists, setLikedArtists] = useState(() => libraryStorage.getLikedArtists());
  const [likedPlaylists, setLikedPlaylists] = useState(() => libraryStorage.getLikedPlaylists());
  const [playlists, setPlaylists] = useState(() => libraryStorage.getPlaylists());
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => libraryStorage.getRecentlyPlayed());
  const [followedArtists, setFollowedArtists] = useState(() => libraryStorage.getFollowedArtists());

  // ─── Song Likes ───────────────────────────────────────────────────────────────
  const toggleLikeSong = useCallback((songId) => {
    if (likedSongs.includes(songId)) {
      libraryStorage.removeLikedSong(songId);
      setLikedSongs(prev => prev.filter(id => id !== songId));
    } else {
      libraryStorage.addLikedSong(songId);
      setLikedSongs(prev => [songId, ...prev]);
    }
  }, [likedSongs]);

  const isSongLiked = useCallback((songId) => likedSongs.includes(songId), [likedSongs]);

  // ─── Album Likes ──────────────────────────────────────────────────────────────
  const toggleLikeAlbum = useCallback((albumId) => {
    libraryStorage.toggleLikedAlbum(albumId);
    setLikedAlbums(libraryStorage.getLikedAlbums());
  }, []);

  const isAlbumLiked = useCallback((albumId) => likedAlbums.includes(albumId), [likedAlbums]);

  // ─── Artist Likes ─────────────────────────────────────────────────────────────
  const toggleLikeArtist = useCallback((artistId) => {
    libraryStorage.toggleLikedArtist(artistId);
    setLikedArtists(libraryStorage.getLikedArtists());
  }, []);

  const isArtistLiked = useCallback((artistId) => likedArtists.includes(artistId), [likedArtists]);

  // ─── Playlist Likes ───────────────────────────────────────────────────────────
  const toggleLikePlaylist = useCallback((playlistId) => {
    libraryStorage.toggleLikedPlaylist(playlistId);
    setLikedPlaylists(libraryStorage.getLikedPlaylists());
  }, []);

  const isPlaylistLiked = useCallback((playlistId) => likedPlaylists.includes(playlistId), [likedPlaylists]);

  // ─── Playlist Management ──────────────────────────────────────────────────────
  const createPlaylist = useCallback((name, coverUrl = null) => {
    const newPlaylist = libraryStorage.createPlaylist(name, coverUrl);
    setPlaylists(libraryStorage.getPlaylists());
    return newPlaylist;
  }, []);

  const updatePlaylist = useCallback((id, updates) => {
    libraryStorage.updatePlaylist(id, updates);
    setPlaylists(libraryStorage.getPlaylists());
  }, []);

  const deletePlaylist = useCallback((id) => {
    libraryStorage.deletePlaylist(id);
    setPlaylists(libraryStorage.getPlaylists());
  }, []);

  const duplicatePlaylist = useCallback((id) => {
    const copy = libraryStorage.duplicatePlaylist(id);
    setPlaylists(libraryStorage.getPlaylists());
    return copy;
  }, []);

  const addSongToPlaylist = useCallback((playlistId, songId) => {
    libraryStorage.addSongToPlaylist(playlistId, songId);
    setPlaylists(libraryStorage.getPlaylists());
  }, []);

  const removeSongFromPlaylist = useCallback((playlistId, songId) => {
    libraryStorage.removeSongFromPlaylist(playlistId, songId);
    setPlaylists(libraryStorage.getPlaylists());
  }, []);

  // ─── Recently Played ──────────────────────────────────────────────────────────
  const addToRecentlyPlayed = useCallback((songId) => {
    libraryStorage.addRecentlyPlayed(songId);
    libraryStorage.incrementPlayCount(songId);
    setRecentlyPlayed(libraryStorage.getRecentlyPlayed());
  }, []);

  const clearHistory = useCallback(() => {
    libraryStorage.clearRecentlyPlayed();
    setRecentlyPlayed([]);
  }, []);

  const getMostPlayed = useCallback((limit = 20) => libraryStorage.getMostPlayed(limit), []);

  // ─── Following ────────────────────────────────────────────────────────────────
  const toggleFollowArtist = useCallback((artistId) => {
    libraryStorage.toggleFollowArtist(artistId);
    setFollowedArtists(libraryStorage.getFollowedArtists());
  }, []);

  const isFollowing = useCallback((artistId) => followedArtists.includes(artistId), [followedArtists]);

  return (
    <LibraryContext.Provider value={{
      likedSongs, likedAlbums, likedArtists, likedPlaylists,
      playlists, recentlyPlayed, followedArtists,
      toggleLikeSong, isSongLiked,
      toggleLikeAlbum, isAlbumLiked,
      toggleLikeArtist, isArtistLiked,
      toggleLikePlaylist, isPlaylistLiked,
      createPlaylist, updatePlaylist, deletePlaylist, duplicatePlaylist,
      addSongToPlaylist, removeSongFromPlaylist,
      addToRecentlyPlayed, clearHistory, getMostPlayed,
      toggleFollowArtist, isFollowing,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
};
