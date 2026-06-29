import { resolveVideoId } from './src/services/youtubeService.js';

async function test() {
  const song = {
    artist: "The Weeknd",
    title: "Blinding Lights",
    videoId: null
  };
  console.log("Resolving video ID...");
  const id = await resolveVideoId(song);
  console.log("Resolved ID:", id);
}

test();
