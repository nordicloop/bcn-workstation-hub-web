import { useState, useEffect } from 'react'
import type { DateRange, Property } from '@bcn/core'

type DateRangePickerProps = {
    fromDate: Date | null
    toDate: Date | null
    onFromDateChange: (date: Date | null) => void
    onToDateChange: (date: Date | null) => void
    onDateChange?: (from: Date | null, to: Date | null) => void
    validationError?: string | null
    reservedRanges?: DateRange[]
    infoPosition?: 'top' | 'bottom'
    onClose?: () => void
    showCloseButton?: boolean
    property?: Property | null
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
}

function getMonthGrid(year: number, month: number): (Date | null)[] {
    const result: (Date | null)[] = []
    const firstDayOfWeek = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let i = 0; i < firstDayOfWeek; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(new Date(year, month, d))
    return result
}

function toDay(d: DateRange['from']): Date {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return startOfDay(new Date(d as any))
}

function isDateBlocked(date: Date, ranges: DateRange[]): boolean {
    return ranges.some(r => date >= toDay(r.from) && date <= toDay(r.to))
}

function rangeContainsBlocked(start: Date, end: Date, ranges: DateRange[]): boolean {
    return ranges.some(r => toDay(r.from) < end && toDay(r.to) > start)
}

function getCellClass(
    date: Date,
    today: Date,
    fromDate: Date | null,
    toDate: Date | null,
    cappedHover: Date | null,
    blocked: boolean,
): string {
    if (blocked || date < today) return 'text-gray-300 cursor-not-allowed line-through'

    const isStart = fromDate !== null && isSameDay(date, fromDate)
    const isEnd = toDate !== null && isSameDay(date, toDate)
    if (isStart || isEnd) return 'bg-[#222222] text-white rounded-full font-bold cursor-pointer z-10 relative'

    const effectiveEnd = toDate ?? (fromDate && cappedHover && cappedHover > fromDate ? cappedHover : null)
    const inRange = fromDate !== null && effectiveEnd !== null && date > fromDate && date < effectiveEnd
    if (inRange) return 'bg-rose-50 text-[#222222] cursor-pointer rounded-none'

    return 'text-[#222222] hover:bg-gray-100 rounded-full cursor-pointer'
}

