import { useState } from "react";
import { DateRangePicker } from "./DateRangePicker";

interface DateSelectorSidebarProps {
  className?: string;
  onDatesChange?: (fromDate: Date | null, toDate: Date | null) => void;
  onGuestsChange?: (adults: number, children: number, infants: number) => void;
}

export function DateSelectorSidebar({ className = "", onDatesChange, onGuestsChange }: DateSelectorSidebarProps) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);

  const totalGuests = adults + children + infants;

  const handleGuestChange = (type: 'adults' | 'children' | 'infants' | 'pets', value: number) => {
    if (type === 'adults') {
      setAdults(value);
    } else if (type === 'children') {
      setChildren(value);
    } else if (type === 'infants') {
      setInfants(value);
    } else if (type === 'pets') {
      setPets(value);
    }

    // Call parent callback (pets not included in guest count for now)
    if (onGuestsChange) {
      onGuestsChange(adults, children, infants);
    }
  };

  const validateStayDuration = (from: Date, to: Date): string | null => {
    const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const minStay = 31; // Default minimum stay
    
    if (nights < minStay) {
      return `Minimum stay is ${minStay} nights. You selected ${nights} night${nights !== 1 ? "s" : ""}.`;
    }
    
    return null;
  };

  const handleDateChange = (from: Date | null, to: Date | null) => {
    setFromDate(from);
    setToDate(to);
    
    // Call parent callback
    if (onDatesChange) {
      onDatesChange(from, to);
    }
    
    if (from && to) {
      const validationError = validateStayDuration(from, to);
      setDateValidationError(validationError);
      setShowCalendar(false); // Close calendar after selection
    } else {
      setDateValidationError(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-[#222222] mb-6">Find Your Perfect Stay</h2>
      
      {/* Guest selector dropdown */}
                            <div className="relative guest-dropdown-container mb-4">
                                <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden">
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
                                                            onClick={() => handleGuestChange('adults', Math.max(1, adults - 1))}
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
                                                            onClick={() => handleGuestChange('adults', adults + 1)}
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
                                                            onClick={() => handleGuestChange('children', Math.max(0, children - 1))}
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
                                                            onClick={() => handleGuestChange('children', children + 1)}
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
                                                            onClick={() => handleGuestChange('infants', Math.max(0, infants - 1))}
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
                                                            onClick={() => handleGuestChange('infants', infants + 1)}
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
                                                        <span className="text-sm text-[#222222]">Pets</span>
                                                        <p className="text-xs text-[#717171]">Bringing a service animal?</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleGuestChange('pets', Math.max(0, pets - 1))}
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
                                                            onClick={() => handleGuestChange('pets', pets + 1)}
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
      
      {/* Date selector */}
                            <div className="relative calendar-popup-container mb-4">
                                <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setShowCalendar(!showCalendar)}
                                        className="w-full px-4 py-3 text-left hover:bg-[#F7F7F7] transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">
                                                    Dates
                                                </p>
                                                {fromDate && toDate ? (
                                                    <p className="text-sm font-semibold text-[#222222] mt-1">
                                                        {formatDate(fromDate)} - {formatDate(toDate)}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm font-semibold text-[#222222] mt-1">
                                                        Select check-in and check-out dates
                                                    </p>
                                                )}
                                            </div>
                                            <svg
                                                className={`w-5 h-5 text-[#717171] transition-transform ${showCalendar ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                                
                                {showCalendar && (
                                    <div className="absolute top-full right-0 bg-white rounded-2xl shadow-xl z-[9999] mt-1" style={{ minWidth: '600px', maxWidth: '700px' }}>
                                        <div>
                                            <DateRangePicker
                                                fromDate={fromDate}
                                                toDate={toDate}
                                                onFromDateChange={setFromDate}
                                                onToDateChange={setToDate}
                                                onDateChange={(from, to) => {
                                                    handleDateChange(from, to);
                                                    // Only close popup if both dates are selected and there's no validation error
                                                    if (from && to && !dateValidationError) {
                                                        setShowCalendar(false);
                                                    }
                                                }}
                                                validationError={dateValidationError}
                                                reservedRanges={[]} // No restrictions for sidebar
                                                infoPosition="top"
                                                onClose={() => setShowCalendar(false)}
                                                showCloseButton={true}
                                                property={null}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

      
      
      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Select your dates and guests, then click on any apartment to see detailed availability and make a booking request.
        </p>
      </div>
    </div>
  );
}
