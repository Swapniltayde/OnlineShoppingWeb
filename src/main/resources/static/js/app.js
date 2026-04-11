// app.js - Main UI Logic (role-aware)
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderNavbar();
    initAnimations();
    if (document.getElementById('product-grid')) loadProducts();
    if (document.getElementById('product-detail'))  loadProductDetail();
}

/* ─── Animations ─────────────────────────────────────────── */
function initAnimations() {
    // 1. Navbar glass effect on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // 2. Button ripple on every click
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = btn.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top  = (e.clientY - rect.top)  + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    });

    // 3. Cart badge pop — observer watches for badge appearance
    const obs = new MutationObserver(() => {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.classList.remove('pop');
            // Force reflow so animation replays
            void badge.offsetWidth;
            badge.classList.add('pop');
        }
    });
    const navEl = document.getElementById('navbar');
    if (navEl) obs.observe(navEl, { subtree: true, childList: true });
}

/* ─── Helpers ────────────────────────────────────────────── */
function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
function getCartItems() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
}
function isAdmin() {
    const u = getCurrentUser();
    return u && u.role === 'ADMIN';
}

/* ─── Toast ──────────────────────────────────────────────── */
function showToast(message, type = 'info') {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        document.body.appendChild(toast);
    }
    const bg = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#1f2937';
    toast.style.cssText = `position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;
        background:${bg};color:#fff;padding:0.9rem 1.4rem;border-radius:12px;
        font-size:0.9rem;font-family:'Inter',sans-serif;box-shadow:0 8px 24px rgba(0,0,0,0.25);
        display:flex;align-items:center;gap:0.6rem;max-width:340px;
        animation:slideInToast 0.3s ease;`;
    toast.innerHTML = message;
    toast.style.display = 'flex';
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

async function addToCart(productId) {
    if (isAdmin()) { showToast('⚠️ Admins cannot add items to cart.', 'error'); return; }
    
    // We must await the product details from the backend
    const product = await ProductStore.getById(productId);
    
    if (!product) {
        showToast('❌ Could not add product to cart.', 'error');
        return;
    }

    const cart = getCartItems();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    renderNavbar();
    showToast(`🛒 "${product.title.substring(0, 30)}..." added to cart!`, 'success');
}

