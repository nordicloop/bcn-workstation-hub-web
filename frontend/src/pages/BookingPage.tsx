import { useState, useEffect } from "react";
import { PropertyGridCard } from "../components/PropertyGridCard";
import { DateSelectorSidebar } from "../components/DateSelectorSidebar";
import { CurrencySelector, useCurrency } from "../components/CurrencySelector";
import { getProperties } from "../api-client";
import type { Property } from "@bcn/core";

// Helper function to get timezone offset in milliseconds
function getTimezoneOffset(timezone: string): number {
  try {
    // Simple timezone offset mapping for common timezones
    const timezoneOffsets: { [key: string]: number } = {
      'Europe/Madrid': 2 * 60 * 60 * 1000, // UTC+2 (CEST in summer)
      'Europe/Paris': 2 * 60 * 60 * 1000,  // UTC+2 (CEST in summer)
      'Europe/Berlin': 2 * 60 * 60 * 1000, // UTC+2 (CEST in summer)
      'Europe/London': 1 * 60 * 60 * 1000,  // UTC+1 (BST in summer)
      'America/New_York': -4 * 60 * 60 * 1000, // UTC-4 (EDT in summer)
      'America/Los_Angeles': -7 * 60 * 60 * 1000, // UTC-7 (PDT in summer)
      'UTC': 0,
    };
    
    return timezoneOffsets[timezone] || 0;
  } catch (error) {
    return 0;
  }
}

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

