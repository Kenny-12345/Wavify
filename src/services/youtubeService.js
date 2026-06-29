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
 * @returns {Promise<Array>} List of songs
 */
export async function getTopCharts(limit = 30) {
  try {
    const response = await axios.get(`/api/itunes-charts?limit=${limit}`);
    const entries = response.data?.feed?.entry || [];
    
    return entries.map((entry, index) => {
      const trackId = entry.id?.attributes?.['im:id'] || `chart_${index}`;
      const title = entry['im:name']?.label || 'Unknown Title';
      const artist = entry['im:artist']?.label || 'Unknown Artist';
      const album = entry['im:collection']?.['im:name']?.label || 'Single';
      const genre = entry['category']?.attributes?.label || 'Pop';
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
        genre,
        year,
        thumbnail: artwork || 'https://via.placeholder.com/400?text=♪',
        videoId: null,
        plays: 10000000 - (index * 200000) + Math.floor(Math.random() * 50000),
      };
    });
  } catch (error) {
    console.error('Failed to fetch top charts from iTunes RSS:', error);
    return FEATURED_SONGS;
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
