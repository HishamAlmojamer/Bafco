const api = (() => {
  const TOKEN_KEY = 'ws_token';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function request(path, { method = 'GET', token, body, isForm = false } = {}) {
    const headers = {};
    if (!isForm) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(path, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const msg = data?.error || data?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return data;
  }

  async function login({ email, password }) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    return data;
  }

  async function register({ email, password, name, phone }) {
    const data = await request('/api/auth/register', {
      method: 'POST',
      body: { email, password, name, phone }
    });
    return data;
  }

  async function getMe() {
    const token = getToken();
    if (!token) throw new Error('No token found');
    return request('/api/auth/me', { token });
  }

  async function getProducts({ q = '', categoryId = '', skip = 0, take = 100 } = {}) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('categoryId', categoryId);
    params.set('skip', skip);
    params.set('take', take);

    return request(`/api/products?${params.toString()}`);
  }

  async function getCategories() {
    return request('/api/categories');
  }

  async function createCategory(name) {
    const token = getToken();
    return request('/api/categories', {
      method: 'POST',
      token,
      body: { name }
    });
  }

  async function deleteCategory(id) {
    const token = getToken();
    return request(`/api/categories/${id}`, {
      method: 'DELETE',
      token
    });
  }

  async function createProduct({ name, description, price, categoryId, imageFile } = {}) {
    const token = getToken();
    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    form.append('price', String(price));
    if (categoryId) form.append('categoryId', categoryId);
    if (imageFile) form.append('image', imageFile);

    return request('/api/products', {
      method: 'POST',
      token,
      isForm: true,
      body: form
    });
  }

  async function updateProduct({ id, name, description, price, categoryId, imageFile } = {}) {
    const token = getToken();
    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    form.append('price', String(price));
    if (categoryId) form.append('categoryId', categoryId);
    if (imageFile) form.append('image', imageFile);

    return request(`/api/products/${id}`, {
      method: 'PUT',
      token,
      isForm: true,
      body: form
    });
  }

  async function deleteProduct(id) {
    const token = getToken();
    return request(`/api/products/${id}`, {
      method: 'DELETE',
      token
    });
  }

  return {
    getToken,
    setToken,
    clearToken,
    login,
    register,
    getMe,
    getProducts,
    getCategories,
    createCategory,
    deleteCategory,
    createProduct,
    updateProduct,
    deleteProduct
  };
})();

// Notifications & Cart Utility
const ui = (() => {
  let cart = JSON.parse(localStorage.getItem('ws_cart') || '[]');

  function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = cart.length;
  }

  function addToCart(product) {
    cart.push(product);
    localStorage.setItem('ws_cart', JSON.stringify(cart));
    updateCartBadge();
    showToast(`تم إضافة ${product.name} إلى السلة`);
  }

  return { showToast, updateCartBadge, addToCart, getCart: () => cart };
})();

function renderProductCard(item) {
  const img = item.imageUrl
    ? `<img src="${item.imageUrl}" alt="" />`
    : `<img src="https://via.placeholder.com/800x600?text=No+Image" alt="" />`;

  const category = item.category ? `<div class="category-badge">${escapeHtml(item.category.name)}</div>` : '';
  
  // Logic for badges
  let badge = '';
  if (item.description?.includes('طازج')) badge = '<div class="badge-special">طازج ✨</div>';
  else if (item.description?.includes('طبيعي')) badge = '<div class="badge-special">طبيعي 🍃</div>';
  else if (item.description?.includes('عالي الجودة')) badge = '<div class="badge-special">مميز ⭐</div>';

  const productJson = JSON.stringify(item).replace(/'/g, "\\'");

  return `
    <div class="card">
      ${badge}
      <div class="img-container">
        ${img}
      </div>
      <div class="card-body">
        ${category}
        <div class="title">${escapeHtml(item.name)}</div>
        <div class="desc">${escapeHtml(item.description || '')}</div>
        <div class="card-footer">
          <div class="price">${Number(item.price).toLocaleString()}</div>
          <button class="btn-add-cart" title="أضف للسلة" onclick="ui.addToCart(${productJson})">+</button>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

