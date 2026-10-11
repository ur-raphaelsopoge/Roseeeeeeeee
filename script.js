const PRODUCTS = [
  { id: 'tee-kurapika', name: 'Kurapika HXH T-shirt', category: 'T-Shirts', price: 399, image: 'images/tee-kurapika.jpg' },
  { id: 'tee-chrollo', name: 'Chrollo Lucilfer T-shirt', category: 'T-Shirts', price: 499, image: 'images/tee-chrollo.jpg' },
  { id: 'hoodie-kurapika', name: 'Kurapika Hoodie', category: 'Hoodies', price: 799, image: 'images/hoodie-kurapika.jpg' },
  { id: 'hoodie-gon-killua', name: 'Gon x Killua Hoodie', category: 'Hoodies', price: 899, image: 'images/hoodie-gon-killua.jpg' },
  { id: 'jeans-hisoka', name: 'Hisoka Painted Jeans', category: 'Pants', price: 999, image: 'images/jeans-hisoka.png' },
  { id: 'jeans-shizuku', name: 'Shizuku Murasaki Painted Jeans', category: 'Pants', price: 1199, image: 'images/jeans-shizuku.png' },
];

const CART_KEY = 'monkey_cart';
const SESSION_KEY = 'monkey_session';
const NOTICE_KEY = 'monkey_notice';

const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const nav = document.getElementById('nav');
const menuToggle = document.getElementById('menuToggle');
const searchInput = document.getElementById('searchInput');
const filters = document.getElementById('filters');
const productList = document.getElementById('productList');
const emptyMessage = document.getElementById('emptyMessage');
const authLink = document.getElementById('authLink');
const userName = document.getElementById('userName');
const heroLogin = document.getElementById('heroLogin');
const cartToggle = document.getElementById('cartToggle');
const cartClose = document.getElementById('cartClose');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartFoot = document.getElementById('cartFoot');
const cartTotal = document.getElementById('cartTotal');
const overlay = document.getElementById('overlay');
const toast = document.getElementById('toast');

let activeCategory = 'all';
let searchQuery = '';
let toastTimer;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    showToast('Could not save your changes in this browser.');
  }
}

function findProduct(id) {
  return PRODUCTS.find((product) => product.id === id);
}

function loadCart() {
  const saved = readStorage(CART_KEY, {});
  const cleaned = {};

  Object.entries(saved).forEach(([id, qty]) => {
    if (findProduct(id) && Number.isInteger(qty) && qty > 0) cleaned[id] = qty;
  });

  return cleaned;
}

let cart = loadCart();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function productCard(product) {
  return `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-body">
        <h4 class="product-name">${product.name}</h4>
        <p class="product-price">${peso.format(product.price)}</p>
        <button type="button" class="btn btn-primary btn-block" data-add="${product.id}">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </article>`;
}

function renderProducts() {
  const visible = PRODUCTS.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  emptyMessage.hidden = visible.length > 0;

  const categories = [...new Set(visible.map((product) => product.category))];

  productList.innerHTML = categories
    .map((category) => `
      <div class="category">
        <h3 class="category-title">${category}</h3>
        <div class="product-grid">
          ${visible.filter((product) => product.category === category).map(productCard).join('')}
        </div>
      </div>`)
    .join('');
}

function saveCart() {
  writeStorage(CART_KEY, cart);
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  showToast(`${findProduct(id).name} added to cart.`);
}

function changeQuantity(id, change) {
  const next = (cart[id] || 0) + change;

  if (next <= 0) {
    delete cart[id];
  } else {
    cart[id] = next;
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart).map(([id, qty]) => ({ product: findProduct(id), qty }));
  const itemCount = entries.reduce((sum, entry) => sum + entry.qty, 0);
  const total = entries.reduce((sum, entry) => sum + entry.product.price * entry.qty, 0);

  cartItems.innerHTML = entries
    .map(({ product, qty }) => `
      <li class="cart-item">
        <img class="cart-thumb" src="${product.image}" alt="">
        <div>
          <p class="cart-name">${product.name}</p>
          <p class="cart-price">${peso.format(product.price)}</p>
          <div class="qty">
            <button type="button" data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity">&minus;</button>
            <span>${qty}</span>
            <button type="button" data-action="increase" data-id="${product.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button type="button" class="remove" data-action="remove" data-id="${product.id}" aria-label="Remove ${product.name}">&times;</button>
      </li>`)
    .join('');

  cartCount.textContent = itemCount;
  cartCount.hidden = itemCount === 0;
  cartEmpty.hidden = itemCount > 0;
  cartFoot.hidden = itemCount === 0;
  cartTotal.textContent = peso.format(total);
}

function openCart() {
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  overlay.classList.add('show');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('show');
}

function getSession() {
  return readStorage(SESSION_KEY, null);
}

function updateAuthUI() {
  const session = getSession();

  authLink.textContent = session ? 'Logout' : 'Login';
  authLink.href = session ? '#' : 'login.html';
  userName.textContent = session ? `Hi, ${session.username}` : '';
  heroLogin.hidden = Boolean(session);
}

function checkout() {
  const session = getSession();

  if (!session) {
    sessionStorage.setItem(NOTICE_KEY, JSON.stringify({
      text: 'Please log in to complete your order.',
      type: 'info',
    }));
    window.location.href = 'login.html';
    return;
  }

  clearCart();
  closeCart();
  showToast(`Thanks, ${session.username}! Your order has been placed.`);
}

function setMenu(open) {
  nav.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('i').className = open ? 'fas fa-xmark' : 'fas fa-bars';
}

menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  renderProducts();
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  setMenu(false);
});

filters.addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;

  activeCategory = chip.dataset.category;

  filters.querySelectorAll('.chip').forEach((button) => {
    const isActive = button === chip;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  renderProducts();
});

productList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (button) addToCart(button.dataset.add);
});

productList.addEventListener('error', (event) => {
  if (event.target.tagName !== 'IMG') return;

  const frame = event.target.closest('.product-image');
  event.target.remove();
  frame.insertAdjacentHTML(
    'beforeend',
    '<span class="image-fallback"><i class="fas fa-shirt"></i>Image unavailable</span>'
  );
}, true);

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === 'increase') changeQuantity(id, 1);
  if (action === 'decrease') changeQuantity(id, -1);
  if (action === 'remove') removeFromCart(id);
});

authLink.addEventListener('click', (event) => {
  if (!getSession()) return;

  event.preventDefault();
  localStorage.removeItem(SESSION_KEY);
  updateAuthUI();
  showToast('You have been logged out.');
});

cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.getElementById('checkoutBtn').addEventListener('click', checkout);
document.getElementById('clearCart').addEventListener('click', clearCart);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCart();
});

document.getElementById('year').textContent = new Date().getFullYear();

renderProducts();
renderCart();
updateAuthUI();