import axios from 'axios';

const INVIDIOUS_INSTANCES = [
  'https://invidious.projectsegfau.lt',
  'https://invidious.lunar.icu',
  'https://yewtu.be',
  'https://invidious.flokinet.to',
  'https://vid.puffyan.us',
  'https://inv.tux.im',
];

async function testResolvers() {
  const query = "The Weeknd - Blinding Lights (Official Audio)";
  console.log("Query:", query);

  let success = false;
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      console.log(`Trying Invidious instance: ${instance}`);
      const res = await axios.get(`${instance}/api/v1/search`, {
        params: { q: query, type: 'video' },
        timeout: 4000
      });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        console.log("SUCCESS from", instance, "Video ID:", res.data[0].videoId);
        success = true;
      } else {
        console.log("FAILED", instance, "returned invalid data format");
      }
    } catch (e) {
      console.log("FAILED", instance, e.message);
    }
  }

  if (!success) {
    try {
      console.log("Trying AllOrigins RAW...");
      const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      const res = await axios.get(proxyUrl);
      const match = res.data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match) {
        console.log("SUCCESS from AllOrigins RAW", match[1]);
      } else {
        console.log("FAILED AllOrigins RAW: no match");
      }
    } catch(e) {
      console.log("FAILED AllOrigins RAW", e.message);
    }
  }
}

testResolvers();
