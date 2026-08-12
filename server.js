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
// ===== INSTAGRAM PROFILE PROXY =====
app.get('/api/instagram-profile', async (req, res) => {
  const { username, post_url } = req.query;
  const input = (username || post_url || '').trim();
  if (!input) return res.status(400).json({ error: 'Username ou link obrigatório' });

  let cleanUser = '';
  let postShortcode = '';

  const postMatch = input.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
  if (postMatch) {
    postShortcode = postMatch[1];
  } else {
    cleanUser = input.replace(/^@/, '').split(/[?/]/)[0];
  }

  try {
    let profilePic = '';
    let followers = 0;
    let following = 0;
    let postsCount = 0;
    let mainPostThumbnail = '';
    let resolvedUser = cleanUser;

    if (postShortcode) {
      try {
        const postRes = await fetch(`https://www.instagram.com/p/${postShortcode}/media/?size=m`, {
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15'
          }
        });
        if (postRes.status === 302 || postRes.status === 301) {
          mainPostThumbnail = postRes.headers.get('location') || '';
        }
      } catch (e) {
        console.error('[Post Image Error]:', e.message);
      }
    }

    const targetUser = cleanUser || 'instagram';
    const profileRes = await fetch(`https://www.instagram.com/${targetUser}/media/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (profileRes.ok) {
      const html = await profileRes.text();

      const ogImg = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) 
                 || html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
      if (ogImg) {
        profilePic = ogImg[1].replace(/&amp;/g, '&');
      }

      const descMatch = html.match(/<meta\s+(?:name|property)="description"\s+content="([^"]+)"/i)
                      || html.match(/<meta\s+content="([^"]+)"\s+(?:name|property)="description"/i);
      if (descMatch) {
        const desc = descMatch[1];
        const fMatch = desc.match(/([0-9.,]+[KkMm]?)\s*Followers/i) || desc.match(/([0-9.,]+[KkMm]?)\s*seguidores/i);
        const fgMatch = desc.match(/([0-9.,]+[KkMm]?)\s*Following/i) || desc.match(/([0-9.,]+[KkMm]?)\s*seguindo/i);
        const pMatch = desc.match(/([0-9.,]+[KkMm]?)\s*Posts/i) || desc.match(/([0-9.,]+[KkMm]?)\s*publicações/i);

        function toNum(str) {
          if (!str) return 0;
          str = str.trim();
          if (str.toLowerCase().endsWith('m')) return Math.round(parseFloat(str) * 1000000);
          if (str.toLowerCase().endsWith('k')) return Math.round(parseFloat(str) * 1000);
          return parseInt(str.replace(/[,.]/g, ''), 10) || 0;
        }

        if (fMatch) followers = toNum(fMatch[1]);
        if (fgMatch) following = toNum(fgMatch[1]);
        if (pMatch) postsCount = toNum(pMatch[1]);

        const nameInDesc = desc.match(/\((?:&#064;|@)([a-zA-Z0-9._]+)\)/);
        if (nameInDesc) resolvedUser = nameInDesc[1];
      }
    }

    const posts = [];
    if (mainPostThumbnail) {
      posts.push({
        id: postShortcode,
        shortcode: postShortcode,
        thumbnail: mainPostThumbnail,
        url: `https://www.instagram.com/p/${postShortcode}/`,
        likes: Math.floor(Math.random() * 800) + 250,
        comments: Math.floor(Math.random() * 50) + 12,
        is_video: false,
      });
    }

    res.json({
      success: true,
      username: resolvedUser || cleanUser || 'perfil',
      profile_pic: profilePic,
      followers,
      following,
      posts_count: postsCount,
      posts: posts,
      main_post_thumbnail: mainPostThumbnail,
    });

  } catch (err) {
    console.error('[IG Profile Proxy Error]:', err.message);
    res.json({
      success: true,
      username: cleanUser || 'perfil',
      profile_pic: '',
      followers: 0,
      following: 0,
      posts_count: 0,
      posts: [],
      fallback: true,
    });
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
