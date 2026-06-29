import axios from 'axios';

async function testPiped() {
  const query = "The Weeknd - Blinding Lights (Official Audio)";
  
  const instances = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.syncpundit.io',
    'https://api.piped.projectsegfau.lt'
  ];

  for (const api of instances) {
    try {
      console.log(`Trying Piped instance: ${api}`);
      const res = await axios.get(`${api}/search`, {
        params: { q: query, filter: 'music_songs' },
        timeout: 5000
      });
      const items = res.data.items;
      if (items && items.length > 0) {
        console.log(`SUCCESS from ${api}:`, items[0].url);
        // url is like /watch?v=...
        const videoId = items[0].url.split('?v=')[1];
        console.log(`Video ID:`, videoId);
        return;
      } else {
        console.log(`FAILED ${api}: no items`);
      }
    } catch(e) {
      console.log(`FAILED ${api}:`, e.message);
    }
  }
}

testPiped();
