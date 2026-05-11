const fs = require('fs');
const https = require('https');

// Read the property data from JSON file
const properties = JSON.parse(fs.readFileSync('./functions/seed-data.json', 'utf8'));

// Firebase Functions URLs (replace with your actual project URL)
const BASE_URL = 'https://us-central1-bcn-workation-hub.cloudfunctions.net';

async function seedProperties() {
  console.log('🌱 Starting Firestore seed...');
  
  for (const property of properties) {
    try {
      console.log(`📋 Seeding property: ${property.name} (${property.id})`);
      
      // Call the saveProperty function
      const response = await makeRequest(`${BASE_URL}/saveProperty`, 'POST', property);
      
      if (response.success) {
        console.log(`✅ Successfully seeded: ${property.name}`);
      } else {
        console.error(`❌ Failed to seed: ${property.name}`, response);
      }
    } catch (error) {
      console.error(`❌ Error seeding ${property.id}:`, error.message);
    }
  }
  
  console.log(`🎉 Seeding complete! Processed ${properties.length} properties`);
}

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'us-central1-bcn-workation-hub.cloudfunctions.net',
      path: url.split('/').pop(),
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run the seed function
seedProperties().catch(console.error);
