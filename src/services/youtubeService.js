/**
 * youtubeService.js
 * Combines iTunes Search & Top Charts APIs with a CORS-free YouTube video resolver.
 */
import axios from 'axios';
import { FEATURED_SONGS } from './mockData';

// Public Invidious instances with open CORS policies for API queries
const INVIDIOUS_INSTANCES = [
  'https://invidious.projectsegfau.lt',
  'https://invidious.lunar.icu',
  'https://yewtu.be',
  'https://invidious.flokinet.to',
  'https://vid.puffyan.us',
  'https://inv.tux.im',
];

/**
 * Fetches the current top trending songs globally from iTunes RSS feed.
 * @param {number} limit
 * @param {string} genre (iTunes Genre ID)
 * @param {string} country (2-letter country code)
 * @returns {Promise<Array>} List of songs
 */
export async function getTopCharts(limit = 30, genre = null, country = 'us') {
  try {
    let url = `/api/itunes-charts?limit=${limit}&country=${country}`;
    if (genre) url += `&genre=${genre}`;
    
    const response = await axios.get(url);
    const entries = response.data?.feed?.entry || [];
    
    return entries.map((entry, index) => {
      const trackId = entry.id?.attributes?.['im:id'] || `chart_${index}`;
      const title = entry['im:name']?.label || 'Unknown Title';
      const artist = entry['im:artist']?.label || 'Unknown Artist';
      const album = entry['im:collection']?.['im:name']?.label || 'Single';
      const songGenre = entry['category']?.attributes?.label || 'Pop';
      const releaseDate = entry['im:releaseDate']?.label;
      const year = releaseDate ? new Date(releaseDate).getFullYear() : new Date().getFullYear();
      
      const rawImg = entry['im:image']?.[2]?.label || '';
      const artwork = rawImg.replace(/\/\d+x\d+bb/g, '/400x400bb');

      return {
        id: `itunes_${trackId}`,
        title,
        artist,
        artistId: `itunes_artist_${trackId}`,
        album,
        albumId: `itunes_album_${trackId}`,
        duration: 210, 
        genre: songGenre,
        year,
        thumbnail: artwork || 'https://via.placeholder.com/400?text=♪',
        videoId: null,
        plays: 10000000 - (index * 200000) + Math.floor(Math.random() * 50000),
      };
    });
  } catch (error) {
    console.error('Failed to fetch top charts from iTunes RSS:', error);
    return [
      {
        id: 'error_1',
        title: 'Error: ' + error.message,
        artist: error.toString(),
        albumId: 'error_album',
        artistId: 'error_artist',
        genre: 'Error',
        year: 2026,
        thumbnail: 'https://via.placeholder.com/400?text=Error',
        plays: 0
      },
      ...FEATURED_SONGS.slice(0, 20)
    ];
  }
}

/**
 * Dynamically fetches several iTunes charts and creates realistic playlists.
 */
export async function getDynamicPlaylists() {
  try {
    // 14 = Pop, 18 = Hip-Hop, 17 = Dance/Electronic, 16 = R&B
    const [global, pop, hiphop, dance] = await Promise.all([
      getTopCharts(50),
      getTopCharts(30, 14),
      getTopCharts(30, 18),
      getTopCharts(30, 17)
    ]);

    return [
      {
        id: 'dyn_global50',
        name: 'Global Top 50',
        description: 'The most played tracks right now across the globe.',
        cover: global[0]?.thumbnail || 'https://via.placeholder.com/400?text=Global',
        songObjects: global, // Passing objects directly so we don't need getSongById
        isOfficial: true,
      },
      {
        id: 'dyn_pop',
        name: 'Pop Essentials',
        description: 'The biggest pop hits playing right now.',
        cover: pop[0]?.thumbnail || 'https://via.placeholder.com/400?text=Pop',
        songObjects: pop,
        isOfficial: true,
      },
      {
        id: 'dyn_hiphop',
        name: 'Trending Hip-Hop',
        description: 'The hottest hip-hop and rap tracks.',
        cover: hiphop[0]?.thumbnail || 'https://via.placeholder.com/400?text=HipHop',
        songObjects: hiphop,
        isOfficial: true,
      },
      {
        id: 'dyn_dance',
        name: 'Dance & Electronic',
        description: 'High-energy electronic beats.',
        cover: dance[0]?.thumbnail || 'https://via.placeholder.com/400?text=Dance',
        songObjects: dance,
        isOfficial: true,
      }
    ];
  } catch (e) {
    console.error('Failed to generate dynamic playlists:', e);
    return [];
  }
}

/**
 * Search the iTunes API for high-quality song metadata.
 * @param {string} query
 * @returns {Promise<Array>} List of formatted songs
 */
export async function searchMusic(query) {
  if (!query || query.trim().length === 0) return [];

  try {
    const response = await axios.get('/api/itunes', {
      params: {
        term: query,
        media: 'music',
        entity: 'song',
        limit: 30,
      },
    });

    const results = response.data.results || [];
    
    return results.map(track => {
      const artwork = track.artworkUrl100
        ? track.artworkUrl100.replace('100x100bb', '400x400bb')
        : 'https://via.placeholder.com/400?text=♪';

      return {
        id: `itunes_${track.trackId}`,
        title: track.trackName,
        artist: track.artistName,
        artistId: `itunes_artist_${track.artistId}`,
        album: track.collectionName || 'Single',
        albumId: `itunes_album_${track.collectionId}`,
        duration: Math.floor(track.trackTimeMillis / 1000),
        genre: track.primaryGenreName || 'Pop',
        year: new Date(track.releaseDate).getFullYear(),
        thumbnail: artwork,
        videoId: null, 
        plays: Math.floor(Math.random() * 5000000) + 10000,
      };
    });
  } catch (error) {
    console.error('iTunes Search API failed, falling back to mock data:', error);
    const q = query.toLowerCase();
    return FEATURED_SONGS.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q)
    );
  }
}

/**
 * Resolves a YouTube video ID using our internal Vercel/Vite API.
 * This runs client-side but hits our own proxy to bypass CORS safely.
 * @param {Object} song
 * @returns {Promise<string|null>} YouTube Video ID or null
 */
export async function resolveVideoId(song) {
  if (song.videoId) return song.videoId;

  const query = `${song.artist} - ${song.title} (Official Audio)`;
  
  try {
    // Call our internal Vite/Vercel serverless function
    const response = await axios.get('/api/yt-search', {
      params: { q: query },
      timeout: 5000,
    });
    
    if (response.data && response.data.videoId) {
      console.log(`Resolved Video ID via internal API: ${response.data.videoId}`);
      return response.data.videoId;
    }
  } catch (e) {
    console.error('Failed to resolve via internal API:', e.message);
  }

  // Fallback if the internal API somehow fails (e.g., rate limited by YouTube)
  // This just passes `null` back, which triggers the Iframe loadPlaylist search fallback.
  return null;
}
