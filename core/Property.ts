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
    availability: DateRange[];
};

export type NamedList = {
    title: string;
    items: string[];
};

export type DateRange = {
    from: Date;
    to: Date;
};
