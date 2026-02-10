const puppeteer = require('puppeteer');
const fs = require('fs');

class EquipboardScraper {
    async scrape_artist(artist_slug) {
        let browser = null;
        try {
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Set user agent to avoid detection
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            const url = `https://equipboard.com/pros/${artist_slug}`;
            console.log(`Fetching ${url}...`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            const gear = await page.evaluate((slug) => {
                const data = {
                    artist: slug,
                    guitars: [],
                    amps: [],
                    effects: []
                };

                // Helper function to extract text
                const getText = (el, selector) => {
                    const found = el.querySelector(selector);
                    return found ? found.innerText.trim() : '';
                };

                // Find all items
                document.querySelectorAll('.eb-item').forEach(el => {
                    const brand = getText(el, '.eb-make-model .brand');
                    const model = getText(el, '.eb-make-model .model');
                    const fullName = brand && model ? `${brand} ${model}` : getText(el, '.eb-make-model');

                    // Determine category based on parent section ID or data attributes
                    const section = el.closest('div[id]');
                    const sectionId = section ? section.id : '';

                    if (fullName) {
                        if (sectionId.startsWith('guitars')) {
                            data.guitars.push(fullName);
                        } else if (sectionId.startsWith('amplifiers') || sectionId.includes('amps')) {
                            data.amps.push(fullName);
                        } else if (sectionId.startsWith('effects') || sectionId.includes('pedals')) {
                            data.effects.push(fullName);
                        }
                    }
                });

                return data;
            }, artist_slug);

            await browser.close();
            return gear;

        } catch (error) {
            console.error(`Error scraping ${artist_slug}:`, error.message);
            if (browser) await browser.close();
            return null;
        }
    }

    async scrape_popular_artists(limit = 3) {
        const artists = [
            'jimi-hendrix', 'john-mayer', 'eric-clapton'
            // 'slash', 'david-gilmour' // Reduced for testing
        ];

        const all_gear = [];
        for (let i = 0; i < Math.min(limit, artists.length); i++) {
            const artist = artists[i];
            console.log(`Scraping ${artist}...`);
            const gear = await this.scrape_artist(artist);
            if (gear) {
                console.log(`Found ${gear.guitars.length} guitars, ${gear.amps.length} amps`);
                all_gear.push(gear);
            }
            // Add delay
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        return all_gear;
    }
}

(async () => {
    const scraper = new EquipboardScraper();
    const gear_data = await scraper.scrape_popular_artists();

    fs.writeFileSync('scripts/gear_data.json', JSON.stringify(gear_data, null, 2));
    console.log('Done! Saved to scripts/gear_data.json');
})();
