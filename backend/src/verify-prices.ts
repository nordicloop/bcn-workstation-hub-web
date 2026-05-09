import { getRealPrice, getAllPrices } from "./price-lookup";

// Import the frontend data to verify prices are correctly updated
const frontendData = require("../../frontend/src/data.json");

console.log('🔍 Verifying Real Prices Implementation\n');

// Check price lookup table
console.log('--- Price Lookup Table ---');
const lookupPrices = getAllPrices();
lookupPrices.forEach(price => {
  console.log(`${price.listingId}: €${price.pricePerNight}/night`);
});

// Check frontend JSON data
console.log('\n--- Frontend JSON Data ---');
const frontendProperties = frontendData.properties;
frontendProperties.forEach(property => {
  const lookupPrice = getRealPrice(property.id);
  const frontendPrice = property.pricePerNight || 0;
  
  console.log(`${property.name}`);
  console.log(`  ID: ${property.id}`);
  console.log(`  Lookup Price: €${lookupPrice}/night`);
  console.log(`  Frontend Price: €${frontendPrice}/night`);
  
  if (lookupPrice > 0 && frontendPrice > 0) {
    if (lookupPrice === frontendPrice) {
      console.log(`  ✅ Prices match and are real!`);
    } else {
      console.log(`  ⚠️  Prices don't match - need update`);
    }
  } else {
    console.log(`  ❌ Missing price data`);
  }
  console.log('');
});

// Summary
console.log('--- Summary ---');
const totalProperties = frontendProperties.length;
const propertiesWithRealPrices = frontendProperties.filter(p => p.pricePerNight && p.pricePerNight > 0).length;

console.log(`📊 Total properties: ${totalProperties}`);
console.log(`💰 Properties with real prices: ${propertiesWithRealPrices}`);
console.log(`📈 Success rate: ${Math.round((propertiesWithRealPrices / totalProperties) * 100)}%`);

if (propertiesWithRealPrices === totalProperties) {
  console.log('🎉 All properties have real prices!');
} else {
  console.log(`⚠️  ${totalProperties - propertiesWithRealPrices} properties still need real prices`);
}

console.log('\n✅ Price verification complete');
