// ===== DATA =====
const services = {
  seguidores: {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
    label: 'Seguidores',
    desc: 'Compre seguidores no Instagram. Receba seguidores de qualquer lugar do mundo de alta qualidade e com 30 dias de proteção contra quedas, clique na quantidade para começar:',
    items: [
      { qty: '500', price: 'R$ 9,00', raw: 9.00 },
      { qty: '1.000', price: 'R$ 14,90', raw: 14.90, tag: 'Desconto de 25%' },
      { qty: '2.000', price: 'R$ 25,90', raw: 25.90, tag: 'Desconto de 35%' },
      { qty: '3.000', price: 'R$ 35,90', raw: 35.90, tag: 'Desconto de 40%' },
      { qty: '5.000', price: 'R$ 55,90', raw: 55.90, tag: 'Mais Vendido', tagColor: '#ec4899' },
      { qty: '10.000', price: 'R$ 99,90', raw: 99.90, tag: 'Desconto de 50%' },
      { qty: '20.000', price: 'R$ 189,90', raw: 189.90, tag: 'Desconto de 52%' },
      { qty: '40.000', price: 'R$ 350,90', raw: 350.90, tag: 'Desconto de 56%' },
    ]
  },
  'seguidores-br': {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
    label: 'Seguidores BR 🇧🇷',
    desc: 'Compre seguidores brasileiros no Instagram. Receba seguidores reais e ativos de alta qualidade:',
    items: [
      { qty: '300', price: 'R$ 9,99', raw: 9.99 },
      { qty: '500', price: 'R$ 27,99', raw: 27.99 },
      { qty: '1.000', price: 'R$ 49,99', raw: 49.99, tag: 'Desconto de 25%' },
      { qty: '2.000', price: 'R$ 89,99', raw: 89.99, tag: 'Desconto de 35%' },
      { qty: '5.000', price: 'R$ 199,99', raw: 199.99, tag: 'Mais Vendido', tagColor: '#ec4899' },
    ]
  },
  curtidas: {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
    label: 'Curtidas',
    desc: 'Curtidas de qualquer lugar do mundo no Instagram com entrega imediata e garantida:',
    items: [
      { qty: '300', price: 'R$ 9,99', raw: 9.99 },
      { qty: '500', price: 'R$ 11,99', raw: 11.99 },
      { qty: '1.000', price: 'R$ 19,99', raw: 19.99, tag: 'Desconto de 25%' },
      { qty: '2.000', price: 'R$ 34,99', raw: 34.99, tag: 'Desconto de 35%' },
      { qty: '5.000', price: 'R$ 79,99', raw: 79.99, tag: 'Mais Vendido', tagColor: '#ec4899' },
    ]
  },
  'curtidas-br': {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
    label: 'Curtidas BR 🇧🇷',
    desc: 'Curtidas de brasileiros no Instagram com entrega imediata e alta retenção:',
    items: [
      { qty: '100', price: 'R$ 9,99', raw: 9.99 },
      { qty: '300', price: 'R$ 12,99', raw: 12.99 },
      { qty: '500', price: 'R$ 19,99', raw: 19.99 },
      { qty: '1.000', price: 'R$ 34,99', raw: 34.99, tag: 'Desconto de 25%' },
      { qty: '2.000', price: 'R$ 59,99', raw: 59.99, tag: 'Desconto de 35%' },
    ]
  },
  views: {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    label: 'Views Reels',
    desc: 'Compre visualizações no seu Reels Instagram com entrega imediata e máxima estabilidade:',
    items: [
      { qty: '1.000', price: 'R$ 9,99', raw: 9.99 },
      { qty: '2.000', price: 'R$ 14,90', raw: 14.90 },
      { qty: '5.000', price: 'R$ 17,99', raw: 17.99, tag: 'Desconto de 30%' },
      { qty: '10.000', price: 'R$ 29,99', raw: 29.99, tag: 'Mais Vendido', tagColor: '#ec4899' },
      { qty: '50.000', price: 'R$ 99,99', raw: 99.99, tag: 'Desconto de 50%' },
    ]
  },
};

