const API_URL = 'http://localhost:3001/api';
let currentProducts = [];
let deleteProductId = null;

// Check authentication on page load
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        showLogin();
        return false;
    }
    
    // Check if token is expired (8 hours)
    const tokenData = parseJwt(token);
    if (tokenData && tokenData.exp * 1000 < Date.now()) {
        localStorage.removeItem('adminToken');
        showLogin();
        return false;
    }
    
    showDashboard();
    return true;
}

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadDashboardData();
}

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            showDashboard();
        } else {
            errorDiv.textContent = data.error || 'Invalid credentials';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error. Make sure backend is running.';
        errorDiv.classList.add('show');
    }
});

// Logout
document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('adminToken');
        showLogin();
    });
});

// Tab Navigation
document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        
        // Update active tab
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(`${tab}Tab`).classList.add('active');
        
        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'products': 'Products',
            'add-product': 'Add Product',
            'prices': 'Update Prices',
            'inventory': 'Inventory'
        };
        document.getElementById('pageTitle').textContent = titles[tab];
        
        // Load tab data
        if (tab === 'dashboard') loadDashboardData();
        if (tab === 'products') loadProductsTable();
        if (tab === 'prices') loadPricesTable();
        if (tab === 'inventory') loadInventoryTable();
    });
});

// API Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('adminToken');
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    if (response.status === 401) {
        localStorage.removeItem('adminToken');
        showLogin();
        throw new Error('Unauthorized');
    }
    
    return response.json();
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const products = await fetch(`${API_URL}/products`).then(r => r.json());
        currentProducts = products;
        
        // Calculate stats
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        const lowStock = products.filter(p => p.stock < 10).length;
        const categories = [...new Set(products.map(p => p.category))].length;
        
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
        document.getElementById('lowStock').textContent = lowStock;
        document.getElementById('categories').textContent = categories;
        
        // Recent products (last 5)
        const recent = products.slice(-5).reverse();
        const tbody = document.querySelector('#recentProductsTable tbody');
        tbody.innerHTML = recent.map(p => `
            <tr>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>$${p.price}</td>
                <td>${p.stock}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn" onclick="editProduct('${p.id}')">✏️</button>
                        <button class="icon-btn" onclick="deleteProduct('${p.id}', '${p.name}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast('Failed to load dashboard data', 'error');
    }
}

// Load Products Table
async function loadProductsTable() {
    try {
        const products = await fetch(`${API_URL}/products`).then(r => r.json());
        currentProducts = products;
        renderProductsTable(products);
    } catch (error) {
        showToast('Failed to load products', 'error');
    }
}

function renderProductsTable(products) {
    const tbody = document.querySelector('#productsTable tbody');
    tbody.innerHTML = products.map(p => {
        let statusClass = 'status-in-stock';
        let statusText = 'In Stock';
        
        if (p.stock === 0) {
            statusClass = 'status-out-stock';
            statusText = 'Out of Stock';
        } else if (p.stock < 10) {
            statusClass = 'status-low-stock';
            statusText = 'Low Stock';
        }
        
        return `
            <tr>
                <td>${p.id.substring(0, 8)}</td>
                <td><img src="${p.image}" alt="${p.name}" class="product-img"></td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>$${p.price}</td>
                <td>${p.stock}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn" onclick="editProduct('${p.id}')" title="Edit">✏️</button>
                        <button class="icon-btn" onclick="showPriceUpdate('${p.id}')" title="Update Price">💰</button>
                        <button class="icon-btn" onclick="deleteProduct('${p.id}', '${p.name}')" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Search and Filter Products
document.getElementById('searchProducts')?.addEventListener('input', (e) => {
    filterProducts();
});

document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
    filterProducts();
});

function filterProducts() {
    const search = document.getElementById('searchProducts').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    const filtered = currentProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search) || 
                            p.category.toLowerCase().includes(search);
        const matchesCategory = !category || p.category === category;
        return matchesSearch && matchesCategory;
    });
    
    renderProductsTable(filtered);
}

// Add Product
document.getElementById('addProductForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const product = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        originalPrice: parseFloat(document.getElementById('productOriginalPrice').value) || parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value || 'https://via.placeholder.com/600'
    };
    
    try {
        await apiCall('/products', 'POST', product);
        showToast('Product added successfully!', 'success');
        e.target.reset();
        loadDashboardData();
    } catch (error) {
        showToast('Failed to add product', 'error');
    }
});

