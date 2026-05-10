import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { getRealPrice } from "./price-lookup";
import { Property } from "./types";

// Initialize Firebase
initializeApp();

// Get all properties
export const getProperties = onRequest({cors: true}, async (request, response) => {
  const db = getFirestore();
  try {
    logger.info("Fetching all properties from Firestore");

    const propertiesSnapshot = await db.collection("properties").get();
    const properties = propertiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Property[];

    // Add real prices from price lookup
    const propertiesWithPrices = properties.map((property) => ({
      ...property,
      pricePerNight: getRealPrice(property.id) || property.pricePerNight || 0,
    }));

    response.json({properties: propertiesWithPrices});
  } catch (error) {
    logger.error("Error fetching properties:", error);
    response.status(500).json({error: "Failed to fetch properties"});
  }
});

// Get single property by ID
export const getProperty = onRequest({cors: true}, async (request, response) => {
  const db = getFirestore();
  try {
    const propertyId = request.query.id as string;

    if (!propertyId) {
      response.status(400).json({error: "Property ID is required"});
      return;
    }

    logger.info(`Fetching property: ${propertyId}`);

    const propertyDoc = await db.collection("properties").doc(propertyId).get();
    
    if (!propertyDoc.exists) {
      response.status(404).json({error: "Property not found"});
      return;
    }

    const property = {
      id: propertyDoc.id,
      ...propertyDoc.data(),
    } as Property;

    // Add real price from price lookup
    property.pricePerNight = getRealPrice(property.id) || property.pricePerNight || 0;

    response.json(property);
  } catch (error) {
    logger.error("Error fetching property:", error);
    response.status(500).json({error: "Failed to fetch property"});
  }
});

// Create or update property
export const saveProperty = onRequest({cors: true}, async (request, response) => {
  const db = getFirestore();
  try {
    if (request.method !== "POST") {
      response.status(405).json({error: "Method not allowed"});
      return;
    }

    const propertyData = request.body;
    const propertyId = propertyData.id;

    if (!propertyId) {
      response.status(400).json({error: "Property ID is required"});
      return;
    }

    logger.info(`Saving property: ${propertyId}`);

    await db.collection("properties").doc(propertyId).set(propertyData);

    logger.info(`Property saved successfully: ${propertyId}`);

    response.json({
      success: true, 
      message: "Property saved successfully",
      propertyId,
    });
  } catch (error) {
    logger.error("Error saving property:", error);
    response.status(500).json({error: "Failed to save property"});
  }
});

// Delete property
export const deleteProperty = onRequest({cors: true}, async (request, response) => {
  const db = getFirestore();
  try {
    if (request.method !== "DELETE") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const propertyId = request.query.id as string;
    
    if (!propertyId) {
      response.status(400).json({ error: "Property ID is required" });
      return;
    }

    logger.info(`Deleting property: ${propertyId}`);

    await db.collection("properties").doc(propertyId).delete();

    logger.info(`Property deleted successfully: ${propertyId}`);

    response.json({
      success: true, 
      message: "Property deleted successfully",
      propertyId 
    });
  } catch (error) {
    logger.error("Error deleting property:", error);
    response.status(500).json({ error: "Failed to delete property" });
  }
});

