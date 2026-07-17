import { Link } from "react-router";
import type { Property } from "@bcn/core";

type Props = {
    property: Property;
};

export function PropertyCard({ property }: Props) {
    const firstImage = (
        property.images.find((i) => i.title.toLowerCase() === "featured") ||
        property.images[0]
    ).items[0];

    return (
        <Link to={`/properties/${property.id}`} className="group block">
            {/* Image container */}
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                {firstImage ? (
                    <img
                        src={firstImage}
                        alt={property.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-rose-100 via-pink-100 to-orange-100 flex items-center justify-center">
                        <svg
                            className="w-14 h-14 text-rose-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Wishlist button */}
                <button
                    onClick={(e) => e.preventDefault()}
                    className="absolute top-3 right-3 p-1 hover:scale-110 transition-transform"
                    aria-label="Save to wishlist"
                >
                    <svg
                        className="w-6 h-6 drop-shadow-md"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
            </div>

            {/* Property info */}
            <div className="space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[#222222] leading-snug truncate">
                        {property.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                        <svg
                            className="w-3.5 h-3.5 text-[#222222]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="text-sm font-medium text-[#222222]">
                            4.92
                        </span>
                    </div>
                </div>

                <p className="text-sm text-[#717171] truncate">
                    {property.address}
                </p>

                {property.amenities.length > 0 && (
                    <p className="text-sm text-[#717171] truncate">
                        {property.amenities[0]?.items.slice(0, 3).join(" · ")}
                    </p>
                )}
            </div>
        </Link>
    );
}