/* ─── Navbar ─────────────────────────────────────────────── */
function renderNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const user = getCurrentUser();
    const cartCount = getCartItems().reduce((acc, item) => acc + item.quantity, 0);
    const admin = isAdmin();

    const userSection = user
        ? `<div class="nav-user-wrap">
                <button class="nav-avatar-btn" id="avatar-btn" onclick="toggleProfileDropdown()">
                    <div class="nav-avatar ${admin ? 'admin-avatar' : ''}">${user.fullName ? user.fullName[0].toUpperCase() : 'U'}</div>
                    <span class="nav-username">${user.fullName ? user.fullName.split(' ')[0] : 'User'} ${admin ? '<span class="admin-tag">Admin</span>' : ''}</span>
                    <span class="avatar-caret">▾</span>
                </button>
                <div class="profile-dropdown" id="profile-dropdown">
                    <div class="profile-header ${admin ? 'admin-header' : ''}">
                        <div class="profile-avatar-lg">${user.fullName ? user.fullName[0].toUpperCase() : 'U'}</div>
                        <div>
                            <div class="profile-name">${user.fullName || 'User'}</div>
                            <div class="profile-tag">${admin ? '🔑 Administrator' : '🛍️ Customer Account'}</div>
                        </div>
                    </div>
                    <div class="profile-info-grid">
                        <div class="profile-info-item"><span class="pi-icon">✉️</span><div><div class="pi-label">Email</div><div class="pi-value">${user.email || '—'}</div></div></div>
                        <div class="profile-info-item"><span class="pi-icon">📱</span><div><div class="pi-label">Mobile</div><div class="pi-value">${user.mobile || '—'}</div></div></div>
                        <div class="profile-info-item"><span class="pi-icon">📍</span><div><div class="pi-label">City</div><div class="pi-value">${user.city || '—'}</div></div></div>
                        <div class="profile-info-item"><span class="pi-icon">📅</span><div><div class="pi-label">Member Since</div><div class="pi-value">${user.memberSince || 'Apr 2026'}</div></div></div>
                    </div>
                    <div class="profile-actions">
                        <a href="#" class="profile-action-link" onclick="openEditProfile(); return false;">✏️ Edit Profile</a>
                        ${admin ? `<a href="/admin.html" class="profile-action-link">⚙️ Admin Dashboard</a>` : `<a href="/orders.html" class="profile-action-link">📦 My Orders</a>`}
                        ${!admin ? `<a href="/cart.html" class="profile-action-link">🛒 My Cart</a>` : ''}
                        <a href="#" class="profile-action-link logout-link" onclick="logout(); return false;">🚪 Sign Out</a>
                    </div>
                </div>
           </div>`
        : `<a href="/login.html" class="nav-login-btn">Login / Register</a>`;

    navbar.innerHTML = `
        <div class="container nav-content">
            <a href="/index.html" class="nav-brand"><span class="brand-icon">🛍️</span>Online Shopping Web</a>
            <button class="nav-hamburger" onclick="toggleMobileMenu()">☰</button>
            <div class="nav-links" id="nav-links">
                <a href="/index.html">Home</a>
                <a href="/index.html#products">Products</a>
                ${admin
                    ? `<a href="/admin.html" class="admin-nav-link">⚙️ Admin Panel</a>`
                    : `<a href="/cart.html" class="nav-cart-link">🛒 Cart ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}</a>
                       <a href="/orders.html">📦 Orders</a>`
                }
                ${userSection}
            </div>
        </div>`;

    document.addEventListener('click', (e) => {
        const dd = document.getElementById('profile-dropdown');
        const btn = document.getElementById('avatar-btn');
        if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) dd.classList.remove('open');
    }, { once: false });

    // Inject Edit Profile Modal if it doesn't exist yet
    if (!document.getElementById('edit-profile-modal') && user) {
        const modal = document.createElement('div');
        modal.id = 'edit-profile-modal';
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h2>Edit Profile</h2>
                    <button class="modal-close" onclick="closeEditProfile()">×</button>
                </div>
                <div class="modal-body form-grid">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="ep-name" class="form-control" value="${user.fullName || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" id="ep-email" class="form-control" value="${user.email || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Mobile No.</label>
                        <input type="tel" id="ep-mobile" class="form-control" value="${user.mobile || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">City</label>
                        <input type="text" id="ep-city" class="form-control" value="${user.city || ''}">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label class="form-label">Full Address</label>
                        <textarea id="ep-address" class="form-control" rows="2">${user.address || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem;">
                    <button class="btn btn-outline" onclick="closeEditProfile()">Cancel</button>
                    <button class="btn btn-primary" onclick="saveProfile()">Save Changes</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }
}

function toggleProfileDropdown() {
    document.getElementById('profile-dropdown')?.classList.toggle('open');
}
function toggleMobileMenu() {
    document.getElementById('nav-links')?.classList.toggle('mobile-open');
}

function openEditProfile() {
    toggleProfileDropdown();
    const modal = document.getElementById('edit-profile-modal');
    if (modal) modal.classList.add('show');
}
function closeEditProfile() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) modal.classList.remove('show');
}
async function saveProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    const btn = document.querySelector('#edit-profile-modal .btn-primary');
    const oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const profileData = {
        fullName: document.getElementById('ep-name').value,
        mobile: document.getElementById('ep-mobile').value,
        city: document.getElementById('ep-city').value,
        address: document.getElementById('ep-address').value
    };
    
    const res = await api.updateProfile(profileData);
    
    if (res.success) {
        // res.data contains the updated User object
        const updatedUser = { ...user, ...res.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        closeEditProfile();
        showToast('✅ Profile updated in database!', 'success');
        renderNavbar(); 
    } else {
        showToast('❌ Failed to update profile: ' + (res.message || 'Server error'), 'error');
    }
    
    btn.disabled = false;
    btn.textContent = oldText;
}