// Send reservation email via Mailgun
export const sendReservationEmail = onRequest({cors: true}, async (request, response) => {
  try {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const {
      property,
      fromDate,
      toDate,
      adults,
      children,
      infants,
      guestEmail,
      totalAmount
    } = request.body;

    if (!property || !fromDate || !toDate || !guestEmail) {
      response.status(400).json({ error: "Missing required fields" });
      return;
    }

    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    
    if (!apiKey || !domain) {
      response.status(500).json({ error: "Mailgun configuration missing" });
      return;
    }

    // Convert string dates to Date objects
    const fromDateObj = typeof fromDate === 'string' ? new Date(fromDate) : fromDate;
    const toDateObj = typeof toDate === 'string' ? new Date(toDate) : toDate;
    
    // Format dates
    const fmt = (d: Date) => {
      if (!(d instanceof Date) || isNaN(d.getTime())) {
        return "Invalid Date";
      }
      return d.toLocaleDateString("en-US", { 
        month: "long", 
        day: "numeric", 
        year: "numeric" 
      });
    };

    const guestParts = [
      `${adults} adult${adults !== 1 ? "s" : ""}`,
      children > 0 ? `${children} child${children !== 1 ? "ren" : ""}` : null,
      infants > 0 ? `${infants} infant${infants !== 1 ? "s" : ""}` : null,
    ].filter(Boolean).join(", ");

    const nights = Math.ceil((toDateObj.getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24));

    // Email to guest
    const guestSubject = `Booking Request – ${property.name}`;
    const guestBody = `
Dear Guest,

Thank you for your booking request for ${property.name}!

Booking Details:
- Property: ${property.name} (ID: ${property.id})
- Check-in: ${fmt(fromDateObj)}
- Check-out: ${fmt(toDateObj)}
- Duration: ${nights} nights
- Guests: ${guestParts}
- Total Amount: $${totalAmount} USD

Next Steps:
To confirm your reservation and proceed with the 10% deposit payment, please add this email address to your contacts and reply to this message. Our property manager will then send you the secure payment link and complete booking instructions.

Property Address: ${property.address}

We look forward to welcoming you to Premià de Mar!

Best regards,
Cynthia
Property Manager
BCN Workation Hub
    `.trim();

    // Email to property managers
    const managerSubject = `New Booking Request – ${property.name} – ${guestEmail}`;
    const managerBody = `
New booking request received:

Guest Information:
- Email: ${guestEmail}
- Check-in: ${fmt(fromDateObj)}
- Check-out: ${fmt(toDateObj)}
- Duration: ${nights} nights
- Guests: ${guestParts}
- Total Amount: $${totalAmount} USD

Property: ${property.name} (ID: ${property.id})
Address: ${property.address}

Please contact the guest to confirm availability and provide payment instructions for the 10% deposit.
    `.trim();

    // Send emails using Mailgun API
    const mailgunUrl = `https://api.mailgun.net/v3/${domain}/messages`;
    
    // Send to guest
    const guestEmailData = new FormData();
    guestEmailData.append('from', `BCN Workation Hub <noreply@${domain}>`);
    guestEmailData.append('to', guestEmail);
    guestEmailData.append('subject', guestSubject);
    guestEmailData.append('text', guestBody);

    // Send to managers
    const managerEmailData = new FormData();
    managerEmailData.append('from', `BCN Workation Hub <noreply@${domain}>`);
    managerEmailData.append('to', 'dfernandezbiz@gmail.com');
    managerEmailData.append('subject', managerSubject);
    managerEmailData.append('text', managerBody);

    // Make API calls
    const [guestResponse, managerResponse] = await Promise.all([
      fetch(mailgunUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        },
        body: guestEmailData,
      }),
      fetch(mailgunUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        },
        body: managerEmailData,
      })
    ]);

    if (!guestResponse.ok || !managerResponse.ok) {
      throw new Error('Failed to send emails');
    }

    logger.info(`Reservation emails sent successfully for property ${property.id} to ${guestEmail}`);

    response.json({
      success: true,
      message: "Reservation emails sent successfully. Please check your email for next steps.",
      bookingDetails: {
        property: property.name,
        checkIn: fmt(fromDateObj),
        checkOut: fmt(toDateObj),
        totalAmount: totalAmount
      }
    });
  } catch (error) {
    logger.error("Error sending reservation email:", error);
    response.status(500).json({ error: "Failed to send reservation email" });
  }
});

// Health check endpoint
export const health = onRequest({cors: true}, (request, response) => {
  logger.info("Health check called - API v2");
  response.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "bcn-workation-hub-api",
    version: "2.0"
  });
});
