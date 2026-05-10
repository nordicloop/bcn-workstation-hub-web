#!/bin/bash

echo "🌱 Starting Firestore seed..."

# Read the first property from JSON and test
curl -X POST https://us-central1-bcn-workation-hub.cloudfunctions.net/saveProperty \
  -H "Content-Type: application/json" \
  -d '{
    "id": "851289997009741371",
    "name": "Sunny apartment - A/C, fast wifi, private rooftop",
    "description": "Fully renovated, 1 bedroom, 1 bathroom with an open kitchen and huge private rooftop terrace in the charming coastal town of Premià de Mar.",
    "address": "Premià de Mar",
    "location": {
      "latitude": 41.49433,
      "longitude": 2.35008
    },
    "host": "Cynthia",
    "pricePerNight": 85,
    "minimumStay": 31,
    "maximumStay": 335
  }'

echo ""
echo "✅ Test property seeding complete"

# Read full JSON and seed all properties
echo "📋 Seeding all properties..."

# Property 1
curl -X POST https://us-central1-bcn-workation-hub.cloudfunctions.net/saveProperty \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "id": "851289997009741371",
  "name": "Sunny apartment - A/C, fast wifi, private rooftop",
  "description": "Fully renovated, 1 bedroom, 1 bathroom with an open kitchen and huge private rooftop terrace in the charming coastal town of Premià de Mar.<br /><br />The apartment has a bright and modern living space, complete with stylish furnishings and all the amenities you need to stay productive (fast internet provided) and comfortable. Spacious private terrace where you can soak up the sun, enjoy the fresh sea breeze, and take in stunning views of the sea and surrounding hills.<br /><br /><b>Other things to note</b><br />This is a temporary rent apartment, minimum 31 days  and maximum 11 months. You will be required to sign electronically a standard rental agreement to comply with local laws and regulations and share your ID / Passport within 48h once the booking is pre-approved. For residents in Spain you will be required to provide a proof of need for temporary rental. You might be asked to provide a source of income and LinkedIn profile.<br />Electricity is covered up to 450 kWh per month, which should meet your needs comfortably. Usage beyond this allocation will incur additional charges in accordance with the market price.<br />Short rent register number: ESFCNT00000809400065161600000000000000000000000000005<br /><br /><b>Registration details</b><br />Spain – National registration number<br />ESFCNT00000809400065161600000000000000000000000000005<br /><br />Catalonia – Regional registration number<br />Exempt",
  "address": "Premià de Mar",
  "location": {
    "latitude": 41.49433,
    "longitude": 2.35008
  },
  "host": "Cynthia",
  "pricePerNight": 85,
  "minimumStay": 31,
  "maximumStay": 335,
  "amenities": [
    {
      "title": "Bathroom",
      "items": [
        "Hairdryer",
        "Cleaning products",
        "Shampoo",
        "Body soap",
        "Hot water",
        "Shower gel"
      ]
    }
  ],
  "images": [
    {
      "title": "Featured",
      "items": [
        "https://a0.muscache.com/im/pictures/miso/Hosting-851289997009741371/original/3dc56863-bbef-4d50-9ce2-e25741d3d8f7.jpeg"
      ]
    }
  ],
  "rules": [
    {
      "title": "Checking in and out",
      "items": [
        "Check-in after 3:00 pm",
        "Checkout before 11:00 am",
        "Self check-in with lockbox"
      ]
    }
  ],
  "reservedRange": [
    {
      "from": "2026-08-19T22:00:00.000Z",
      "to": "2026-09-22T22:00:00.000Z"
    }
  ]
}
EOF

echo ""
echo "🎉 Seeding complete!"
