const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to S21 Plus landscape (e.g. 915 x 412)
  await page.setViewport({ width: 915, height: 412, isMobile: true, hasTouch: true, isLandscape: true });
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Click on "Control" tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const controlTab = tabs.find(t => t.innerText && t.innerText.includes('Control'));
    if (controlTab) controlTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:\\Users\\hiep.pham\\.gemini\\antigravity\\brain\\a5137779-8eda-49ed-b440-c8bf7340842d\\scratch\\control.png' });

  // Click on "Filament" tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const filamentTab = tabs.find(t => t.innerText && t.innerText.includes('Filament'));
    if (filamentTab) filamentTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:\\Users\\hiep.pham\\.gemini\\antigravity\\brain\\a5137779-8eda-49ed-b440-c8bf7340842d\\scratch\\filament.png' });

  await browser.close();
})();
