import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import type { Property, NamedList } from "@bcn/core";
import { getProperty } from "../api-client";
import { DateRangePicker } from "../components/DateRangePicker";
import { GuestCounter } from "../components/GuestCounter";
import { ImageGalleryModal } from "../components/ImageGalleryModal";

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

    useEffect(() => {
        if (!id) return;
        getProperty(id)
            .then(setProperty)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

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
                                Hosted by Nordicloop
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-linear-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-lg">
                                N
                            </span>
                        </div>
                    </section>

                    {/* Description */}
                    <section className="py-8 border-b border-[#EBEBEB]">
                        <p className="text-[#484848] leading-relaxed text-[15px]">
                            {property.description}
                        </p>
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
                        />

                        <div className="mt-8">
                            <h3 className="font-semibold text-[#222222] mb-1">
                                Guests
                            </h3>
                            <p className="text-sm text-[#717171] mb-4">
                                This place allows up to 16 guests
                            </p>
                            <GuestCounter
                                adults={adults}
                                children={children}
                                infants={infants}
                                onAdultsChange={setAdults}
                                onChildrenChange={setChildren}
                                onInfantsChange={setInfants}
                            />
                        </div>

                        {/* Available periods */}
                        {property.availability.length > 0 && (
                            <div className="mt-6 p-5 bg-[#F7F7F7] rounded-2xl">
                                <h3 className="font-semibold text-[#222222] mb-3 text-sm">
                                    Available periods
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {property.availability.map((period, i) => (
                                        <div
                                            key={i}
                                            className="text-sm text-[#484848] bg-white border border-[#DDDDDD] rounded-full px-4 py-1.5"
                                        >
                                            {new Date(
                                                period.from
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                            {" – "}
                                            {new Date(
                                                period.to
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar booking card */}
                <div className="hidden lg:block">
                    <div className="sticky top-28">
                        <div className="border border-[#DDDDDD] rounded-3xl p-7 shadow-xl">
                            <p className="text-2xl font-bold text-[#222222] mb-5 font-display">
                                Book your stay
                            </p>

                            {/* Date + guests picker */}
                            <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden mb-4">
                                <div className="grid grid-cols-2 divide-x divide-[#DDDDDD]">
                                    <div className="px-4 py-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">
                                            Check-in
                                        </p>
                                        <p className="text-sm font-semibold text-[#222222] mt-1">
                                            {fromDate ? (
                                                fromDate.toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    }
                                                )
                                            ) : (
                                                <span className="text-[#AAAAAA] font-normal">
                                                    Add date
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="px-4 py-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">
                                            Check-out
                                        </p>
                                        <p className="text-sm font-semibold text-[#222222] mt-1">
                                            {toDate ? (
                                                toDate.toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    }
                                                )
                                            ) : (
                                                <span className="text-[#AAAAAA] font-normal">
                                                    Add date
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="border-t border-[#DDDDDD] px-4 py-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">
                                        Guests
                                    </p>
                                    <p className="text-sm font-semibold text-[#222222] mt-1">
                                        {totalGuests} guest
                                        {totalGuests !== 1 ? "s" : ""}
                                        {infants > 0
                                            ? `, ${infants} infant${infants !== 1 ? "s" : ""}`
                                            : ""}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const section =
                                        document.getElementById("availability");
                                    section?.scrollIntoView({
                                        behavior: "smooth",
                                    });
                                }}
                                className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-4 rounded-2xl transition-colors text-[15px] tracking-wide"
                            >
                                {fromDate && toDate
                                    ? "Reserve"
                                    : "Check availability"}
                            </button>

                            <p className="text-center text-sm text-[#717171] mt-3">
                                You won't be charged yet
                            </p>

                            {nightCount && (
                                <div className="mt-5 pt-5 border-t border-[#EBEBEB] space-y-2">
                                    <div className="flex justify-between text-sm text-[#484848]">
                                        <span>
                                            {nightCount} night
                                            {nightCount !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile sticky footer */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDDDDD] px-6 py-4">
                <a
                    href="#availability"
                    className="block w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-4 rounded-2xl text-center transition-colors"
                >
                    Check availability
                </a>
            </div>
        </main>
    );
}
