import { PlaywrightCrawler } from "crawlee";
import { Property, NamedList, DateRange } from "@bcn/core";
import { createProperty } from "./properties/repository";
import ical, { VEvent } from "node-ical";

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

function extractImages(mediaTour: any, featuredImages: string[]): NamedList[] {
    const images: NamedList[] = [];

    if (Array.isArray(featuredImages) && featuredImages.length > 0) {
        images.push({ title: "Featured", items: featuredImages });
    }

    if (!mediaTour) return images;

    (mediaTour.stops ?? []).forEach((stop: any) => {
        images.push({
            title: stop.name ?? "",
            items: (stop.items ?? [])
                .filter((item: any) => item.image?.uri)
                .map((item: any) => item.image.uri),
        });
    });

    return images;
}

function extractAmenities(groups: any[]): NamedList[] {
    return groups.map((group: any) => ({
        title: group.title ?? "",
        items: (group.amenities ?? []).map((a: any) => a.title).filter(Boolean),
    }));
}

function extractHost(sections: any[]): string {
    const section = sections.find((s: any) => s.sectionId === "MEET_YOUR_HOST");
    return section?.section?.cardData?.name ?? "";
}

async function fetchReservedDates(icalUrl: string): Promise<DateRange[]> {
    const events = await ical.async.fromURL(icalUrl);
    return Object.values(events)
        .filter(
            (e): e is VEvent =>
                e.type === "VEVENT" && (e as VEvent).summary === "Reserved"
        )
        .map((e) => ({ from: e.start, to: e.end }));
}

function extractRules(sections: any[]): NamedList[] {
    const section = sections.find(
        (s: any) => s.sectionId === "POLICIES_DEFAULT"
    );
    if (!section) return [];

    return (section.section?.houseRulesSections ?? []).map(
        (ruleSection: any) => ({
            title: ruleSection.title ?? "",
            items: (ruleSection.items ?? [])
                .map((item: any) => item.title)
                .filter(Boolean),
        })
    );
}

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
        const reservedRange = icalUrl ? await fetchReservedDates(icalUrl) : [];

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
        };

        await createProperty(room);
    },
    headless: true,
});

crawler.run(
    airbnbListings.map(({ url, icalUrl }) => ({ url, userData: { icalUrl } }))
);
