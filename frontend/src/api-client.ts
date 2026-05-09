import type { Property } from "@bcn/core";
import data from "./data.json";

export async function getProperties(): Promise<Property[]> {
    return data.properties;
}

export async function getProperty(id: string): Promise<Property> {
    const result = data.properties.find((x) => x.id === id);
    if (!result) {
        throw new Error("not found");
    }
    return result;
}
