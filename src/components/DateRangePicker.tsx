import { useState } from 'react'

type DateRangePickerProps = {
    fromDate: Date | null
    toDate: Date | null
    onFromDateChange: (date: Date | null) => void
    onToDateChange: (date: Date | null) => void
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

function getCellClass(date: Date, today: Date, fromDate: Date | null, toDate: Date | null, hover: Date | null): string {
    const isPast = date < today
    if (isPast) return 'text-gray-300 cursor-not-allowed line-through'

    const isStart = fromDate !== null && isSameDay(date, fromDate)
    const isEnd = toDate !== null && isSameDay(date, toDate)
    if (isStart || isEnd) return 'bg-[#222222] text-white rounded-full font-bold cursor-pointer z-10 relative'

    const effectiveEnd = toDate ?? (fromDate && hover && hover > fromDate ? hover : null)
    const inRange = fromDate !== null && effectiveEnd !== null && date > fromDate && date < effectiveEnd
    if (inRange) return 'bg-rose-50 text-[#222222] cursor-pointer rounded-none'

    return 'text-[#222222] hover:bg-gray-100 rounded-full cursor-pointer'
}

export function DateRangePicker({ fromDate, toDate, onFromDateChange, onToDateChange }: DateRangePickerProps) {
    const today = startOfDay(new Date())
    const [viewYear, setViewYear] = useState(today.getFullYear())
    const [viewMonth, setViewMonth] = useState(today.getMonth())
    const [hover, setHover] = useState<Date | null>(null)

    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear

    const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth()

    function goToPrev() {
        if (!canGoPrev) return
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
        else setViewMonth(m => m - 1)
    }

    function goToNext() {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
        else setViewMonth(m => m + 1)
    }

    function handleClick(date: Date) {
        if (date < today) return
        if (!fromDate || (fromDate && toDate)) {
            onFromDateChange(date)
            onToDateChange(null)
        } else {
            if (isSameDay(date, fromDate)) {
                onFromDateChange(null)
            } else if (date < fromDate) {
                onFromDateChange(date)
            } else {
                onToDateChange(date)
            }
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
                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => handleClick(date)}
                                onMouseEnter={() => setHover(date)}
                                onMouseLeave={() => setHover(null)}
                                className={`h-10 w-full text-sm flex items-center justify-center transition-colors ${getCellClass(date, today, fromDate, toDate, hover)}`}
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

            {/* Selected range summary + clear */}
            {(fromDate || toDate) && (
                <div className="border-t border-[#EBEBEB] px-6 py-4 flex items-center gap-6 bg-[#FAFAFA]">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">Check-in</p>
                        <p className="text-sm font-semibold text-[#222222] mt-0.5">
                            {fromDate
                                ? fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—'}
                        </p>
                    </div>
                    <div className="w-px h-8 bg-[#DDDDDD]" />
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#717171]">Check-out</p>
                        <p className="text-sm font-semibold text-[#222222] mt-0.5">
                            {toDate
                                ? toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—'}
                        </p>
                    </div>
                    <button
                        onClick={() => { onFromDateChange(null); onToDateChange(null) }}
                        className="ml-auto text-xs font-semibold text-[#717171] underline hover:text-[#222222] transition-colors"
                    >
                        Clear dates
                    </button>
                </div>
            )}
        </div>
    )
}
