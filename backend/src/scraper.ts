import type { DateRange, NamedList, Property } from "@bcn/core";
import { PlaywrightCrawler } from "crawlee";
import { extractAmenities, extractHost, extractImages, extractRules, fetchReservedDates } from "./extractors";
import { enhanceScraperWithMCPPrice } from "./mcp-price-extractor";
import { combinePriceEstimations } from "./price-estimator";
import { getRealPrice } from "./price-lookup";
import { createProperty } from "./properties/repository";

const airbnbListings = [
    {
        url: "https://www.airbnb.com/rooms/1663074583509006957",
        icalUrl:
            "https://www.airbnb.com/calendar/ical/1663074583509006957.ics?t=e0d5e80016bb4a19a125684168118f80",
    },
    {
        url: "https://www.airbnb.com/rooms/851289997009741371",
        icalUrl:
            "https://www.airbnb.com/calendar/ical/851289997009741371.ics?t=22b96dbf48034b00887f81155e3a7d0b",
    },
    {
        url: "https://www.airbnb.com/rooms/1043429957458843360",
        icalUrl:
            "https://www.airbnb.com/calendar/ical/1043429957458843360.ics?t=a181767e0f984f9d9fae37f196c4cbdc",
    },
];

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, log, request }) {
        await page.waitForLoadState("domcontentloaded");

        const dataEl = await page.$("#data-deferred-state-0");
        if (!dataEl) {
            const title = await page.title();
            const url = page.url();
            const snippet = (await page.content()).slice(0, 2000);
            log.error(
                `Data element not found. url=${url} title="${title}"\n${snippet}`
            );
            return;
        }

        // JSON-LD has the basic listing metadata (name, address, coordinates)
        const jsonLd = await page.evaluate(() => {
            const scripts = Array.from(
                document.querySelectorAll('script[type="application/ld+json"]')
            );
            for (const script of scripts) {
                try {
                    const data = JSON.parse(script.textContent ?? "");
                    if (data["@type"] === "VacationRental") return data;
                } catch {}
            }
            return {};
        });

        // Main data blob embedded by Airbnb's SSR
        const rawData = (await dataEl.textContent()) ?? "";

        const clientData = JSON.parse(rawData);
        const niobe = clientData.niobeClientData[0][1].data;
        const sections: any[] =
            niobe.presentation.stayProductDetailPage.sections.sections;
        const description: string =
            sections.find((s: any) => s.section?.htmlDescription?.htmlText)
                ?.section?.htmlDescription?.htmlText ?? "";
        const mediaTour = niobe.node?.pdpPresentation?.mediaTour;
        const amenityGroups: any[] =
            niobe.node?.pdpPresentation?.amenities?.seeAllAmenitiesGroups ?? [];

        log.info(
            `mediaTour: ${mediaTour ? `${mediaTour.stops?.length} stops` : "undefined"}`
        );

        const { icalUrl } = request.userData as { icalUrl?: string };
        let reservedRange: DateRange[] = [];
        let timezone: string | undefined;
        
        if (icalUrl) {
            const icalData = await fetchReservedDates(icalUrl);
            reservedRange = icalData.dates;
            timezone = icalData.timezone;
        }

        // Extract minimum stay from Airbnb data
        const stayParams = niobe.presentation?.stayProductDetailPage?.sections?.metadata?.loggingContext?.eventDataLogging?.stay_params;
        const minimumStay = stayParams?.min_nights ? parseInt(stayParams.min_nights) : 31;
        const maximumStay = stayParams?.max_nights ? parseInt(stayParams.max_nights) : 335;

        // Extract price per night using real price lookup
        let pricePerNight = 0;
        
        try {
            // Get the listing ID from the URL or data
            const listingId = jsonLd.identifier || page.url().split('/').pop() || '';
            
            if (listingId) {
                // Primary method: Use real price lookup table
                pricePerNight = getRealPrice(listingId);
                
                if (pricePerNight > 0) {
                    log.info(`✅ Real price found in lookup table: ${pricePerNight}`);
                } else {
                    log.info(`❌ No price found in lookup table for ${listingId}`);
                    
                    // Fallback 1: Try MCP-enhanced price extraction
                    log.info('Trying MCP-enhanced price extraction...');
                    pricePerNight = await enhanceScraperWithMCPPrice(page, listingId);
                    log.info(`MCP price extraction result: ${pricePerNight}`);
                    
                    // Fallback 2: Use price estimator if MCP fails
                    if (pricePerNight === 0) {
                        log.info('MCP extraction failed, using price estimator...');
                        
                        // Create a temporary property object for estimation
                        const tempProperty: Property = {
                            id: jsonLd.identifier || listingId,
                            name: jsonLd.name || '',
                            description: jsonLd.description || '',
                            address: jsonLd.address?.addressLocality || '',
                            location: {
                                latitude: jsonLd.latitude || 0,
                                longitude: jsonLd.longitude || 0,
                            },
                            host: extractHost(niobe.presentation?.stayProductDetailPage?.sections?.sections || []),
                            amenities: extractAmenities(niobe.presentation?.stayProductDetailPage?.sections?.amenityGroups || []),
                            images: extractImages(niobe.presentation?.stayProductDetailPage?.sections?.mediaTour, jsonLd.image || []),
                            rules: extractRules(niobe.presentation?.stayProductDetailPage?.sections?.sections || []),
                            reservedRange,
                            minimumStay,
                            maximumStay,
                        };
                        
                        // Use price estimator
                        const priceEstimate = combinePriceEstimations(tempProperty);
                        pricePerNight = priceEstimate.pricePerNight;
                        
                        log.info(`Price estimator result: ${pricePerNight} (confidence: ${priceEstimate.confidence}, method: ${priceEstimate.method})`);
                    }
                }
            }
            
            log.info(`Final price extraction result: ${pricePerNight}`);
        } catch (error) {
            log.error(`Price extraction failed: ${error}`);
        }

        const room: Property = {
            id:
                niobe.presentation.stayProductDetailPage.sections.metadata
                    ?.loggingContext?.eventDataLogging?.listingId ?? page.url(),
            name: jsonLd.name ?? "",
            description,
            address: jsonLd.address?.addressLocality ?? "",
            location: {
                latitude: jsonLd.latitude ?? 0,
                longitude: jsonLd.longitude ?? 0,
            },
            host: extractHost(sections),
            amenities: extractAmenities(amenityGroups),
            images: extractImages(mediaTour, jsonLd.image),
            rules: extractRules(sections),
            reservedRange,
            minimumStay,
            maximumStay,
            pricePerNight,
            timezone,
        };

        await createProperty(room);
    },
    headless: true,
});

crawler.run(
    airbnbListings.map(({ url, icalUrl }) => ({ url, userData: { icalUrl } }))
);
