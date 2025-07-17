import axios from 'axios';

/**
 * PayPal API service for handling payments
 */
export class PayPalService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  /**
   * Get PayPal access token
   */
  async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      throw error;
    }
  }

  /**
   * Create a PayPal order for video generation
   */
  async createOrder(): Promise<{ id: string, approvalUrl: string }> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: '0.80',
                breakdown: {
                  item_total: {
                    currency_code: 'USD',
                    value: '0.80'
                  }
                }
              },
              description: 'AI Video Generation',
              items: [
                {
                  name: 'AI Video Generation',
                  description: 'Generate one AI video from an image',
                  quantity: '1',
                  unit_amount: {
                    currency_code: 'USD',
                    value: '0.80'
                  },
                  category: 'DIGITAL_GOODS'
                }
              ]
            }
          ],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/paypal/capture`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { id } = response.data;
      const approvalUrl = response.data.links.find((link: any) => link.rel === 'approve').href;

      return { id, approvalUrl };
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  /**
   * Capture payment for an approved PayPal order
   */
  async capturePayment(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      throw error;
    }
  }
} 