import { useState, useEffect } from "react";
import { DateRangePicker } from "./DateRangePicker";
import type { Property } from "@bcn/core";
import { getProperties } from "../api-client";

interface BookingSelectorProps {
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

interface AvailableProperty extends Property {
  available: boolean;
  reason?: string;
}

export function BookingSelector({ onPropertySelect, className = "" }: BookingSelectorProps) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [availableProperties, setAvailableProperties] = useState<AvailableProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Load all properties on component mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const allProperties = await getProperties();
        setProperties(allProperties);
      } catch (error) {
        console.error("Failed to load properties:", error);
      }
    };
    loadProperties();
  }, []);

  // Check availability when dates or guests change
  useEffect(() => {
    if (fromDate && toDate && properties.length > 0) {
      checkAvailability();
    } else {
      setAvailableProperties([]);
      setSearchPerformed(false);
    }
  }, [fromDate, toDate, adults, children, infants, properties]);

  const checkAvailability = () => {
    if (!fromDate || !toDate) return;

    setLoading(true);
    setSearchPerformed(false);

    // Simulate API call delay
    setTimeout(() => {
      const totalGuests = adults + children + infants;
      const nights = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

      const available = properties.map(property => {
        // Check if property can accommodate the guests (defaulting to 4 max guests)
        const maxGuests = 4;
        if (totalGuests > maxGuests) {
          return {
            ...property,
            available: false,
            reason: `Maximum ${maxGuests} guests allowed`
          };
        }

        // Check minimum stay requirement
        const minStay = property.minimumStay || 31;
        if (nights < minStay) {
          return {
            ...property,
            available: false,
            reason: `Minimum ${minStay} nights required`
          };
        }

        // Check if dates conflict with existing reservations
        const hasConflict = property.reservedRange?.some(range => {
          const reservedStart = new Date(range.from);
          const reservedEnd = new Date(range.to);
          return (
            (fromDate >= reservedStart && fromDate <= reservedEnd) ||
            (toDate >= reservedStart && toDate <= reservedEnd) ||
            (fromDate <= reservedStart && toDate >= reservedEnd)
          );
        });

        if (hasConflict) {
          return {
            ...property,
            available: false,
            reason: "Dates already booked"
          };
        }

        return {
          ...property,
          available: true
        };
      });

      setAvailableProperties(available);
      setLoading(false);
      setSearchPerformed(true);
    }, 500);
  };

  const handleDateChange = (from: Date | null, to: Date | null) => {
    setFromDate(from);
    setToDate(to);
    setShowCalendar(false);
  };

  const totalGuests = adults + children + infants;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const nights = fromDate && toDate 
    ? Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-[#222222] mb-6">Find Your Perfect Stay</h2>
      
      {/* Guest Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#222222] mb-2">Guests</label>
        <div className="relative">
          <button
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            className="w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-left flex items-center justify-between hover:border-[#222222] transition-colors"
          >
            <span className="text-[#222222]">
              {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
            </span>
            <svg className="w-5 h-5 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showGuestDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#DDDDDD] rounded-xl shadow-xl z-50 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#222222]">Adults</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:border-[#222222] transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{adults}</span>
                    <button
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:border-[#222222] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[#222222]">Children</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:border-[#222222] transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{children}</span>
                    <button
                      onClick={() => setChildren(children + 1)}
                      className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:border-[#222222] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[#222222]">Infants</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:border-[#222222] transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{infants}</span>
                    <button
                      onClick={() => setInfants(infants + 1)}
                      className="w-8 h-8 rounded-full border border-[#DDDDDD] flex items-center justify-center hover:border-[#222222] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowGuestDropdown(false)}
                className="w-full mt-4 py-2 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#222222] mb-2">Dates</label>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-left hover:border-[#222222] transition-colors"
        >
          {fromDate && toDate ? (
            <span className="text-[#222222]">
              {formatDate(fromDate)} - {formatDate(toDate)}
              {nights > 0 && <span className="text-[#717171] ml-2">({nights} nights)</span>}
            </span>
          ) : (
            <span className="text-[#717171]">Select check-in and check-out dates</span>
          )}
        </button>
        
        {showCalendar && (
          <div className="absolute mt-2 bg-white border border-[#DDDDDD] rounded-xl shadow-xl z-50">
            <DateRangePicker
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              onDateChange={handleDateChange}
              reservedRanges={[]} // We'll handle this in availability check
              infoPosition="top"
              onClose={() => setShowCalendar(false)}
              showCloseButton={true}
              property={null}
            />
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchPerformed && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[#222222] mb-4">
            Available Apartments ({availableProperties.filter(p => p.available).length})
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF385C]"></div>
              <p className="text-[#717171] mt-2">Checking availability...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableProperties.length === 0 ? (
                <p className="text-[#717171] text-center py-8">No apartments found</p>
              ) : (
                availableProperties.map(property => (
                  <div
                    key={property.id}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      property.available 
                        ? 'border-[#DDDDDD] hover:border-[#FF385C] hover:shadow-md' 
                        : 'border-[#DDDDDD] opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => property.available && onPropertySelect?.(property)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#222222] mb-1">{property.name}</h4>
                        <p className="text-sm text-[#717171] mb-2">{property.address}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-[#222222]">
                            ${property.pricePerNight}/night
                          </span>
                          <span className="text-[#717171]">
                            Max 4 guests
                          </span>
                          <span className="text-[#717171]">
                            Min {property.minimumStay || 31} nights
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {property.available ? (
                          <div className="text-green-600">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium">Available</span>
                          </div>
                        ) : (
                          <div className="text-red-600 text-right">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium">{property.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
