import { useState, useEffect } from "react";
import { DateRangePicker } from "./DateRangePicker";
import { ReservationStatus } from "./ReservationStatus";
import { ReservationSummary } from "./ReservationSummary";
import type { Property } from "@bcn/core";
import { ReservationCookies } from "../utils/ReservationCookies";

interface PropertyBookingCardProps {
  property: Property;
  className?: string;
  formatPrice?: (price: number) => string;
}

export function PropertyBookingCard({ property, className = "", formatPrice }: PropertyBookingCardProps) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);
  const [showReservationSummary, setShowReservationSummary] = useState(false);
  const [showSuccessConfirmation, setShowSuccessConfirmation] = useState(false);

  // Restore dates from cookies when component loads
  useEffect(() => {
    const allReservations = ReservationCookies.getAllReservations();
    const propertyReservation = allReservations.find(r => r.propertyId === property.id);
    
    if (propertyReservation) {
      setFromDate(new Date(propertyReservation.fromDate));
      setToDate(new Date(propertyReservation.toDate));
    }
  }, [property.id]);

  const totalGuests = adults + children + infants;
  const nightCount = fromDate && toDate 
    ? Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const validateStayDuration = (from: Date, to: Date): string | null => {
    const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const minStay = property.minimumStay || 31;
    
    if (nights < minStay) {
      return `Minimum stay is ${minStay} nights. You selected ${nights} night${nights !== 1 ? "s" : ""}.`;
    }
    
    return null;
  };

  const handleDateChange = (from: Date | null, to: Date | null) => {
    setFromDate(from);
    setToDate(to);
    
    if (from && to) {
      const validationError = validateStayDuration(from, to);
      setDateValidationError(validationError);
    } else {
      setDateValidationError(null);
    }
  };

  function openBookingMail() {
    if (!fromDate || !toDate) {
      setShowCalendarPopup(true);
      return;
    }
    
    const validationError = validateStayDuration(fromDate, toDate);
    if (validationError) {
      alert(validationError);
      setShowCalendarPopup(true);
      return;
    }
    
    setShowReservationSummary(true);
  }

  async function confirmBooking(guestEmail: string) {
    if (!fromDate || !toDate || !property) {
      alert("Missing required information");
      return;
    }

    const validationError = validateStayDuration(fromDate, toDate);
    if (validationError) {
      alert(validationError);
      return;
    }

    // Store booking in cookies to prevent double booking
    ReservationCookies.addReservation({
      propertyId: property.id,
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0],
      guestEmail: guestEmail
    });
    
    setShowReservationSummary(false);
    setShowSuccessConfirmation(true);
  }

  function cancelBooking() {
    setShowReservationSummary(false);
  }

  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Property Image */}
      <div className="relative h-48 bg-gray-200">
        {property.images[0] && (
          <img 
            src={property.images[0].items[0]} 
            alt={property.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-medium">
          {formatPrice ? formatPrice(property.pricePerNight || 0) : `$${property.pricePerNight || 0}`}/night
        </div>
      </div>

      {/* Property Content */}
      <div className="p-6">
        {/* Property Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#222222] mb-2">{property.name}</h3>
          <p className="text-[#717171] text-sm mb-2">{property.address}</p>
          <div className="flex items-center gap-4 text-sm text-[#717171]">
            <span>Max 4 guests</span>
            <span>Min {property.minimumStay || 31} nights</span>
          </div>
        </div>

        {/* Booking Status */}
        <ReservationStatus 
          propertyId={property.id}
          fromDate={fromDate}
          toDate={toDate}
          onCancel={() => {
            // Refresh the component state when booking is cancelled
            setShowSuccessConfirmation(false);
            // Force a re-render by updating the state
            setFromDate(fromDate);
            setToDate(toDate);
          }}
        />

        {/* Guest and Date Selection */}
        <div className="space-y-4 mb-6">
          {/* Guest Selector */}
          <div>
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
          <div>
            <label className="block text-sm font-medium text-[#222222] mb-2">Dates</label>
            <button
              onClick={() => setShowCalendarPopup(!showCalendarPopup)}
              className="w-full px-4 py-3 border border-[#DDDDDD] rounded-xl text-left hover:border-[#222222] transition-colors"
            >
              {fromDate && toDate ? (
                <span className="text-[#222222]">
                  {formatDate(fromDate)} - {formatDate(toDate)}
                  {nightCount && <span className="text-[#717171] ml-2">({nightCount} nights)</span>}
                </span>
              ) : (
                <span className="text-[#717171]">Select check-in and check-out dates</span>
              )}
            </button>
            
            {showCalendarPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Select Dates</h3>
                      <button
                        onClick={() => setShowCalendarPopup(false)}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                    <DateRangePicker
                      fromDate={fromDate}
                      toDate={toDate}
                      onFromDateChange={setFromDate}
                      onToDateChange={setToDate}
                      onDateChange={handleDateChange}
                      validationError={dateValidationError}
                      reservedRanges={property.reservedRange}
                      infoPosition="top"
                      onClose={() => setShowCalendarPopup(false)}
                      showCloseButton={false}
                      property={property}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Button */}
        <button
          onClick={openBookingMail}
          className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-4 rounded-2xl transition-colors text-[15px] tracking-wide"
        >
          Request Booking
        </button>

        <p className="text-center text-sm text-[#717171] mt-3">
          You won't be charged yet
        </p>
      </div>

      {/* Booking Summary Modal */}
      {showReservationSummary && property && (
        <ReservationSummary
          property={property}
          fromDate={fromDate}
          toDate={toDate}
          adults={adults}
          children={children}
          infants={infants}
          onConfirm={confirmBooking}
          onCancel={cancelBooking}
        />
      )}

      {/* Success Confirmation Card */}
      {showSuccessConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Success Message */}
            <h2 className="text-2xl font-bold text-[#222222] mb-2">Booking Requested!</h2>
            <p className="text-[#717171] mb-6">
              Your booking request has been sent successfully. We'll email you shortly with next steps.
            </p>
            
            {/* Property Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#222222] block">{property.name}</h3>
                  <p className="text-sm text-[#717171]">{property.address}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#717171]">Check-in:</span>
                  <span className="text-[#222222] font-medium">{fromDate && formatDate(fromDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717171]">Check-out:</span>
                  <span className="text-[#222222] font-medium">{toDate && formatDate(toDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717171]">Guests:</span>
                  <span className="text-[#222222] font-medium">{totalGuests}</span>
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessConfirmation(false)}
              className="w-full bg-[#222222] hover:bg-[#333333] text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
