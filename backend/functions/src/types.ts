export interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  host: string;
  pricePerNight?: number;
  minimumStay: number;
  maximumStay: number;
  amenities: Array<{
    title: string;
    items: string[];
  }>;
  images: Array<{
    title: string;
    items: string[];
  }>;
  rules: Array<{
    title: string;
    items: string[];
  }>;
  reservedRange: Array<{
    from: string;
    to: string;
  }>;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}
