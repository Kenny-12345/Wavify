import axios from 'axios';

async function testProxy() {
  const query = "The Weeknd - Blinding Lights (Official Audio)";
  const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  
  const proxies = [
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      console.log(`Trying proxy: ${proxyUrl}`);
      const res = await axios.get(proxyUrl, { timeout: 10000 });
      const match = res.data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match) {
        console.log(`SUCCESS from ${proxyUrl}:`, match[1]);
        return;
      } else {
        console.log(`FAILED ${proxyUrl}: no match`);
      }
    } catch(e) {
      console.log(`FAILED ${proxyUrl}:`, e.message);
    }
  }
}

testProxy();
