import type { Property } from "@bcn/core";
import data from "./data.json";

// import axios from "axios";
//
// const client = axios.create({
//     baseURL: "http://localhost:3000",
// });
// 
// export async function getProperties(): Promise<Property[]> {
//     const response = await client.get("/properties");
//     return response.data;
// }

// export async function getProperty(id: string): Promise<Property> {
//     const response = await client.get(`/properties/${id}`);
//     return response.data;
// }

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
