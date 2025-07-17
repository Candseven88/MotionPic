# PayPal Integration Setup

This document provides instructions on how to set up PayPal integration for MotionPic to enable pay-per-use video generation.

## Overview

MotionPic uses PayPal to process payments for video generation. Each video generation costs $0.80. The integration uses PayPal's REST API to create orders and process payments.

## Setting up PayPal for Development

### 1. Create a PayPal Developer Account

1. Go to [PayPal Developer](https://developer.paypal.com/) and sign up for a developer account
2. Log in to the PayPal Developer Dashboard

### 2. Create a Sandbox App

1. From your developer dashboard, select **Apps & Credentials**
2. Click **Create App** under the REST API apps section
3. Enter a name for your app (e.g., "MotionPic Development")
4. Select **Sandbox** for the environment
5. Click **Create App**

### 3. Get Your API Credentials

1. After creating your app, you'll see your **Client ID** and **Secret**
2. Copy these values to your `.env.local` file:
   ```
   PAYPAL_CLIENT_ID=your_sandbox_client_id_here
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

### 4. Create Sandbox Test Accounts

1. In the PayPal Developer Dashboard, go to **Testing Tools** > **Sandbox Accounts**
2. Click **Create Account**
3. Create two accounts:
   - A **Personal** account (to simulate a buyer)
   - A **Business** account (to simulate your merchant account)
4. Note down the email and password for these accounts for testing

## Testing the Integration

1. Start your development server with `npm run dev`
2. Generate an image in the application
3. Click on "Create Video" and fill in the video prompt
4. Click "Pay $0.80" to initiate the PayPal payment flow
5. You'll be redirected to PayPal's sandbox environment
6. Log in with your sandbox personal account credentials
7. Complete the payment process
8. You'll be redirected back to the application, and the video generation will start

## Going Live with PayPal

When you're ready to accept real payments:

### 1. Create a Live PayPal App

1. From your developer dashboard, select **Apps & Credentials**
2. Click **Create App** under the REST API apps section
3. Enter a name for your app (e.g., "MotionPic Production")
4. Select **Live** for the environment
5. Click **Create App**

### 2. Update Your Production Environment

1. Update your production environment variables with your live credentials:
   ```
   PAYPAL_CLIENT_ID=your_live_client_id_here
   PAYPAL_CLIENT_SECRET=your_live_client_secret_here
   NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
   ```

### 3. PayPal Account Requirements

1. Ensure you have a PayPal Business account (not a Personal account)
2. Complete any verification steps required by PayPal
3. Set up your payout preferences in your PayPal Business account

## Integration Details

The PayPal integration in MotionPic consists of the following components:

1. **PayPal Service** (`lib/paypal.ts`): Handles API communication with PayPal
2. **Create Order Endpoint** (`app/api/paypal/create-order/route.ts`): Creates a PayPal order
3. **Capture Payment Endpoint** (`app/api/paypal/capture/route.ts`): Captures the payment after approval
4. **UI Integration** (`components/ImageGenerator.tsx`): Manages the payment flow in the UI

## Troubleshooting

### Common Issues

1. **Payment Approval Error**: Ensure your sandbox account has sufficient funds
2. **Redirect Issues**: Verify that your `NEXT_PUBLIC_BASE_URL` is correctly set
3. **API Errors**: Check the browser console and server logs for detailed error messages

### Testing Tips

1. Use the PayPal sandbox dashboard to view transaction history
2. Monitor the Network tab in browser DevTools to see API requests and responses
3. Use different sandbox accounts to test different scenarios

## Additional Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/api/overview/)
- [PayPal REST API Reference](https://developer.paypal.com/api/rest/)
- [PayPal Checkout Integration Guide](https://developer.paypal.com/docs/checkout/) 