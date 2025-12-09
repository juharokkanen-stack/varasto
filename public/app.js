// API base URL
const API_URL = '/api/products';

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('productForm').addEventListener('submit', handleAddProduct);
    document.getElementById('editForm').addEventListener('submit', handleEditProduct);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeEditModal();
        }
    });
}

// Load all products
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const products = await response.json();
        displayProducts(products);
        updateStats(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please refresh the page.');
    }
}

// Display products in the grid
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <h3>No products yet</h3>
                <p>Add your first product using the form above</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => createProductCard(product)).join('');
}

// Create a product card HTML
function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-header">
                <div>
                    <div class="product-name">${escapeHtml(product.name)}</div>
                    ${product.category ? `<span class="product-category">${escapeHtml(product.category)}</span>` : ''}
                </div>
            </div>
            ${product.description ? `<p class="product-description">${escapeHtml(product.description)}</p>` : ''}
            <div class="product-details">
                <div class="detail-item">
                    <span class="detail-label">Price</span>
                    <span class="detail-value price">${product.price.toFixed(2)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Quantity</span>
                    <span class="detail-value quantity">${product.quantity}</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn btn-edit" onclick="openEditModal(${product.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        </div>
    `;
}

// Update statistics
function updateStats(products) {
    const totalProducts = products.length;
    const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalItems').textContent = totalItems;
}

// Handle add product form submission
async function handleAddProduct(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        quantity: parseInt(document.getElementById('quantity').value),
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to add product');
        
        // Reset form and reload products
        event.target.reset();
        await loadProducts();
        showSuccess('Product added successfully!');
    } catch (error) {
        console.error('Error adding product:', error);
        showError('Failed to add product. Please try again.');
    }
}

// Open edit modal
async function openEditModal(productId) {
    try {
        const response = await fetch(`${API_URL}/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        
        const product = await response.json();
        
        // Populate form
        document.getElementById('editId').value = product.id;
        document.getElementById('editName').value = product.name;
        document.getElementById('editDescription').value = product.description || '';
        document.getElementById('editQuantity').value = product.quantity;
        document.getElementById('editPrice').value = product.price;
        document.getElementById('editCategory').value = product.category || '';
        
        // Show modal
        document.getElementById('editModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Failed to load product details.');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editForm').reset();
}

// Handle edit product form submission
async function handleEditProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('editId').value;
    const formData = {
        name: document.getElementById('editName').value,
        description: document.getElementById('editDescription').value,
        quantity: parseInt(document.getElementById('editQuantity').value),
        price: parseFloat(document.getElementById('editPrice').value),
        category: document.getElementById('editCategory').value
    };
    
    try {
        const response = await fetch(`${API_URL}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to update product');
        
        closeEditModal();
        await loadProducts();
        showSuccess('Product updated successfully!');
    } catch (error) {
        console.error('Error updating product:', error);
        showError('Failed to update product. Please try again.');
    }
}

// Delete a product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete product');
        
        await loadProducts();
        showSuccess('Product deleted successfully!');
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product. Please try again.');
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

// Show success message
function showSuccess(message) {
    showNotification(message, 'success');
}

// Show error message
function showError(message) {
    showNotification(message, 'error');
}

// Show notification (simple implementation)
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
