const https = require('https');

// Updated booking data from iCal for property 851289997009741371
const updatedProperty = {
  id: "851289997009741371",
  reservedRange: [
    {
      from: "2026-05-10T22:00:00.000Z", // May 10, 2026
      to: "2026-06-01T22:00:00.000Z"    // June 1, 2026 (checkout)
    },
    {
      from: "2026-08-19T22:00:00.000Z", // August 19, 2026 (single blocked day)
      to: "2026-08-20T22:00:00.000Z"    // August 20, 2026
    },
    {
      from: "2026-08-20T22:00:00.000Z", // August 20, 2026
      to: "2026-09-23T22:00:00.000Z"    // September 23, 2026
    },
    {
      from: "2026-09-23T22:00:00.000Z", // September 23, 2026 (single blocked day)
      to: "2026-09-24T22:00:00.000Z"    // September 24, 2026
    }
  ]
};

const BASE_URL = 'https://us-central1-bcn-workation-hub.cloudfunctions.net';

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const fullUrl = `${BASE_URL}${url}`;
    
    const urlObj = new URL(fullUrl);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

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

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function fixPropertyAvailability() {
  console.log('🔧 Fixing property availability for 851289997009741371...');
  console.log('📅 Updated bookings from iCal:');
  updatedProperty.reservedRange.forEach((booking, index) => {
    console.log(`  ${index + 1}. ${booking.from} to ${booking.to}`);
  });
  
  try {
    // Get current property data first
    console.log('📋 Fetching current property data...');
    const currentPropertyResponse = await makeRequest(`/properties/851289997009741371`, 'GET', null);
    
    console.log('📋 Current property response:', JSON.stringify(currentPropertyResponse, null, 2));
    
    if (!currentPropertyResponse || !currentPropertyResponse.id) {
      throw new Error('Property not found');
    }
    
    console.log('✅ Current property data loaded');
    
    // Update with new reserved range
    const updatedData = {
      ...currentPropertyResponse,
      reservedRange: updatedProperty.reservedRange
    };
    
    console.log('💾 Saving updated property data...');
    console.log('📋 Updated data reserved range:', updatedData.reservedRange);
    const response = await makeRequest(`/properties`, 'POST', updatedData);
    
    console.log('📋 Save response:', response);
    
    if (response && response.success) {
      console.log('🎉 Property availability fixed successfully!');
      console.log('📅 June 1 - July 2, 2026 should now be available for booking');
    } else {
      console.error('❌ Failed to update property:', response);
    }
    
  } catch (error) {
    console.error('❌ Error fixing property availability:', error.message);
  }
}

// Run the fix
fixPropertyAvailability().catch(console.error);
