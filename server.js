const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ===== IRONPAY CONFIG =====
const IRONPAY_BASE = 'https://api.ironpayapp.com.br/api/public/v1';
const API_TOKEN = 'Z9DAYrt7sWMHnbN8gUvwBjeS8A6HcvJRChZ621XV1v54vegMWzQHmzlVgIfs';

// Product → { product_hash, offer_hash, title }
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
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += n[i] * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  n.push(d1);
  sum = 0;
  for (let i = 0; i < 10; i++) sum += n[i] * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;
  n.push(d2);
  return n.join('');
}

// ===== CREATE PIX TRANSACTION =====
app.post('/api/create-pix', async (req, res) => {
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

    console.log('[PIX] Creating transaction:', JSON.stringify({ service, qty, amount: amountCents, profile }));

    const response = await fetch(`${IRONPAY_BASE}/transactions?api_token=${API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[PIX] IronPay error:', response.status, JSON.stringify(data));
      return res.status(response.status).json({ error: 'Erro ao criar pagamento.', details: data });
    }

    console.log('[PIX] Transaction created:', data.hash || data.transaction_hash);

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
});

// ===== CHECK TRANSACTION STATUS =====
app.get('/api/transaction/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const response = await fetch(`${IRONPAY_BASE}/transactions/${hash}?api_token=${API_TOKEN}`, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[STATUS] Error:', err.message);
    res.status(500).json({ error: 'Erro ao consultar transação.' });
  }
});

// ===== INSTAGRAM PROFILE PROXY =====
app.get('/api/instagram-profile', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Username obrigatório' });

  const clean = username.replace(/^@/, '').split(/[?/]/)[0];

  try {
    const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${clean}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-ig-app-id': '936619743392459',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) throw new Error('Instagram API error: ' + response.status);

    const data = await response.json();
    const user = data?.data?.user;
    if (!user) throw new Error('User not found');

    const posts = (user.edge_owner_to_timeline_media?.edges || []).slice(0, 12).map(edge => ({
      id: edge.node.id,
      shortcode: edge.node.shortcode,
      thumbnail: edge.node.thumbnail_src || edge.node.display_url,
      likes: edge.node.edge_liked_by?.count || 0,
      comments: edge.node.edge_media_to_comment?.count || 0,
      is_video: edge.node.is_video || false,
      url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
    }));

    res.json({
      success: true,
      username: user.username,
      full_name: user.full_name || '',
      profile_pic: user.profile_pic_url_hd || user.profile_pic_url || '',
      followers: user.edge_followed_by?.count || 0,
      following: user.edge_follow?.count || 0,
      posts_count: user.edge_owner_to_timeline_media?.count || 0,
      is_private: user.is_private || false,
      posts: posts,
    });

  } catch (err) {
    console.error('[IG Profile] Error:', err.message);
    res.status(404).json({ success: false, error: 'Perfil não encontrado ou privado.' });
  }
});

// ===== START SERVER (local dev only) =====
// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Aumenta Digital rodando em http://localhost:${PORT}`);
    console.log(`📦 Checkout: http://localhost:${PORT}/checkout.html`);
    console.log(`🏠 Home: http://localhost:${PORT}/index.html\n`);
  });
}

module.exports = app;
