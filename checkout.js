// ===== READ URL PARAMS =====
const params = new URLSearchParams(window.location.search);
const serviceType = params.get('service') || 'seguidores';
const initialQty = params.get('qty') || '10.000';
const initialPrice = parseFloat(params.get('price') || '99.90');
const discountParam = params.get('discount') || '';

// Is this a "post-level" service? (curtidas, curtidas-br, views)
const isPostService = ['curtidas', 'curtidas-br', 'views'].includes(serviceType);

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

const currentTiers = serviceTiers[serviceType] || serviceTiers['seguidores'];

let activeStepIdx = currentTiers.findIndex(t => t.qty.replace(/\./g, '') === initialQty.replace(/\./g, ''));
if (activeStepIdx === -1) {
  activeStepIdx = currentTiers.findIndex(t => Math.abs(t.price - initialPrice) < 0.1);
  if (activeStepIdx === -1) activeStepIdx = 0;
}

let selectedTier = currentTiers[activeStepIdx];
let currentBasePrice = selectedTier.price;
let selectedPostUrl = ''; // For post-level services

function formatBRL(val) {
  return 'R$ ' + val.toFixed(2).replace('.', ',');
}

// ===== UPSELL VARIABLES =====
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

updateTierUI(selectedTier);

// Update profile label for post services
if (isPostService) {
  const profileLabel = document.querySelector('label[for="ck-profile"]');
  if (profileLabel) profileLabel.textContent = '@ do Perfil ou link da Publicação';
}

// ===== WHATSAPP AUTO MASK (DDD + 9 DÍGITOS) =====
const whatsappInput = document.getElementById('ck-whatsapp');
if (whatsappInput) {
  whatsappInput.addEventListener('input', function(e) {
    let digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) {
      e.target.value = '';
    } else if (digits.length <= 2) {
      e.target.value = `(${digits}`;
    } else if (digits.length <= 7) {
      e.target.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else {
      e.target.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
  });
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

// ===== SLIDER =====
const slider = document.getElementById('ck-slider');
const maxSteps = currentTiers.length - 1;
slider.value = maxSteps > 0 ? (activeStepIdx / maxSteps) * 100 : 0;

slider.addEventListener('input', function() {
  const stepIdx = maxSteps > 0 ? Math.round((this.value / 100) * maxSteps) : 0;
  updateTierUI(currentTiers[stepIdx]);
});

// ===== CHECKOUT → IRONPAY PIX =====
async function handleCheckout(e) {
  e.preventDefault();

  const profile = document.getElementById('ck-profile').value.trim();
  const name = document.getElementById('ck-name').value.trim();
  const email = document.getElementById('ck-email').value.trim();
  const whatsapp = document.getElementById('ck-whatsapp').value.trim();
  const termsOk = document.getElementById('ck-terms').checked;

  const rawPhone = whatsapp.replace(/\D/g, '');
  if (rawPhone.length < 11) {
    alert('Por favor, informe seu WhatsApp completo com DDD + 9 dígitos (ex: 11 99999-9999).');
    return false;
  }

  if (!termsOk) { alert('Você precisa aceitar os termos de uso.'); return false; }

  const totalAmount = currentBasePrice + totalExtras;
  const currentQty = document.getElementById('ck-qty').textContent;

  // For post-level services, use the selected post URL or the input value
  const finalProfile = isPostService && selectedPostUrl ? selectedPostUrl : profile;

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
        profile: finalProfile,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Erro ao gerar PIX.');
    }

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
  document.getElementById('checkoutForm').style.display = 'none';
  const pixResult = document.getElementById('pix-result');
  pixResult.style.display = 'block';

  const qrImg = document.getElementById('pix-qr-img');
  if (data.pix_code) {
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(data.pix_code);
    qrImg.style.display = 'block';
  } else if (data.pix_qr_image) {
    qrImg.src = data.pix_qr_image;
    qrImg.style.display = 'block';
  } else {
    qrImg.style.display = 'none';
  }

  document.getElementById('pix-code-input').value = data.pix_code || '';

  if (data.transaction_hash) {
    startPaymentPolling(data.transaction_hash);
  }
}

function copyPixCode() {
  const input = document.getElementById('pix-code-input');
  input.select();
  input.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(input.value).then(() => {
    const btn = document.querySelector('.ck-copy-btn');
    btn.textContent = '✅ COPIADO!';
    btn.style.background = '#10b981';
    setTimeout(() => { btn.textContent = 'COPIAR PIX'; btn.style.background = ''; }, 3000);
  });
}

let pollInterval;
function startPaymentPolling(hash) {
  let attempts = 0;
  pollInterval = setInterval(async () => {
    attempts++;
    if (attempts > 360) {
      clearInterval(pollInterval);
      document.getElementById('pix-status').innerHTML = '<span style="color:#ef4444">⏰ Tempo expirado. Gere um novo PIX.</span>';
      return;
    }
    try {
      const res = await fetch('/api/transaction/' + hash);
      const data = await res.json();
      if ((data.payment_status || data.status) === 'paid') {
        clearInterval(pollInterval);
        document.getElementById('pix-status').innerHTML = '<span style="color:#10b981;font-weight:700;font-size:1.1rem">✅ Pagamento Confirmado! Seu pedido está sendo processado.</span>';
        document.getElementById('pix-status').style.background = 'rgba(16,185,129,0.08)';
      }
    } catch (err) {}
  }, 5000);
}
