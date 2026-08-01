import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { Property } from "@bcn/core";
import { getProperties } from "../api-client";

const AIRBNB_GUEST_FEE_RATE = 0.1471; // ~14.71% service fee charged to guests
const AIRBNB_HOST_FEE_RATE = 0.03;    // 3% host service fee
const CLEANING_FEE = 50;              // EUR flat cleaning fee

interface PropertyBreakdown {
    property: Property;
    daily: {
        guestPays: number;
        airbnbGuestFee: number;
        listingPrice: number;
        airbnbHostFee: number;
        hostReceives: number;
    };
    monthly: {
        guestPays: number;
        airbnbGuestFee: number;
        listingPrice: number;
        airbnbHostFee: number;
        hostReceives: number;
        cleaningFee: number;
    };
}

function calcBreakdown(property: Property): PropertyBreakdown {
    const nightlyPrice = property.pricePerNight || 0;
    const minStay = property.minimumStay || 31;

    // Daily
    const dailyGuestFee = nightlyPrice * AIRBNB_GUEST_FEE_RATE;
    const dailyGuestPays = nightlyPrice + dailyGuestFee;
    const dailyHostFee = nightlyPrice * AIRBNB_HOST_FEE_RATE;
    const dailyHostReceives = nightlyPrice - dailyHostFee;

    // Monthly (min stay)
    const monthlyListing = nightlyPrice * minStay;
    const monthlyGuestFee = monthlyListing * AIRBNB_GUEST_FEE_RATE;
    const monthlyGuestPays = monthlyListing + monthlyGuestFee + CLEANING_FEE;
    const monthlyHostFee = monthlyListing * AIRBNB_HOST_FEE_RATE;
    const monthlyHostReceives = monthlyListing - monthlyHostFee;

    return {
        property,
        daily: {
            guestPays: dailyGuestPays,
            airbnbGuestFee: dailyGuestFee,
            listingPrice: nightlyPrice,
            airbnbHostFee: dailyHostFee,
            hostReceives: dailyHostReceives,
        },
        monthly: {
            guestPays: monthlyGuestPays,
            airbnbGuestFee: monthlyGuestFee,
            listingPrice: monthlyListing,
            airbnbHostFee: monthlyHostFee,
            hostReceives: monthlyHostReceives,
            cleaningFee: CLEANING_FEE,
        },
    };
}

