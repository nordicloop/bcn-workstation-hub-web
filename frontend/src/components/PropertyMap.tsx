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
        google?: any;
    }
}

export function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const [loadError, setLoadError] = useState<string>('');

    // Generate Google Maps URL with property location and zoom
    const generateMapUrl = () => {
        // Calculate the circle center (same as in the map)
        const latOffset = 0.1 / 111; // ~0.1km south (negative)
        const lonOffset = (0.1 / 111) / Math.cos(latitude * Math.PI / 180); // ~0.1km east (positive)
        
        const circleLat = latitude - latOffset; // Move south
        const circleLng = longitude + lonOffset; // Move east
        
        // Create Google Maps URL that centers on the circle location with higher zoom
        // Use address as search query and coordinates for precise location
        return `https://maps.google.com/?q=${encodeURIComponent(address)}&z=17&ll=${circleLat},${circleLng}`;
    };

    useEffect(() => {
        if (!mapRef.current) return;

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        console.log('🗺️ Google Maps API Key:', apiKey ? 'Present' : 'Missing');
        
        if (!apiKey) {
            setLoadError('Google Maps API key is missing');
            return;
        }

        const initMap = () => {
            try {
                console.log('🗺️ Initializing Google Maps...');
                
                // More thorough check for Google Maps API
                if (!window.google) {
                    console.error('🗺️ Google object not available');
                    setLoadError('Google Maps API not loaded');
                    return;
                }
                
                if (!window.google.maps) {
                    console.error('🗺️ Google Maps API not available');
                    setLoadError('Google Maps API not loaded');
                    return;
                }
                
                if (typeof window.google.maps.Map !== 'function') {
                    console.error('🗺️ Google Maps Map constructor not available');
                    setLoadError('Google Maps Map constructor not available');
                    return;
                }

                // Calculate 0.1km southeast offset
                // 1 degree latitude ≈ 111km, 1 degree longitude ≈ 111km * cos(latitude)
                const latOffset = 0.1 / 111; // ~0.1km south (negative)
                const lonOffset = (0.1 / 111) / Math.cos(latitude * Math.PI / 180); // ~0.1km east (positive)
                
                const map = new window.google.maps.Map(mapRef.current!, {
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
                new window.google.maps.Circle({
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
                console.log('✅ Google Maps initialized successfully');
            } catch (error) {
                console.error('❌ Failed to initialize Google Maps:', error);
                setLoadError('Failed to initialize Google Maps');
            }
        };

        // Check if Google Maps API is already loaded
        if (window.google && window.google.maps) {
            console.log('🗺️ Google Maps API already loaded');
            initMap();
            return;
        }

        // Set up global callback function BEFORE checking for existing script
        window.initGoogleMap = initMap;

        // Set up error handler
        window.googleMapsError = () => {
            console.error('❌ Google Maps API loading failed');
            setLoadError('Google Maps API loading failed');
        };

        // Check if script is already loaded or loading
        const existingScript = document.querySelector('#google-maps-script');
        if (existingScript) {
            console.log('🗺️ Google Maps script already loading, waiting...');
            // Script already exists, wait for it to load
            const checkLoaded = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(checkLoaded);
                    initMap();
                }
            }, 100);
            
            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkLoaded);
                if (!window.google || !window.google.maps) {
                    setLoadError('Google Maps API loading timeout');
                }
            }, 10000);
            
            return;
        }

        // Load Google Maps API with proper async loading pattern
        const loadGoogleMaps = () => {
            return new Promise<void>((resolve, reject) => {
                // Create script with proper async loading
                const script = document.createElement('script');
                script.id = 'google-maps-script';
                script.type = 'text/javascript';
                script.async = true;
                script.defer = true;
                
                // Set the source with loading=async parameter
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&loading=async&callback=initGoogleMap&error=googleMapsError`;
                
                script.onerror = (error) => {
                    console.error('❌ Failed to load Google Maps script:', error);
                    setLoadError('Failed to load Google Maps script');
                    reject(error);
                };
                
                script.onload = () => {
                    console.log('✅ Google Maps script loaded successfully');
                    // Wait for the API to be fully available
                    const checkApiReady = () => {
                        if (window.google && window.google.maps && typeof window.google.maps.Map === 'function') {
                            console.log('✅ Google Maps API is ready');
                            resolve();
                        } else {
                            setTimeout(checkApiReady, 50);
                        }
                    };
                    checkApiReady();
                };
                
                // Add to document head
                document.head.appendChild(script);
            });
        };

        // Load the script
        loadGoogleMaps().catch(error => {
            console.error('❌ Google Maps loading failed:', error);
        });

        return () => {
            if (window.initGoogleMap) {
                delete window.initGoogleMap;
            }
            if (window.googleMapsError) {
                delete window.googleMapsError;
            }
        };
    }, [latitude, longitude]);

    if (loadError) {
        return (
            <div className="w-full h-80 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="text-center p-4">
                    <p className="text-red-600 text-sm mb-2">{loadError}</p>
                    <a
                        href={generateMapUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF385C] hover:bg-[#E31E4C] text-white text-sm font-medium rounded-full transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
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
        </div>
    );
}
