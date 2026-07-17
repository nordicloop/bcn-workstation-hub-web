import { Link } from "react-router";
import type { Property } from "@bcn/core";

interface AvailabilityResult {
  property: Property;
  isAvailable: boolean;
  reason: string | null;
  pricing: {
    basePrice: number;
    nightlyTotal: number;
    cleaningFee: number;
    serviceFee: number;
    total: number;
  };
  nextAvailable?: {
    fromDate: Date;
    toDate: Date;
    nights: number;
  };
}

interface PropertyGridCardProps {
  property: Property;
  className?: string;
  availabilityResult?: AvailabilityResult;
  formatPrice?: (price: number) => string;
}

export function PropertyGridCard({ property, className = "", availabilityResult, formatPrice }: PropertyGridCardProps) {
  // Check if we should preselect dates (when no dates are selected and we have next available dates)
  const shouldPreselectDates = availabilityResult && !availabilityResult.isAvailable && availabilityResult.nextAvailable;
  
  const navigationState = shouldPreselectDates && availabilityResult.nextAvailable ? {
    preselectDates: {
      fromDate: availabilityResult.nextAvailable.fromDate,
      toDate: availabilityResult.nextAvailable.toDate
    },
    preselectGuests: {
      adults: 1,
      children: 0,
      infants: 0,
      pets: 0
    }
  } : undefined;

  return (
    <Link 
      to={`/properties/${property.id}`}
      state={navigationState}
      className={`block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden ${className} ${
        availabilityResult 
          ? availabilityResult.isAvailable 
            ? 'ring-2 ring-green-300' 
            : 'ring-2 ring-gray-300 opacity-75'
          : ''
      }`}
    >
      <div className="relative">
        {/* Property Image */}
        <div className="h-48 bg-gray-200">
          {property.images[0] && (
            <img 
              src={property.images[0].items[0]} 
              alt={property.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
          {formatPrice ? formatPrice(property.pricePerNight || 0) : `$${property.pricePerNight || 0}`}/night
        </div>
      </div>

      {/* Property Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[#222222] mb-1 line-clamp-1">{property.name}</h3>
        <p className="text-sm text-[#717171] mb-3 line-clamp-1">{property.address}</p>
        
        {/* Availability Status */}
        {availabilityResult ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-[#717171]">
              <span>Max 4 guests</span>
              <span>•</span>
              <span>Min {property.minimumStay || 31} nights</span>
            </div>

            {availabilityResult.isAvailable ? (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-[#717171]">
                  {formatPrice ? formatPrice(availabilityResult.pricing.basePrice) : `$${availabilityResult.pricing.basePrice}`} × {Math.ceil((availabilityResult.pricing.nightlyTotal / availabilityResult.pricing.basePrice))} nights
                </p>
              </div>
            ) : availabilityResult.nextAvailable ? (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-blue-700 font-medium mb-1">
                  Next available dates:
                </p>
                <p className="text-xs text-blue-700 font-medium">
                  {availabilityResult.nextAvailable.fromDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {availabilityResult.nextAvailable.toDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                <p className="text-xs text-[#717171]">
                  {availabilityResult.nextAvailable.nights} nights
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs text-[#717171]">
            <span>Max 4 guests</span>
            <span>•</span>
            <span>Min {property.minimumStay || 31} nights</span>
          </div>
        )}
      </div>
    </Link>
  );
}
