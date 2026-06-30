import fs from 'fs';

async function check() {
  const r = await fetch('https://wavify-tau.vercel.app');
  const text = await r.text();
  const match = text.match(/src="(\/assets\/index-[^"]+)"/);
  if (match) {
    console.log('Found JS bundle:', match[1]);
    const jsUrl = 'https://wavify-tau.vercel.app' + match[1];
    const jsResp = await fetch(jsUrl);
    const jsText = await jsResp.text();
    console.log('Contains error_1?', jsText.includes('error_1'));
  } else {
    console.log('Could not find JS bundle in HTML');
  }
}
check();
