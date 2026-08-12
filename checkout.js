// ===== READ URL PARAMS =====
const params = new URLSearchParams(window.location.search);
const serviceType = params.get('service') || 'seguidores';
const initialQty = params.get('qty') || '10.000';
const initialPrice = parseFloat(params.get('price') || '99.90');
const discountParam = params.get('discount') || '';

// ===== SERVICE TIERS DATABASE (EXACT MATCHING APP.JS) =====
const serviceTiers = {
  'seguidores': [
    { qty: '500', price: 9.00, tag: '' },
    { qty: '1.000', price: 14.90, tag: 'Desconto de 25%' },
    { qty: '2.000', price: 25.90, tag: 'Desconto de 35%' },
    { qty: '3.000', price: 35.90, tag: 'Desconto de 40%' },
    { qty: '5.000', price: 55.90, tag: 'Mais Vendido' },
    { qty: '10.000', price: 99.90, tag: 'Desconto de 50%' },
    { qty: '20.000', price: 189.90, tag: 'Desconto de 52%' },
    { qty: '40.000', price: 350.90, tag: 'Desconto de 56%' },
  ],
  'seguidores-br': [
    { qty: '300', price: 9.99, tag: '' },
    { qty: '500', price: 27.99, tag: '' },
    { qty: '1.000', price: 49.99, tag: 'Desconto de 25%' },
    { qty: '2.000', price: 89.99, tag: 'Desconto de 35%' },
    { qty: '5.000', price: 199.99, tag: 'Mais Vendido' },
  ],
  'curtidas': [
    { qty: '300', price: 9.99, tag: '' },
    { qty: '500', price: 11.99, tag: '' },
    { qty: '1.000', price: 19.99, tag: 'Desconto de 25%' },
    { qty: '2.000', price: 34.99, tag: 'Desconto de 35%' },
    { qty: '5.000', price: 79.99, tag: 'Mais Vendido' },
  ],
  'curtidas-br': [
    { qty: '100', price: 9.99, tag: '' },
    { qty: '300', price: 12.99, tag: '' },
    { qty: '500', price: 19.99, tag: '' },
    { qty: '1.000', price: 34.99, tag: 'Desconto de 25%' },
    { qty: '2.000', price: 59.99, tag: 'Desconto de 35%' },
  ],
  'views': [
    { qty: '1.000', price: 9.99, tag: '' },
    { qty: '2.000', price: 14.90, tag: '' },
    { qty: '5.000', price: 17.99, tag: 'Desconto de 30%' },
    { qty: '10.000', price: 29.99, tag: 'Mais Vendido' },
    { qty: '50.000', price: 99.99, tag: 'Desconto de 50%' },
  ]
};

// ===== SERVICE NAME MAPPING =====
const serviceNames = {
  'seguidores': 'Seguidores',
  'seguidores-br': 'Seguidores BR 🇧🇷',
  'curtidas': 'Curtidas',
  'curtidas-br': 'Curtidas BR 🇧🇷',
  'views': 'Visualizações em Reels',
};
const serviceName = serviceNames[serviceType] || 'Seguidores';

// Get active tiers for selected service
const currentTiers = serviceTiers[serviceType] || serviceTiers['seguidores'];

// Find tier index matching initialQty
let activeStepIdx = currentTiers.findIndex(t => t.qty.replace(/\./g, '') === initialQty.replace(/\./g, ''));
if (activeStepIdx === -1) {
  activeStepIdx = currentTiers.findIndex(t => Math.abs(t.price - initialPrice) < 0.1);
  if (activeStepIdx === -1) activeStepIdx = 0;
}

let selectedTier = currentTiers[activeStepIdx];
let currentBasePrice = selectedTier.price;

function formatBRL(val) {
  return 'R$ ' + val.toFixed(2).replace('.', ',');
}

// ===== UPSELL VARIABLES (must be before updateTierUI) =====
let upsells = { curtidas: false, views: false };
let upsellPrices = { curtidas: 60, views: 57 };
let totalExtras = 0;