/* ─── Product Grid (Users) ───────────────────────────────── */
async function loadProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = `<div class="skeleton-grid">${Array(8).fill('<div class="skeleton-card"><div class="sk-img"></div><div class="sk-line"></div><div class="sk-line short"></div></div>').join('')}</div>`;
    const response = await api.getProducts();
    if (!response.success) { grid.innerHTML = '<p style="text-align:center;padding:3rem">Failed to load products.</p>'; return; }
    const products = response.data.content;
    if (products.length === 0) { grid.innerHTML = '<p style="text-align:center;padding:3rem;color:#6b7280">No products available yet.</p>'; return; }
    grid.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <a href="/product-detail.html?id=${product.id}" class="product-img-link">
                <img src="${product.imageUrl}" alt="${product.title}" class="product-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                <span class="product-category-badge">${product.category}</span>
            </a>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price">${formatINR(product.price)}</div>
                    <div class="product-rating">⭐ 4.${(product.id % 5) + 1}</div>
                </div>
                <div class="product-btn-row">
                    <a href="/product-detail.html?id=${product.id}" class="btn btn-outline btn-sm">View</a>
                    ${isAdmin()
                        ? `<a href="/admin.html" class="btn btn-sm" style="background:#7c3aed;color:#fff">Edit</a>`
                        : `<button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">Add to Cart</button>`
                    }
                </div>
            </div>`;
        grid.appendChild(card);
    });

    // ── Scroll-reveal with stagger ──────────────────
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cards = Array.from(grid.querySelectorAll('.product-card'));
                const idx   = cards.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, idx * 80); // 80ms stagger per card
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    grid.querySelectorAll('.product-card').forEach(card => observer.observe(card));
}

/* ─── Product Detail ─────────────────────────────────────── */
async function loadProductDetail() {
    const id = new URLSearchParams(window.location.search).get('id') || 1;
    const detailContainer = document.getElementById('product-detail');
    const response = await api.getProduct(id);
    if (!response.success || !response.data) { detailContainer.innerHTML = '<p style="text-align:center;padding:4rem">Product not found.</p>'; return; }
    const product = response.data;
    document.title = `${product.title} - Online Shopping Web`;
    detailContainer.innerHTML = `
        <div class="detail-img-wrap">
            <img src="${product.imageUrl}" alt="${product.title}" class="detail-image" onerror="this.src='https://via.placeholder.com/500x500?text=No+Image'">
        </div>
        <div class="detail-info">
            <span class="product-category-badge" style="margin-bottom:1rem;display:inline-block">${product.category}</span>
            <h1>${product.title}</h1>
            <div class="detail-rating">⭐⭐⭐⭐⭐ <span style="color:#6b7280;font-size:0.9rem">(1,284 ratings)</span></div>
            <div class="stock-badge">✅ In Stock (${product.stockQuantity} units left)</div>
            <div class="detail-price">${formatINR(product.price)}</div>
            <p class="detail-desc">${product.description} Comes with 1 year manufacturer warranty and free shipping across India.</p>
            ${isAdmin()
                ? `<a href="/admin.html" class="btn btn-primary" style="padding:0.85rem 2rem">⚙️ Manage in Admin Panel</a>`
                : `<div class="detail-actions">
                        <div class="qty-selector">
                            <button onclick="changeQty(-1)">−</button>
                            <span id="qty-display">1</span>
                            <button onclick="changeQty(1)">+</button>
                        </div>
                        <button class="btn btn-primary" style="padding:0.85rem 2rem;font-size:1rem" id="add-cart-btn"
                            onclick="addToCartDetail(${product.id})">🛒 Add to Cart</button>
                   </div>
                   <div class="detail-badges">
                       <div class="detail-badge">🚚 Free Delivery</div>
                       <div class="detail-badge">↩️ 30-Day Returns</div>
                       <div class="detail-badge">🔒 Secure Payment</div>
                   </div>`
            }
        </div>`;
    window._qty = 1;
}

async function addToCartDetail(productId) {
    const qty = window._qty || 1;
    for (let i = 0; i < qty; i++) {
        await addToCart(productId);
    }
}
function changeQty(delta) {
    window._qty = Math.max(1, (window._qty || 1) + delta);
    const el = document.getElementById('qty-display');
    if (el) el.textContent = window._qty;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}
