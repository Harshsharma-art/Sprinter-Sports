const API_URL = 'http://localhost:3001/api';

// ===== STATE =====
let products = [];
let cart = JSON.parse(localStorage.getItem('sprinter_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('sprinter_wishlist')) || [];
let activeCategory = 'All';
let activeSort = 'featured';

// ===== LOAD PRODUCTS =====
async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch');
    products = await res.json();
    renderProducts(products);
    renderBestSellers(products);
  } catch (err) {
    console.error('Error loading products:', err);
    document.getElementById('productsGrid').innerHTML =
      '<p style="padding:24px;color:#666;">Could not load products. Make sure the backend is running on port 3001.</p>';
  }
}

// ===== RENDER PRODUCTS =====
function renderProducts(list) {
  let filtered = activeCategory === 'All' ? [...list] : list.filter(p => p.category === activeCategory);

  // Sort
  if (activeSort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (activeSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (activeSort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  document.getElementById('resultsCount').textContent = `Showing ${filtered.length} products`;
  document.getElementById('productsGrid').innerHTML = filtered.map(p => productCardHTML(p)).join('');
}

function renderBestSellers(list) {
  const top = [...list].sort((a, b) => b.rating - a.rating).slice(0, 8);
  document.getElementById('bestSellersGrid').innerHTML = top.map(p => productCardHTML(p)).join('');
}

function productCardHTML(p) {
  const off = p.originalPrice > p.price
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;
  const inWishlist = wishlist.includes(String(p.id));
  const outOfStock = p.stock === 0;
  const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));

  return `
    <div class="product-card">
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x400/f5f5f5/999?text=${encodeURIComponent(p.name.split(' ').slice(0,2).join('+'))}'">
        ${p.badge ? `<span class="product-badge-top${outOfStock ? ' out' : ''}">${outOfStock ? 'Out of Stock' : p.badge}</span>` : ''}
        <button class="wishlist-btn ${inWishlist ? 'active' : ''}" onclick="toggleWishlist('${p.id}')" aria-label="Wishlist">
          ${inWishlist ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="product-info">
        <div class="product-cat">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="rating-num">${p.rating}</span>
          <span class="rating-count">(${p.reviews || 0})</span>
        </div>
        <div class="product-price">
          <span class="price-current">₹${p.price.toLocaleString()}</span>
          ${p.originalPrice > p.price ? `<span class="price-original">₹${p.originalPrice.toLocaleString()}</span>` : ''}
          ${off > 0 ? `<span class="price-off">${off}% OFF</span>` : ''}
        </div>
        <button class="btn-add-cart" onclick="addToCart('${p.id}')" ${outOfStock ? 'disabled' : ''}>
          ${outOfStock ? 'OUT OF STOCK' : '🛒 ADD TO CART'}
        </button>
      </div>
    </div>`;
}

// ===== CART =====
function addToCart(productId) {
  const product = products.find(p => String(p.id) === String(productId));
  if (!product) return;
  const existing = cart.find(item => String(item.id) === String(productId));
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart! 🛒`);
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => String(item.id) !== String(productId));
  saveCart();
  updateCartUI();
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => String(i.id) === String(productId));
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(productId);
  else { saveCart(); updateCartUI(); }
}

function saveCart() {
  localStorage.setItem('sprinter_cart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

function updateCartUI() {
  const count = getCartCount();
  const subtotal = getCartTotal();
  const delivery = subtotal >= 999 ? 0 : 99;
  const total = subtotal + delivery;

  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartItemCount').textContent = count;
  document.getElementById('cartSubtotal').textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById('cartDelivery').textContent = delivery === 0 ? 'FREE' : `₹${delivery}`;
  document.getElementById('cartTotal').textContent = `₹${total.toLocaleString()}`;

  const cartItemsEl = document.getElementById('cartItems');
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<div class="cart-empty"><span style="font-size:48px">🛒</span><p>Your cart is empty</p></div>`;
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString()}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
    </div>`).join('');
}

// ===== WISHLIST =====
function toggleWishlist(productId) {
  const id = String(productId);
  const index = wishlist.indexOf(id);
  if (index > -1) {
    wishlist.splice(index, 1);
    showToast('Removed from wishlist', 'error');
  } else {
    wishlist.push(id);
    showToast('Added to wishlist ❤️');
  }
  localStorage.setItem('sprinter_wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
  renderProducts(products);
  renderBestSellers(products);
}

function updateWishlistUI() {
  document.getElementById('wishlistCount').textContent = wishlist.length;
}

// ===== TOAST =====
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== HERO SLIDER =====
let heroIndex = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('.dot');

function goToSlide(n) {
  heroSlides[heroIndex].classList.remove('active');
  heroDots[heroIndex].classList.remove('active');
  heroIndex = (n + heroSlides.length) % heroSlides.length;
  heroSlides[heroIndex].classList.add('active');
  heroDots[heroIndex].classList.add('active');
}

document.getElementById('heroPrev').addEventListener('click', () => goToSlide(heroIndex - 1));
document.getElementById('heroNext').addEventListener('click', () => goToSlide(heroIndex + 1));
heroDots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));
setInterval(() => goToSlide(heroIndex + 1), 4000);

// ===== COUNTDOWN =====
function startCountdown() {
  let end = localStorage.getItem('sprinter_sale_end');
  if (!end || Date.now() > parseInt(end)) {
    end = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('sprinter_sale_end', end);
  }

  setInterval(() => {
    const diff = Math.max(0, parseInt(end) - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('cdH').textContent = String(h).padStart(2, '0');
    document.getElementById('cdM').textContent = String(m).padStart(2, '0');
    document.getElementById('cdS').textContent = String(s).padStart(2, '0');
  }, 1000);
}

// ===== FILTERS =====
document.getElementById('catTabs').addEventListener('click', e => {
  const btn = e.target.closest('.cat-tab');
  if (!btn) return;
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCategory = btn.dataset.cat;
  renderProducts(products);
});

document.getElementById('sortSelect').addEventListener('change', e => {
  activeSort = e.target.value;
  renderProducts(products);
});

// Category cards & nav links with data-cat
document.querySelectorAll('[data-cat]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    const cat = el.dataset.cat;
    activeCategory = cat;
    document.querySelectorAll('.cat-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === cat);
    });
    renderProducts(products);
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    // Close mobile menu if open
    document.getElementById('mobileMenu').classList.remove('open');
    document.getElementById('menuOverlay').classList.remove('open');
  });
});

// ===== SEARCH =====
document.getElementById('searchToggle').addEventListener('click', () => {
  document.getElementById('searchBar').classList.toggle('open');
  document.getElementById('searchInput').focus();
});
document.getElementById('searchClose').addEventListener('click', () => {
  document.getElementById('searchBar').classList.remove('open');
  document.getElementById('searchInput').value = '';
  renderProducts(products);
});
document.getElementById('searchInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
  document.getElementById('productsGrid').innerHTML = filtered.map(p => productCardHTML(p)).join('');
  document.getElementById('resultsCount').textContent = `Showing ${filtered.length} products`;
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});

// ===== CART EVENTS =====
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('cartClose2').addEventListener('click', e => { e.preventDefault(); closeCart(); });
document.getElementById('cartOverlay').addEventListener('click', closeCart);

// ===== MOBILE MENU =====
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.add('open');
  document.getElementById('menuOverlay').classList.add('open');
});
document.getElementById('mobileMenuClose').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('menuOverlay').classList.remove('open');
});
document.getElementById('menuOverlay').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('menuOverlay').classList.remove('open');
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length > 1) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartUI();
  updateWishlistUI();
  startCountdown();
});
