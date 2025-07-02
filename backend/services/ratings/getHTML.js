const puppeteer = require('puppeteer-extra')
const fs = require('fs')
// Add adblocker plugin, which will transparently block ads in all pages you
// create using puppeteer.
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(
  AdblockerPlugin({
    // Optionally enable Cooperative Mode for several request interceptors
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
  })
)

;(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Set to true for headless scraping
    const page = await browser.newPage();

    // Go to RateMyProfessors TAMU search
    await page.goto('https://www.ratemyprofessors.com/search/professors/1003?q=*', {
        waitUntil: 'networkidle2'
    });

    // Give React/GraphQL time to fully render (important!)
    console.log("Initial wait for React to finish...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    let clickCount = 0;

    while (true) {
  try {
    // Find all buttons
    const buttons = await page.$$('button');
    if (!buttons || buttons.length === 0) {
      console.log('No buttons found. Done.');
      break;
    }

    let clicked = false;

    for (const btn of buttons) {
      const text = await (await btn.getProperty('textContent')).jsonValue();
      if (text && text.trim().toLowerCase() === 'show more') {
        console.log(`Scrolling to and clicking "Show More" (${++clickCount})...`);

        // Scroll the button into view inside the page context
        await page.evaluate(button => {
          button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, btn);

        // Wait a little for smooth scroll animation
        await new Promise(resolve => setTimeout(resolve, 500));

        // Click the button
        await btn.click();

        clicked = true;
        break; // click only one per loop iteration
      }
    }

    if (!clicked) {
      console.log('No "Show More" button found. Done.');
      break;
    }

    // Wait for new content to load after click
    await new Promise(resolve => setTimeout(resolve, 2500));

  } catch (err) {
    console.log('Error or no more "Show More" button. Finished.');
    break;
  }
}

    // Save the final rendered HTML
    const htmlContent = await page.content();
    fs.writeFileSync('output.html', htmlContent);
    console.log('✅ Final HTML saved to output.html');

    await browser.close();
})();