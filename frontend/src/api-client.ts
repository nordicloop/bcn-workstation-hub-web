import type { Property } from "@bcn/core";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export async function getProperties(): Promise<Property[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/properties`);
        if (!response.ok) {
            throw new Error(`Failed to fetch properties: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching properties from server:', error);
        // Fallback to static data if server is unavailable
        const data = await import('./data.json');
        return data.properties;
    }
}

export async function getProperty(id: string): Promise<Property> {
    try {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Property not found");
            }
            throw new Error(`Failed to fetch property: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching property from server:', error);
        // Fallback to static data if server is unavailable
        const data = await import('./data.json');
        const result = data.properties.find((x) => x.id === id);
        if (!result) {
            throw new Error("Property not found");
        }
        return result;
    }
}
