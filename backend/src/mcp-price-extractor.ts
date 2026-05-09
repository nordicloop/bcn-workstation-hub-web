import { Page, Browser } from 'playwright';

export interface PriceData {
  pricePerNight: number;
  currency: string;
  totalPrice?: number;
  cleaningFee?: number;
  serviceFee?: number;
}

export async function extractPriceFromAirbnb(page: Page, listingId: string): Promise<PriceData | null> {
  try {
    // Navigate to the Airbnb listing page
    const url = `https://www.airbnb.com/rooms/${listingId}?check_in=2026-06-01&check_out=2026-06-02&adults=1`;
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for price elements to load
    await page.waitForTimeout(3000);

    // Try multiple selectors for price extraction
    const priceSelectors = [
      '[data-testid="price-display"]',
      '.price',
      '[class*="price"]',
      '[data-automation="price"]',
      '.per-night',
      '.price-amount',
      '[class*="Price"]'
    ];

    let pricePerNight = 0;
    let currency = 'USD';

    for (const selector of priceSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text) {
            // Extract price using regex
            const priceMatch = text.match(/[\$€£¥]\s*(\d+(?:,\d{3})*(?:\.\d+)?)/);
            if (priceMatch) {
              pricePerNight = parseFloat(priceMatch[1].replace(/,/g, ''));
              
              // Extract currency
              const currencyMatch = text.match(/([\$€£¥])/);
              if (currencyMatch) {
                currency = currencyMatch[1];
              }
              
              break;
            }
          }
        }
      } catch (error) {
        // Continue to next selector
        continue;
      }
    }

    // If still no price, try to extract from page content
    if (pricePerNight === 0) {
      const pageContent = await page.content();
      
      // Look for price patterns in the HTML
      const pricePatterns = [
        /"price":\s*"?\$?(\d+(?:,\d{3})*(?:\.\d+)?)/gi,
        /"perNight":\s*"?(\d+(?:,\d{3})*(?:\.\d+)?)/gi,
        /\$?(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:per\s*night|\/night)/gi,
        /"amount":\s*"?\$?(\d+(?:,\d{3})*(?:\.\d+)?)/gi
      ];

      for (const pattern of pricePatterns) {
        const matches = pageContent.match(pattern);
        if (matches) {
          for (const match of matches) {
            const priceMatch = match.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/);
            if (priceMatch) {
              const price = parseFloat(priceMatch[1].replace(/,/g, ''));
              if (price > 10 && price < 10000) { // Reasonable price range
                pricePerNight = price;
                break;
              }
            }
          }
          if (pricePerNight > 0) break;
        }
      }
    }

    // Try to extract additional price details
    let totalPrice: number | undefined;
    let cleaningFee: number | undefined;
    let serviceFee: number | undefined;

    try {
      // Look for total price
      const totalElement = await page.$('[data-testid="total-price"]');
      if (totalElement) {
        const totalText = await totalElement.textContent();
        if (totalText) {
          const totalMatch = totalText.match(/[\$€£¥]\s*(\d+(?:,\d{3})*(?:\.\d+)?)/);
          if (totalMatch) {
            totalPrice = parseFloat(totalMatch[1].replace(/,/g, ''));
          }
        }
      }

      // Look for cleaning fee
      const cleaningElement = await page.$('[data-testid="cleaning-fee"]');
      if (cleaningElement) {
        const cleaningText = await cleaningElement.textContent();
        if (cleaningText) {
          const cleaningMatch = cleaningText.match(/[\$€£¥]\s*(\d+(?:,\d{3})*(?:\.\d+)?)/);
          if (cleaningMatch) {
            cleaningFee = parseFloat(cleaningMatch[1].replace(/,/g, ''));
          }
        }
      }

      // Look for service fee
      const serviceElement = await page.$('[data-testid="service-fee"]');
      if (serviceElement) {
        const serviceText = await serviceElement.textContent();
        if (serviceText) {
          const serviceMatch = serviceText.match(/[\$€£¥]\s*(\d+(?:,\d{3})*(?:\.\d+)?)/);
          if (serviceMatch) {
            serviceFee = parseFloat(serviceMatch[1].replace(/,/g, ''));
          }
        }
      }
    } catch (error) {
      // Continue even if additional fees can't be extracted
    }

    if (pricePerNight > 0) {
      return {
        pricePerNight,
        currency,
        totalPrice,
        cleaningFee,
        serviceFee
      };
    }

    return null;
  } catch (error) {
    console.error(`Error extracting price for listing ${listingId}:`, error);
    return null;
  }
}

// Function to integrate with existing scraper
export async function enhanceScraperWithMCPPrice(page: Page, listingId: string): Promise<number> {
  const priceData = await extractPriceFromAirbnb(page, listingId);
  return priceData?.pricePerNight || 0;
}
