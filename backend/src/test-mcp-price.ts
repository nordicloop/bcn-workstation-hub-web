import { Dataset, PlaywrightCrawler } from "crawlee";
import { enhanceScraperWithMCPPrice } from "./mcp-price-extractor";

const testListings = [
    "https://www.airbnb.com/rooms/851289997009741371",
    "https://www.airbnb.com/rooms/1663074583509006957",
    "https://www.airbnb.com/rooms/1043429957458843360"
];

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request }) {
        const url = request.url;
        const listingId = url.split('/').pop() || '';
        
        console.log(`Testing price extraction for listing: ${listingId}`);
        
        try {
            // Navigate to the page
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // Extract price using MCP-enhanced method
            const pricePerNight = await enhanceScraperWithMCPPrice(page, listingId);
            
            console.log(`✅ Price extracted for ${listingId}: $${pricePerNight}`);
            
            // Store the result
            await Dataset.pushData({
                listingId,
                pricePerNight,
                url
            });
            
        } catch (error) {
            console.error(`❌ Error extracting price for ${listingId}:`, error);
        }
    },
    headless: true,
});

// Run the test
crawler.run(testListings.map(url => ({ url })))
    .then(() => {
        console.log('✅ MCP price extraction test completed');
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
    });
