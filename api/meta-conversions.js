import { createHash } from 'node:crypto';

const ALLOWED_EVENTS = new Set(['PageView', 'Lead', 'Contact']);
const PIXEL_ID = process.env.META_PIXEL_ID || '28161293560174741';
const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || 'v23.0';

function normalizeAndHash(value, type) {
  if (typeof value !== 'string' || !value.trim()) return null;
  let normalized = value.trim().toLowerCase();
  if (type === 'phone') normalized = normalized.replace(/\D/g, '');
  return normalized ? createHash('sha256').update(normalized).digest('hex') : null;
}

function safeString(value, maxLength = 255) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function requestHost(req) {
  return safeString(req.headers['x-forwarded-host'] || req.headers.host, 255).split(',')[0];
}

function sameOrigin(req) {
  const origin = safeString(req.headers.origin, 500);
  if (!origin) return true;
  try { return new URL(origin).host === requestHost(req); }
  catch { return false; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success:false });
  }
  if (!sameOrigin(req)) return res.status(403).json({ success:false });

  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) return res.status(503).json({ success:false, error:'Meta CAPI is not configured.' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const eventName = safeString(body.event_name, 40);
  const eventId = safeString(body.event_id, 120);
  if (body.marketing_consent !== true || !ALLOWED_EVENTS.has(eventName) || !/^[A-Za-z0-9_-]{8,120}$/.test(eventId)) {
    return res.status(400).json({ success:false });
  }

  const userData = {
    client_ip_address:safeString(req.headers['x-forwarded-for'], 100).split(',')[0] || undefined,
    client_user_agent:safeString(req.headers['user-agent'], 500) || undefined,
    fbp:safeString(body.fbp) || undefined,
    fbc:safeString(body.fbc) || undefined
  };
  const emailHash = normalizeAndHash(body.email, 'email');
  const phoneHash = normalizeAndHash(body.phone, 'phone');
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
  if (process.env.META_TEST_EVENT_CODE) metaPayload.test_event_code = process.env.META_TEST_EVENT_CODE;

  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify(metaPayload)
    });
    if (!response.ok) {
      console.error('Meta CAPI rejected an event', response.status, await response.text());
      return res.status(502).json({ success:false });
    }
    const result = await response.json();
    return res.status(200).json({ success:true, events_received:result.events_received || 0 });
  } catch (error) {
    console.error('Meta CAPI request failed', error instanceof Error ? error.message : 'Unknown error');
    return res.status(502).json({ success:false });
  }
}
