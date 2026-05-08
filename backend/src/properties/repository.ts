import * as db from "../database";
import { Property } from "@bcn/core";

export async function createProperty(property: Property) {
    let properties = await db.get<Property[]>("properties");
    properties = properties || [];
    properties.push(property);
    await db.set("properties", properties);
    return property;
}

export async function findProperties(): Promise<Property[]> {
    const properties = await db.get<Property[]>("properties");
    return properties || [];
}

export async function findProperty(id: string): Promise<Property | null> {
    const properties = await db.get<Property[]>("properties");
    return properties.find((p) => p.id === id) || null;
}
