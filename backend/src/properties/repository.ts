import { getFirestore } from "firebase-admin/firestore";
import { Property } from "@bcn/core";

export async function createProperty(property: Property) {
    const db = getFirestore();
    await db.collection("properties").doc(property.id).set(property);
}

export async function findProperties(): Promise<Property[]> {
    const db = getFirestore();

    const propertiesSnapshot = await db.collection("properties").get();
    const properties = propertiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Property[];

    return properties;
}

export async function findProperty(id: string): Promise<Property | null> {
    const db = getFirestore();

    const doc = await db.collection("properties").doc(id).get();

    if (!doc.exists) {
        return null;
    }

    const property = {
        id: doc.id,
        ...doc.data(),
    } as Property;

    return property;
}
