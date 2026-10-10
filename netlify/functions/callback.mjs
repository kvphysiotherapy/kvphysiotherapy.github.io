export default async (request) => {
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Forbidden' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Invalid content type' }, 415);
  let data;
  try { const body = await request.text(); if (body.length > 6000) return json({ error: 'Request too large' }, 413); data = JSON.parse(body); }
  catch { return json({ error: 'Invalid request' }, 400); }
  if (!data || typeof data !== 'object' || data.website) return json({ error: 'Invalid request' }, 400);
  const areas = ['Wakad', 'Hinjewadi', 'Tathawade', 'Punawale', 'Ravet', 'Kiwale', 'Balewadi', 'Other Pune area'];
  const times = ['Morning (9 am–12 pm)', 'Afternoon (12–5 pm)', 'Evening (5–8 pm)', 'Any time'];
  if (typeof data.name !== 'string' || !data.name.trim() || data.name.length > 80 || typeof data.phone !== 'string' || data.phone.length > 20 || !/^[+0-9() —-]+$/.test(data.phone) || !/^\d{10,15}$/.test(data.phone.replace(/\D/g, '')) || !areas.includes(data.area) || !times.includes(data.time) || data.consent !== 'on' || (data.message !== undefined && (typeof data.message !== 'string' || data.message.length > 1000))) return json({ error: 'Please check your details' }, 400);
  const { RESEND_API_KEY, CALLBACK_FROM_EMAIL } = process.env;
  const CALLBACK_TO_EMAIL = process.env.CALLBACK_TO_EMAIL || 'gundewarvijaya17@gmail.com';
  if (!RESEND_API_KEY || !CALLBACK_TO_EMAIL || !CALLBACK_FROM_EMAIL) return json({ error: 'Callback email is not configured' }, 503);
  const text = ['A new client has requested a physiotherapy callback.', '', 'Name: ' + data.name.trim(), 'Phone: ' + data.phone, 'Area: ' + data.area, 'Preferred call time (India): ' + data.time, '', 'Message: ' + (data.message || 'Not provided'), '', 'The client consented to being contacted about this enquiry.'].join('\n');
  try {
    const result = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: CALLBACK_FROM_EMAIL, to: [CALLBACK_TO_EMAIL], subject: 'KV Physiotherapy — new callback request', text }), signal: AbortSignal.timeout(10000) });
    if (!result.ok) return json({ error: 'Delivery failed. Please call directly.' }, 502);
    return json({ ok: true });
  } catch { return json({ error: 'Delivery unavailable. Please call directly.' }, 502); }
};
export const config = { path: '/.netlify/functions/callback', rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
