/**
 * lyricsService.js
 * Fetches lyrics from lyrics.ovh API.
 */
import axios from 'axios';

const LYRICS_API_URL = 'https://api.lyrics.ovh/v1';

/**
 * Fetch lyrics for a song.
 * @param {string} artist
 * @param {string} title
 * @returns {Promise<string[]>} Array of lyrics lines
 */
export async function getLyrics(artist, title) {
  // Clean titles (remove feat., ft., etc.)
  const cleanTitle = title.replace(/\(feat\..*?\)/gi, '').replace(/ft\..*?/gi, '').trim();
  const cleanArtist = artist.split('&')[0].split(',')[0].trim();

  try {
    const response = await axios.get(`${LYRICS_API_URL}/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`);
    if (response.data && response.data.lyrics) {
      // Split by newlines and filter empty lines
      return response.data.lyrics
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('Paroles de '));
    }
  } catch (error) {
    console.warn(`Lyrics not found for: ${cleanArtist} - ${cleanTitle}`);
  }

  // Fallback / Mock lyrics generated on the fly for demonstration
  return [
    `[Instrumental Intro]`,
    `Enjoying "${title}" by ${artist}?`,
    `We couldn't fetch the official lyrics for this track automatically.`,
    `Here's a nice place to sing along!`,
    `♪ ♫ ♬`,
    `La la la...`,
    `You are listening to "${title}" on Wavify.`,
    `[Instrumental Outro]`
  ];
}
