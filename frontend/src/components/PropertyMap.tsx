import { useEffect, useRef, useState } from 'react';

interface PropertyMapProps {
    latitude: number;
    longitude: number;
    address: string;
}

declare global {
    interface Window {
        initGoogleMap?: () => void;
        googleMapsError?: () => void;
    }
}

export function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const [loadError, setLoadError] = useState<string>('');

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            setLoadError('Google Maps API key is missing');
            return;
        }

        const initMap = () => {
            try {
                if (!window.google || !window.google.maps) {
                    setLoadError('Google Maps API not loaded');
                    return;
                }

                // Calculate 0.1km southeast offset
                // 1 degree latitude ≈ 111km, 1 degree longitude ≈ 111km * cos(latitude)
                const latOffset = 0.1 / 111; // ~0.1km south (negative)
                const lonOffset = (0.1 / 111) / Math.cos(latitude * Math.PI / 180); // ~0.1km east (positive)
                
                const map = new google.maps.Map(mapRef.current!, {
                    center: { lat: latitude, lng: longitude },
                    zoom: 14,
                    styles: [
                        {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }]
                        }
                    ],
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                });

                // Add circle overlay with 0.3km southeast offset
                new google.maps.Circle({
                    strokeColor: "#FF385C",
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                    fillColor: "#FF385C",
                    fillOpacity: 0.1,
                    map: map,
                    center: { 
                        lat: latitude - latOffset, // Move south
                        lng: longitude + lonOffset  // Move east
                    },
                    radius: 150, // 150 meters = 0.15km (even smaller circle)
                });

                mapInstanceRef.current = map;
                setLoadError('');
            } catch (error) {
                setLoadError('Failed to initialize Google Maps');
                console.error('Google Maps initialization error:', error);
            }
        };

        // Check if Google Maps API is already loaded
        if (window.google && window.google.maps) {
            // API already loaded, initialize map directly
            initMap();
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
        if (existingScript) {
            // Script already exists, wait for it to load
            const checkLoaded = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(checkLoaded);
                    initMap();
                }
            }, 100);
            return;
        }

        // Set up global callback function
        window.initGoogleMap = initMap;

        // Load Google Maps API with Promise-based approach
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=initGoogleMap`;
        script.async = true;
        script.defer = true;
        
        script.onerror = () => {
            setLoadError('Failed to load Google Maps script');
        };
        
        script.onload = () => {
            // Script loaded, callback should fire automatically
            console.log('Google Maps script loaded');
        };
        
        document.head.appendChild(script);

        return () => {
            if (window.initGoogleMap) {
                delete window.initGoogleMap;
            }
        };
    }, [latitude, longitude]);

    if (loadError) {
        return (
            <div className="w-full h-80 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="text-center p-4">
                    <p className="text-red-600 text-sm mb-2">{loadError}</p>
                    <a
                        href={`https://maps.google.com/?q=${address}&z=14`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#222222] underline hover:text-[#FF385C] transition-colors"
                    >
                        View on Google Maps
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-80 bg-gray-100 rounded-2xl overflow-hidden">
            <div 
                ref={mapRef} 
                className="w-full h-full rounded-2xl"
                style={{ borderRadius: '12px' }}
            />
            <div className="mt-4">
                <a
                    href={`https://maps.google.com/?q=${address}&z=14`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#222222] underline hover:text-[#FF385C] transition-colors"
                >
                    View larger map
                </a>
            </div>
        </div>
    );
}
