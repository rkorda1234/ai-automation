export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ZOHO_URL =
    'https://www.zohoapis.com/billing/v1/settings/incomingwebhooks/iw_n8n_create_invoices/execute' +
    '?auth_type=apikey&encapiKey=wSsVR611%2FUX5Wqh8mjKkI%2BY%2Bm1gHVAvyFFN03gCgvyT%2BSKqT%2FNxolE3HAgelHp5wTjYpTWlH7dRG3Hd8rmxh1ppClFBeZxSo%2FGqVd2E0MFVF%2FOi71Q%3D%3D';

  try {
    const zohoRes = await fetch(ZOHO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const text = await zohoRes.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(zohoRes.status).json(data);
  } catch (err) {
    console.error('[zoho-invoice proxy]', err.message);
    return res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
