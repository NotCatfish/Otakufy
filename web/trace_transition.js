const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Navigate to Dashboard
  await page.goto('http://localhost:3000');
  
  // Wait for the page to load
  await page.waitForSelector('a[href="/practice/kanji"]');

  // Inject script to monitor classes on SmoothFade and PageContainer
  await page.evaluate(() => {
    window.mutationLogs = [];
    
    // We will watch document.body for any changes to classes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const el = mutation.target;
          if (el.id === 'content-bounds' || el.tagName === 'A' || el.tagName === 'MAIN' || el.className.includes('gentle-fade-down')) {
            window.mutationLogs.push({
              time: performance.now(),
              id: el.id,
              tag: el.tagName,
              className: el.className,
              styleDelay: el.style.animationDelay,
              styleMode: el.style.animationFillMode
            });
          }
        }
      }
    });
    
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    });
  });

  // Click Kanji
  console.log('Clicking Kanji...');
  await page.click('a[href="/practice/kanji"]');
  
  // Wait 2.5 seconds
  await new Promise(r => setTimeout(r, 2500));
  
  // Get logs
  const logs = await page.evaluate(() => window.mutationLogs);
  console.log('Mutation Logs:', JSON.stringify(logs, null, 2));

  await browser.close();
})();
