import { PlaywrightCrawler } from "crawlee";
import { extractRealPriceFromAirbnb } from "./real-price-extractor";

const testListings = [
    "https://www.airbnb.com/rooms/851289997009741371",
    "https://www.airbnb.com/rooms/1663074583509006957",
    "https://www.airbnb.com/rooms/1043429957458843360"
];

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request }) {
        const url = request.url;
        const listingId = url.split('/').pop() || '';
        
        console.log(`\n🔍 Testing real price extraction for: ${listingId}`);
        console.log(`📍 URL: ${url}`);
        
        try {
            // Extract real price using the enhanced method
            const pricePerNight = await extractRealPriceFromAirbnb(page, listingId);
            
            if (pricePerNight > 0) {
                console.log(`✅ SUCCESS - Real price extracted: €${pricePerNight}/night`);
                
                // Store the result
                await Dataset.pushData({
                    listingId,
                    pricePerNight,
                    url,
                    success: true
                });
            } else {
                console.log(`❌ FAILED - No price found`);
                
                // Store the failure
                await Dataset.pushData({
                    listingId,
                    pricePerNight: 0,
                    url,
                    success: false
                });
            }
            
        } catch (error) {
            console.error(`❌ ERROR - Failed to extract price:`, error);
            
            // Store the error
            await Dataset.pushData({
                listingId,
                pricePerNight: 0,
                url,
                success: false,
                error: error.message
            });
        }
    },
    headless: true,
    maxRequestRetries: 2,
    requestHandlerTimeoutSecs: 60,
});

// Run the test
console.log('🚀 Starting real price extraction test...\n');

crawler.run(testListings.map(url => ({ url })))
    .then(() => {
        console.log('\n🎉 Real price extraction test completed');
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
    });
