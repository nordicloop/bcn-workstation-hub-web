export type Property = {
    id: string;
    name: string;
    description: string;
    address: string;
    location: {
        latitude: number;
        longitude: number;
    };
    host: string
    amenities: NamedList[];
    images: NamedList[];
    rules: NamedList[];
    reservedRange: DateRange[];
    minimumStay?: number;
    maximumStay?: number;
    pricePerNight?: number;
};

export type NamedList = {
    title: string;
    items: string[];
};

export type DateRange = {
    from: string;
    to: string;
};