function recalcTotal() {
  totalExtras = 0;
  Object.keys(upsells).forEach(k => { if (upsells[k]) totalExtras += upsellPrices[k]; });
  const extrasEl = document.getElementById('summary-extras');
  if (totalExtras > 0) {
    extrasEl.style.display = 'flex';
    document.getElementById('summary-extras-price').textContent = formatBRL(totalExtras);
  } else {
    extrasEl.style.display = 'none';
  }
  const total = currentBasePrice + totalExtras;
  document.getElementById('summary-total').textContent = formatBRL(total);
  document.getElementById('ck-total-val').textContent = formatBRL(total);
}

// ===== POPULATE PAGE INITIAL STATE =====
function updateTierUI(tier) {
  selectedTier = tier;
  currentBasePrice = tier.price;

  document.getElementById('ck-qty').textContent = tier.qty;
  document.getElementById('ck-service-name').textContent = serviceName;
  document.getElementById('summary-item').textContent = tier.qty + ' ' + serviceName;
  document.getElementById('summary-base-price').textContent = formatBRL(tier.price);

  const badge = document.getElementById('ck-badge');
  if (tier.tag || discountParam) {
    badge.textContent = (tier.tag || discountParam).toUpperCase();
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }

  recalcTotal();
}

// Initial populate
updateTierUI(selectedTier);

// ===== INSTAGRAM PROFILE PREVIEW =====
let profileDebounce = null;
const profileInput = document.getElementById('ck-profile');
profileInput.addEventListener('input', function() {
  clearTimeout(profileDebounce);
  const raw = this.value.trim();
  profileDebounce = setTimeout(() => fetchProfilePreview(raw), 600);
});

function extractUsername(input) {
  // Remove @ prefix
  let u = input.replace(/^@/, '');
  // Extract from URL like instagram.com/username
  const urlMatch = u.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
  if (urlMatch) u = urlMatch[1];
  // Clean any trailing slashes or query params
  u = u.split(/[?/]/)[0];
  return u;
}

async function fetchProfilePreview(raw) {
  const preview = document.getElementById('ck-profile-preview');
  const username = extractUsername(raw);

  if (!username || username.length < 2) {
    preview.style.display = 'none';
    return;
  }

  try {
    // Use a public proxy to fetch Instagram profile data
    const res = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      headers: { 'x-ig-app-id': '936619743392459' }
    });

    if (!res.ok) throw new Error('not found');
    const json = await res.json();
    const user = json.data?.user;

    if (!user) throw new Error('no user');

    // Populate preview
    document.getElementById('ck-profile-pic').src = user.profile_pic_url || '';
    document.getElementById('ck-profile-name').textContent = user.username;
    document.getElementById('ck-profile-followers').textContent = formatCount(user.edge_followed_by?.count || 0);
    document.getElementById('ck-profile-following').textContent = formatCount(user.edge_follow?.count || 0);
    document.getElementById('ck-profile-posts').textContent = formatCount(user.edge_owner_to_timeline_media?.count || 0);
    preview.style.display = 'flex';
  } catch (err) {
    // Fallback: show preview with placeholder data from username
    document.getElementById('ck-profile-pic').src = `https://ui-avatars.com/api/?name=${username}&background=E1306C&color=fff&size=80&bold=true`;
    document.getElementById('ck-profile-name').textContent = username;
    document.getElementById('ck-profile-followers').textContent = '-';
    document.getElementById('ck-profile-following').textContent = '-';
    document.getElementById('ck-profile-posts').textContent = '-';
    preview.style.display = 'flex';
  }
}

function formatCount(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + ' mi';
  if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + ' mil';
  return num.toString();
}

// ===== UPSELL TOGGLE =====
function toggleUpsell(type, extraPrice) {
  const item = document.getElementById('upsell-' + type);
  const btn = item.querySelector('.ck-upsell-btn');
  upsells[type] = !upsells[type];

  if (upsells[type]) {
    item.classList.add('added');
    btn.textContent = 'Remover';
    btn.classList.add('added');
  } else {
    item.classList.remove('added');
    btn.textContent = 'Adicionar';
    btn.classList.remove('added');
  }
  recalcTotal();
}

// ===== SLIDER LOGIC (MATCHES SPECIFIC SERVICE TIERS) =====
const slider = document.getElementById('ck-slider');
const maxSteps = currentTiers.length - 1;

