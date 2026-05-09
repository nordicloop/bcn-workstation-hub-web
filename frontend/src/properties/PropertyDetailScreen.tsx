import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import type { Property, NamedList } from "@bcn/core";
import { getProperty } from "../api-client";
import { DateRangePicker } from "../components/DateRangePicker";
import { ImageGalleryModal } from "../components/ImageGalleryModal";
import { PropertyMap } from "../components/PropertyMap";

function removeRegistrationDetails(description: string): string {
    // Remove Registration details section and related content
    const cleanedDescription = description
        .replace(/<b>Registration details<\/b>.*?(?=<br>|<br\/>|$)/gis, '')
        .replace(/Short rent register number:.*?(?=<br>|<br\/>|$)/gis, '')
        .replace(/Spain – National registration number.*?(?=<br>|<br\/>|$)/gis, '')
        .replace(/Catalonia – Regional registration number.*?(?=<br>|<br\/>|$)/gis, '')
        .replace(/ESFCNT\d+.*?(?=<br>|<br\/>|$)/gis, '')
        // Clean up multiple consecutive breaks but preserve paragraph spacing
        .replace(/(<br\s*\/?>\s*){3,}/gi, '<br/><br/>') // Convert 3+ breaks to 2 breaks
        .replace(/^(<br\s*\/?>\s*)+/, '') // Remove leading breaks
        .replace(/(<br\s*\/?>\s*)+$/, '') // Remove trailing breaks
        .replace(/<br\/><br\/>/g, '<br/><br/>'); // Ensure consistent double breaks for paragraphs
    
    return cleanedDescription.trim();
}