function fmt(n: number): string {
    return `€${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function BreakdownCard({ data }: { data: PropertyBreakdown }) {
    const { property, daily, monthly } = data;
    const minStay = property.minimumStay || 31;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-5">
                <h3 className="text-white font-bold text-lg leading-tight">{property.name}</h3>
                <p className="text-gray-300 text-sm mt-1">{property.address} &middot; {fmt(property.pricePerNight || 0)}/night &middot; Min {minStay} nights</p>
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-100">
                {/* Daily */}
                <div className="p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Per Night</h4>
                    <Row label="Listing price" value={fmt(daily.listingPrice)} />
                    <Row label="Airbnb guest fee (14.7%)" value={`+${fmt(daily.airbnbGuestFee)}`} className="text-red-500" />
                    <Divider />
                    <Row label="Guest pays" value={fmt(daily.guestPays)} bold className="text-gray-900" />
                    <div className="pt-2" />
                    <Row label="Listing price" value={fmt(daily.listingPrice)} />
                    <Row label="Airbnb host fee (3%)" value={`-${fmt(daily.airbnbHostFee)}`} className="text-red-500" />
                    <Divider />
                    <Row label="Host receives" value={fmt(daily.hostReceives)} bold className="text-emerald-600" />
                </div>

                {/* Monthly */}
                <div className="p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly ({minStay} nights)</h4>
                    <Row label={`${fmt(daily.listingPrice)} × ${minStay} nights`} value={fmt(monthly.listingPrice)} />
                    <Row label="Airbnb guest fee (14.7%)" value={`+${fmt(monthly.airbnbGuestFee)}`} className="text-red-500" />
                    <Row label="Cleaning fee" value={`+${fmt(monthly.cleaningFee)}`} className="text-orange-500" />
                    <Divider />
                    <Row label="Guest pays total" value={fmt(monthly.guestPays)} bold className="text-gray-900" />
                    <div className="pt-2" />
                    <Row label={`${fmt(daily.listingPrice)} × ${minStay} nights`} value={fmt(monthly.listingPrice)} />
                    <Row label="Airbnb host fee (3%)" value={`-${fmt(monthly.airbnbHostFee)}`} className="text-red-500" />
                    <Divider />
                    <Row label="Host receives" value={fmt(monthly.hostReceives)} bold className="text-emerald-600" />
                </div>
            </div>

            {/* Airbnb margin */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Airbnb takes (monthly)</span>
                <span className="font-semibold text-amber-600">
                    {fmt(monthly.airbnbGuestFee + monthly.airbnbHostFee)} ({((AIRBNB_GUEST_FEE_RATE + AIRBNB_HOST_FEE_RATE) * 100).toFixed(1)}%)
                </span>
            </div>
        </div>
    );
}

function Row({ label, value, bold, className }: { label: string; value: string; bold?: boolean; className?: string }) {
    return (
        <div className={`flex justify-between items-center text-sm ${bold ? "font-bold" : ""} ${className || "text-gray-600"}`}>
            <span>{label}</span>
            <span className="tabular-nums">{value}</span>
        </div>
    );
}

function Divider() {
    return <div className="border-t border-dashed border-gray-200" />;
}

function PriceCalculator() {
    const [nightlyPrice, setNightlyPrice] = useState(85);
    const [nights, setNights] = useState(31);
    const [cleaningFee, setCleaningFee] = useState(50);
    const [guestFeeRate, setGuestFeeRate] = useState(14.71);
    const [hostFeeRate, setHostFeeRate] = useState(3);

    const guestRate = guestFeeRate / 100;
    const hostRate = hostFeeRate / 100;

    const subtotal = nightlyPrice * nights;
    const guestFee = subtotal * guestRate;
    const guestTotal = subtotal + guestFee + cleaningFee;
    const hostFee = subtotal * hostRate;
    const hostTotal = subtotal - hostFee;
    const airbnbTotal = guestFee + hostFee;
    const airbnbPct = subtotal > 0 ? ((airbnbTotal / subtotal) * 100).toFixed(1) : "0";

    return (
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 px-6 py-5">
                <h3 className="text-white font-bold text-lg">Price Calculator</h3>
                <p className="text-indigo-200 text-sm mt-1">Adjust values to simulate any scenario</p>
            </div>

            <div className="p-6">
                {/* Inputs */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <CalcInput label="Nightly price (€)" value={nightlyPrice} onChange={setNightlyPrice} min={0} step={5} />
                    <CalcInput label="Number of nights" value={nights} onChange={setNights} min={1} step={1} />
                    <CalcInput label="Cleaning fee (€)" value={cleaningFee} onChange={setCleaningFee} min={0} step={5} />
                    <CalcInput label="Guest fee (%)" value={guestFeeRate} onChange={setGuestFeeRate} min={0} max={50} step={0.1} />
                    <CalcInput label="Host fee (%)" value={hostFeeRate} onChange={setHostFeeRate} min={0} max={50} step={0.1} />
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Guest pays */}
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Guest pays</h4>
                        <Row label={`€${nightlyPrice.toFixed(2)} × ${nights} nights`} value={fmt(subtotal)} />
                        <Row label={`Guest service fee (${guestFeeRate}%)`} value={`+${fmt(guestFee)}`} className="text-red-500" />
                        <Row label="Cleaning fee" value={`+${fmt(cleaningFee)}`} className="text-orange-500" />
                        <Divider />
                        <Row label="Total" value={fmt(guestTotal)} bold className="text-gray-900" />
                        <div className="pt-1">
                            <Row label="Per night (effective)" value={nights > 0 ? fmt(guestTotal / nights) : "—"} className="text-gray-400" />
                        </div>
                    </div>

                    {/* Host receives */}
                    <div className="bg-emerald-50 rounded-xl p-5 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600">Host receives</h4>
                        <Row label={`€${nightlyPrice.toFixed(2)} × ${nights} nights`} value={fmt(subtotal)} />
                        <Row label={`Host service fee (${hostFeeRate}%)`} value={`-${fmt(hostFee)}`} className="text-red-500" />
                        <Divider />
                        <Row label="Total" value={fmt(hostTotal)} bold className="text-emerald-700" />
                        <div className="pt-1">
                            <Row label="Per night (effective)" value={nights > 0 ? fmt(hostTotal / nights) : "—"} className="text-emerald-400" />
                        </div>
                    </div>

                    {/* Airbnb takes */}
                    <div className="bg-amber-50 rounded-xl p-5 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600">Airbnb takes</h4>
                        <Row label={`From guest (${guestFeeRate}%)`} value={fmt(guestFee)} className="text-amber-700" />
                        <Row label={`From host (${hostFeeRate}%)`} value={fmt(hostFee)} className="text-amber-700" />
                        <Divider />
                        <Row label="Total" value={fmt(airbnbTotal)} bold className="text-amber-700" />
                        <div className="pt-1">
                            <Row label="Effective rate" value={`${airbnbPct}%`} className="text-amber-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CalcInput({ label, value, onChange, min, max, step }: {
    label: string; value: number; onChange: (v: number) => void;
    min?: number; max?: number; step?: number;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                min={min}
                max={max}
                step={step}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
        </div>
    );
}

// --- Competition data (scraped Aug 2026) ---
interface Competitor {
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

const MY_LAT = 41.4940;
const MY_LNG = 2.3510;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const COMPETITORS: Competitor[] = [
    // Aug 2026
    { id: "1552369751659748186", name: "3 Bedrooms with Terrace in the center of Premià", url: "https://www.airbnb.com/rooms/1552369751659748186", lat: 41.49266, lng: 2.35728, details: "3 bedrooms, 5 beds, 2 baths", badge: "", rating: "", monthlyPrice: 3970, originalPrice: 4998, period: "Aug" },
    { id: "1722620015138408380", name: "Comfortable room near the sea and in the mountains", url: "https://www.airbnb.com/rooms/1722620015138408380", lat: 41.4917, lng: 2.2928, details: "3 beds, 1 bath", badge: "", rating: "New", monthlyPrice: 1747, originalPrice: 2134, period: "Aug" },
    { id: "917090712711593909", name: "Casa en l'Maresme", url: "https://www.airbnb.com/rooms/917090712711593909", lat: 41.48773, lng: 2.32453, details: "3 bedrooms, 3 beds, 2 baths", badge: "", rating: "", monthlyPrice: 4198, originalPrice: 5128, period: "Aug" },
    { id: "1487593882281800432", name: "Relaxation near Barcelona", url: "https://www.airbnb.com/rooms/1487593882281800432", lat: 41.55483, lng: 2.35752, details: "2 bedrooms, 4 beds, 1 bath", badge: "", rating: "New", monthlyPrice: 7522, period: "Aug" },
    { id: "920775718686398058", name: "Green peaceful place", url: "https://www.airbnb.com/rooms/920775718686398058", lat: 41.52504, lng: 2.25036, details: "1 bed, 1 bath", badge: "", rating: "", monthlyPrice: 1050, period: "Aug" },
    { id: "1211612327627200713", name: "Apartment near the beach", url: "https://www.airbnb.com/rooms/1211612327627200713", lat: 41.50901, lng: 2.39479, details: "1 bed, 1 bath", badge: "", rating: "", monthlyPrice: 4198, originalPrice: 5128, period: "Aug" },
    // Sep 2026
    { id: "967191945967458619", name: "Seafront listing", url: "https://www.airbnb.com/rooms/967191945967458619", lat: 41.49798, lng: 2.34241, details: "1 double bed, 1 bath", badge: "Guest favorite", rating: "4.9 (30)", monthlyPrice: 2452, originalPrice: 2662, period: "Sep" },
    { id: "35245942", name: "El Fisquito", url: "https://www.airbnb.com/rooms/35245942", lat: 41.53048, lng: 2.31348, details: "1 bedroom, 2 beds, 1 bath", badge: "Guest favorite", rating: "4.97 (73)", monthlyPrice: 3978, originalPrice: 4848, period: "Sep" },
    { id: "1096305018941217650", name: "Valentino's House & Pool, Maresme", url: "https://www.airbnb.com/rooms/1096305018941217650", lat: 41.51666, lng: 2.35801, details: "2 bedrooms, 4 beds, 1 bath", badge: "Superhost", rating: "4.94 (32)", monthlyPrice: 7954, originalPrice: 9676, period: "Sep" },
    { id: "1096382321586151980", name: "Maresme, Clarks 3 Bdr TownHouse", url: "https://www.airbnb.com/rooms/1096382321586151980", lat: 41.51836, lng: 2.35725, details: "3 bedrooms, 4 beds, 1 bath", badge: "Guest favorite", rating: "4.94 (17)", monthlyPrice: 2692, originalPrice: 4987, period: "Sep" },
    { id: "2297252", name: "House with pool and private garden", url: "https://www.airbnb.com/rooms/2297252", lat: 41.50952, lng: 2.33958, details: "4 bedrooms, 6 beds, 3.5 baths", badge: "", rating: "4.74 (62)", monthlyPrice: 8504, originalPrice: 15819, period: "Sep" },
    { id: "661928671890970620", name: "House with a large terrace and large parking", url: "https://www.airbnb.com/rooms/661928671890970620", lat: 41.544, lng: 2.42728, details: "2 bedrooms, 3 beds, 1 bath", badge: "Guest favorite", rating: "4.94 (68)", monthlyPrice: 2879, originalPrice: 4681, period: "Sep" },
    { id: "1031886375594478815", name: "Centrally located room in Mataró", url: "https://www.airbnb.com/rooms/1031886375594478815", lat: 41.5394, lng: 2.4358, details: "1 single bed, 1 bath", badge: "Guest favorite", rating: "4.89 (56)", monthlyPrice: 826, originalPrice: 1124, period: "Sep" },
    { id: "37254201", name: "Family house near Barcelona and the sea", url: "https://www.airbnb.com/rooms/37254201", lat: 41.5518, lng: 2.3977, details: "3 bedrooms, 4 beds, 1 bath", badge: "Superhost", rating: "4.8 (88)", monthlyPrice: 3760, originalPrice: 4850, period: "Sep" },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function CompetitionSection({ properties }: { properties: Property[] }) {
    const [sortBy, setSortBy] = useState<"distance" | "price">("distance");
    const [competitors, setCompetitors] = useState<Competitor[]>(COMPETITORS);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>("Aug 2026 (static)");

    async function refreshCompetition() {
        setRefreshing(true);
        try {
            const now = new Date();
            const month1Start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const month1End = new Date(now.getFullYear(), now.getMonth() + 2, 1);
            const month2Start = month1End;
            const month2End = new Date(now.getFullYear(), now.getMonth() + 3, 1);

            const toYMD = (d: Date) => d.toISOString().split("T")[0];

            const [res1, res2] = await Promise.all([
                fetch(`${API_BASE_URL}/competition?checkin=${toYMD(month1Start)}&checkout=${toYMD(month1End)}`),
                fetch(`${API_BASE_URL}/competition?checkin=${toYMD(month2Start)}&checkout=${toYMD(month2End)}`),
            ]);

            const data1: Competitor[] = res1.ok ? await res1.json() : [];
            const data2: Competitor[] = res2.ok ? await res2.json() : [];
            const merged = [...data1, ...data2];

            if (merged.length > 0) {
                setCompetitors(merged);
                setLastUpdated(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
            } else {
                setLastUpdated(`Refresh returned no results – showing cached data`);
            }
        } catch (e) {
            console.error("Competition refresh failed:", e);
            setLastUpdated(`Refresh failed – showing cached data`);
        } finally {
            setRefreshing(false);
        }
    }

    const enriched = competitors.map(c => ({
        ...c,
        distance: haversineKm(MY_LAT, MY_LNG, c.lat, c.lng),
    })).sort((a, b) => sortBy === "distance" ? a.distance - b.distance : a.monthlyPrice - b.monthlyPrice);

    // Your avg monthly price for comparison
    const myAvgMonthly = properties.reduce((s, p) => {
        const nights = p.minimumStay || 31;
        const subtotal = (p.pricePerNight || 0) * nights;
        const guestFee = subtotal * AIRBNB_GUEST_FEE_RATE;
        return s + subtotal + guestFee + CLEANING_FEE;
    }, 0) / (properties.length || 1);

    return (
        <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Competition nearby</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Monthly stays near Premià de Mar</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={refreshCompetition}
                        disabled={refreshing}
                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                    >
                        <svg className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                            <polyline points="21 3 21 9 15 9" />
                        </svg>
                        {refreshing ? "Refreshing…" : "Refresh"}
                    </button>
                    <button
                        onClick={() => setSortBy("distance")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${sortBy === "distance" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                        By distance
                    </button>
                    <button
                        onClick={() => setSortBy("price")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${sortBy === "price" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                        By price
                    </button>
                </div>
            </div>

            {/* Your avg price reference bar */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-800">Your avg monthly price (guest pays)</span>
                <span className="text-lg font-bold text-emerald-700 tabular-nums">{fmt(myAvgMonthly)}</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-400">
                            <th className="px-5 py-3 font-semibold">Listing</th>
                            <th className="px-5 py-3 font-semibold">Details</th>
                            <th className="px-5 py-3 font-semibold">Distance</th>
                            <th className="px-5 py-3 font-semibold">Period</th>
                            <th className="px-5 py-3 font-semibold text-right">Monthly price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {enriched.map((c) => {
                            const cheaper = c.monthlyPrice < myAvgMonthly;
                            return (
                                <tr key={`${c.id}-${c.period}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3">
                                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
                                            {c.name}
                                        </a>
                                        <div className="flex gap-1.5 mt-1">
                                            {c.badge && (
                                                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700">{c.badge}</span>
                                            )}
                                            {c.rating && (
                                                <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-600">★ {c.rating}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500 text-xs">{c.details}</td>
                                    <td className="px-5 py-3 text-gray-600 tabular-nums">{c.distance.toFixed(1)} km</td>
                                    <td className="px-5 py-3">
                                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-600">{c.period} 2026</span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <span className={`font-bold tabular-nums ${cheaper ? "text-red-600" : "text-emerald-600"}`}>
                                            {fmt(c.monthlyPrice)}
                                        </span>
                                        {c.originalPrice && (
                                            <span className="block text-[10px] text-gray-400 line-through tabular-nums">{fmt(c.originalPrice)}</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-gray-400 mt-3 text-right">
                Data from Airbnb search · Last updated: {lastUpdated} · Prices include guest service fees
            </p>
        </div>
    );
}

export function HostDashboard() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProperties()
            .then(setProperties)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const breakdowns = properties.map(calcBreakdown);

    // Totals
    const totalMonthlyGuestPays = breakdowns.reduce((s, b) => s + b.monthly.guestPays, 0);
    const totalMonthlyHostReceives = breakdowns.reduce((s, b) => s + b.monthly.hostReceives, 0);
    const totalAirbnbCut = breakdowns.reduce((s, b) => s + b.monthly.airbnbGuestFee + b.monthly.airbnbHostFee, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">Host Dashboard</h1>
                    <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Back</Link>
                </div>
                <p className="text-gray-500 text-sm mb-8">Guest pays vs. host receives — Airbnb fee breakdown</p>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">All guests pay (monthly)</p>
                        <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmt(totalMonthlyGuestPays)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">You receive (monthly)</p>
                        <p className="text-2xl font-bold text-emerald-600 tabular-nums">{fmt(totalMonthlyHostReceives)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Airbnb takes (monthly)</p>
                        <p className="text-2xl font-bold text-amber-600 tabular-nums">{fmt(totalAirbnbCut)}</p>
                    </div>
                </div>

                {/* Per-property breakdowns */}
                <div className="space-y-6">
                    {breakdowns.map((b) => (
                        <BreakdownCard key={b.property.id} data={b} />
                    ))}
                </div>

                {/* Price Calculator */}
                <PriceCalculator />

                {/* Competition */}
                <CompetitionSection properties={properties} />
            </div>
        </div>
    );
}