// Set slider initial value
slider.value = maxSteps > 0 ? (activeStepIdx / maxSteps) * 100 : 0;

slider.addEventListener('input', function() {
  const stepIdx = maxSteps > 0 ? Math.round((this.value / 100) * maxSteps) : 0;
  const newTier = currentTiers[stepIdx];
  updateTierUI(newTier);
});

// ===== CHECKOUT → IRONPAY PIX =====
async function handleCheckout(e) {
  e.preventDefault();

  const profile = document.getElementById('ck-profile').value.trim();
  const name = document.getElementById('ck-name').value.trim();
  const email = document.getElementById('ck-email').value.trim();
  const whatsapp = document.getElementById('ck-whatsapp').value.trim();
  const termsOk = document.getElementById('ck-terms').checked;

  if (!termsOk) { alert('Você precisa aceitar os termos de uso.'); return false; }

  const totalAmount = currentBasePrice + totalExtras;
  const currentQty = document.getElementById('ck-qty').textContent;

  // Disable button and show loading
  const payBtn = document.querySelector('.ck-pay-btn');
  payBtn.disabled = true;
  payBtn.innerHTML = '<div class="ck-btn-spinner"></div> Gerando PIX...';

  try {
    const res = await fetch('/api/create-pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: serviceType,
        qty: currentQty,
        amount: totalAmount,
        name,
        email,
        whatsapp,
        profile,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Erro ao gerar PIX.');
    }

    // Show PIX section
    showPixResult(data);

  } catch (err) {
    alert('Erro: ' + err.message);
    payBtn.disabled = false;
    payBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> PAGAR AGORA VIA PIX';
  }

  return false;
}

// ===== SHOW PIX RESULT =====
function showPixResult(data) {
  // Hide form, show PIX
  document.getElementById('checkoutForm').style.display = 'none';
  const pixResult = document.getElementById('pix-result');
  pixResult.style.display = 'block';

  // QR Code image generator
  const qrImg = document.getElementById('pix-qr-img');
  if (data.pix_code) {
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(data.pix_code);
    qrImg.src = qrUrl;
    qrImg.style.display = 'block';
  } else if (data.pix_qr_image) {
    qrImg.src = data.pix_qr_image;
    qrImg.style.display = 'block';
  } else {
    qrImg.style.display = 'none';
  }

  // PIX code for copy
  const pixInput = document.getElementById('pix-code-input');
  pixInput.value = data.pix_code || '';

  // Start polling for payment status
  if (data.transaction_hash) {
    startPaymentPolling(data.transaction_hash);
  }
}

// ===== COPY PIX CODE =====
function copyPixCode() {
  const input = document.getElementById('pix-code-input');
  input.select();
  input.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(input.value).then(() => {
    const btn = document.querySelector('.ck-copy-btn');
    btn.textContent = '✅ COPIADO!';
    btn.style.background = '#10b981';
    setTimeout(() => {
      btn.textContent = 'COPIAR PIX';
      btn.style.background = '';
    }, 3000);
  });
}

// ===== POLL PAYMENT STATUS =====
let pollInterval;
function startPaymentPolling(hash) {
  let attempts = 0;
  const maxAttempts = 360; // 30 minutes (every 5s)

  pollInterval = setInterval(async () => {
    attempts++;
    if (attempts > maxAttempts) {
      clearInterval(pollInterval);
      document.getElementById('pix-status').innerHTML = '<span style="color:#ef4444">⏰ Tempo expirado. Gere um novo PIX.</span>';
      return;
    }

    try {
      const res = await fetch('/api/transaction/' + hash);
      const data = await res.json();

      const status = data.payment_status || data.status;
      if (status === 'paid') {
        clearInterval(pollInterval);
        document.getElementById('pix-status').innerHTML = '<span style="color:#10b981;font-weight:700;font-size:1.1rem">✅ Pagamento Confirmado! Seu pedido está sendo processado.</span>';
        document.getElementById('pix-status').style.background = 'rgba(16,185,129,0.08)';
        document.getElementById('pix-status').style.borderColor = 'rgba(16,185,129,0.3)';
      }
    } catch (err) {
      // silently continue polling
    }
  }, 5000);
}
