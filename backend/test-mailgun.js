// Test Mailgun API directly
const FormData = require('form-data');

const apiKey = "key-3f2e1a4b5c6d7e8f9a0b1c2d3e4f5a6b";
const domain = "sandbox77893c76f5d2452987992929bb5d9a28.mailgun.org";
const mailgunUrl = `https://api.mailgun.net/v3/${domain}/messages`;

async function testMailgun() {
    try {
        console.log("Testing Mailgun API...");
        console.log("Domain:", domain);
        console.log("API Key:", apiKey ? "Present" : "Missing");
        
        // Create test email data
        const formData = new FormData();
        formData.append('from', `BCN Workation Hub <noreply@${domain}>`);
        formData.append('to', 'dfernandezbiz@gmail.com');
        formData.append('subject', 'Test Email from Mailgun');
        formData.append('text', 'This is a test email from the BCN Workation Hub system.');

        console.log("Sending email...");
        
        const response = await fetch(mailgunUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
            },
            body: formData,
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log("Response body:", responseText);
        
        if (response.ok) {
            console.log("✅ Email sent successfully!");
        } else {
            console.log("❌ Email failed to send");
        }
        
    } catch (error) {
        console.error("Error:", error);
    }
}

testMailgun();
