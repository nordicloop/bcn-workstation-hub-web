import { PlaywrightCrawler } from "crawlee";

const testListings = [
    "https://www.airbnb.com/rooms/851289997009741371",
    "https://www.airbnb.com/rooms/1663074583509006957"
];

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request }) {
        const url = request.url;
        const listingId = url.split('/').pop() || '';
        
        console.log(`\n🔍 Checking currency for: ${listingId}`);
        
        try {
            // Navigate to the listing page
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // Wait for price elements to load
            await page.waitForTimeout(3000);
            
            // Look for price elements and check currency
            const priceSelectors = [
                '[data-testid="price-display"]',
                '[data-testid="price-amount"]',
                '.price-amount',
                '[class*="price"]'
            ];
            
            for (const selector of priceSelectors) {
                try {
                    const element = await page.$(selector);
                    if (element) {
                        const text = await element.textContent();
                        if (text) {
                            console.log(`📊 Found price element with selector "${selector}": "${text}"`);
                            
                            // Check for currency symbols
                            if (text.includes('$')) {
                                console.log(`💵 Currency: USD`);
                            } else if (text.includes('€')) {
                                console.log(`💶 Currency: EUR`);
                            } else if (text.includes('£')) {
                                console.log(`💷 Currency: GBP`);
                            }
                        }
                    }
                } catch (error) {
                    continue;
                }
            }
            
            // Also check page content for price patterns
            const pageContent = await page.content();
            
            // Look for USD prices
            const usdMatches = pageContent.match(/\$\s*(\d+(?:,\d{3})*(?:\.\d+)?)/g);
            if (usdMatches) {
                console.log(`💵 Found USD prices: ${usdMatches.slice(0, 3).join(', ')}`);
            }
            
            // Look for EUR prices
            const eurMatches = pageContent.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*€/g);
            if (eurMatches) {
                console.log(`💶 Found EUR prices: ${eurMatches.slice(0, 3).join(', ')}`);
            }
            
        } catch (error) {
            console.error(`❌ Error checking currency: ${error}`);
        }
    },
    headless: true,
    maxRequestRetries: 1,
});

// Run the check
console.log('🔍 Checking Airbnb listing currencies...\n');

crawler.run(testListings.map(url => ({ url })))
    .then(() => {
        console.log('\n✅ Currency check completed');
    })
    .catch((error) => {
        console.error('❌ Check failed:', error);
    });
