import { useState, useEffect } from 'react'
import type { Property } from '@bcn/core'
import { getProperties } from '../api-client'
import { PropertyCard } from '../components/PropertyCard'

function SkeletonCard() {
    return (
        <div className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-2xl mb-3" />
            <div className="h-4 bg-gray-200 rounded-lg mb-2 w-3/4" />
            <div className="h-3 bg-gray-200 rounded-lg mb-1.5 w-1/2" />
            <div className="h-3 bg-gray-200 rounded-lg w-2/3" />
        </div>
    )
}

export function PropertiesListScreen() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getProperties()
            .then(setProperties)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    return (
        <main className="max-w-7xl mx-auto px-6 lg:px-10">
            {/* Category filter bar */}
            <div className="flex gap-8 py-5 overflow-x-auto scrollbar-hide border-b border-[#EBEBEB] mb-8">
                {['All stays', 'Cabins', 'Beachfront', 'Amazing views', 'Lakefront', 'Countryside', 'Tiny homes', 'Boats'].map((cat, i) => (
                    <button
                        key={cat}
                        className={`flex flex-col items-center gap-1.5 shrink-0 pb-2 border-b-2 transition-colors ${i === 0 ? 'border-[#222222] text-[#222222]' : 'border-transparent text-[#717171] hover:text-[#222222] hover:border-[#DDDDDD]'}`}
                    >
                        <span className="text-xl">{['🏠', '🌲', '🏖️', '🏔️', '🏞️', '🌾', '🏡', '⛵'][i]}</span>
                        <span className="text-xs font-semibold whitespace-nowrap">{cat}</span>
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-[#717171] text-lg font-medium">Could not load properties</p>
                    <p className="text-sm text-gray-400">{error}</p>
                </div>
            ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3">
                    <span className="text-6xl">🏡</span>
                    <p className="text-[#222222] text-xl font-semibold font-display">No stays found</p>
                    <p className="text-[#717171]">Check back later for available properties</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 pb-16">
                    {properties.map(property => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            )}
        </main>
    )
}
