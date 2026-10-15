const categories = ['Plumbing', 'Electrical', 'HVAC & mechanical', 'Roofing', 'Carpentry', 'Painting'];

const providers = [
  {
    id: 'rapid-flow',
    name: 'Rapid Flow Plumbing',
    person: 'Daniel Banda',
    category: 'Plumbing',
    distance: 1.2,
    area: 'Eastside',
    rating: 4.8,
    reviews: 37,
    photo: 'assets/plumber.jpg',
    initials: 'DB',
    services: ['Leak & burst pipe repair', 'Faucet and fixture installation', 'Drain clearing'],
    quote: 'Fixed our burst pipe within the hour, tidy work, no upsell.',
    reviewer: 'Sarah M.',
    date: 'September 2026'
  },
  {
    id: 'voltworks',
    name: 'Voltworks Electric',
    person: 'Chisomo Phiri',
    category: 'Electrical',
    distance: 2,
    area: 'Central',
    rating: 4.9,
    reviews: 52,
    photo: 'assets/electrician.jpg',
    initials: 'CP',
    services: ['Home rewiring', 'Lighting and outlet installation', 'Electrical fault finding'],
    quote: 'Rewired our kitchen cleanly and walked us through every step.',
    reviewer: 'James K.',
    date: 'September 2026'
  },
  {
    id: 'northline',
    name: 'Northline Mechanical',
    person: 'Peter Moyo',
    category: 'HVAC & mechanical',
    distance: 3.4,
    area: 'Northside',
    rating: 4.6,
    reviews: 28,
    photo: 'assets/mechanical.jpg',
    initials: 'PM',
    services: ['Air conditioning repairs', 'Cooling system maintenance', 'Air conditioning installation'],
    quote: 'Serviced our AC the same day and left the place spotless.',
    reviewer: 'Mary L.',
    date: 'September 2026'
  }
];

const services = providers.flatMap((provider) =>
  provider.services.map((service) => ({ provider, service }))
);

let keyword = '';
let query = '';
let category = '';
let activeChatProvider = null;

const $ = (id) => document.getElementById(id);
const escapeHtml = (value) =>
  value.replace(/[&<>\"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[character]));
const getCategoryLabel = (trade) => (trade === 'HVAC & mechanical' ? 'HVAC' : trade);

function renderTradeButtons() {
  $('tradeButtons').innerHTML = categories
    .map((trade) => {
      const isActive = category === trade;
      return `<button class="btn ${isActive ? 'btn-ink' : 'btn-trade'}" type="button" aria-pressed="${isActive}" onclick="setCategory('${trade}')">${trade}</button>`;
    })
    .join(' ');
}

function setCategory(nextCategory) {
  category = category === nextCategory ? '' : nextCategory;
  render();
}

function reset() {
  keyword = '';
  query = '';
  category = '';
  $('keyword').value = '';
  render();
}

$('searchForm').addEventListener('submit', (event) => {
  event.preventDefault();
  query = keyword;
  render();
});

$('keyword').addEventListener('input', (event) => {
  keyword = event.target.value;

  if (!event.target.value) {
    query = '';
    render();
  }
});

function render() {
  const searchTerm = query.trim().toLowerCase();
  const listings = services
    .filter(({ provider, service }) => {
      const matchesCategory = !category || provider.category === category;
      const matchesSearch =
        !searchTerm || `${service} ${provider.name} ${provider.category}`.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    })
    .sort((left, right) => {
      return right.provider.rating - left.provider.rating || left.provider.distance - right.provider.distance;
    });

  $('count').textContent = `${listings.length} ${listings.length === 1 ? 'service' : 'services'}${category ? ` | ${category}` : ''}`;
  $('resultsTitle').textContent = query || category ? 'Matching services' : 'All services near you';
  $('empty').hidden = listings.length > 0;
  $('listings').hidden = listings.length === 0;
  $('listings').style.display = listings.length ? 'grid' : 'none';

  $('listings').innerHTML = listings
    .map(({ provider, service }) => {
      const categoryLabel = getCategoryLabel(provider.category).toLowerCase();

      return `
        <article class="provider-card">
          <a href="#" onclick="showProvider('${provider.id}'); return false" aria-label="View ${escapeHtml(provider.name)}">
            <img
              src="${provider.photo}"
              alt="${escapeHtml(provider.person)} working on ${escapeHtml(categoryLabel)} services"
              loading="lazy"
              onerror="this.insertAdjacentHTML('afterend','<div class=&quot;initials&quot;>${provider.initials}</div>'); this.remove()"
            />
          </a>
          <div class="card-body">
            <div class="card-top">
              <h3>${escapeHtml(service)}</h3>
              <span class="rating">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${provider.rating.toFixed(1)}
              </span>
            </div>
            <p class="card-meta">${escapeHtml(getCategoryLabel(provider.category))} | ${escapeHtml(provider.name)}</p>
            <p class="card-area">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              ${escapeHtml(provider.area)} | ${provider.distance.toFixed(1)} km
            </p>
            <div class="card-actions">
              <button class="btn btn-athletic btn-xs" type="button" onclick="openChat('${provider.id}', '${escapeHtml(service)}')">
                Live chat
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
              </button>
              <button class="btn btn-trade btn-xs" type="button" onclick="showProvider('${provider.id}')">Provider</button>
            </div>
          </div>
        </article>
      `;
    })
    .join(' ');

  renderTradeButtons();
}

function openDialog(id) {
  $(id).dataset.open = 'true';
}

function closeDialog(id) {
  $(id).dataset.open = 'false';
}

document.querySelectorAll('.overlay').forEach((overlay) => {
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.dataset.open = 'false';
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.overlay').forEach((overlay) => {
      overlay.dataset.open = 'false';
    });
  }
});

