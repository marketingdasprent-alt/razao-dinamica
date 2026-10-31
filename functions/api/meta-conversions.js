// Cloudflare Pages Function: mesmo comportamento de api/meta-conversions.js (Vercel).
// Variáveis em Configurações > Variáveis e segredos: META_ACCESS_TOKEN (segredo),
// META_PIXEL_ID, META_GRAPH_API_VERSION e META_TEST_EVENT_CODE (opcionais).
const ALLOWED_EVENTS = new Set(['PageView', 'Lead', 'Contact']);

async function normalizeAndHash(value, type) {
  if (typeof value !== 'string' || !value.trim()) return null;
  let normalized = value.trim().toLowerCase();
  if (type === 'phone') normalized = normalized.replace(/\D/g, '');
  if (!normalized) return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeString(value, maxLength = 255) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function sameOrigin(request) {
  const origin = safeString(request.headers.get('origin'), 500);
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; }
  catch { return false; }
}

function json(status, body, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra }
  });
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json(405, { success:false }, { Allow:'POST' });
  if (!sameOrigin(request)) return json(403, { success:false });

  const accessToken = env.META_ACCESS_TOKEN;
  if (!accessToken) return json(503, { success:false, error:'Meta CAPI is not configured.' });

  let body = {};
  try { body = await request.json(); } catch { body = {}; }
  if (!body || typeof body !== 'object') body = {};
  const eventName = safeString(body.event_name, 40);
  const eventId = safeString(body.event_id, 120);
  if (body.marketing_consent !== true || !ALLOWED_EVENTS.has(eventName) || !/^[A-Za-z0-9_-]{8,120}$/.test(eventId)) {
    return json(400, { success:false });
  }

  const userData = {
    client_ip_address:safeString(request.headers.get('cf-connecting-ip'), 100) || undefined,
    client_user_agent:safeString(request.headers.get('user-agent'), 500) || undefined,
    fbp:safeString(body.fbp) || undefined,
    fbc:safeString(body.fbc) || undefined
  };
  const emailHash = await normalizeAndHash(body.email, 'email');
  const phoneHash = await normalizeAndHash(body.phone, 'phone');
  if (emailHash) userData.em = [emailHash];
  if (phoneHash) userData.ph = [phoneHash];
  Object.keys(userData).forEach((key) => userData[key] === undefined && delete userData[key]);

  const event = {
    event_name:eventName,
    event_time:Math.floor(Date.now() / 1000),
    event_id:eventId,
    action_source:'website',
    event_source_url:safeString(body.event_source_url, 1000),
    user_data:userData
  };
  const metaPayload = { data:[event], access_token:accessToken };
  if (env.META_TEST_EVENT_CODE) metaPayload.test_event_code = env.META_TEST_EVENT_CODE;

  const pixelId = env.META_PIXEL_ID || '28161293560174741';
  const graphVersion = env.META_GRAPH_API_VERSION || 'v23.0';
  try {
    const response = await fetch(`https://graph.facebook.com/${graphVersion}/${pixelId}/events`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify(metaPayload)
    });
    if (!response.ok) {
      console.error('Meta CAPI rejected an event', response.status, await response.text());
      return json(502, { success:false });
    }
    const result = await response.json();
    return json(200, { success:true, events_received:result.events_received || 0 });
  } catch (error) {
    console.error('Meta CAPI request failed', error instanceof Error ? error.message : 'Unknown error');
    return json(502, { success:false });
  }
}
