// cart.js - Cart logic with INR + checkout redirect
document.addEventListener('DOMContentLoaded', () => {
    renderCartPage();
    document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
});

function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function renderCartPage() {
    const cart = getCartItems();
    const container = document.getElementById('cart-items-container');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🛒</div>
                <h3 style="margin-bottom:0.5rem">Your cart is empty</h3>
                <p style="margin-bottom:1.5rem;color:#6b7280">Looks like you haven't added anything yet.</p>
                <a href="/index.html" class="btn btn-primary">Start Shopping</a>
            </div>`;
        updateSummary(0);
        document.getElementById('checkout-btn').disabled = true;
        return;
    }

    document.getElementById('checkout-btn').disabled = false;
    let subtotal = 0;

    container.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return `
            <div class="cart-item">
                <img src="${item.imageUrl}" alt="${item.title}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/90'">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <div class="cart-item-price">${formatINR(item.price)} each</div>
                    <div style="font-size:0.8rem;color:#6b7280;margin-top:0.2rem">Item total: <strong>${formatINR(itemTotal)}</strong></div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">−</button>
                    <span class="qty-count">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="qty-btn" style="color:#ef4444;border-color:#fca5a5" onclick="removeItem(${index})" title="Remove">🗑</button>
                </div>
            </div>`;
    }).join('');

    updateSummary(subtotal);
}

function updateQuantity(index, change) {
    const cart = getCartItems();
    cart[index].quantity = Math.max(0, cart[index].quantity + change);
    if (cart[index].quantity === 0) cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartPage();
    renderNavbar();
}

function removeItem(index) {
    const cart = getCartItems();
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartPage();
    renderNavbar();
}

function updateSummary(subtotal) {
    const shipping = subtotal >= 499 ? 0 : (subtotal > 0 ? 49 : 0);
    const total = subtotal + shipping;
    document.getElementById('summary-subtotal').textContent = formatINR(subtotal);
    document.getElementById('summary-shipping').textContent = shipping === 0 && subtotal > 0 ? 'FREE 🎉' : formatINR(shipping);
    document.getElementById('summary-total').textContent = formatINR(total);
}

function handleCheckout() {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login to continue checkout.');
        window.location.href = '/login.html?redirect=cart';
        return;
    }
    window.location.href = '/checkout.html';
}
