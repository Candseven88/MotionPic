# PixWall Payment Setup Guide

## Overview

This guide explains how to set up automatic Pro plan upgrades using Creem Payment Links.

## How It Works

1. **User clicks "Upgrade to Pro"** on the pricing page
2. **System redirects to Creem payment page** with user metadata
3. **User completes payment** on Creem
4. **Creem sends webhook notification** to our server
5. **System automatically upgrades user** to Pro plan

## Setup Steps

### 1. Creem Dashboard Configuration

1. **Create Product in Creem**
   - Go to your Creem dashboard
   - Create a new product called "PixWall Pro"
   - Set price to $6.99/month
   - Copy the product ID (e.g., `prod_1MUecBTN3wEvpldZoXjCJZ`)

2. **Configure Webhook**
   - In Creem dashboard, go to Webhooks section
   - Add webhook URL: `https://your-domain.com/api/creem-webhook`
   - Select events: `order.paid`, `checkout.session.completed`

### 2. Environment Variables

Add these to your `.env.local` file:

```bash
# Your domain (for webhook URL)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. Payment Link Format

The payment link automatically includes user metadata:

```
https://www.creem.io/payment/prod_1MUecBTN3wEvpldZoXjCJZ?metadata[user_id]=USER_ID&metadata[email]=USER_EMAIL&metadata[platform]=pixwall&metadata[plan]=pro
```

## Features

### Automatic Upgrade
- When user pays, Creem sends webhook to `/api/creem-webhook`
- System reads `user_id` from metadata
- Automatically upgrades user to Pro plan

### Manual Downgrade
- Pro users can downgrade to Free plan
- Uses `/api/downgrade-user` endpoint
- Immediately removes Pro privileges

### User Experience
- Clean pricing page with plan comparison
- One-click upgrade to Pro
- Automatic plan status updates
- Real-time plan display in header

## Testing

### Test Payment Flow
1. Login to your app
2. Go to `/pricing` page
3. Click "Upgrade to Pro"
4. Complete test payment on Creem
5. Check if user is automatically upgraded

### Test Webhook
- Use tools like ngrok to test webhook locally
- Check server logs for webhook events
- Verify user plan changes in database

## Troubleshooting

### Common Issues

1. **User not upgraded after payment**
   - Check webhook URL in Creem dashboard
   - Verify webhook events are enabled
   - Check server logs for errors

2. **Payment link not working**
   - Verify product ID is correct
   - Check if user is logged in
   - Ensure metadata parameters are valid

3. **Webhook not receiving events**
   - Verify webhook URL is accessible
   - Check if domain has SSL certificate
   - Test webhook endpoint manually

### Logs to Monitor
- Webhook reception: `Received Creem webhook event`
- User upgrade: `User plan upgraded to Pro successfully`
- Errors: `Failed to upgrade user plan`

## Security Notes

- Webhook endpoint validates request method
- User ID is validated before database updates
- All operations are logged for debugging
- No sensitive data is exposed in logs

## Support

If you encounter issues:
1. Check server logs for error messages
2. Verify Creem dashboard configuration
3. Test webhook endpoint manually
4. Contact support with specific error details 