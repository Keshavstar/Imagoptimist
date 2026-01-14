
/**
 * CLOUDFLARE WORKER BACKEND LOGIC
 * This file contains the architecture for the Worker that manages security.
 * NOTE: This is intended for deployment via Wranglers/Cloudflare UI.
 */

// Added KVNamespace definition for TypeScript environment
interface KVNamespace {
  get(key: string, options?: { type: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<any>;
  put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: { expiration?: number; expirationTtl?: number; metadata?: any }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string; expiration?: number; metadata?: any }[]; list_complete: boolean; cursor?: string }>;
}

interface Env {
  LICENSES: KVNamespace;
  LIMITS: KVNamespace;
  SESSIONS: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    // API Routes
    try {
      if (url.pathname === '/api/validate-key' && method === 'POST') {
        const body = await request.json();
        const { key, deviceFingerprint } = body as any;

        // 1. Check KV for License
        const licenseDataStr = await env.LICENSES.get(key);
        if (!licenseDataStr) {
          return new Response(JSON.stringify({ error: 'License not found' }), { status: 404, headers: corsHeaders });
        }

        const license = JSON.parse(licenseDataStr);

        // 2. Security: Expiry Check
        if (license.expiresAt < Date.now()) {
          return new Response(JSON.stringify({ error: 'License expired' }), { status: 403, headers: corsHeaders });
        }

        // 3. Security: Device Lock
        if (!license.devices.includes(deviceFingerprint)) {
          if (license.devices.length >= license.maxDevices) {
            return new Response(JSON.stringify({ error: 'Too many devices linked' }), { status: 403, headers: corsHeaders });
          }
          // Register new device
          license.devices.push(deviceFingerprint);
          await env.LICENSES.put(key, JSON.stringify(license));
        }

        // 4. Generate Session Token
        const token = crypto.randomUUID();
        const sessionData = { key, tier: 'PREMIUM', expires: Date.now() + 10 * 60 * 1000 };
        await env.SESSIONS.put(token, JSON.stringify(sessionData), { expirationTtl: 600 });

        return new Response(JSON.stringify({ success: true, token, expiry: license.expiresAt }), { headers: corsHeaders });
      }

      // Action validation (Rate limiting)
      if (url.pathname === '/api/verify-action' && method === 'POST') {
        const auth = request.headers.get('Authorization');
        const ip = request.headers.get('cf-connecting-ip') || 'unknown';

        if (!auth) {
          // Free User Rate Limiting
          const limitKey = `limit:${ip}`;
          const current = await env.LIMITS.get(limitKey);
          const count = current ? parseInt(current) : 0;

          if (count >= 5) { // 5 per hour for free users
             return new Response(JSON.stringify({ error: 'Limit reached. Upgrade to Premium for unlimited use.' }), { status: 429, headers: corsHeaders });
          }

          await env.LIMITS.put(limitKey, (count + 1).toString(), { expirationTtl: 3600 });
          return new Response(JSON.stringify({ success: true, tier: 'FREE' }), { headers: corsHeaders });
        }

        // Premium User Token Check
        const sessionStr = await env.SESSIONS.get(auth.replace('Bearer ', ''));
        if (!sessionStr) {
          return new Response(JSON.stringify({ error: 'Invalid or expired session' }), { status: 401, headers: corsHeaders });
        }

        return new Response(JSON.stringify({ success: true, tier: 'PREMIUM' }), { headers: corsHeaders });
      }

      return new Response('Not Found', { status: 404 });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  },
};
