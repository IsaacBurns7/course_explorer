// Goes through each professor, calls getInfo, adds more specified information such as specific class ratings, pushes to new json file 

const professors = require('./professors.json')
const puppeteer = require('puppeteer-extra')
const path = require('path')
const fs = require('fs')

const {getInfo} = require('./helpers/getInfo.js')
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(
  AdblockerPlugin({
    interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
  })
)

;(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const enriched = [];

    for (let i = 0; i < professors.length; i++) {
        const prof = professors[i]
        //if (info.some(obj => obj.hasOwnProperty(prof.name))) continue;
        if (prof.rating == null) continue;

        console.log(`(${i + 1}/${professors.length}) Visiting ${prof.name}`);
        try {
            console.log("Initial wait for React to finish...");
            await page.goto(prof.profileLink, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 5000)); // wait for components to load in
            let clickCount = 0;
            while (true) {
                let clicked = false;
                const buttons = await page.$$('button');
                if (!buttons || buttons.length === 0) {
                    console.log('No buttons found. Done.');
                    break;
                }

                for (const btn of buttons) {
                    const text = await (await btn.getProperty('textContent')).jsonValue();
                    if (text && text.trim().toLowerCase() === 'load more ratings') {
                        console.log(`Scrolling to and clicking "Show More" (${++clickCount})... for ${prof.name}`);

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
                    const htmlContent = await page.content();
                    const info = getInfo(htmlContent)
                    const index = enriched.findIndex(obj => obj.name === prof.name);
                    if (index != -1) {
                        enriched[index] = info
                        console.log("Replaced error info")
                    } else {
                        enriched.push(info)
                        console.log("Pushed new info")
                    }
                    console.log(`✅ ${prof.name} done`);
                    fs.writeFileSync('professors-enriched.json', JSON.stringify(enriched, null, 2));
                    console.log(info)
                    break;
                }

                // Wait for new content to load after click
                await new Promise(resolve => setTimeout(resolve, 2500));
            }
        } catch (err) {
            console.error(`❌ Error scraping ${prof.name}:`, err.message);
            enriched.push({
                ...prof,
                topTags: [],
                recentComments: [],
                error: true
            });
        }
    }

    await browser.close();

    console.log("Finished!")
})();