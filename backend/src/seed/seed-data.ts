import { Property } from "@bcn/core";
import { getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import * as fs from "fs";
import * as path from "path";

/**
 * Seeds Firestore with property data from JSON file
 * @returns Promise with success status and count of properties seeded
 */
export async function seedFirestore() {
  const db = getFirestore();
  
  try {
    logger.info("Starting Firestore seed...");
    
    // Read property data from JSON file
    const dataPath = path.join(__dirname, "../seed-data.json");
    const fileContent = fs.readFileSync(dataPath, "utf8");
    const properties: Property[] = JSON.parse(fileContent);
    
    for (const property of properties) {
      await db.collection("properties").doc(property.id).set(property);
      logger.info(`Seeded property: ${property.name} (${property.id})`);
    }
    
    logger.info(`Successfully seeded ${properties.length} properties to Firestore`);
    return { success: true, count: properties.length };
  } catch (error) {
    logger.error("Error seeding Firestore:", error);
    throw error;
  }
}
