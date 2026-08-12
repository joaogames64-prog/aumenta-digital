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

// ===== INSTAGRAM PROFILE PREVIEW =====
let profileDebounce = null;
let profileData = null;
const profileInput = document.getElementById('ck-profile');
profileInput.addEventListener('input', function() {
  clearTimeout(profileDebounce);
  const raw = this.value.trim();
  profileDebounce = setTimeout(() => fetchProfilePreview(raw), 800);
});

function extractUsername(input) {
  let u = input.replace(/^@/, '');
  // Extract from post URL
  const postMatch = u.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
  if (postMatch) {
    // It's a post URL, extract the post shortcode — we still need the profile
    selectedPostUrl = input;
  }
  // Extract from profile URL
  const urlMatch = u.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
  if (urlMatch) u = urlMatch[1];
  u = u.split(/[?/]/)[0];
  return u;
}

async function fetchProfilePreview(raw) {
  const preview = document.getElementById('ck-profile-preview');
  const postsGrid = document.getElementById('ck-posts-grid');
  const input = raw.trim();

  if (!input || input.length < 2) {
    preview.style.display = 'none';
    if (postsGrid) postsGrid.style.display = 'none';
    return;
  }

  const isPostUrl = input.includes('/p/');
  const username = extractUsername(input);

  // Show loading state
  preview.style.display = 'flex';
  document.getElementById('ck-profile-pic').src = `https://ui-avatars.com/api/?name=${username || 'IG'}&background=E1306C&color=fff&size=80&bold=true`;
  document.getElementById('ck-profile-name').textContent = username || 'Instagram';
  document.getElementById('ck-profile-followers').textContent = '...';
  document.getElementById('ck-profile-following').textContent = '...';
  document.getElementById('ck-profile-posts').textContent = '...';

  try {
    const queryParam = isPostUrl ? `post_url=${encodeURIComponent(input)}` : `username=${encodeURIComponent(username)}`;
    const res = await fetch(`/api/instagram-profile?${queryParam}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error);

    profileData = data;

    // Update profile preview card
    if (data.profile_pic) {
      document.getElementById('ck-profile-pic').src = data.profile_pic;
    } else {
      document.getElementById('ck-profile-pic').src = `https://ui-avatars.com/api/?name=${data.username || username}&background=E1306C&color=fff&size=80&bold=true`;
    }

    document.getElementById('ck-profile-name').textContent = data.username || username;
    document.getElementById('ck-profile-followers').textContent = formatCount(data.followers);
    document.getElementById('ck-profile-following').textContent = formatCount(data.following);
    document.getElementById('ck-profile-posts').textContent = formatCount(data.posts_count);

    // Show posts grid for post-level services (curtidas, curtidas-br, views)
    if (isPostService && postsGrid) {
      let postsToRender = data.posts || [];

      if (postsToRender.length === 0 && data.main_post_thumbnail) {
        postsToRender = [{
          url: input,
          thumbnail: data.main_post_thumbnail,
          likes: 4500,
          comments: 230,
        }];
      }

      if (postsToRender.length === 0 && (data.profile_pic || username)) {
        const thumb = data.profile_pic || `https://ui-avatars.com/api/?name=${data.username || username}&background=3B82F6&color=fff&size=300`;
        postsToRender = [
          { url: input, thumbnail: thumb, likes: 4500, comments: 230 },
          { url: input, thumbnail: thumb, likes: 1200, comments: 85 },
          { url: input, thumbnail: thumb, likes: 3100, comments: 140 },
        ];
      }

      if (postsToRender.length > 0) {
        renderPostsGrid(postsToRender);
      }
    }

  } catch (err) {
    document.getElementById('ck-profile-followers').textContent = '-';
    document.getElementById('ck-profile-following').textContent = '-';
    document.getElementById('ck-profile-posts').textContent = '-';
  }
}

function formatCount(num) {
  if (!num || num === 0) return '-';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + ' mi';
  if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + ' mil';
  return num.toString();
}

// ===== POST SELECTION GRID =====
function renderPostsGrid(posts) {
  const container = document.getElementById('ck-posts-grid');
  if (!container) return;

  const maxShow = 3;
  const remaining = posts.length - maxShow;

  let html = '<p class="ck-posts-hint">👇 Clique em uma publicação para selecionar</p>';
  html += '<div class="ck-posts-thumbs">';

  posts.slice(0, maxShow).forEach((post, idx) => {
    const activeClass = idx === 0 ? ' selected' : '';
    html += `
      <div class="ck-post-thumb${activeClass}" data-url="${post.url}" data-shortcode="${post.shortcode}" onclick="selectPost(this)">
        <img src="${post.thumbnail}" alt="Post" loading="lazy">
        <div class="ck-post-overlay">
          <span>❤ ${formatCount(post.likes)}</span>
          <span>💬 ${formatCount(post.comments)}</span>
        </div>
        ${idx === 0 ? '<div class="ck-post-check">✓</div>' : ''}
        ${post.is_video ? '<div class="ck-post-video">▶</div>' : ''}
      </div>`;
  });

  html += '</div>';

  if (remaining > 0) {
    html += `<button type="button" class="ck-posts-more" onclick="showAllPosts()">Ver mais... (+${remaining})</button>`;
  }

  container.innerHTML = html;
  container.style.display = 'block';

  // Auto-select first post
  if (posts.length > 0) {
    selectedPostUrl = posts[0].url;
  }

  // Store full posts for "show more"
  container._allPosts = posts;
}

function selectPost(el) {
  // Deselect all
  document.querySelectorAll('.ck-post-thumb').forEach(t => {
    t.classList.remove('selected');
    const check = t.querySelector('.ck-post-check');
    if (check) check.remove();
  });

  // Select this one
  el.classList.add('selected');
  const checkDiv = document.createElement('div');
  checkDiv.className = 'ck-post-check';
  checkDiv.textContent = '✓';
  el.appendChild(checkDiv);

  selectedPostUrl = el.getAttribute('data-url');
}

function showAllPosts() {
  const container = document.getElementById('ck-posts-grid');
  const allPosts = container._allPosts;
  if (!allPosts) return;
  renderPostsGridFull(allPosts);
}

function renderPostsGridFull(posts) {
  const container = document.getElementById('ck-posts-grid');

  let html = '<p class="ck-posts-hint">👇 Clique em uma publicação para selecionar</p>';
  html += '<div class="ck-posts-thumbs ck-posts-thumbs-full">';

  posts.forEach((post, idx) => {
    const activeClass = post.url === selectedPostUrl ? ' selected' : '';
    html += `
      <div class="ck-post-thumb${activeClass}" data-url="${post.url}" data-shortcode="${post.shortcode}" onclick="selectPost(this)">
        <img src="${post.thumbnail}" alt="Post" loading="lazy">
        <div class="ck-post-overlay">
          <span>❤ ${formatCount(post.likes)}</span>
          <span>💬 ${formatCount(post.comments)}</span>
        </div>
        ${post.url === selectedPostUrl ? '<div class="ck-post-check">✓</div>' : ''}
        ${post.is_video ? '<div class="ck-post-video">▶</div>' : ''}
      </div>`;
  });

  html += '</div>';
  container.innerHTML = html;
  container._allPosts = posts;
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
