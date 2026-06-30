import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  try {
    await page.goto('https://wavify-tau.vercel.app', { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Find and click Guest button
    const buttons = await page.$$('button');
    for (let b of buttons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && text.toLowerCase().includes('guest')) {
        console.log('Found guest button, clicking...');
        await b.click();
        break;
      }
    }
    
    // Wait for redirect to home
    await new Promise(r => setTimeout(r, 4000));
    
    // Scrape texts
    const texts = await page.evaluate(() => 
      Array.from(document.querySelectorAll('h1, h2, h3, p, span'))
        .map(e => e.innerText)
        .filter(t => t.trim().length > 0)
        .slice(0, 30)
    );
    console.log('TEXTS:', texts);
  } catch (e) {
    console.error('Failed to load page:', e);
  } finally {
    await browser.close();
  }
})();
