// api.js - Pointing to the Render backend for split-stack hosting
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? '/api' 
    : 'https://onlineshoppingweb.onrender.com/api';

const api = {
    async fetch(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
                ...options, 
                headers: { ...headers, ...options.headers } 
            });
            
            if (response.status === 401 || response.status === 403) {
                // Only redirect if we were actually trying to do something authenticated
                if (token) {
                    localStorage.removeItem('token'); 
                    localStorage.removeItem('user');
                    window.location.href = '/login.html';
                }
            }
            return response.json();
        } catch (e) {
            console.error('API Error:', e);
            return { success: false, message: 'Network error or server unavailable' };
        }
    },

    // Auth
    async login(email, password) {
        return this.fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async register(fullName, email, password) {
        return this.fetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password })
        });
    },

    async updateProfile(profileData) {
        return this.fetch('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // Products
    async getProducts(page = 0, size = 20) {
        return this.fetch(`/products?page=${page}&size=${size}`);
    },

    async getProduct(id) {
        return this.fetch(`/products/${id}`);
    },

    // Orders
    async createOrder(orderData) {
        return this.fetch('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    async getMyOrders() {
        return this.fetch('/orders');
    }
};

// Compatibility shim for existing code that might use ProductStore/OrderStore
const ProductStore = {
    async getAll() {
        const res = await api.getProducts();
        return res.success ? res.data.content : [];
    },
    async getById(id) {
        const res = await api.getProduct(id);
        return res.success ? res.data : null;
    }
};
