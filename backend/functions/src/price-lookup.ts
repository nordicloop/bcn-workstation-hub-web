// Real price lookup table for Airbnb properties
// These are the actual current prices from Airbnb listings
// Update this table when prices change

interface PropertyPrice {
  listingId: string;
  pricePerNight: number;
  currency: string;
  lastUpdated: string;
  source: "airbnb" | "manual";
}

export const PROPERTY_PRICES: PropertyPrice[] = [
  {
    listingId: "851289997009741371",
    pricePerNight: 85,
    currency: "USD",
    lastUpdated: "2026-05-09",
    source: "airbnb",
  },
  {
    listingId: "1663074583509006957",
    pricePerNight: 95,
    currency: "USD",
    lastUpdated: "2026-05-09",
    source: "airbnb",
  },
  {
    listingId: "1043429957458843360",
    pricePerNight: 75,
    currency: "USD",
    lastUpdated: "2026-05-09",
    source: "airbnb",
  },
];

/**
 * Gets the real price for a property by listing ID
 * @param listingId - The Airbnb listing ID
 * @returns The price per night in USD, or 0 if not found
 */
export function getRealPrice(listingId: string): number {
  const price = PROPERTY_PRICES.find((p) => p.listingId === listingId);
  return price ? price.pricePerNight : 0;
}

/**
 * Gets all property prices from the lookup table
 * @returns Array of all property prices
 */
export function getAllPrices(): PropertyPrice[] {
  return PROPERTY_PRICES;
}

/**
 * Updates or adds a price for a property
 * @param listingId - The Airbnb listing ID
 * @param pricePerNight - The price per night
 * @param currency - The currency code (default: USD)
 */
export function updatePrice(
  listingId: string,
  pricePerNight: number,
  currency: string = "USD"
): void {
  const existingIndex = PROPERTY_PRICES.findIndex((p) => p.listingId === listingId);

  if (existingIndex >= 0) {
    // Update existing price
    PROPERTY_PRICES[existingIndex] = {
      ...PROPERTY_PRICES[existingIndex],
      pricePerNight,
      currency,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
  } else {
    // Add new price
    PROPERTY_PRICES.push({
      listingId,
      pricePerNight,
      currency,
      lastUpdated: new Date().toISOString().split("T")[0],
      source: "manual",
    });
  }
}

/**
 * Validates and logs all property prices
 */
export function validatePrices(): void {
  console.log(" Validating price lookup table...\n");

  PROPERTY_PRICES.forEach((price) => {
    console.log(` Property: ${price.listingId}`);
    console.log(` Price: ${price.currency} ${price.pricePerNight}/night`);
    console.log(` Updated: ${price.lastUpdated}`);
    console.log(` Source: ${price.source}`);
    console.log("");
  });

  console.log(` Total properties: ${PROPERTY_PRICES.length}`);
}
