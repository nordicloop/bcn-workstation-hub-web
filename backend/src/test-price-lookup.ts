import { getRealPrice, getAllPrices, validatePrices } from "./price-lookup";

console.log('🧪 Testing Real Price Lookup\n');

// Test the price lookup function
console.log('--- Testing Individual Price Lookups ---');

const testIds = [
  "851289997009741371",
  "1663074583509006957", 
  "1043429957458843360",
  "invalid-id"
];

testIds.forEach(id => {
  const price = getRealPrice(id);
  if (price > 0) {
    console.log(`✅ ${id}: €${price}/night`);
  } else {
    console.log(`❌ ${id}: No price found`);
  }
});

console.log('\n--- Testing All Prices ---');
const allPrices = getAllPrices();
console.log(`📊 Total properties with prices: ${allPrices.length}`);

console.log('\n--- Validation ---');
validatePrices();

console.log('\n✅ Real Price Lookup Test Complete');
