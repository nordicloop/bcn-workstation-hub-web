interface PropertyMapProps {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
}

export function PropertyMap({ latitude, longitude, name, address }: PropertyMapProps) {
    // Create Google Maps embed URL without API key using the standard share/embed URL
    const googleMapsUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=en&z=15&output=embed`;

    return (
        <div className="w-full h-80 bg-gray-100 rounded-2xl overflow-hidden">
            <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={googleMapsUrl}
                title={`Google Maps showing location of ${name} at ${address}`}
            />
            <div className="mt-4">
                <a
                    href={`https://maps.google.com/?q=${latitude},${longitude}`}
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
