/**
 * storageService.js
 * Typed localStorage helpers for all persistent app data.
 */

const KEYS = {
  USER: 'wavify_user',
  USERS_DB: 'wavify_users_db',
  LIKED_SONGS: 'wavify_liked_songs',
  LIKED_ALBUMS: 'wavify_liked_albums',
  LIKED_ARTISTS: 'wavify_liked_artists',
  LIKED_PLAYLISTS: 'wavify_liked_playlists',
  PLAYLISTS: 'wavify_playlists',
  RECENTLY_PLAYED: 'wavify_recently_played',
  PLAY_COUNTS: 'wavify_play_counts',
  FOLLOWED_ARTISTS: 'wavify_followed_artists',
  THEME: 'wavify_theme',
  ACCENT: 'wavify_accent',
  QUEUE: 'wavify_queue',
  VOLUME: 'wavify_volume',
  REPEAT: 'wavify_repeat',
  SHUFFLE: 'wavify_shuffle',
};

// ─── Generic helpers ───────────────────────────────────────────────────────────
function get(key, defaultValue = null) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage set error:', e);
  }
}

function remove(key) {
  localStorage.removeItem(key);
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authStorage = {
  getUser: () => get(KEYS.USER),
  setUser: (user) => set(KEYS.USER, user),
  clearUser: () => remove(KEYS.USER),
  getUsersDb: () => get(KEYS.USERS_DB, []),
  setUsersDb: (users) => set(KEYS.USERS_DB, users),
  registerUser: (userData) => {
    const db = authStorage.getUsersDb();
    const exists = db.find(u => u.email === userData.email);
    if (exists) throw new Error('Email already registered');
    const newUser = { ...userData, id: `user_${Date.now()}`, createdAt: new Date().toISOString() };
    db.push(newUser);
    authStorage.setUsersDb(db);
    const { password: _p, ...safeUser } = newUser;
    authStorage.setUser(safeUser);
    return safeUser;
  },
  loginUser: (email, password) => {
    const db = authStorage.getUsersDb();
    const user = db.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const { password: _p, ...safeUser } = user;
    authStorage.setUser(safeUser);
    return safeUser;
  },
  updateUser: (updates) => {
    const user = authStorage.getUser();
    if (!user) return;
    const updated = { ...user, ...updates };
    authStorage.setUser(updated);
    // Also update in db
    const db = authStorage.getUsersDb();
    const idx = db.findIndex(u => u.id === user.id);
    if (idx !== -1) db[idx] = { ...db[idx], ...updates };
    authStorage.setUsersDb(db);
    return updated;
  },
};

// ─── Library ───────────────────────────────────────────────────────────────────
export const libraryStorage = {
  // Liked Songs
  getLikedSongs: () => get(KEYS.LIKED_SONGS, []),
  addLikedSong: (songId) => {
    const songs = libraryStorage.getLikedSongs();
    if (!songs.includes(songId)) set(KEYS.LIKED_SONGS, [songId, ...songs]);
  },
  removeLikedSong: (songId) => {
    set(KEYS.LIKED_SONGS, libraryStorage.getLikedSongs().filter(id => id !== songId));
  },
  isLiked: (songId) => libraryStorage.getLikedSongs().includes(songId),

  // Liked Albums
  getLikedAlbums: () => get(KEYS.LIKED_ALBUMS, []),
  toggleLikedAlbum: (albumId) => {
    const albums = libraryStorage.getLikedAlbums();
    const next = albums.includes(albumId) ? albums.filter(id => id !== albumId) : [albumId, ...albums];
    set(KEYS.LIKED_ALBUMS, next);
  },
  isAlbumLiked: (albumId) => libraryStorage.getLikedAlbums().includes(albumId),

  // Liked Artists
  getLikedArtists: () => get(KEYS.LIKED_ARTISTS, []),
  toggleLikedArtist: (artistId) => {
    const artists = libraryStorage.getLikedArtists();
    const next = artists.includes(artistId) ? artists.filter(id => id !== artistId) : [artistId, ...artists];
    set(KEYS.LIKED_ARTISTS, next);
  },
  isArtistLiked: (artistId) => libraryStorage.getLikedArtists().includes(artistId),

  // Liked Playlists
  getLikedPlaylists: () => get(KEYS.LIKED_PLAYLISTS, []),
  toggleLikedPlaylist: (playlistId) => {
    const lists = libraryStorage.getLikedPlaylists();
    const next = lists.includes(playlistId) ? lists.filter(id => id !== playlistId) : [playlistId, ...lists];
    set(KEYS.LIKED_PLAYLISTS, next);
  },
  isPlaylistLiked: (playlistId) => libraryStorage.getLikedPlaylists().includes(playlistId),

  // User Playlists
  getPlaylists: () => get(KEYS.PLAYLISTS, []),
  setPlaylists: (playlists) => set(KEYS.PLAYLISTS, playlists),
  createPlaylist: (name, coverUrl = null) => {
    const playlists = libraryStorage.getPlaylists();
    const newPlaylist = {
      id: `playlist_user_${Date.now()}`,
      name,
      cover: coverUrl || null,
      description: '',
      songIds: [],
      createdAt: new Date().toISOString(),
      pinned: false,
    };
    set(KEYS.PLAYLISTS, [newPlaylist, ...playlists]);
    return newPlaylist;
  },
  updatePlaylist: (id, updates) => {
    const playlists = libraryStorage.getPlaylists();
    const updated = playlists.map(p => p.id === id ? { ...p, ...updates } : p);
    set(KEYS.PLAYLISTS, updated);
  },
  deletePlaylist: (id) => {
    set(KEYS.PLAYLISTS, libraryStorage.getPlaylists().filter(p => p.id !== id));
  },
  duplicatePlaylist: (id) => {
    const playlists = libraryStorage.getPlaylists();
    const source = playlists.find(p => p.id === id);
    if (!source) return;
    const copy = { ...source, id: `playlist_user_${Date.now()}`, name: `${source.name} (Copy)`, createdAt: new Date().toISOString() };
    set(KEYS.PLAYLISTS, [copy, ...playlists]);
    return copy;
  },
  addSongToPlaylist: (playlistId, songId) => {
    const playlists = libraryStorage.getPlaylists();
    const updated = playlists.map(p => {
      if (p.id !== playlistId) return p;
      if (p.songIds.includes(songId)) return p;
      return { ...p, songIds: [...p.songIds, songId] };
    });
    set(KEYS.PLAYLISTS, updated);
  },
  removeSongFromPlaylist: (playlistId, songId) => {
    const playlists = libraryStorage.getPlaylists();
    const updated = playlists.map(p => p.id === playlistId ? { ...p, songIds: p.songIds.filter(id => id !== songId) } : p);
    set(KEYS.PLAYLISTS, updated);
  },

  // Recently Played
  getRecentlyPlayed: () => get(KEYS.RECENTLY_PLAYED, []),
  addRecentlyPlayed: (songId) => {
    const recent = libraryStorage.getRecentlyPlayed().filter(id => id !== songId);
    set(KEYS.RECENTLY_PLAYED, [songId, ...recent].slice(0, 50));
  },
  clearRecentlyPlayed: () => set(KEYS.RECENTLY_PLAYED, []),

  // Play Counts
  getPlayCounts: () => get(KEYS.PLAY_COUNTS, {}),
  incrementPlayCount: (songId) => {
    const counts = libraryStorage.getPlayCounts();
    counts[songId] = (counts[songId] || 0) + 1;
    set(KEYS.PLAY_COUNTS, counts);
  },
  getMostPlayed: (limit = 20) => {
    const counts = libraryStorage.getPlayCounts();
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);
  },

  // Followed Artists
  getFollowedArtists: () => get(KEYS.FOLLOWED_ARTISTS, []),
  toggleFollowArtist: (artistId) => {
    const followed = libraryStorage.getFollowedArtists();
    const next = followed.includes(artistId) ? followed.filter(id => id !== artistId) : [artistId, ...followed];
    set(KEYS.FOLLOWED_ARTISTS, next);
  },
  isFollowing: (artistId) => libraryStorage.getFollowedArtists().includes(artistId),
};

// ─── Settings ──────────────────────────────────────────────────────────────────
export const settingsStorage = {
  getTheme: () => get(KEYS.THEME, 'dark'),
  setTheme: (theme) => set(KEYS.THEME, theme),
  getAccent: () => get(KEYS.ACCENT, 'green'),
  setAccent: (accent) => set(KEYS.ACCENT, accent),
  getVolume: () => get(KEYS.VOLUME, 80),
  setVolume: (vol) => set(KEYS.VOLUME, vol),
  getRepeat: () => get(KEYS.REPEAT, 'off'), // 'off' | 'one' | 'all'
  setRepeat: (mode) => set(KEYS.REPEAT, mode),
  getShuffle: () => get(KEYS.SHUFFLE, false),
  setShuffle: (val) => set(KEYS.SHUFFLE, val),
  getQueue: () => get(KEYS.QUEUE, []),
  setQueue: (queue) => set(KEYS.QUEUE, queue),
};