function AmenitySection({ section }: { section: NamedList }) {
    return (
        <div>
            {section.title && (
                <h3 className="font-semibold text-[#222222] mb-3 text-sm uppercase tracking-wide">
                    {section.title}
                </h3>
            )}
            <div className="grid grid-cols-2 gap-2">
                {section.items.map((item) => (
                    <div
                        key={item}
                        className="flex items-center gap-3 text-[#484848]"
                    >
                        <svg
                            className="w-5 h-5 text-[#484848] shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-sm">{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ImageGallery({
    images,
    name,
    onShowAll,
}: {
    images: string[];
    name: string;
    onShowAll: () => void;
}) {
    if (images.length === 0) {
        return (
            <div className="h-120 rounded-3xl overflow-hidden bg-linear-to-br from-rose-100 via-pink-100 to-orange-100 flex items-center justify-center mb-8">
                <svg
                    className="w-20 h-20 text-rose-200"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-120 rounded-3xl overflow-hidden mb-8">
            {/* Main large image */}
            <div className="col-span-2 row-span-2">
                <img
                    src={images[0]}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>
            {/* Right grid — up to 4 thumbnails, last one has "view all" overlay */}
            {[1, 2, 3, 4].map((i) => {
                const isLast = i === 4;
                return (
                    <div key={i} className="relative overflow-hidden">
                        {images[i] ? (
                            <img
                                src={images[i]}
                                alt={`${name} ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-linear-to-br from-rose-50 to-pink-100" />
                        )}
                        {isLast && (
                            <button
                                onClick={onShowAll}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/55 transition-colors"
                            >
                                <span className="bg-white text-[#222222] text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                                    View all photos
                                </span>
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function PropertyDetailScreen() {
    const { id } = useParams<{ id: string }>();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [galleryOpen, setGalleryOpen] = useState(false);

    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [pets, setPets] = useState(0);
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);
    const [showCalendarPopup, setShowCalendarPopup] = useState(false);

    useEffect(() => {
        if (!id) return;
        getProperty(id)
            .then(setProperty)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            
            // Check if click is outside all popup containers
            const isOutsideGuestDropdown = !target.closest('.guest-dropdown-container');
            const isOutsideCalendarPopup = !target.closest('.calendar-popup-container');
            
            if (showGuestDropdown && isOutsideGuestDropdown) {
                setShowGuestDropdown(false);
            }
            if (showCalendarPopup && isOutsideCalendarPopup) {
                setShowCalendarPopup(false);
            }
        };

        if (showGuestDropdown || showCalendarPopup) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showGuestDropdown, showCalendarPopup]);

    if (loading) {
        return (
            <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 animate-pulse">
                <div className="h-8 bg-gray-200 rounded-lg w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 rounded-lg w-1/3 mb-8" />
                <div className="h-[480px] bg-gray-200 rounded-3xl mb-8" />
                <div className="grid grid-cols-3 gap-12">
                    <div className="col-span-2 space-y-4">
                        <div className="h-4 bg-gray-200 rounded-lg" />
                        <div className="h-4 bg-gray-200 rounded-lg w-5/6" />
                        <div className="h-4 bg-gray-200 rounded-lg w-4/6" />
                    </div>
                </div>
            </main>
        );
    }

    if (error || !property) {
        return (
            <main className="max-w-7xl mx-auto px-6 lg:px-10 py-32 flex flex-col items-center gap-4">
                <svg
                    className="w-12 h-12 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[#717171] text-lg font-medium">
                    {error || "Property not found"}
                </p>
                <Link
                    to="/"
                    className="text-sm font-semibold underline text-[#222222] hover:text-[#FF385C] transition-colors"
                >
                    ← Back to all stays
                </Link>
            </main>
        );
    }

    const allImages =
        property.images.find((i) => i.title === "Featured")?.items || [];
    const totalGuests = adults + children;

    const nightCount =
        fromDate && toDate
            ? Math.ceil(
                  (toDate.getTime() - fromDate.getTime()) /
                      (1000 * 60 * 60 * 24)
              )
            : null;

    function openReservationMail() {
        if (!fromDate || !toDate) {
            document.getElementById("availability")?.scrollIntoView({ behavior: "smooth" });
            return;
        }
        const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        const guestParts = [
            `${adults} adult${adults !== 1 ? "s" : ""}`,
            children > 0 ? `${children} child${children !== 1 ? "ren" : ""}` : null,
            infants > 0 ? `${infants} infant${infants !== 1 ? "s" : ""}` : null,
        ].filter(Boolean).join(", ");
        const subject = encodeURIComponent(`Booking Request – ${property!.name}`);
        const body = encodeURIComponent(
            `Hi,\n\nI would like to book the following stay:\n\n` +
            `Property: ${property!.name} (ID: ${property!.id})\n` +
            `Check-in: ${fmt(fromDate)}\n` +
            `Check-out: ${fmt(toDate)}\n` +
            `Guests: ${guestParts}\n\n` +
            `Please let me know the next steps.\n\nThank you!`
        );
        window.location.href = `mailto:cyn.killner@gmail.com,imdavidfernandez@gmail.com?subject=${subject}&body=${body}`;
    }

    return (
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-8 pb-20">
            {/* Breadcrumb */}
            <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-[#717171] hover:text-[#222222] mb-4 transition-colors group"
            >
                <svg
                    className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                All stays
            </Link>

            {/* Title */}
            <h1 className="font-display text-3xl font-semibold text-[#222222] mb-1">
                {property.name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-[#717171] mb-8">
                <div className="flex items-center gap-1">
                    <svg
                        className="w-3.5 h-3.5 text-[#222222]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="font-semibold text-[#222222]">4.92</span>
                    <span className="underline cursor-pointer">
                        · 128 reviews
                    </span>
                </div>
                <span>·</span>
                <span className="underline cursor-pointer font-medium">
                    {property.address}
                </span>
            </div>

            {/* Gallery */}
            <ImageGallery
                images={allImages}
                name={property.name}
                onShowAll={() => setGalleryOpen(true)}
            />
            {galleryOpen && (
                <ImageGalleryModal
                    images={property.images}
                    name={property.name}
                    onClose={() => setGalleryOpen(false)}
                />
            )}

            {/* Content + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
                {/* Left column */}
                <div className="space-y-0">
                    {/* Host line */}
                    <section className="pb-8 border-b border-[#EBEBEB] flex items-center justify-between">
                        <div>
                            <h2 className="font-display text-2xl font-semibold text-[#222222]">
                                Entire place
                            </h2>
                            <p className="text-[#717171] mt-0.5">
                                Hosted by {property.host}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-linear-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-lg">
                                {property.host[0]}
                            </span>
                        </div>
                    </section>

                    {/* Description */}
                    <section className="py-8 border-b border-[#EBEBEB]">
                        <p
                            className="text-[#484848] leading-relaxed text-[15px]"
                            dangerouslySetInnerHTML={{
                                __html: removeRegistrationDetails(property.description),
                            }}
                        />
                    </section>

                    {/* Amenities */}
                    {property.amenities.length > 0 && (
                        <section className="py-8 border-b border-[#EBEBEB]">
                            <h2 className="font-display text-2xl font-semibold text-[#222222] mb-6">
                                What this place offers
                            </h2>
                            <div className="space-y-6">
                                {property.amenities.map((section) => (
                                    <AmenitySection
                                        key={section.title}
                                        section={section}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* House rules */}
                    {property.rules.length > 0 && (
                        <section className="py-8 border-b border-[#EBEBEB]">
                            <h2 className="font-display text-2xl font-semibold text-[#222222] mb-6">
                                House rules
                            </h2>
                            <div className="space-y-6">
                                {property.rules.map((section) => (
                                    <div key={section.title}>
                                        {section.title && (
                                            <h3 className="font-semibold text-[#222222] mb-2">
                                                {section.title}
                                            </h3>
                                        )}
                                        <ul className="space-y-2">
                                            {section.items.map((item) => (
                                                <li
                                                    key={item}
                                                    className="flex items-start gap-3 text-[#484848] text-sm"
                                                >
                                                    <svg
                                                        className="w-4 h-4 text-[#717171] shrink-0 mt-0.5"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                        />
                                                        <line
                                                            x1="12"
                                                            y1="8"
                                                            x2="12"
                                                            y2="16"
                                                        />
                                                        <line
                                                            x1="8"
                                                            y1="12"
                                                            x2="16"
                                                            y2="12"
                                                        />
                                                    </svg>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Location section */}
                    <section className="py-8 border-b border-[#EBEBEB]">
                        <h2 className="font-display text-2xl font-semibold text-[#222222] mb-6">
                            Location
                        </h2>
                        <div className="space-y-4">
                            <p className="text-[#484848] text-sm">
                                {property.address}
                            </p>
                            <PropertyMap
                                latitude={property.location.latitude}
                                longitude={property.location.longitude}
                                name={property.name}
                                address={property.address}
                            />
                        </div>
                    </section>

                    {/* Availability section */}
                    <section className="py-8" id="availability">
                        <h2 className="font-display text-2xl font-semibold text-[#222222] mb-1">
                            Availability
                        </h2>
                        <p className="text-[#717171] mb-6 text-sm">
                            {fromDate && toDate
                                ? `${nightCount} night${nightCount !== 1 ? "s" : ""} selected`
                                : "Select check-in and check-out dates"}
                        </p>

                        <DateRangePicker
                            fromDate={fromDate}
                            toDate={toDate}
                            onFromDateChange={setFromDate}
                            onToDateChange={setToDate}
                            reservedRanges={property.reservedRange}
                            infoPosition="bottom"
                        />

                        
                        
                    </section>
                </div>

                {/* Sidebar booking card */}
                <div className="hidden lg:block">
                    <div className="sticky top-28">
                        <div className="border border-[#DDDDDD] rounded-3xl p-7 shadow-xl">
                            <p className="text-2xl font-bold text-[#222222] mb-5 font-display">
                                Book your stay
                            </p>

                            {/* Guest selector dropdown */}
                            <div className="relative guest-dropdown-container">
                                <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden mb-4">
                                    <button
                                        onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                                        className="w-full px-4 py-3 text-left hover:bg-[#F7F7F7] transition-colors flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">
                                                Guests
                                            </p>
                                            <p className="text-sm font-semibold text-[#222222] mt-1">
                                                {totalGuests} guest
                                                {totalGuests !== 1 ? "s" : ""}
                                                {infants > 0
                                                    ? `, ${infants} infant${infants !== 1 ? "s" : ""}`
                                                    : ""}
                                                {pets > 0
                                                    ? `, ${pets} pet${pets !== 1 ? "s" : ""}`
                                                    : ""}
                                            </p>
                                        </div>
                                        <svg
                                            className={`w-5 h-5 text-[#717171] transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {showGuestDropdown && (
                                    <div className="absolute top-full left-0 right-0 bg-white border border-[#DDDDDD] rounded-2xl shadow-lg z-50 mt-1">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="font-semibold text-[#222222]">Guests</h4>
                                                    <p className="text-sm text-[#717171]">This place allows up to 16 guests</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowGuestDropdown(false)}
                                                    className="p-1 hover:bg-[#F7F7F7] rounded-full"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm text-[#222222]">Adults</span>
                                                        <p className="text-xs text-[#717171]">Age 13+</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setAdults(Math.max(1, adults - 1))}
                                                            className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:bg-[#F7F7F7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={adults === 1}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                            </svg>
                                                        </button>
                                                        <span className="text-sm font-semibold text-[#222222] w-8 text-center">
                                                            {adults}
                                                        </span>
                                                        <button
                                                            onClick={() => setAdults(adults + 1)}
                                                            className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:bg-[#F7F7F7] transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm text-[#222222]">Children</span>
                                                        <p className="text-xs text-[#717171]">Ages 2-12</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setChildren(Math.max(0, children - 1))}
                                                            className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:bg-[#F7F7F7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={children === 0}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                            </svg>
                                                        </button>
                                                        <span className="text-sm font-semibold text-[#222222] w-8 text-center">
                                                            {children}
                                                        </span>
                                                        <button
                                                            onClick={() => setChildren(children + 1)}
                                                            className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:bg-[#F7F7F7] transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm text-[#222222]">Infants</span>
                                                        <p className="text-xs text-[#717171]">Under 2</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setInfants(Math.max(0, infants - 1))}
                                                            className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:bg-[#F7F7F7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={infants === 0}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                            </svg>
                                                        </button>
                                                        <span className="text-sm font-semibold text-[#222222] w-8 text-center">
                                                            {infants}
                                                        </span>
                                                        <button
                                                            onClick={() => setInfants(infants + 1)}
                                                            className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:bg-[#F7F7F7] transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                    <div>
                                                        <span className="text-sm text-[#222222]">Pets</span>
                                                        <p className="text-xs text-[#717171]">Bringing pets?</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setPets(Math.max(0, pets - 1))}
                                                            className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:bg-[#F7F7F7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={pets === 0}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                            </svg>
                                                        </button>
                                                        <span className="text-sm font-semibold text-[#222222] w-8 text-center">
                                                            {pets}
                                                        </span>
                                                        <button
                                                            onClick={() => setPets(pets + 1)}
                                                            className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:bg-[#F7F7F7] transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            
                            {/* Date picker popup */}
                            <div className="relative calendar-popup-container">
                                <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden mb-4">
                                    <button
                                        onClick={() => setShowCalendarPopup(!showCalendarPopup)}
                                        className="w-full px-4 py-3 text-left hover:bg-[#F7F7F7] transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">
                                                    Dates
                                                </p>
                                                <p className="text-sm font-semibold text-[#222222] mt-1">
                                                    {fromDate && toDate ? (
                                                        `${fromDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${toDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                                    ) : (
                                                        <span className="text-[#AAAAAA] font-normal">
                                                            Select dates
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <svg
                                                className={`w-5 h-5 text-[#717171] transition-transform ${showCalendarPopup ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                                
                                {showCalendarPopup && (
                                    <div className="absolute top-full right-0 bg-white rounded-2xl shadow-xl z-[9999] mt-1" style={{ minWidth: '600px', maxWidth: '700px' }}>
                                        <div>
                                            <DateRangePicker
                                                fromDate={fromDate}
                                                toDate={toDate}
                                                onFromDateChange={(date) => {
                                                    setFromDate(date);
                                                    // Keep popup open when selecting dates
                                                    if (date && toDate) {
                                                        // Both dates selected, could optionally close after a delay
                                                    }
                                                }}
                                                onToDateChange={(date) => {
                                                    setToDate(date);
                                                    // Close popup when both dates are selected
                                                    if (date && fromDate) {
                                                        setShowCalendarPopup(false);
                                                    }
                                                }}
                                                reservedRanges={property.reservedRange}
                                                infoPosition="top"
                                                onClose={() => setShowCalendarPopup(false)}
                                                showCloseButton={true}
                                            />
                                        </div>
                                                                                </div>
                                )}
                            </div>

                            <button
                                onClick={openReservationMail}
                                className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-4 rounded-2xl transition-colors text-[15px] tracking-wide"
                            >
                                Reserve
                            </button>

                            <p className="text-center text-sm text-[#717171] mt-3">
                                You won't be charged yet
                            </p>

                                                    </div>
                    </div>

                                </div>
            </div>

            {/* Mobile sticky footer */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDDDDD] px-6 py-4">
                <button
                    onClick={openReservationMail}
                    className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-4 rounded-2xl transition-colors"
                >
                    Reserve
                </button>
            </div>
        </main>
    );
}