function showReviews() {
  $('reviewList').innerHTML = providers.map((provider) => `
    <li class="review-card">
      <h3>${escapeHtml(provider.name)} <span class="rating">${provider.rating.toFixed(1)} / 5</span></h3>
      <p class="review-meta">${escapeHtml(provider.reviewer)} · ${escapeHtml(provider.date)} · ${provider.reviews} reviews</p>
      <blockquote>"${escapeHtml(provider.quote)}"</blockquote>
    </li>
  `).join('');
  openDialog('reviews');
}

function showProvider(id) {
  const provider = providers.find((item) => item.id === id);
  $('providerTitle').textContent = provider.name;
  $('providerSub').textContent = `${getCategoryLabel(provider.category)} | ${provider.area} | ${provider.distance.toFixed(1)} km | ${provider.rating.toFixed(1)} (${provider.reviews} reviews)`;
  $('providerServices').innerHTML = provider.services.map((service) => `<li>${escapeHtml(service)}</li>`).join('');
  $('providerQuote').textContent = `"${provider.quote}" - ${provider.reviewer}, ${provider.date}`;
  openDialog('provider');
}

function openChat(id, service) {
  const provider = providers.find((item) => item.id === id);
  activeChatProvider = provider;
  $('chatTitle').textContent = `Chat with ${provider.person}`;
  $('chatSub').textContent = `${provider.name} | about ${service}`;
  $('chatLog').innerHTML = `<li class="bubble">${escapeHtml(`Hi, thanks for reaching out about ${service}. Tell me what you need and I'll help.`)}</li>`;
  openDialog('chat');
  $('chatInput').focus();
}

$('chatForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = $('chatInput').value.trim();

  if (!text || !activeChatProvider) {
    return;
  }

  $('chatLog').insertAdjacentHTML('beforeend', `<li class="bubble me">${escapeHtml(text)}</li>`);
  $('chatInput').value = '';
  $('chatLog').scrollTop = $('chatLog').scrollHeight;
});

function toggleMenu() {
  const isOpen = $('menuPanel').style.display === 'grid';
  $('menuPanel').style.display = isOpen ? 'none' : 'grid';
  $('menuBtn').setAttribute('aria-expanded', String(!isOpen));
  $('menuBtn').setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  $('menuBtn').innerHTML = isOpen
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
}

render();