export function DateRangePicker({ fromDate, toDate, onFromDateChange, onToDateChange, onDateChange, validationError, reservedRanges = [], infoPosition = 'bottom', onClose, showCloseButton = false, property }: DateRangePickerProps) {
    const today = startOfDay(new Date())
    const [viewYear, setViewYear] = useState(today.getFullYear())
    const [viewMonth, setViewMonth] = useState(today.getMonth())
    const [hover, setHover] = useState<Date | null>(null)
    const [localValidationError, setLocalValidationError] = useState<string | null>(null)

    // Update view to show selected dates when they change
    useEffect(() => {
        if (fromDate) {
            setViewYear(fromDate.getFullYear())
            setViewMonth(fromDate.getMonth())
        }
    }, [fromDate])

    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear

    const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth()

    // Cap hover preview so it doesn't visually cross a blocked range
    let cappedHover = hover
    if (fromDate && hover && hover > fromDate) {
        for (const r of reservedRanges) {
            const rFrom = toDay(r.from)
            if (rFrom > fromDate && rFrom <= cappedHover!) {
                const dayBefore = new Date(rFrom.getTime())
                dayBefore.setDate(dayBefore.getDate() - 1)
                cappedHover = dayBefore
            }
        }
    }

    function goToPrev() {
        if (!canGoPrev) return
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
        else setViewMonth(m => m - 1)
    }

    function goToNext() {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
        else setViewMonth(m => m + 1)
    }

    function findNextAvailableDate(): Date | null {
        let currentDate = new Date(today)
        currentDate.setDate(currentDate.getDate() + 1) // Start from tomorrow
        
        // Check up to 2 years ahead
        const maxDate = new Date(today)
        maxDate.setFullYear(maxDate.getFullYear() + 2)
        
        while (currentDate <= maxDate) {
            if (!isDateBlocked(currentDate, reservedRanges)) {
                return currentDate
            }
            currentDate.setDate(currentDate.getDate() + 1)
        }
        
        return null
    }

    function monthHasAvailableDates(year: number, month: number): boolean {
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        
        let currentDate = new Date(firstDay)
        while (currentDate <= lastDay) {
            if (!isDateBlocked(currentDate, reservedRanges) && currentDate >= today) {
                return true
            }
            currentDate.setDate(currentDate.getDate() + 1)
        }
        
        return false
    }

    function goToNextAvailableMonth() {
        const nextAvailable = findNextAvailableDate()
        if (nextAvailable) {
            setViewYear(nextAvailable.getFullYear())
            setViewMonth(nextAvailable.getMonth())
        }
    }

    const currentMonthHasAvailability = monthHasAvailableDates(viewYear, viewMonth)
    const nextMonthHasAvailability = monthHasAvailableDates(nextYear, nextMonth)
    const nextAvailableDate = findNextAvailableDate()

    function handleClick(date: Date) {
        if (date < today || isDateBlocked(date, reservedRanges)) return
        let newFromDate = fromDate
        let newToDate = toDate
        
        if (!fromDate || (fromDate && toDate)) {
            newFromDate = date
            newToDate = null
            onFromDateChange(date)
            onToDateChange(null)
            // Clear local validation error when selecting new check-in
            setLocalValidationError(null)
        } else {
            if (isSameDay(date, fromDate)) {
                newFromDate = null
                onFromDateChange(null)
                // Clear local validation error when clearing check-in
                setLocalValidationError(null)
            } else if (date < fromDate) {
                newFromDate = date
                newToDate = null
                onFromDateChange(date)
                // Clear local validation error when selecting new check-in
                setLocalValidationError(null)
            } else {
                // This is a checkout date selection with check-in already filled
                if (rangeContainsBlocked(fromDate, date, reservedRanges)) {
                    // Range would span a blocked period — start fresh from this date
                    newFromDate = date
                    newToDate = null
                    onFromDateChange(date)
                    onToDateChange(null)
                } else {
                    // Check minimum stay validation only when the property defines one
                    const nights = Math.ceil((date.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
                    const minimumStay = property?.minimumStay;
                    
                    if (minimumStay !== undefined && minimumStay !== null && nights < minimumStay) {
                        // Validation failed - set local error and don't update toDate
                        setLocalValidationError(`Minimum stay is ${minimumStay} nights. You selected ${nights} night${nights !== 1 ? 's' : ''}.`);
                        newToDate = null;
                        // Call onDateChange to clear any existing validation error
                        if (onDateChange) {
                            onDateChange(fromDate, null);
                        }
                        return; // Don't proceed with the date selection
                    } else {
                        // Validation passed - clear local error and proceed with checkout date selection
                        setLocalValidationError(null);
                        newToDate = date;
                        onToDateChange(date);
                    }
                }
            }
        }
        
        // Call validation callback if provided
        if (onDateChange) {
            onDateChange(newFromDate, newToDate)
        }
    }

    function renderMonth(year: number, month: number) {
        const days = getMonthGrid(year, month)
        return (
            <div className="flex-1 min-w-0">
                <div className="grid grid-cols-7 gap-y-1">
                    {DAY_LABELS.map(d => (
                        <div key={d} className="text-center text-xs font-semibold text-[#717171] pb-2 uppercase tracking-wide">
                            {d}
                        </div>
                    ))}
                    {days.map((date, i) => {
                        if (!date) return <div key={`e-${i}`} className="h-10" />
                        const blocked = isDateBlocked(date, reservedRanges)
                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleClick(date)}
                                onMouseEnter={() => { if (!blocked && date >= today) setHover(date) }}
                                onMouseLeave={() => setHover(null)}
                                className={`h-10 w-full text-sm flex items-center justify-center transition-colors ${getCellClass(date, today, fromDate, toDate, cappedHover, blocked)}`}
                            >
                                {date.getDate()}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden">
            {/* Validation error message */}
            {validationError && (
                <div className="bg-red-50 border-b border-red-200 px-6 py-3">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm text-red-700 font-medium">{validationError}</p>
                    </div>
                </div>
            )}
            {/* Selected range summary + clear - top position */}
            {infoPosition === 'top' && (fromDate || toDate) && (
                <div className="border-b border-[#EBEBEB] px-6 py-4 flex items-center gap-6 bg-[#FAFAFA]">
                    <div className="flex items-center gap-2">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">Check-in</p>
                            <p className="text-sm font-semibold text-[#222222] mt-0.5">
                                {fromDate
                                    ? fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : '—'}
                            </p>
                        </div>
                        {fromDate && (
                            <button
                                onClick={() => onFromDateChange(null)}
                                className="p-1 hover:bg-[#E5E5E5] rounded-full transition-colors"
                                title="Clear check-in date"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="w-px h-8 bg-[#DDDDDD]" />
                    <div className="flex items-center gap-2">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">Check-out</p>
                            <p className="text-sm font-semibold text-[#222222] mt-0.5">
                                {toDate
                                    ? toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : '—'}
                            </p>
                        </div>
                        {toDate && (
                            <button
                                onClick={() => onToDateChange(null)}
                                className="p-1 hover:bg-[#E5E5E5] rounded-full transition-colors"
                                title="Clear check-out date"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => { onFromDateChange(null); onToDateChange(null); if (onDateChange) onDateChange(null, null); }}
                        className="ml-auto text-xs font-semibold text-[#717171] underline hover:text-[#222222] transition-colors"
                    >
                        Clear dates
                    </button>
                    {showCloseButton && onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors"
                            title="Close calendar"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
            
            {/* Minimum stay validation - only show when complete invalid range is selected */}
            {(validationError || localValidationError) && (
                <div className="mx-6 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                            <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-blue-800 font-medium text-xs">Stay Duration Requirement</p>
                                <p className="text-blue-600 text-xs mt-0.5">{localValidationError || validationError}</p>
                            </div>
                        </div>
                        {fromDate && property?.minimumStay && (
                            <button
                                onClick={() => {
                                    // Calculate the checkout date that meets minimum stay
                                    const minimumStay = property.minimumStay || 31;
                                    const checkoutDate = new Date(fromDate.getTime());
                                    checkoutDate.setDate(checkoutDate.getDate() + minimumStay);
                                    
                                    // Clear validation error and set the dates
                                    setLocalValidationError(null);
                                    onToDateChange(checkoutDate);
                                    if (onDateChange) {
                                        onDateChange(fromDate, checkoutDate);
                                    }
                                }}
                                className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-full transition-colors flex-shrink-0"
                            >
                                Select {property.minimumStay} nights
                            </button>
                        )}
                    </div>
                </div>
            )}
            
                        
            {/* Navigation header */}
            <div className="flex items-center px-6 pt-5 pb-4">
                <button
                    onClick={goToPrev}
                    disabled={!canGoPrev}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous month"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div className="flex flex-1 justify-around">
                    <span className="text-sm font-bold text-[#222222]">
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </span>
                    <span className="text-sm font-bold text-[#222222]">
                        {MONTH_NAMES[nextMonth]} {nextYear}
                    </span>
                </div>
                <button
                    onClick={goToNext}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Next month"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>

            {/* Two-month grid */}
            <div className="flex gap-6 px-6 pb-5">
                {renderMonth(viewYear, viewMonth)}
                <div className="w-px bg-[#EBEBEB] self-stretch mx-1" />
                {renderMonth(nextYear, nextMonth)}
            </div>

            {/* Next available date info */}
            {!currentMonthHasAvailability && !nextMonthHasAvailability && nextAvailableDate && (
                <div className="px-6 pb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Next available: {nextAvailableDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    No availability in current months
                                </p>
                            </div>
                            <button
                                onClick={goToNextAvailableMonth}
                                className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Go to available
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected range summary + clear - bottom position */}
            {infoPosition === 'bottom' && (fromDate || toDate) && (
                <div className="border-t border-[#EBEBEB] px-6 py-4 flex items-center gap-6 bg-[#FAFAFA]">
                    <div className="flex items-center gap-2">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">Check-in</p>
                            <p className="text-sm font-semibold text-[#222222] mt-0.5">
                                {fromDate
                                    ? fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : '—'}
                            </p>
                        </div>
                        {fromDate && (
                            <button
                                onClick={() => onFromDateChange(null)}
                                className="p-1 hover:bg-[#E5E5E5] rounded-full transition-colors"
                                title="Clear check-in date"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="w-px h-8 bg-[#DDDDDD]" />
                    <div className="flex items-center gap-2">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">Check-out</p>
                            <p className="text-sm font-semibold text-[#222222] mt-0.5">
                                {toDate
                                    ? toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : '—'}
                            </p>
                        </div>
                        {toDate && (
                            <button
                                onClick={() => onToDateChange(null)}
                                className="p-1 hover:bg-[#E5E5E5] rounded-full transition-colors"
                                title="Clear check-out date"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => { onFromDateChange(null); onToDateChange(null); if (onDateChange) onDateChange(null, null); }}
                        className="ml-auto text-xs font-semibold text-[#717171] underline hover:text-[#222222] transition-colors"
                    >
                        Clear dates
                    </button>
                </div>
            )}
        </div>
    )
}
