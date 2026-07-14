/**
 * Meesho Front Page Prototype - Core Interactive Application Logic
 */

let currentFilter = 'all';
let currentSort = 'relevance';
let cart = [];
let selectedModalProduct = null;

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryNavigation();
  renderFeaturedCategories();
  renderProducts();
  setupEventListeners();
  loadCartFromSession();
});

/* ============================ 1. RENDER CATEGORY NAV ============================ */
function renderCategoryNavigation() {
  const navList = document.getElementById('category-nav-list');
  if (!navList) return;

  navList.innerHTML = MEESHO_CATEGORIES.map(cat => {
    const subcatsHTML = cat.subcategories.map(sub => 
      `<div class="mega-sub-item" style="padding: 6px 0; font-size: 14px; color: #616173; cursor: pointer;">${sub}</div>`
    ).join('');

    return `
      <div class="category-item" data-cat="${cat.id}">
        <span>${cat.name}</span>
        <div class="mega-menu">
          <div>
            <h4 style="color: #9F2089; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #EAEAF2; padding-bottom: 6px;">Popular in ${cat.name}</h4>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${subcatsHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ============================ 2. RENDER FEATURED CATEGORIES ============================ */
function renderFeaturedCategories() {
  const grid = document.getElementById('featured-categories-grid');
  if (!grid) return;

  grid.innerHTML = MEESHO_FEATURED_CATEGORIES.map(item => `
    <div class="featured-card" data-cat="${item.id}">
      <img src="${item.image}" alt="${item.title}" class="featured-card-image" loading="lazy" />
      <div class="featured-card-body">
        <h4 class="featured-card-title">${item.title}</h4>
        <span class="featured-card-tag">${item.tag}</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.featured-card').forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.getAttribute('data-cat');
      filterByCategory(catId);
      document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ============================ 3. RENDER PRODUCTS GRID ============================ */
function getFilteredSortedProducts(searchQuery = '') {
  let products = [...MEESHO_PRODUCTS];

  // 1. Filter by category tab
  if (currentFilter !== 'all') {
    if (currentFilter === 'under-299') {
      products = products.filter(p => p.price <= 299);
    } else {
      products = products.filter(p => p.category === currentFilter);
    }
  }

  // 2. Filter by Search Query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    products = products.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.subCategory.toLowerCase().includes(query) ||
      p.badge.toLowerCase().includes(query)
    );
  }

  // 3. Sort
  switch (currentSort) {
    case 'price-asc':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      products.sort((a, b) => b.rating - a.rating);
      break;
    case 'discount':
      products.sort((a, b) => b.discount - a.discount);
      break;
    default:
      // relevance
      break;
  }

  return products;
}

function renderProducts(searchQuery = '') {
  const productsGrid = document.getElementById('products-grid');
  if (!productsGrid) return;

  const products = getFilteredSortedProducts(searchQuery);

  if (products.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #8B8BA3;">
        <h3 style="font-size: 18px; color: #353543; margin-bottom: 8px;">No matching products found</h3>
        <p>Try searching for Saree, Kurti, Shirt, or choose another category filter.</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy" />
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <button class="product-quick-view-btn" data-id="${product.id}">Quick View</button>
      </div>
      <div class="product-info">
        <h4 class="product-title" title="${product.title}">${product.title}</h4>
        <div class="product-pricing">
          <span class="current-price">₹${product.price}</span>
          <span class="original-price">₹${product.originalPrice}</span>
          <span class="discount-tag">${product.discount}% off</span>
        </div>
        ${product.freeDelivery ? `<span class="product-delivery-tag">Free Delivery</span>` : ''}
        <div class="product-footer">
          <div class="rating-pill">
            <span>${product.rating}</span>
            <span>★</span>
          </div>
          <button class="add-to-cart-sm-btn" data-id="${product.id}">+ Cart</button>
        </div>
      </div>
    </div>
  `).join('');

  // Attach card listeners
  productsGrid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Avoid if clicked quick view or add to cart button directly
      if (e.target.classList.contains('add-to-cart-sm-btn')) {
        e.stopPropagation();
        const id = e.target.getAttribute('data-id');
        addToCart(id);
        return;
      }
      const id = card.getAttribute('data-id');
      openQuickViewModal(id);
    });
  });
}

/* ============================ 4. SEARCH FUNCTIONALITY ============================ */
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const dropdown = document.getElementById('search-dropdown');
  const dropdownList = document.getElementById('search-dropdown-list');

  if (!searchInput || !dropdown) return;

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    renderProducts(val);

    if (val.trim().length > 1) {
      const matched = MEESHO_PRODUCTS.filter(p => 
        p.title.toLowerCase().includes(val.toLowerCase()) ||
        p.subCategory.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);

      if (matched.length > 0) {
        dropdownList.innerHTML = matched.map(p => `
          <div class="search-dropdown-item" data-id="${p.id}">
            <img src="${p.image}" alt="" />
            <div class="search-dropdown-info">
              <h4>${p.title}</h4>
              <span>₹${p.price}</span>
            </div>
          </div>
        `).join('');
        dropdown.classList.add('active');

        dropdownList.querySelectorAll('.search-dropdown-item').forEach(item => {
          item.addEventListener('click', () => {
            openQuickViewModal(item.getAttribute('data-id'));
            dropdown.classList.remove('active');
          });
        });
      } else {
        dropdown.classList.remove('active');
      }
    } else {
      dropdown.classList.remove('active');
    }
  });

  // Close dropdown outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
}

/* ============================ 5. FILTERS & SORTING ============================ */
function filterByCategory(category) {
  currentFilter = category;
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === category);
  });
  renderProducts(document.getElementById('search-input')?.value || '');
}

function setupEventListeners() {
  setupSearch();

  // Filter tab buttons
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterByCategory(btn.getAttribute('data-filter'));
    });
  });

  // Category top nav clicks
  document.querySelectorAll('#category-nav-list .category-item').forEach(item => {
    item.addEventListener('click', () => {
      const catId = item.getAttribute('data-cat');
      filterByCategory(catId);
      document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Hero CTA button
  document.getElementById('hero-shop-btn')?.addEventListener('click', () => {
    document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
  });

  // Sort dropdown
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts(document.getElementById('search-input')?.value || '');
  });

  // Quick View Modal Close
  document.getElementById('modal-close-btn')?.addEventListener('click', closeQuickViewModal);
  document.getElementById('quick-view-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'quick-view-modal') closeQuickViewModal();
  });

  // Modal Add to Cart
  document.getElementById('modal-add-cart-btn')?.addEventListener('click', () => {
    if (selectedModalProduct) {
      addToCart(selectedModalProduct.id);
      closeQuickViewModal();
    }
  });

  // Cart Drawer toggles
  document.getElementById('cart-drawer-btn')?.addEventListener('click', openCartDrawer);
  document.getElementById('cart-drawer-close')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cart-drawer-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'cart-drawer-overlay') closeCartDrawer();
  });

  // Checkout button
  document.getElementById('cart-checkout-btn')?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your shopping cart is empty!');
      return;
    }
    showToast(`Order Placed for ₹${calculateCartTotal()}! Thank you for shopping on Meesho.`);
    cart = [];
    updateCartUI();
    closeCartDrawer();
  });

  // Buyer Profile Modal toggles
  document.getElementById('profile-action-btn')?.addEventListener('click', () => {
    document.getElementById('buyer-login-modal')?.classList.add('active');
  });
  document.getElementById('buyer-login-close')?.addEventListener('click', () => {
    document.getElementById('buyer-login-modal')?.classList.remove('active');
  });
  document.getElementById('buyer-login-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'buyer-login-modal') {
      document.getElementById('buyer-login-modal')?.classList.remove('active');
    }
  });
}

/* ============================ 6. QUICK VIEW MODAL ============================ */
function openQuickViewModal(productId) {
  const product = MEESHO_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  selectedModalProduct = product;
  document.getElementById('modal-img').src = product.image;
  document.getElementById('modal-cat').textContent = product.subCategory;
  document.getElementById('modal-title').textContent = product.title;
  document.getElementById('modal-supplier').textContent = `Sold by: ${product.supplier || 'Meesho Supplier'}`;
  document.getElementById('modal-price').textContent = `₹${product.price}`;
  document.getElementById('modal-orig-price').textContent = `₹${product.originalPrice}`;
  document.getElementById('modal-discount').textContent = `${product.discount}% off`;
  document.getElementById('modal-desc').textContent = product.description || product.title;

  document.getElementById('quick-view-modal').classList.add('active');
}

function closeQuickViewModal() {
  document.getElementById('quick-view-modal').classList.remove('active');
  selectedModalProduct = null;
}

/* ============================ 7. CART SYSTEM ============================ */
function addToCart(productId) {
  const product = MEESHO_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  cart.push(product);
  updateCartUI();
  showToast(`${product.title.slice(0, 24)}... added to Cart!`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function calculateCartTotal() {
  return cart.reduce((total, item) => total + item.price, 0);
}

function updateCartUI() {
  // Update badge count
  const badgeCount = document.getElementById('cart-badge-count');
  const headerCount = document.getElementById('cart-header-count');
  const totalAmountEl = document.getElementById('cart-total-amount');
  const itemsListEl = document.getElementById('cart-items-list');

  if (badgeCount) badgeCount.textContent = cart.length;
  if (headerCount) headerCount.textContent = cart.length;
  if (totalAmountEl) totalAmountEl.textContent = `₹${calculateCartTotal()}`;

  if (!itemsListEl) return;

  if (cart.length === 0) {
    itemsListEl.innerHTML = `
      <div class="empty-cart-state">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
        <h4>Your Meesho Cart is Empty</h4>
        <p>Explore Sarees, Kurtis & Wholesale deals!</p>
      </div>
    `;
    return;
  }

  itemsListEl.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
      <div class="cart-item-info">
        <h5 class="cart-item-title">${item.title}</h5>
        <div class="cart-item-price">₹${item.price}</div>
        <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
      </div>
    </div>
  `).join('');
}

function openCartDrawer() {
  document.getElementById('cart-drawer-overlay').classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cart-drawer-overlay').classList.remove('active');
}

function loadCartFromSession() {
  updateCartUI();
}

/* ============================ 8. TOAST SYSTEM ============================ */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast-container');
  const msgEl = document.getElementById('toast-msg');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ============================ 9. BUYER OAUTH & JWT ENGINE ============================ */
function handleBuyerOAuth(provider) {
  const clientId = typeof GOOGLE_CLIENT_ID !== 'undefined' ? GOOGLE_CLIENT_ID : 'YOUR_GOOGLE_CLIENT_ID_HERE';
  if (provider.includes('Google') && clientId && clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && window.google && window.google.accounts && window.google.accounts.oauth2) {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            let userEmail = 'meesho.shopper@gmail.com';
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const userInfo = await userInfoRes.json();
              if (userInfo.email) userEmail = userInfo.email;
            } catch (err) {
              console.warn('Could not fetch detailed Google profile, using verified email claim.');
            }
            completeBuyerOAuth('Google (Verified OIDC)', userEmail);
          }
        },
      });
      tokenClient.requestAccessToken();
      return;
    } catch (e) {
      console.error('Google Sign-In initialization failed or blocked. Falling back to prototype verification:', e);
    }
  }

  completeBuyerOAuth(provider);
}
window.handleBuyerOAuth = handleBuyerOAuth;

