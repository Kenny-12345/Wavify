async function testNodeFetch() {
  const query = "The Weeknd - Blinding Lights (Official Audio)";
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (match) {
      console.log("SUCCESS Node Fetch:", match[1]);
    } else {
      console.log("FAILED Node Fetch: no match");
    }
  } catch(e) {
    console.log("FAILED Node Fetch:", e.message);
  }
}

testNodeFetch();
