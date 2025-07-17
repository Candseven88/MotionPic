import { NextRequest, NextResponse } from 'next/server';
import { PayPalService } from '@/lib/paypal';

/**
 * POST /api/paypal/create-order
 * Create a PayPal order for video generation
 */
export async function POST(request: NextRequest) {
  try {
    const paypalService = new PayPalService();
    const { id, approvalUrl } = await paypalService.createOrder();

    return NextResponse.json({
      success: true,
      orderId: id,
      approvalUrl,
    });
  } catch (error) {
    console.error('PayPal create order API error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
} 