// Load Prices Table
async function loadPricesTable() {
    try {
        const products = await fetch(`${API_URL}/products`).then(r => r.json());
        const tbody = document.querySelector('#pricesTable tbody');
        
        tbody.innerHTML = products.map(p => `
            <tr data-id="${p.id}">
                <td>${p.name}</td>
                <td>$${p.price}</td>
                <td>
                    <input type="number" step="0.01" value="${p.price}" 
                           class="price-input" data-id="${p.id}" 
                           style="width: 120px; padding: 8px; border: 2px solid var(--border); border-radius: 6px;">
                </td>
                <td class="discount-${p.id}">0%</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="updatePrice('${p.id}')">Save</button>
                </td>
            </tr>
        `).join('');
        
        // Add input listeners for discount calculation
        document.querySelectorAll('.price-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.dataset.id;
                const product = products.find(p => p.id === id);
                const newPrice = parseFloat(e.target.value);
                const discount = ((product.price - newPrice) / product.price * 100).toFixed(1);
                document.querySelector(`.discount-${id}`).textContent = discount > 0 ? `-${discount}%` : '0%';
            });
        });
    } catch (error) {
        showToast('Failed to load prices', 'error');
    }
}

async function updatePrice(id) {
    const input = document.querySelector(`.price-input[data-id="${id}"]`);
    const newPrice = parseFloat(input.value);
    
    try {
        await apiCall(`/products/${id}/price`, 'PATCH', { price: newPrice });
        showToast('Price updated successfully!', 'success');
        loadPricesTable();
    } catch (error) {
        showToast('Failed to update price', 'error');
    }
}

// Load Inventory Table
async function loadInventoryTable(filter = 'all') {
    try {
        let products = await fetch(`${API_URL}/products`).then(r => r.json());
        
        // Apply filter
        if (filter === 'low') {
            products = products.filter(p => p.stock > 0 && p.stock < 20);
        } else if (filter === 'out') {
            products = products.filter(p => p.stock === 0);
        }
        
        const tbody = document.querySelector('#inventoryTable tbody');
        
        tbody.innerHTML = products.map(p => {
            let statusClass = 'status-in-stock';
            let statusText = 'In Stock';
            
            if (p.stock === 0) {
                statusClass = 'status-out-stock';
                statusText = 'Out of Stock';
            } else if (p.stock < 5) {
                statusClass = 'status-out-stock';
                statusText = 'Critical';
            } else if (p.stock < 20) {
                statusClass = 'status-low-stock';
                statusText = 'Low Stock';
            }
            
            return `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.category}</td>
                    <td>${p.stock}</td>
                    <td>
                        <input type="number" value="${p.stock}" 
                               class="stock-input" data-id="${p.id}"
                               style="width: 100px; padding: 8px; border: 2px solid var(--border); border-radius: 6px;">
                    </td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="updateStock('${p.id}')">Save</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        showToast('Failed to load inventory', 'error');
    }
}

async function updateStock(id) {
    const input = document.querySelector(`.stock-input[data-id="${id}"]`);
    const newStock = parseInt(input.value);
    
    try {
        await apiCall(`/products/${id}/stock`, 'PATCH', { stock: newStock });
        showToast('Stock updated successfully!', 'success');
        loadInventoryTable();
    } catch (error) {
        showToast('Failed to update stock', 'error');
    }
}

// Inventory filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadInventoryTable(btn.dataset.filter);
    });
});

// Delete Product
function deleteProduct(id, name) {
    deleteProductId = id;
    document.getElementById('deleteMessage').textContent = 
        `Are you sure you want to delete "${name}"? This cannot be undone.`;
    document.getElementById('deleteModal').classList.add('show');
}

document.getElementById('cancelDelete')?.addEventListener('click', () => {
    document.getElementById('deleteModal').classList.remove('show');
    deleteProductId = null;
});

document.getElementById('confirmDelete')?.addEventListener('click', async () => {
    if (!deleteProductId) return;
    
    try {
        await apiCall(`/products/${deleteProductId}`, 'DELETE');
        showToast('Product deleted successfully!', 'success');
        document.getElementById('deleteModal').classList.remove('show');
        deleteProductId = null;
        loadDashboardData();
        loadProductsTable();
    } catch (error) {
        showToast('Failed to delete product', 'error');
    }
});

// Edit Product (simplified - just show in add form)
function editProduct(id) {
    const product = currentProducts.find(p => p.id === id);
    if (!product) return;
    
    // Switch to add product tab
    document.querySelector('.nav-item[data-tab="add-product"]').click();
    
    // Fill form
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productOriginalPrice').value = product.originalPrice;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productImage').value = product.image;
    
    showToast('Edit mode - modify and save', 'success');
}

function showPriceUpdate(id) {
    document.querySelector('.nav-item[data-tab="prices"]').click();
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize
checkAuth();
