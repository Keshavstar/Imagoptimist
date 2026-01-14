
import { LicenseStatus, UserTier } from '../types';

/**
 * In a real production environment, this would call your Cloudflare Worker endpoint.
 * For this demo, we simulate the Worker's server-side logic and KV interactions.
 */
export const validateLicense = async (key: string): Promise<LicenseStatus> => {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 1200));

  // Anti-bypass Logic (Server-side simulation)
  // Real check would involve KV: const val = await KV.get(key);
  const isValidFormat = /^PREM-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
  
  // Demo Mock: Any key starting with 'PREM-1234' is valid
  if (isValidFormat && key.startsWith('PREM-1234')) {
    return {
      valid: true,
      tier: UserTier.PREMIUM,
      token: btoa(Date.now().toString() + key), // Short-lived session token
      expiry: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      message: 'License activated successfully!'
    };
  }

  return {
    valid: false,
    tier: UserTier.FREE,
    message: 'Invalid license key format or key not found.'
  };
};

/**
 * Real Worker Implementation Example (Code for deployment to Cloudflare)
 * 
 * export default {
 *   async fetch(request, env) {
 *     const url = new URL(request.url);
 *     
 *     if (url.pathname === '/api/validate') {
 *       const { key, fingerprint } = await request.json();
 *       const license = await env.LICENSES.get(key, { type: 'json' });
 *       
 *       if (!license || license.status !== 'active') {
 *         return new Response(JSON.stringify({ success: false }), { status: 403 });
 *       }
 *       
 *       // Check device locks
 *       if (license.devices.length >= license.maxDevices && !license.devices.includes(fingerprint)) {
 *          return new Response(JSON.stringify({ error: 'Device limit reached' }), { status: 403 });
 *       }
 *       
 *       const token = crypto.randomUUID();
 *       await env.SESSIONS.put(token, JSON.stringify({ key, tier: 'PREMIUM' }), { expirationTtl: 3600 });
 *       
 *       return new Response(JSON.stringify({ valid: true, token, expiry: license.expiry }));
 *     }
 *   }
 * }
 */