// ===== RENDER SERVICES WITH TABS =====
function renderServices() {
  const container = document.getElementById('services-container');
  if (!container) return;

  const serviceKeys = Object.keys(services);

  // Render Tabs Header
  let tabsHtml = `<div class="service-tabs-wrapper"><div class="service-tabs">`;
  serviceKeys.forEach((key, idx) => {
    const s = services[key];
    const activeClass = idx === 0 ? 'active' : '';
    tabsHtml += `
      <button type="button" class="tab-btn ${activeClass}" data-tab="${key}">
        ${s.icon}
        <span>${s.label}</span>
      </button>`;
  });
  tabsHtml += `</div></div>`;

  // Render Cards Container
  let cardsHtml = `<div class="service-cards-wrapper">`;
  serviceKeys.forEach((key, idx) => {
    const s = services[key];
    const displayStyle = idx === 0 ? 'block' : 'none';

    const buttons = s.items.map(item => {
      const tag = item.tag ? `<span class="svc-offer-badge" style="background:${item.tagColor || '#10b981'}">${item.tag}</span>` : '';
      const serviceNameOnly = s.label.replace(' 🇧🇷', '').split(' ')[0];

      return `<a href="checkout.html?service=${key}&qty=${encodeURIComponent(item.qty)}&price=${item.raw}" class="svc-offer-btn">
        ${tag}
        <div class="svc-offer-left">
          <div class="svc-offer-qty">${item.qty}</div>
          <div class="svc-offer-label">${serviceNameOnly}</div>
        </div>
        <div class="svc-offer-right">
          <div class="svc-offer-price">${item.price}</div>
          <div class="svc-offer-buy">Comprar Agora</div>
        </div>
      </a>`;
    }).join('');

    cardsHtml += `
      <div class="service-card" id="svc-panel-${key}" style="display:${displayStyle}">
        <div class="service-card-header">
          <svg class="svc-ig-icon" viewBox="0 0 24 24" width="32" height="32"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="url(#ig-grad-card)"/><defs><linearGradient id="ig-grad-card" x1="0" y1="24" x2="24" y2="0"><stop stop-color="#FFDD55"/><stop offset=".5" stop-color="#FF543E"/><stop offset="1" stop-color="#C837AB"/></linearGradient></defs></svg>
          <h3>${s.label}</h3>
        </div>
        <p class="service-card-desc">${s.desc}</p>
        <div class="svc-offer-grid">${buttons}</div>
      </div>`;
  });
  cardsHtml += `</div>`;

  container.innerHTML = tabsHtml + cardsHtml;

  // Add click listeners to tabs
  const tabBtns = container.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const selectedKey = this.getAttribute('data-tab');

      // Update active tab button
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Update visible service panel
      serviceKeys.forEach(k => {
        const panel = document.getElementById('svc-panel-' + k);
        if (panel) {
          panel.style.display = (k === selectedKey) ? 'block' : 'none';
        }
      });
    });
  });
}

renderServices();

// ===== TESTIMONIALS =====
const testimonials = [
  { name:'Mariana Silva', initial:'M', photo:'', text:'Excelente serviço! Recebi todos os seguidores muito rápido. Meu Instagram cresceu muito depois disso. Super recomendo!' },
  { name:'João Santos', initial:'J', photo:'https://i.imgur.com/SIcELa7.jpg', text:'Melhor investimento que fiz! Comprei 5000 seguidores brasileiros e o engajamento aumentou muito. Site confiável e entrega rápida.' },
  { name:'Rafael Oliveira', initial:'R', photo:'https://i.imgur.com/Q5GsUWA.jpg', text:'Comprei curtidas e recebi em menos de 10 minutos! Qualidade incrível, perfis reais. Com certeza voltarei a comprar.' },
  { name:'Camila Alencar', initial:'C', photo:'https://i.imgur.com/DjZ4axO.jpg', text:'Estava receosa no começo, mas me surpreendi! O suporte me ajudou em tudo. Meus reels bateram mais de 50k views!' },
  { name:'Ana Paula', initial:'A', photo:'https://i.imgur.com/G8Nt5ms.jpg', text:'Serviço de altíssima qualidade. Minha conta profissional ganhou muito mais credibilidade com os novos seguidores.' },
];

const track = document.getElementById('testimonial-track');
if (track) {
  const items = [...testimonials, ...testimonials];
  track.innerHTML = items.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-header">
        ${t.photo
          ? `<img src="${t.photo}" alt="${t.name}" class="testimonial-avatar-img">`
          : `<div class="testimonial-avatar">${t.initial}</div>`
        }
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-stars">★★★★★</div>
        </div>
      </div>
      <p class="testimonial-text">"${t.text}"</p>
    </div>
  `).join('');
}

// ===== FAQ ACCORDION =====
const faqs = [
  { q: 'Quanto tempo leva para os seguidores/curtidas chegarem?', a: 'A entrega começa imediatamente após a confirmação do pagamento, podendo levar de alguns minutos até poucas horas a depender da quantidade.' },
  { q: 'Preciso fornecer minha senha?', a: 'Jamais! Precisamos apenas do @ do seu perfil ou do link da sua publicação. Nunca solicitamos sua senha.' },
  { q: 'Os seguidores podem cair com o tempo?', a: 'Trabalhamos com perfis de alta qualidade. Oferecemos garantia de reposição de 30 dias para qualquer eventual queda.' },
  { q: 'O pagamento é seguro?', a: 'Sim! Utilizamos sistema de pagamento criptografado via PIX com processamento em tempo real.' },
  { q: 'Como funciona o suporte?', a: 'Nosso suporte funciona via Instagram e WhatsApp com atendimento prioritário 24 horas por dia.' },
];

const faqContainer = document.getElementById('faq-container');
if (faqContainer) {
  faqContainer.innerHTML = faqs.map(f => `
    <div class="faq-item">
      <button class="faq-question">
        <span>${f.q}</span>
        <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="faq-answer"><p>${f.a}</p></div>
    </div>
  `).join('');

  faqContainer.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.parentElement;
      const isActive = item.classList.contains('active');
      faqContainer.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}
