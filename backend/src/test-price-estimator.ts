import { combinePriceEstimations } from "./price-estimator";
import type { Property } from "@bcn/core";

// Test data based on actual properties
const testProperties: Property[] = [
  {
    id: "851289997009741371",
    name: "Sunny apartment - A/C, fast wifi, private rooftop",
    description: "Fully renovated, 1 bedroom, 1 bathroom with an open kitchen and huge private rooftop terrace in the charming coastal town of Premià de Mar.",
    address: "Premià de Mar",
    location: { latitude: 41.49433, longitude: 2.35008 },
    host: "Cynthia",
    amenities: [
      {
        title: "Bathroom",
        items: ["Hairdryer", "Cleaning products", "Shampoo", "Body soap", "Hot water", "Shower gel"]
      },
      {
        title: "Bedroom and laundry",
        items: ["Washing machine", "Free dryer – In unit", "Essentials", "Hangers", "Bed linens"]
      },
      {
        title: "Entertainment",
        items: ["TV"]
      },
      {
        title: "Heating and cooling",
        items: ["AC - split type ductless system", "Ceiling fan", "Heating - split type ductless system"]
      },
      {
        title: "Internet and office",
        items: ["Wifi", "Dedicated workspace"]
      },
      {
        title: "Kitchen and dining",
        items: ["Kitchen", "Refrigerator", "Microwave", "Cooking basics", "Dishes and silverware"]
      },
      {
        title: "Outdoor",
        items: ["Private patio or balcony", "Backyard", "Outdoor furniture", "Outdoor dining area"]
      }
    ],
    images: [],
    rules: [],
    reservedRange: [],
    minimumStay: 31,
    maximumStay: 335
  },
  {
    id: "1663074583509006957",
    name: "Modern 2BR, fast wifi, A/C, walk to beach & train",
    description: "Newly renovated 2BR apartment in peaceful Premià de Mar. Perfect for remote work with high-speed Wi-Fi and AC.",
    address: "Premià de Mar",
    location: { latitude: 41.4946, longitude: 2.35084 },
    host: "Cynthia",
    amenities: [
      {
        title: "Bathroom",
        items: ["Cleaning products", "Shampoo", "Conditioner", "Body soap", "Hot water", "Shower gel"]
      },
      {
        title: "Bedroom and laundry",
        items: ["Washer", "Dryer", "Essentials", "Hangers", "Bed linens", "Extra pillows and blankets"]
      },
      {
        title: "Entertainment",
        items: ["TV"]
      },
      {
        title: "Heating and cooling",
        items: ["AC - split type ductless system", "Portable heater"]
      },
      {
        title: "Internet and office",
        items: ["Wifi", "Dedicated workspace"]
      },
      {
        title: "Kitchen and dining",
        items: ["Kitchen", "Refrigerator", "Microwave", "Cooking basics", "Dishes and silverware"]
      },
      {
        title: "Outdoor",
        items: ["Patio or balcony"]
      }
    ],
    images: [],
    rules: [],
    reservedRange: [],
    minimumStay: 31,
    maximumStay: 335
  },
  {
    id: "1043429957458843360",
    name: "Sunny modern 1-bed apart, A/C and high speed wi-fi",
    description: "Fully renovated, 1 bedroom, 1 bathroom with an open kitchen and ocean view balcony in the charming coastal town of Premià de Mar.",
    address: "Premià de Mar",
    location: { latitude: 41.49313, longitude: 2.35159 },
    host: "Cynthia",
    amenities: [
      {
        title: "Scenic views",
        items: ["City skyline view", "Ocean view", "Mountain view"]
      },
      {
        title: "Bathroom",
        items: ["Cleaning products", "Shampoo", "Body soap", "Hot water", "Shower gel"]
      },
      {
        title: "Bedroom and laundry",
        items: ["Washer", "Dryer", "Essentials", "Hangers", "Bed linens", "Extra pillows and blankets"]
      },
      {
        title: "Entertainment",
        items: ["TV"]
      },
      {
        title: "Heating and cooling",
        items: ["AC - split type ductless system", "Portable heater"]
      },
      {
        title: "Internet and office",
        items: ["Wifi", "Dedicated workspace"]
      },
      {
        title: "Kitchen and dining",
        items: ["Kitchen", "Refrigerator", "Microwave", "Cooking basics", "Dishes and silverware"]
      },
      {
        title: "Location features",
        items: ["Beach access"]
      },
      {
        title: "Outdoor",
        items: ["Patio or balcony"]
      }
    ],
    images: [],
    rules: [],
    reservedRange: [],
    minimumStay: 31,
    maximumStay: 335
  }
];

console.log('🧪 Testing Price Estimator\n');

testProperties.forEach((property, index) => {
  console.log(`\n--- Property ${index + 1} ---`);
  console.log(`Name: ${property.name}`);
  console.log(`ID: ${property.id}`);
  
  const estimate = combinePriceEstimations(property);
  
  console.log(`💰 Estimated Price: ${estimate.currency} ${estimate.pricePerNight}/night`);
  console.log(`📊 Confidence: ${estimate.confidence}`);
  console.log(`🔧 Method: ${estimate.method}`);
  
  // Show key amenities that influenced the price
  const amenities = property.amenities.flatMap(a => a.items);
  const keyFeatures = amenities.filter(a => 
    a.toLowerCase().includes('air conditioning') ||
    a.toLowerCase().includes('rooftop') ||
    a.toLowerCase().includes('ocean view') ||
    a.toLowerCase().includes('modern') ||
    a.toLowerCase().includes('2 bedroom') ||
    a.toLowerCase().includes('dedicated workspace')
  );
  
  if (keyFeatures.length > 0) {
    console.log(`🏠 Key Features: ${keyFeatures.join(', ')}`);
  }
});

console.log('\n✅ Price Estimator Test Complete');
