import { useState } from "react";
import type { Property } from "@bcn/core";

interface ReservationSummaryProps {
  property: Property;
  fromDate: Date | null;
  toDate: Date | null;
  adults: number;
  children: number;
  infants: number;
  onConfirm: (guestEmail: string) => void;
  onCancel: () => void;
}

export function ReservationSummary({ 
  property, 
  fromDate, 
  toDate, 
  adults, 
  children, 
  infants, 
  onConfirm, 
  onCancel 
}: ReservationSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [guestEmail, setGuestEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Calculate number of nights
  const nights = fromDate && toDate 
    ? Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate base amount
  const basePricePerNight = property.pricePerNight || 0;
  const baseAmount = nights * basePricePerNight;

  // Calculate total with discount
  const totalAmount = baseAmount - discountAmount;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Apply promo code
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setIsApplyingPromo(true);
    setPromoError("");

    // Simulate promo code validation (in real app, this would be an API call)
    setTimeout(() => {
      // Mock promo codes for demo
      const promoCodes: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
        'SAVE10': { discount: 10, type: 'percentage' },
        'SAVE20': { discount: 20, type: 'percentage' },
        'WELCOME50': { discount: 50, type: 'fixed' },
      };

      const promo = promoCodes[promoCode.toUpperCase()];
      
      if (promo) {
        if (promo.type === 'percentage') {
          setDiscountAmount(Math.round(baseAmount * (promo.discount / 100)));
        } else {
          setDiscountAmount(promo.discount);
        }
        setPromoError("");
      } else {
        setPromoError("Invalid promo code");
        setDiscountAmount(0);
      }
      
      setIsApplyingPromo(false);
    }, 1000);
  };

  // Remove promo code
  const removePromoCode = () => {
    setPromoCode("");
    setDiscountAmount(0);
    setPromoError("");
  };

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle confirm with email validation
  const handleConfirm = () => {
    if (!guestEmail.trim()) {
      setEmailError("Please enter your email address");
      return;
    }

    if (!validateEmail(guestEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    // Call onConfirm with the email
    onConfirm(guestEmail);
  };

  const guestParts = [
    `${adults} adult${adults !== 1 ? "s" : ""}`,
    children > 0 ? `${children} child${children !== 1 ? "ren" : ""}` : null,
    infants > 0 ? `${infants} infant${infants !== 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(", ");

  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#222222]">Reservation Summary</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Property Info */}
          <div className="mb-4">
            <h3 className="font-semibold text-[#222222] mb-1">{property.name}</h3>
            <p className="text-xs text-[#717171]">{property.address}</p>
          </div>

          {/* Compact Info Grid */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Dates Section */}
              <div>
                <h4 className="font-semibold text-[#222222] mb-1">Dates</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#717171] text-xs">Check-in</span>
                    <span className="text-[#222222] text-xs">{fromDate ? fmt(fromDate) : 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#717171] text-xs">Check-out</span>
                    <span className="text-[#222222] text-xs">{toDate ? fmt(toDate) : 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#717171] text-xs">Nights</span>
                    <span className="text-[#222222] text-xs">{nights}</span>
                  </div>
                </div>
              </div>
              
              {/* Guests Section */}
              <div>
                <h4 className="font-semibold text-[#222222] mb-1">Guests</h4>
                <div className="flex justify-between">
                  <span className="text-[#717171] text-xs">Total Guests</span>
                  <span className="text-[#222222] text-xs">{guestParts}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-4">
            <h4 className="font-semibold text-[#222222] mb-2">Price Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#717171] text-xs">
                  {formatCurrency(basePricePerNight)} × {nights} nights
                </span>
                <span className="text-[#222222] text-xs">{formatCurrency(baseAmount)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-xs">Promo code discount</span>
                  <span className="text-xs">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              
              <div className="border-t pt-1 mt-1">
                <div className="flex justify-between font-semibold text-sm">
                  <span>Total</span>
                  <span className="text-[#222222]">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div className="mb-4">
            <h4 className="font-semibold text-[#222222] mb-2">Promo Code</h4>
            {discountAmount > 0 ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                <div>
                  <span className="text-sm text-green-800 font-medium">{promoCode.toUpperCase()}</span>
                  <span className="text-xs text-green-600 ml-2">Applied</span>
                </div>
                <button
                  onClick={removePromoCode}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1 px-3 py-2 border border-[#DDDDDD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                  disabled={isApplyingPromo}
                />
                <button
                  onClick={applyPromoCode}
                  disabled={isApplyingPromo || !promoCode.trim()}
                  className="px-4 py-2 bg-[#FF385C] text-white rounded-lg text-sm font-medium hover:bg-[#E31C5F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isApplyingPromo ? 'Applying...' : 'Apply'}
                </button>
              </div>
            )}
            
            {promoError && (
              <p className="text-red-500 text-xs mt-1">{promoError}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <h4 className="font-semibold text-[#222222] mb-2">Your Email Address</h4>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => {
                setGuestEmail(e.target.value);
                setEmailError("");
              }}
              placeholder="Enter your email address"
              className="w-full px-3 py-2 border border-[#DDDDDD] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
            <p className="text-xs text-[#717171] mt-1">
              We'll send your booking confirmation to this email address.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleConfirm}
              data-testid="confirm-button"
              className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-2 rounded-2xl transition-colors text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!guestEmail.trim()}
            >
              Confirm Reservation
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-100 hover:bg-gray-200 text-[#222222] font-medium py-2 rounded-2xl transition-colors text-xs"
            >
              Cancel
            </button>
          </div>

          {/* Note */}
          <p className="text-xs text-[#717171] text-center mt-4">
            Upon confirmation, you will receive an email containing your booking details and payment instructions for the 10% deposit required to secure your reservation.
          </p>
        </div>
      </div>
    </div>
  );
}
