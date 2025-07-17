import { NextRequest, NextResponse } from 'next/server';
import { PayPalService } from '@/lib/paypal';

/**
 * GET /api/paypal/capture
 * Capture a PayPal payment after user approval
 */
export async function GET(request: NextRequest) {
  try {
    // Get the order ID from the URL query parameters
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('token');

    if (!orderId) {
      return NextResponse.redirect(new URL('/?error=missing_order_id', request.url));
    }

    const paypalService = new PayPalService();
    const captureResult = await paypalService.capturePayment(orderId);

    // Check if the payment was successfully captured
    if (captureResult.status === 'COMPLETED') {
      // Redirect to the app with success parameter
      return NextResponse.redirect(new URL('/?payment=success&orderId=' + orderId, request.url));
    } else {
      // Redirect to the app with error parameter
      return NextResponse.redirect(new URL('/?payment=failed&reason=capture_failed', request.url));
    }
  } catch (error) {
    console.error('PayPal capture API error:', error);
    return NextResponse.redirect(new URL('/?payment=failed&reason=server_error', request.url));
  }
} 