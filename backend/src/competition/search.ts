import axios from "axios";

export interface CompetitorResult {
    id: string;
    name: string;
    url: string;
    lat: number;
    lng: number;
    details: string;
    badge: string;
    rating: string;
    monthlyPrice: number;
    originalPrice?: number;
    period: string;
}

export async function searchCompetition(
    location: string,
    checkin: string,
    checkout: string
): Promise<CompetitorResult[]> {
    const searchUrl = `https://www.airbnb.com/s/${encodeURIComponent(location)}/homes`;
    const params = {
        checkin,
        checkout,
        adults: "1",
        children: "0",
        infants: "0",
        pets: "0",
        monthly_start_date: checkin,
        monthly_length: "1",
        monthly_end_date: checkout,
    };

    const { data: html } = await axios.get(searchUrl, {
        params,
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeout: 15000,
    });

    // Extract the deferred state JSON embedded in the HTML
    const results: CompetitorResult[] = [];

    // Airbnb embeds search data in a script tag with id="data-deferred-state-0" or similar
    const stateMatch =
        html.match(/<script\s+id="data-deferred-state-0"[^>]*>([\s\S]*?)<\/script>/) ||
        html.match(/<script\s+id="data-state"[^>]*>([\s\S]*?)<\/script>/);

    if (!stateMatch) {
        console.warn("Could not find embedded state in Airbnb HTML");
        return results;
    }

    try {
        const state = JSON.parse(stateMatch[1]);
        const listings = findListings(state);

        const periodLabel = new Date(checkin).toLocaleString("en", { month: "short" });

        for (const listing of listings) {
            try {
                const result = parseListing(listing, periodLabel);
                if (result) results.push(result);
            } catch {
                // skip unparseable listings
            }
        }
    } catch (e) {
        console.error("Failed to parse Airbnb state JSON:", e);
    }

    return results;
}

function findListings(obj: any, depth = 0): any[] {
    if (depth > 15 || !obj || typeof obj !== "object") return [];

    // Look for searchResults or staysSearchResults arrays
    if (Array.isArray(obj)) {
        // Check if this looks like a listings array
        const hasListings = obj.some(
            (item) => item?.listing?.id || item?.demandStayListing || item?.listingId
        );
        if (hasListings) return obj;
    }

    for (const key of Object.keys(obj)) {
        if (
            key === "searchResults" ||
            key === "sections" ||
            key === "listings" ||
            key === "items" ||
            key === "staysSearchResults"
        ) {
            const found = findListings(obj[key], depth + 1);
            if (found.length > 0) return found;
        }
    }

    // Broader search
    for (const key of Object.keys(obj)) {
        const found = findListings(obj[key], depth + 1);
        if (found.length > 0) return found;
    }

    return [];
}

function parseListing(item: any, period: string): CompetitorResult | null {
    const listing = item?.listing || item?.demandStayListing || item;
    if (!listing) return null;

    const id =
        listing.id?.toString() ||
        item?.listingId?.toString() ||
        item?.id?.toString();
    if (!id) return null;

    const name =
        listing?.description?.name?.localizedStringWithTranslationPreference ||
        listing?.name ||
        listing?.title ||
        "Unknown";

    const lat = listing?.location?.coordinate?.latitude || listing?.lat || 0;
    const lng = listing?.location?.coordinate?.longitude || listing?.lng || 0;

    const details =
        item?.structuredContent?.primaryLine ||
        listing?.roomTypeCategory ||
        "";

    const badge =
        item?.badges ||
        (listing?.isSuperhost ? "Superhost" : "") ||
        "";

    const ratingLabel = item?.avgRatingA11yLabel || "";
    const rating = ratingLabel.replace("out of 5 average rating, ", "(").replace(" reviews", ")").replace("New place to stay", "New");

    // Price parsing
    let monthlyPrice = 0;
    let originalPrice: number | undefined;

    const priceLabel =
        item?.structuredDisplayPrice?.primaryLine?.accessibilityLabel || "";
    const priceMatch = priceLabel.match(/€([\d,]+)\s*monthly/);
    if (priceMatch) {
        monthlyPrice = parseInt(priceMatch[1].replace(/,/g, ""), 10);
    }

    const origMatch = priceLabel.match(/originally\s*€([\d,]+)/);
    if (origMatch) {
        originalPrice = parseInt(origMatch[1].replace(/,/g, ""), 10);
    }

    if (!monthlyPrice && !lat) return null;

    return {
        id,
        name,
        url: `https://www.airbnb.com/rooms/${id}`,
        lat,
        lng,
        details,
        badge,
        rating,
        monthlyPrice,
        originalPrice,
        period,
    };
}
