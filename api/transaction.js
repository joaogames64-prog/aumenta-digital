const IRONPAY_BASE = 'https://api.ironpayapp.com.br/api/public/v1';
const API_TOKEN = 'Z9DAYrt7sWMHnbN8gUvwBjeS8A6HcvJRChZ621XV1v54vegMWzQHmzlVgIfs';

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { hash } = req.query;
    if (!hash) return res.status(400).json({ error: 'Hash não informado.' });

    const response = await fetch(`${IRONPAY_BASE}/transactions/${hash}?api_token=${API_TOKEN}`, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[STATUS] Error:', err.message);
    res.status(500).json({ error: 'Erro ao consultar transação.' });
  }
};
