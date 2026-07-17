import ical, { VEvent } from "node-ical";
import { DateRange, NamedList } from "@bcn/core";

export function extractImages(mediaTour: any, featuredImages: string[]): NamedList[] {
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

export function extractAmenities(groups: any[]): NamedList[] {
    return groups.map((group: any) => ({
        title: group.title ?? "",
        items: (group.amenities ?? []).map((a: any) => a.title).filter(Boolean),
    }));
}

export function extractHost(sections: any[]): string {
    const section = sections.find((s: any) => s.sectionId === "MEET_YOUR_HOST");
    return section?.section?.cardData?.name ?? "";
}

export async function fetchReservedDates(
    icalUrl: string
): Promise<{ dates: DateRange[]; timezone?: string }> {
    const events = await ical.async.fromURL(icalUrl);
    
    // Extract timezone from VCALENDAR component
    let timezone: string | undefined;
    
    // Look for VTIMEZONE component or timezone info in events
    const calendarComponents = Object.values(events);
    for (const component of calendarComponents) {
        if (component.type === 'VTIMEZONE') {
            // Extract timezone ID from VTIMEZONE component
            timezone = (component as any).tzid;
            break;
        }
    }
    
    // If no VTIMEZONE found, try to infer from event start/end times
    if (!timezone) {
        const vevents = Object.values(events).filter(
            (e): e is VEvent => e.type === "VEVENT"
        );
        
        if (vevents.length > 0) {
            const firstEvent = vevents[0];
            // Check if event has timezone info
            if ((firstEvent as any).start?.tz) {
                timezone = (firstEvent as any).start.tz;
            } else if ((firstEvent as any).params?.TZID) {
                timezone = (firstEvent as any).params.TZID;
            }
        }
    }
    
    // Default timezone inference based on property location if still not found
    if (!timezone) {
        // For Spanish properties, default to Europe/Madrid
        timezone = "Europe/Madrid";
    }
    
    const dates = Object.values(events)
        .filter(
            (e): e is VEvent =>
                e.type === "VEVENT" &&
                ((e as VEvent).summary === "Reserved" ||
                    (e as VEvent).summary === "Airbnb (Not available)")
        )
        .map((e) => ({ from: e.start.toISOString(), to: e.end.toISOString() }));
    
    return { dates, timezone };
}

export function extractRules(sections: any[]): NamedList[] {
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
