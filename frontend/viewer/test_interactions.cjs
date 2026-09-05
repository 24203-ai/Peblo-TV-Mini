const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:5174/');
  await page.waitForSelector('.brand', { timeout: 5000 });
  
  console.log("Navigated to Home");
  
  // Wait for loading to finish
  try {
    await page.waitForFunction(() => !document.body.innerText.includes('Loading content...'), { timeout: 5000 });
  } catch(e) {}
  
  console.log("Page loaded");
  
  // Check More Info button
  const moreInfoBtn = await page.$('a:has-text("More Info")');
  if (moreInfoBtn) {
    console.log("More Info button found");
  } else {
    // try to find it by text content manually
    const btn = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.find(l => l.textContent.includes('More Info'))?.href;
    });
    console.log("More Info button href:", btn);
  }
  
  // Check Play Now button
  const playBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent.includes('Play Now')) !== undefined;
  });
  console.log("Play Now button exists:", playBtn);
  
  await browser.close();
})();
