const IRONPAY_BASE = 'https://api.ironpayapp.com.br/api/public/v1';
const API_TOKEN = 'Z9DAYrt7sWMHnbN8gUvwBjeS8A6HcvJRChZ621XV1v54vegMWzQHmzlVgIfs';

const PRODUCTS = {
  'seguidores':    { product_hash: 'alezfn4nij', offer_hash: '2wkbki5cqj', title: 'Seguidores' },
  'seguidores-br': { product_hash: 'v6p89hfsvq', offer_hash: 'rhn9wlobdl', title: 'Seguidores BR' },
  'curtidas':      { product_hash: 'mvcrwaoebe', offer_hash: 'clukwvtwrx', title: 'Curtidas' },
  'curtidas-br':   { product_hash: 'ksefbof6th', offer_hash: 'iga4epsosr', title: 'Curtidas BR' },
  'views':         { product_hash: 'i7fnuvmena', offer_hash: 'jwgxiwsfxu', title: 'Visualizações em Reels' },
};

// ===== GENERATE VALID CPF =====
function generateCPF() {
  const rand = () => Math.floor(Math.random() * 9);
  const n = Array.from({ length: 9 }, rand);

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += n[i] * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  n.push(d1);

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) sum += n[i] * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;
  n.push(d2);

  return n.join('');
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { service, qty, amount, name, email, whatsapp, profile } = req.body;

    if (!service || !amount || !name || !email || !whatsapp) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    const product = PRODUCTS[service];
    if (!product) {
      return res.status(400).json({ error: 'Serviço inválido.' });
    }

    const amountCents = Math.round(amount * 100);
    const phone = whatsapp.replace(/\D/g, '');
    const cpf = generateCPF();

    const payload = {
      amount: amountCents,
      offer_hash: product.offer_hash,
      payment_method: 'pix',
      customer: {
        name, email,
        phone_number: phone,
        document: cpf,
        street_name: 'N/A',
        number: '0',
        complement: '',
        neighborhood: 'N/A',
        city: 'N/A',
        state: 'SP',
        zip_code: '00000000',
      },
      cart: [{
        product_hash: product.product_hash,
        title: `${qty} ${product.title} - @${(profile || '').replace('@', '')}`,
        cover: null,
        price: amountCents,
        quantity: 1,
        operation_type: 1,
        tangible: false,
      }],
      expire_in_days: 1,
      transaction_origin: 'api',
      tracking: { src: '', utm_source: '', utm_medium: '', utm_campaign: '', utm_term: '', utm_content: '' },
    };

    const response = await fetch(`${IRONPAY_BASE}/transactions?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao criar pagamento.', details: data });
    }

    const pix = data.pix || {};
    res.json({
      success: true,
      transaction_hash: data.hash || data.transaction_hash,
      pix_code: pix.pix_qr_code || '',
      pix_qr_image: pix.pix_url || '',
      amount: amountCents,
      status: data.payment_status || data.status || 'pending',
    });

  } catch (err) {
    console.error('[PIX] Server error:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
