import { Page } from 'playwright';

export async function extractRealPriceFromAirbnb(page: Page, listingId: string): Promise<number> {
  try {
    // Navigate to the Airbnb listing page with specific dates
    const url = `https://www.airbnb.com/rooms/${listingId}?check_in=2026-06-01&check_out=2026-06-02&adults=1&guests=1`;
    
    console.log(`🔍 Extracting real price from: ${url}`);
    
    // Navigate with extended timeout
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });

    // Wait for page to fully load
    await page.waitForTimeout(5000);

    // Try multiple specific selectors for price elements
    const priceSelectors = [
      '[data-testid="price-display"]',
      '[data-testid="price-amount"]',
      '[data-testid="book-it-container"] [data-testid="price-display"]',
      '.price-amount',
      '.per-night',
      '[class*="price"]',
      '[data-automation="price"]',
      '.book-it__price',
      '.price-summary__amount'
    ];

    let pricePerNight = 0;

    // Method 1: Try specific price selectors
    for (const selector of priceSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          console.log(`📊 Found element with selector "${selector}": "${text}"`);
          
          if (text) {
            // Extract price using multiple regex patterns
            const pricePatterns = [
              /[\$€£¥]\s*(\d+(?:,\d{3})*(?:\.\d+)?)/,
              /(\d+(?:,\d{3})*(?:\.\d+)?)\s*[\$€£¥]/,
              /(\d+(?:,\d{3})*(?:\.\d+)?)/
            ];

            for (const pattern of pricePatterns) {
              const match = text.match(pattern);
              if (match) {
                const price = parseFloat(match[1].replace(/,/g, ''));
                if (price > 10 && price < 10000) {
                  pricePerNight = price;
                  console.log(`💰 Extracted price: ${price}`);
                  break;
                }
              }
            }
            
            if (pricePerNight > 0) break;
          }
        }
      } catch (error: any) {
        console.log(`❌ Selector "${selector}" failed: ${error.message}`);
        continue;
      }
    }

    // Method 2: Look for price in page content
    if (pricePerNight === 0) {
      console.log('🔍 Searching page content for price...');
      
      const pageContent = await page.content();
      
      // Look for specific price patterns in HTML
      const contentPatterns = [
        /"price":\s*"?\$?(\d+(?:,\d{3})*(?:\.\d+)?)/gi,
        /"perNight":\s*"?(\d+(?:,\d{3})*(?:\.\d+)?)/gi,
        /"amount":\s*"?\$?(\d+(?:,\d{3})*(?:\.\d+)?)/gi,
        /pricePerNight["\s:]+\s*["\s]*(\d+(?:,\d{3})*(?:\.\d+)?)/gi,
        /\$?(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:per\s*night|\/night)/gi,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*€\s*(?:per\s*night|\/night)/gi
      ];

      for (const pattern of contentPatterns) {
        const matches = pageContent.match(pattern);
        if (matches) {
          console.log(`📋 Found ${matches.length} matches with pattern: ${pattern}`);
          for (const match of matches) {
            const priceMatch = match.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/);
            if (priceMatch) {
              const price = parseFloat(priceMatch[1].replace(/,/g, ''));
              if (price > 10 && price < 10000) {
                pricePerNight = price;
                console.log(`💰 Extracted price from content: ${price}`);
                break;
              }
            }
          }
          if (pricePerNight > 0) break;
        }
      }
    }

    // Method 3: Look for booking section with price
    if (pricePerNight === 0) {
      console.log('🔍 Searching booking section for price...');
      
      try {
        const bookingSection = await page.$('[data-testid="book-it-container"]');
        if (bookingSection) {
          const bookingText = await bookingSection.textContent();
          console.log(`📋 Booking section text: "${bookingText?.substring(0, 200)}..."`);
          
          if (bookingText) {
            const priceMatch = bookingText.match(/[\$€£¥]\s*(\d+(?:,\d{3})*(?:\.\d+)?)/);
            if (priceMatch) {
              pricePerNight = parseFloat(priceMatch[1].replace(/,/g, ''));
              console.log(`💰 Extracted price from booking section: ${pricePerNight}`);
            }
          }
        }
      } catch (error: any) {
        console.log(`❌ Booking section search failed: ${error.message}`);
      }
    }

    // Method 4: Try to find price in structured data
    if (pricePerNight === 0) {
      console.log('🔍 Searching structured data for price...');
      
      try {
        const scripts = await page.$$('script[type="application/ld+json"]');
        for (const script of scripts) {
          const content = await script.textContent();
          if (content) {
            const jsonData = JSON.parse(content);
            const searchForPrice = (obj: any): number => {
              if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                  if (key.toLowerCase().includes('price') && typeof obj[key] === 'string') {
                    const price = parseFloat(obj[key].replace(/[^0-9.]/g, ''));
                    if (price > 10 && price < 10000) {
                      return price;
                    }
                  }
                  if (typeof obj[key] === 'object') {
                    const price = searchForPrice(obj[key]);
                    if (price > 0) return price;
                  }
                }
              }
              return 0;
            };
            
            pricePerNight = searchForPrice(jsonData);
            if (pricePerNight > 0) {
              console.log(`💰 Extracted price from structured data: ${pricePerNight}`);
              break;
            }
          }
        }
      } catch (error: any) {
        console.log(`❌ Structured data search failed: ${error.message}`);
      }
    }

    console.log(`🎯 Final price extraction result: ${pricePerNight}`);
    return pricePerNight;

  } catch (error) {
    console.error(`❌ Error extracting real price for listing ${listingId}:`, error);
    return 0;
  }
}
