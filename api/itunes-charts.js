export default async function handler(req, res) {
  const { limit } = req.query;

  try {
    const targetUrl = `https://itunes.apple.com/us/rss/topsongs/limit=${limit || 30}/json`;
    
    const response = await fetch(targetUrl);
    const data = await response.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    console.error('iTunes Charts API error:', error);
    res.status(500).json({ error: error.message });
  }
}