export function BookingPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<{ fromDate: Date | null; toDate: Date | null }>({ fromDate: null, toDate: null });
  const [selectedGuests, setSelectedGuests] = useState({ adults: 1, children: 0, infants: 0 });
  const { currency, setCurrency, formatPrice } = useCurrency();

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const allProperties = await getProperties();
        setProperties(allProperties);
      } catch (error) {
        console.error("Failed to load properties:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  // Calculate next available dates for a property
  const findNextAvailableDates = (property: Property, requestedNights: number): { fromDate: Date; toDate: Date; nights: number } | null => {
    const today = new Date();
    const minStay = property.minimumStay || 31;
    const nightsToCheck = Math.max(requestedNights, minStay);
    
    // Check dates for the next 6 months
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 6);
    
    let currentDate = new Date(today);
    
    while (currentDate <= endDate) {
      const potentialToDate = new Date(currentDate);
      potentialToDate.setDate(potentialToDate.getDate() + nightsToCheck - 1);
      
      // Check if this date range conflicts with existing reservations
      const hasConflict = property.reservedRange?.some(range => {
        const reservedStart = new Date(range.from);
        const reservedEnd = new Date(range.to);
        return (
          (currentDate >= reservedStart && currentDate <= reservedEnd) ||
          (potentialToDate >= reservedStart && potentialToDate <= reservedEnd) ||
          (currentDate <= reservedStart && potentialToDate >= reservedEnd)
        );
      });
      
      if (!hasConflict) {
        return {
          fromDate: new Date(currentDate),
          toDate: new Date(potentialToDate),
          nights: nightsToCheck
        };
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return null;
  };

  // Check availability for all properties
  const checkAvailability = (): AvailabilityResult[] => {
    if (!selectedDates.fromDate || !selectedDates.toDate || properties.length === 0) {
      // Show next available dates for each property by default
      return properties.map(property => {
        const minStay = property.minimumStay || 31;
        const nextAvailable = findNextAvailableDates(property, minStay);
        
        return {
          property,
          isAvailable: false, // Show as unavailable since no dates selected
          reason: null,
          pricing: {
            basePrice: property.pricePerNight || 0,
            nightlyTotal: 0,
            cleaningFee: 50,
            serviceFee: 0,
            total: 0
          },
          nextAvailable: nextAvailable || undefined
        };
      });
    }

    const nights = Math.ceil((selectedDates.toDate.getTime() - selectedDates.fromDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalGuests = selectedGuests.adults + selectedGuests.children + selectedGuests.infants;

    const results = properties.map(property => {
      // Check guest capacity
      const maxGuests = 4;
      const guestCapacityOk = totalGuests <= maxGuests;

      // Check minimum stay requirement
      const minStay = property.minimumStay || 31;
      const stayDurationOk = nights >= minStay;

      // Check date conflicts with existing reservations
      const hasConflict = property.reservedRange?.some(range => {
        const reservedStart = new Date(range.from);
        const reservedEnd = new Date(range.to);
        
        // Use property-specific timezone for checkout/check-in timing
        // Most properties have checkout at 11 AM and check-in at 3 PM
        let checkoutBuffer = new Date(reservedEnd);
        
        // If we have timezone information, use it for more accurate calculations
        if (property.timezone) {
          try {
            // Convert to property's timezone and add buffer time
            const timezoneOffset = getTimezoneOffset(property.timezone);
            const localCheckoutTime = new Date(reservedEnd.getTime() + timezoneOffset);
            localCheckoutTime.setDate(localCheckoutTime.getDate() + 1);
            checkoutBuffer = new Date(localCheckoutTime.getTime() - timezoneOffset);
          } catch (error) {
            // Fallback to simple date addition if timezone conversion fails
            checkoutBuffer.setDate(checkoutBuffer.getDate() + 1);
          }
        } else {
          // Fallback to simple 1-day buffer for properties without timezone info
          checkoutBuffer.setDate(checkoutBuffer.getDate() + 1);
        }
        
        return (
          (selectedDates.fromDate! >= reservedStart && selectedDates.fromDate! < checkoutBuffer) ||
          (selectedDates.toDate! > reservedStart && selectedDates.toDate! <= reservedEnd) ||
          (selectedDates.fromDate! <= reservedStart && selectedDates.toDate! >= reservedEnd)
        );
      });

      const isAvailable = guestCapacityOk && stayDurationOk && !hasConflict;

      // Debug logging for property 851289997009741371
      if (property.id === "851289997009741371") {
        // Log detailed reserved range information
        const reservedDetails = property.reservedRange?.map(range => ({
          from: range.from,
          to: range.to,
          fromDateObj: new Date(range.from).toISOString(),
          toDateObj: new Date(range.to).toISOString()
        }));
        
        console.log(`Property ${property.id} availability check:`, {
          selectedDates: {
            from: selectedDates.fromDate?.toISOString(),
            to: selectedDates.toDate?.toISOString()
          },
          nights,
          totalGuests,
          guestCapacityOk,
          minStay,
          stayDurationOk,
          reservedRange: property.reservedRange,
          reservedDetails,
          hasConflict,
          isAvailable,
          reason: !guestCapacityOk ? `Maximum ${maxGuests} guests allowed` : 
                  !stayDurationOk ? `Minimum ${minStay} nights required` : 
                  hasConflict ? "Dates already booked" : null
        });
      }

      // Determine unavailability reason
      let reason = null;
      if (!guestCapacityOk) {
        reason = `Maximum ${maxGuests} guests allowed`;
      } else if (!stayDurationOk) {
        reason = `Minimum ${minStay} nights required`;
      } else if (hasConflict) {
        reason = "Dates already booked";
      }

      // Calculate pricing (all prices are in EUR base currency)
      const basePrice = property.pricePerNight || 0;
      const nightlyTotal = basePrice * nights;
      const cleaningFee = 50;
      const serviceFee = Math.round(nightlyTotal * 0.1);
      const total = nightlyTotal + cleaningFee + serviceFee;

      // Find next available dates if unavailable due to booking conflicts
      let nextAvailable = undefined;
      if (!isAvailable && hasConflict) {
        const nextDates = findNextAvailableDates(property, nights);
        if (nextDates) {
          nextAvailable = nextDates;
        }
      }

      return {
        property,
        isAvailable,
        reason,
        pricing: {
          basePrice,
          nightlyTotal,
          cleaningFee,
          serviceFee,
          total
        },
        nextAvailable
      };
    });

    // Sort: available properties first
    return results.sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return 0;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
          <p className="text-[#717171] mt-4">Loading apartments...</p>
        </div>
      </div>
    );
  }

  const availabilityResults = checkAvailability();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="flex justify-center">
              <h1 className="text-4xl font-bold text-[#222222]">
                BCN Workstation Hub
              </h1>
            </div>
            <div className="flex-1 flex justify-end">
              <CurrencySelector
                selectedCurrency={currency}
                onCurrencyChange={setCurrency}
              />
            </div>
          </div>
          <p className="text-xl text-[#717171] max-w-2xl mx-auto">
            Choose your perfect workspace in Barcelona. Select dates and guests to see availability and pricing.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Property Grid - Left Side */}
          <div className="flex-1">
            {/* Availability Summary */}
            {selectedDates.fromDate && selectedDates.toDate && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Available Apartments ({availabilityResults.filter(r => r.isAvailable).length})
                    </h3>
                    <p className="text-sm text-blue-700">
                      {availabilityResults.filter(r => r.isAvailable).length} of {availabilityResults.length} apartments match your criteria
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-700">
                      {selectedGuests.adults + selectedGuests.children + selectedGuests.infants} guests • {Math.ceil((selectedDates.toDate.getTime() - selectedDates.fromDate.getTime()) / (1000 * 60 * 60 * 24))} nights
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {availabilityResults.map((result) => (
                <PropertyGridCard 
                  key={result.property.id} 
                  property={result.property}
                  availabilityResult={result}
                  formatPrice={formatPrice}
                />
              ))}
            </div>

            {properties.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#717171]">No apartments available at the moment.</p>
              </div>
            )}
          </div>

          {/* Date Selector Sidebar - Right Side */}
          <div className="lg:w-96 lg:flex-shrink-0">
            <DateSelectorSidebar 
              onDatesChange={(fromDate, toDate) => setSelectedDates({ fromDate, toDate })}
              onGuestsChange={(adults, children, infants) => setSelectedGuests({ adults, children, infants })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
