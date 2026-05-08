type CounterRowProps = {
    label: string
    description: string
    value: number
    onIncrement: () => void
    onDecrement: () => void
    min?: number
    max?: number
}

function CounterRow({ label, description, value, onIncrement, onDecrement, min = 0, max = 16 }: CounterRowProps) {
    return (
        <div className="flex items-center justify-between py-5 border-b border-[#EBEBEB] last:border-0">
            <div>
                <p className="font-semibold text-[#222222]">{label}</p>
                <p className="text-sm text-[#717171]">{description}</p>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onDecrement}
                    disabled={value <= min}
                    className="w-9 h-9 rounded-full border border-[#B0B0B0] flex items-center justify-center hover:border-[#222222] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
                <span className="w-5 text-center font-semibold text-[#222222] tabular-nums">{value}</span>
                <button
                    onClick={onIncrement}
                    disabled={value >= max}
                    className="w-9 h-9 rounded-full border border-[#B0B0B0] flex items-center justify-center hover:border-[#222222] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

type GuestCounterProps = {
    adults: number
    children: number
    infants: number
    onAdultsChange: (n: number) => void
    onChildrenChange: (n: number) => void
    onInfantsChange: (n: number) => void
}

export function GuestCounter({ adults, children, infants, onAdultsChange, onChildrenChange, onInfantsChange }: GuestCounterProps) {
    return (
        <div className="border border-[#DDDDDD] rounded-2xl px-6">
            <CounterRow
                label="Adults"
                description="Ages 13 or above"
                value={adults}
                onIncrement={() => onAdultsChange(adults + 1)}
                onDecrement={() => onAdultsChange(Math.max(1, adults - 1))}
                min={1}
            />
            <CounterRow
                label="Children"
                description="Ages 2–12"
                value={children}
                onIncrement={() => onChildrenChange(children + 1)}
                onDecrement={() => onChildrenChange(Math.max(0, children - 1))}
            />
            <CounterRow
                label="Infants"
                description="Under 2"
                value={infants}
                onIncrement={() => onInfantsChange(infants + 1)}
                onDecrement={() => onInfantsChange(Math.max(0, infants - 1))}
                max={5}
            />
        </div>
    )
}
