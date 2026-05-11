import { PlaywrightCrawler } from "crawlee";
import { extractPriceFromAirbnbAPI } from "./api-price-extractor";

const testListings = [
    "https://www.airbnb.com/rooms/851289997009741371",
    "https://www.airbnb.com/rooms/1663074583509006957"
];

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request }) {
        const url = request.url;
        const listingId = url.split('/').pop() || '';
        
        console.log(`\n🔍 Testing API price extraction for: ${listingId}`);
        
        try {
            // Extract price using API interception method
            const pricePerNight = await extractPriceFromAirbnbAPI(page, listingId);
            
            if (pricePerNight > 0) {
                console.log(`✅ SUCCESS - API price extracted: €${pricePerNight}/night`);
            } else {
                console.log(`❌ FAILED - No price found via API`);
            }
            
        } catch (error) {
            console.error(`❌ ERROR - API extraction failed:`, error);
        }
    },
    headless: false, // Use headed mode to see what's happening
    maxRequestRetries: 1,
    requestHandlerTimeoutSecs: 90,
});

// Run the test
console.log('🚀 Starting API price extraction test...\n');

crawler.run(testListings.map(url => ({ url })))
    .then(() => {
        console.log('\n🎉 API price extraction test completed');
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
    });
