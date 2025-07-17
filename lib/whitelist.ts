/**
 * Local whitelist configuration for bypassing payment in development
 */

// Enable/disable whitelist functionality
export const ENABLE_WHITELIST = false; // Disabled regardless of environment

// List of IP addresses that can bypass payment
export const WHITELISTED_IPS = [
  '127.0.0.1',
  'localhost',
  '::1',
  // Add more IPs as needed
];

/**
 * Check if an IP address is whitelisted
 */
export function isWhitelisted(ip: string | null): boolean {
  if (!ENABLE_WHITELIST) return false;
  if (!ip) return false;
  
  return WHITELISTED_IPS.includes(ip);
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string | null {
  const headers = new Headers(request.headers);
  
  // Try various headers where IP might be found
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0].trim();
  const realIP = headers.get('x-real-ip');
  
  return forwardedFor || realIP || 'localhost';
} 