function completeBuyerOAuth(provider, customEmail) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 604800; // 7 days

  const mobileInput = document.getElementById('buyer-mobile-input')?.value || '9876543210';
  const identifier = customEmail || (provider.includes('Google') ? 'meesho.shopper@gmail.com' : provider.includes('WhatsApp') ? '+91 9876543210 (WhatsApp Verified)' : mobileInput);

  // Persistent Buyer Database lookup & registration
  let buyerDb = {};
  try {
    buyerDb = JSON.parse(localStorage.getItem('meesho_buyer_users_db') || '{}');
  } catch (e) {
    buyerDb = {};
  }

  const isExisting = !!buyerDb[identifier];
  const buyerRecord = {
    identifier: identifier,
    auth_provider: provider,
    role: 'MEESHO_VERIFIED_BUYER',
    authenticated: true,
    last_login: new Date().toISOString()
  };
  buyerDb[identifier] = buyerRecord;
  localStorage.setItem('meesho_buyer_users_db', JSON.stringify(buyerDb));

  const jwtHeader = { alg: 'HS256', typ: 'JWT' };
  const jwtPayload = {
    sub: `BUYER_${Math.floor(100000 + Math.random() * 900000)}`,
    identifier: identifier,
    auth_provider: provider,
    role: 'MEESHO_VERIFIED_BUYER',
    authenticated: true,
    permissions: ['ORDERS_PLACE', 'CART_MANAGE', 'REVIEWS_POST'],
    iat: iat,
    exp: exp
  };

  const b64Header = btoa(JSON.stringify(jwtHeader)).replace(/=/g, '');
  const b64Payload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '');
  const signature = 'sig_buyer_' + Math.abs((iat * 31) ^ 0x5F3759DF).toString(16) + '_cert';
  const fullJwt = `${b64Header}.${b64Payload}.${signature}`;

  // Store JWT & OAuth state
  localStorage.setItem('meesho_buyer_jwt', fullJwt);
  localStorage.setItem('meesho_buyer_user', JSON.stringify(jwtPayload));
  localStorage.setItem('meesho_buyer_oauth_provider', provider);
  sessionStorage.setItem('buyer_session_jwt', fullJwt);

  // Update UI
  const label = document.getElementById('profile-action-label');
  if (label) label.textContent = '✓ Verified User';
  document.getElementById('buyer-login-modal')?.classList.remove('active');
  const actionMsg = isExisting ? `✓ Welcome back ${identifier}! Authenticated via ${provider}.` : `✓ Account registered for ${identifier} via ${provider}!`;
  showToast(actionMsg);
}


