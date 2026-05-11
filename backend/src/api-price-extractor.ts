import { Page } from 'playwright';

export async function extractPriceFromAirbnbAPI(page: Page, listingId: string): Promise<number> {
  try {
    console.log(`🔍 Extracting price from Airbnb API for: ${listingId}`);
    
    // Navigate to the listing page
    const url = `https://www.airbnb.com/rooms/${listingId}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Set up network interception to capture API calls
    let priceData: any = null;
    
    page.on('response', async (response) => {
      const url = response.url();
      
      // Look for Airbnb API endpoints that might contain pricing data
      if (url.includes('api.airbnb.com') || url.includes('airbnb.com/api')) {
        try {
          const data = await response.json();
          
          // Search for price information in the response
          const searchForPrice = (obj: any, path: string = ''): void => {
            if (typeof obj === 'object' && obj !== null) {
              for (const key in obj) {
                if (key.toLowerCase().includes('price') && obj[key] !== null) {
                  console.log(`🔍 Found price field at ${path}.${key}:`, obj[key]);
                  if (typeof obj[key] === 'number' && obj[key] > 0) {
                    priceData = obj[key];
                  } else if (typeof obj[key] === 'string') {
                    const price = parseFloat(obj[key].replace(/[^0-9.]/g, ''));
                    if (price > 0) {
                      priceData = price;
                    }
                  }
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                  searchForPrice(obj[key], `${path}.${key}`);
                }
              }
            }
          };
          
          searchForPrice(data);
          
        } catch (error) {
          // Ignore JSON parsing errors
        }
      }
    });
    
    // Wait for network activity and try to trigger price loading
    await page.waitForTimeout(5000);
    
    // Try to trigger price calculation by selecting dates
    try {
      // Look for date input fields
      const dateInputs = await page.$$('input[type="date"], [data-testid="date-input"]');
      if (dateInputs.length > 0) {
        console.log(`📅 Found ${dateInputs.length} date inputs`);
        
        // Try to set dates to trigger price calculation
        await dateInputs[0].fill('2026-06-01');
        await page.waitForTimeout(1000);
        
        if (dateInputs.length > 1) {
          await dateInputs[1].fill('2026-06-02');
          await page.waitForTimeout(2000);
        }
      }
    } catch (error) {
      console.log(`❌ Date selection failed: ${error}`);
    }
    
    // Try to click on booking button to trigger price calculation
    try {
      const bookButton = await page.$('[data-testid="book-it-button"], [data-testid="book-it-container"]');
      if (bookButton) {
        console.log(`🖱️ Clicking booking button to trigger price calculation`);
        await bookButton.click();
        await page.waitForTimeout(3000);
      }
    } catch (error) {
      console.log(`❌ Booking button click failed: ${error}`);
    }
    
    // Wait a bit more for network requests
    await page.waitForTimeout(3000);
    
    if (priceData && priceData > 0) {
      console.log(`💰 API price extraction successful: ${priceData}`);
      return priceData;
    }
    
    // Fallback: Try to find price in page content after API calls
    console.log(`🔍 API extraction failed, trying page content...`);
    
    const pageContent = await page.content();
    
    // Look for specific price patterns that might be loaded dynamically
    const dynamicPatterns = [
      /"price":\s*(\d+(?:\.\d+)?)/gi,
      /"amount":\s*(\d+(?:\.\d+)?)/gi,
      /"perNight":\s*(\d+(?:\.\d+)?)/gi,
      /pricePerNight["\s:]+\s*(\d+(?:\.\d+)?)/gi,
      /"nightly_price":\s*(\d+(?:\.\d+)?)/gi,
      /"base_price":\s*(\d+(?:\.\d+)?)/gi
    ];
    
    for (const pattern of dynamicPatterns) {
      const matches = pageContent.match(pattern);
      if (matches) {
        console.log(`📋 Found ${matches.length} matches with pattern: ${pattern}`);
        for (const match of matches) {
          const priceMatch = match.match(/(\d+(?:\.\d+)?)/);
          if (priceMatch) {
            const price = parseFloat(priceMatch[1]);
            if (price > 10 && price < 10000) {
              console.log(`💰 Extracted dynamic price: ${price}`);
              return price;
            }
          }
        }
      }
    }
    
    console.log(`❌ No price data found`);
    return 0;
    
  } catch (error) {
    console.error(`❌ API price extraction failed:`, error);
    return 0;
  }
}
