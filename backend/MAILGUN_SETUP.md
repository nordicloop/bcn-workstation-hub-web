# Mailgun Setup Instructions

## 1. Get Mailgun Credentials

1. Sign up for a Mailgun account at https://www.mailgun.com/
2. Go to your Mailgun dashboard
3. Navigate to "Domains" or "Sending" section
4. Note your:
   - **API Key** (from Settings > API Keys)
   - **Domain** (your verified Mailgun domain, e.g., `sandbox12345.mailgun.org` or your custom domain)

## 2. Configure Firebase Functions

Replace the placeholder values with your actual Mailgun credentials:

```bash
cd backend/functions
firebase functions:config:set mailgun.api_key="your-actual-api-key" mailgun.domain="your-actual-domain"
```

Example:
```bash
firebase functions:config:set mailgun.api_key="key-1234567890abcdef1234567890abcdef" mailgun.domain="sandbox1234567890.mailgun.org"
```

## 3. Deploy Functions

```bash
cd backend
firebase deploy --only functions
```

## 4. Test the Email Function

The new email endpoint is available at:
```
https://us-central1-bcn-workation-hub.cloudfunctions.net/sendReservationEmail
```

## 5. How It Works

When a user confirms a reservation:

1. **Guest Email**: The system prompts for the guest's email address
2. **Dual Emails**: 
   - Guest receives a confirmation email with booking details
   - Property manager (dfernandezbiz@gmail.com) receives a notification
3. **Next Steps**: Guest is instructed to reply to the email for payment instructions

## 6. Email Content

**Guest Email Includes:**
- Property details and total amount
- Check-in/check-out dates
- Guest count
- Instructions to reply for payment link

**Manager Email Includes:**
- Guest email and contact info
- All booking details
- Total amount for reference

## 7. Environment Variables

The function uses these environment variables:
- `MAILGUN_API_KEY`: Your Mailgun API key
- `MAILGUN_DOMAIN`: Your Mailgun domain

## 8. Security Notes

- The email function is configured with CORS for frontend access
- All emails are sent via Mailgun's secure API
- Guest emails are validated before sending
