// PrivateBox - User App
import { database } from './firebase.js';
import { ref, set, push, remove, onValue } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

// ========== DỮ LIỆU SẢN PHẨM ==========
const products = [
  { id: 1, name: "Viên uống bổ sung sinh lý nam (hàu, kẽm)", price: 120000 },
  { id: 2, name: "Nước uống tăng năng lượng (Red Bull, Sting…)", price: 15000 },
  { id: 3, name: "Khăn giấy ướt", price: 15000 },
  { id: 4, name: "Dung dịch vệ sinh cá nhân", price: 80000 },
  { id: 5, name: "Bao cao su nữ (ít phổ biến)", price: 50000 },
  { id: 6, name: "Gel massage thư giãn", price: 100000 },
  { id: 7, name: "Nến thơm", price: 70000 },
  { id: 8, name: "Nước hoa mini", price: 120000 },
  { id: 9, name: "Thuốc tránh thai khẩn cấp loại phổ thông", price: 25000 },
  { id: 10, name: "Thuốc tránh thai khẩn cấp loại tốt (Postinor)", price: 60000 },
  { id: 11, name: "Mì gói", price: 7000 },
  { id: 12, name: "Bánh Oreo gói nhỏ", price: 26000 },
  { id: 13, name: "Snack Poca nhỏ", price: 6000 },
  { id: 14, name: "Xúc xích tiệt trùng", price: 10000 },
  { id: 15, name: "Nước suối chai 500ml", price: 10000 },
  { id: 16, name: "Nước ngọt lon (Coca/Pepsi)", price: 15000 },
  { id: 17, name: "Trà đóng chai C2", price: 10000 },
  { id: 18, name: "Cà phê lon", price: 20000 },
  { id: 19, name: "Bao cao su nam", price: 20000 }
];

// ========== STATE QUẢN LÝ ==========
let cartNormal = []; // Giỏ hàng Mua Ngay: [{id, name, price, quantity}]
let cartSecure = []; // Giỏ hàng Mua Bảo Mật: [{id, name, price, quantity}]
let currentPurchaseType = null; // 'normal' hoặc 'secure'
let currentPage = 'home'; // home, products, cart, checkout
let quantities = {};

// Function để lấy giỏ hàng hiện tại
function getCurrentCart() {
  return currentPurchaseType === 'normal' ? cartNormal : cartSecure;
}

// Function để set giỏ hàng hiện tại
function setCurrentCart(items) {
  if (currentPurchaseType === 'normal') {
    cartNormal = items;
  } else {
    cartSecure = items;
  }
}

// ========== DOM ELEMENTS ==========
const navbar = document.querySelector('nav');
const mainContent = document.getElementById('main-content');
const cartBadge = document.getElementById('cart-badge');
const cartBtn = document.getElementById('cart-btn');
const homeBtn = document.getElementById('home-btn');

// ========== HIỂN THỊ TRANG CHỦ ==========
function showHome() {
  currentPage = 'home';
  currentPurchaseType = null;
  mainContent.innerHTML = `
    <div class="hero-section">
      <div class="hero-content">
        <h1>PrivateBox</h1>
        <p>Mua sắm an toàn, tiện lợi - Giao hàng bảo mật</p>
        <div class="purchase-options">
          <button class="btn-primary" onclick="window.selectPurchaseType('normal')">
            <i class="icon">🛍️</i>
            <span>Mua Ngay</span>
          </button>
          <button class="btn-primary" onclick="window.selectPurchaseType('secure')">
            <i class="icon">🔒</i>
            <span>Mua Bảo Mật</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ========== CHỌN LOẠI MUA HÀNG ==========
window.selectPurchaseType = function(type) {
  currentPurchaseType = type;
  showProducts();
};

// ========== HIỂN THỊ TRANG SẢN PHẨM ==========
function showProducts() {
  currentPage = 'products';
  const typeLabel = currentPurchaseType === 'normal' ? '🛍️ Mua Ngay' : '🔒 Mua Bảo Mật';
  
  mainContent.innerHTML = `
    <div class="products-header">
      <h1>${typeLabel}</h1>
      <button class="btn-secondary" onclick="window.showHome()" style="margin-top: 1rem;">← Quay lại chọn loại</button>
    </div>
    <div class="products-container">
      <h2>Sản Phẩm Nổi Bật</h2>
      <div class="product-grid" id="product-grid"></div>
    </div>
  `;
  renderProducts();
}

// ========== HIỂN THỊ SẢN PHẨM ==========
/*function renderProducts() {
  const grid = document.getElementById('product-grid');
  const stock = quantities[product.id]?.quantity || 0;
  grid.innerHTML = products.map(product => `
    <div class="product-card ${stock === 0 ? 'out-of-stock' : ''}">
      <div class="product-image"><img src="assets/images/products/product-${String(product.id).padStart(3, '0')}.jpg" alt="${product.name}"></div>
      <h3>${product.name}</h3>
      <p class="product-price">${product.price.toLocaleString()}₫</p>
      <p class="product-stock">
        ${stock > 0 ? `Còn: ${stock}` : 'Hết hàng'}
      </p>
      <button  class="btn-add-to-cart"  ${stock === 0 ? 'disabled' : ''}  onclick="window.addToCart(${product.id})">
        + Thêm vào giỏ
      </button>
    </div>
  `).join('');
}*/
function renderProducts() {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = products.map(product => {
    const stock = quantities[product.id]?.quantity || 0;
    return `
      <div class="product-card ${stock === 0 ? 'out-of-stock' : ''}">
        <div class="product-image">
          <img src="assets/images/products/product-${String(product.id).padStart(3, '0')}.jpg" alt="${product.name}">
        </div>
        <h3>${product.name}</h3>
        <p class="product-price">${product.price.toLocaleString()}₫</p>
        <p class="product-stock">
          ${stock > 0 ? `Còn: ${stock}` : 'Hết hàng'}
        </p>
        <button 
          class="btn-add-to-cart"
          ${stock === 0 ? 'disabled' : ''}
          onclick="window.addToCart(${product.id})">
          + Thêm vào giỏ
        </button>
      </div>
    `;
  }).join('');
}

// ========== THÊM VÀO GIỎ HÀNG ==========
window.addToCart = function(productId) {
  const product = products.find(p => p.id === productId);
  const cart = getCurrentCart();
  const existingItem = cart.find(item => item.id === productId);
  const stock = quantities[productId]?.quantity || 0;
  if (stock <= 0) {
    showNotification('❌ Sản phẩm đã hết hàng!');
    return;
  }
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }
  
  setCurrentCart(cart);
  updateCartUI();
  showNotification('✅ Đã thêm vào giỏ hàng!');
};

// ========== CẬP NHẬT UI GIỎ HÀNG ==========
function updateCartUI() {
  const cart = getCurrentCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
  if (totalItems > 0) {
    cartBadge.style.display = 'block';
  } else {
    cartBadge.style.display = 'none';
  }
}

// ========== HIỂN THỊ GIỎ HÀNG ==========
function showCart() {
  currentPage = 'cart';
  const cart = getCurrentCart();
  const typeLabel = currentPurchaseType === 'normal' ? '🛍️ Mua Ngay' : '🔒 Mua Bảo Mật';
  
  if (cart.length === 0) {
    mainContent.innerHTML = `
      <div class="empty-cart">
        <h2>🛒 Giỏ hàng của bạn trống</h2>
        <button class="btn-primary" onclick="window.showProducts()">← Quay lại mua sắm</button>
      </div>
    `;
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  mainContent.innerHTML = `
    <div class="cart-container">
      <h2>🛒 Giỏ Hàng (${typeLabel})</h2>
      <div class="cart-items" id="cart-items"></div>
      <div class="cart-summary">
        <h3>Tổng Tiền: <span class="total-price">${total.toLocaleString()}₫</span></h3>
        <div class="cart-actions">
          <button class="btn-secondary" onclick="window.showProducts()">← Tiếp tục mua</button>
          <button class="btn-primary" onclick="window.showCheckout()">Thanh Toán →</button>
        </div>
      </div>
    </div>
  `;
  
  renderCartItems();
}

// ========== HIỂN THỊ CHI TIẾT GIỎ HÀNG ==========
function renderCartItems() {
  const cart = getCurrentCart();
  const container = document.getElementById('cart-items');
  container.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="item-info">
        <h4>${item.name}</h4>
        <p>${item.price.toLocaleString()}₫</p>
      </div>
      <div class="item-quantity">
        <button onclick="window.changeQuantity(${index}, -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="window.changeQuantity(${index}, 1)">+</button>
      </div>
      <div class="item-total">
        ${(item.price * item.quantity).toLocaleString()}₫
      </div>
      <button class="btn-remove" onclick="window.removeFromCart(${index})">🗑️</button>
    </div>
  `).join('');
}

// ========== THAY ĐỔI SỐ LƯỢNG ==========
window.changeQuantity = function(index, change) {
  const cart = getCurrentCart();
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    window.removeFromCart(index);
  } else {
    setCurrentCart(cart);
    showCart();
    updateCartUI();
  }
};

// ========== XÓA SẢN PHẨM ==========
window.removeFromCart = function(index) {
  const cart = getCurrentCart();
  cart.splice(index, 1);
  setCurrentCart(cart);
  updateCartUI();
  showCart();
};

// ========== HIỂN THỊ TRANG THANH TOÁN ==========
window.showCheckout = function() {
  const cart = getCurrentCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  if (currentPurchaseType === 'normal') {
    // Mua Ngay - không cần địa chỉ
    showCheckoutConfirm('normal', null);
  } else {
    // Mua Bảo Mật - cần địa chỉ
    mainContent.innerHTML = `
      <div class="checkout-container">
        <h2>🔒 Mua Bảo Mật</h2>
        <div class="checkout-form">
          <label for="address">Địa Chỉ Giao Hàng:</label>
          <textarea id="address" placeholder="Nhập địa chỉ giao hàng..." rows="3"></textarea>
          
          <div class="order-summary">
            <h3>Tóm Tắt Đơn Hàng</h3>
            <div class="summary-items" id="summary-items"></div>
            <h4>Tổng: <span class="summary-total">${total.toLocaleString()}₫</span></h4>
          </div>
          
          <div class="checkout-actions">
            <button class="btn-secondary" onclick="window.showCart()">← Quay lại</button>
            <button class="btn-primary" onclick="window.completeSecureCheckout()">✓ Thanh Toán</button>
          </div>
        </div>
      </div>
    `;
    renderOrderSummary();
  }
}

// ========== HIỂN THỊ TÓM TẮT ĐƠN HÀNG ==========
function renderOrderSummary() {
  const cart = getCurrentCart();
  const container = document.getElementById('summary-items');
  container.innerHTML = cart.map(item => `
    <div class="summary-item">
      <span>${item.name} x${item.quantity}</span>
      <span>${(item.price * item.quantity).toLocaleString()}₫</span>
    </div>
  `).join('');
}

// ========== HOÀN TẤT THANH TOÁN BẢO MẬT ==========
window.completeSecureCheckout = async function() {
  const address = document.getElementById('address').value.trim();
  
  if (!address) {
    showNotification('❌ Vui lòng nhập địa chỉ giao hàng!');
    return;
  }
  
  await window.createOrder('secure', address);
};

// ========== HIỂN THỊ XÁC NHẬN THANH TOÁN ==========
function showCheckoutConfirm(type, address) {
  mainContent.innerHTML = `
    <div class="checkout-confirm">
      <h2>${type === 'normal' ? '🛍️ Mua Ngay' : '🔒 Mua Bảo Mật'}</h2>
      <div class="order-summary">
        <h3>Tóm Tắt Đơn Hàng</h3>
        <div class="summary-items" id="confirm-summary-items"></div>
        <div class="order-total"></div>
      </div>
      
      <div class="checkout-actions">
        <button class="btn-secondary" onclick="window.showCart()">← Quay lại</button>
        <button class="btn-primary" onclick="window.createOrder('${type}', ${address ? `'${address}'` : 'null'})">
          ✓ Xác Nhận Thanh Toán
        </button>
      </div>
    </div>
  `;
  
  const cart = getCurrentCart();
  const container = document.getElementById('confirm-summary-items');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  container.innerHTML = cart.map(item => `
    <div class="summary-item">
      <span>${item.name} x${item.quantity}</span>
      <span>${(item.price * item.quantity).toLocaleString()}₫</span>
    </div>
  `).join('');
  
  document.querySelector('.order-total').innerHTML = `
    <h4>Tổng Cộng: <span class="summary-total">${total.toLocaleString()}₫</span></h4>
  `;
}

// ========== TẠO ĐƠN HÀNG - LƯU VÀO FIREBASE ==========
window.createOrder = async function(type, address = null) {
  const cart = getCurrentCart();
  
  if (cart.length === 0) {
    showNotification('❌ Giỏ hàng trống!');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderId = 'ORD' + Date.now();
  
  const orderData = {
    id: orderId,
    items: cart.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    total: total,
    type: type,
    timestamp: new Date().toLocaleString('vi-VN'),
    status: 'pending'
  };
  
  if (type === 'secure' && address) {
    orderData.address = address;
  }
  
  try {
    // Lưu vào Firebase
    const ordersRef = ref(database, 'orders/' + orderId);
    await set(ordersRef, orderData);
    
    // Hiển thị popup thành công
    showSuccessPopup(orderId, type);
    
    // Reset giỏ hàng hiện tại
    if (currentPurchaseType === 'normal') {
      cartNormal = [];
    } else {
      cartSecure = [];
    }
    updateCartUI();
    
  } catch (error) {
    console.error('Lỗi khi lưu đơn hàng:', error);
    showNotification('❌ Lỗi khi xử lý đơn hàng!');
  }
};

// ========== HIỂN THỊ POPUP THÀNH CÔNG ==========
function showSuccessPopup(orderId, type) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content success-modal">
      <div class="success-icon">✅</div>
      <h2>Thanh Toán Thành Công!</h2>
      <p>Mã Đơn Hàng: <strong>${orderId}</strong></p>
      ${type === 'secure' ? '<p>Chúng tôi sẽ liên hệ với bạn trong 1-2 giờ</p>' : '<p>Vui lòng chụp màn hình này để nhận hàng</p>'}
      <p class="warning-text">⚠️ Vui lòng lưu lại mã đơn hàng này</p>
      <button class="btn-primary" onclick="location.reload()">← Quay về Trang Chủ</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// ========== HIỂN THỊ THÔNG BÁO ==========
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ========== EXPOSE FUNCTIONS TO GLOBAL ==========
window.showHome = showHome;
window.showProducts = showProducts;
window.showCart = showCart;
window.updateCartUI = updateCartUI;

// ========== EVENT LISTENERS ==========
cartBtn.addEventListener('click', showCart);
homeBtn.addEventListener('click', showHome);

// ========== LOAD SỐ LƯỢNG HÀNG ==========
function listenToQuantities() {
  const quantitiesRef = ref(database, 'quantities');
  onValue(quantitiesRef, (snapshot) => {
    quantities = snapshot.val() || {};
    renderProducts(); // 🔥 reload lại sản phẩm khi có thay đổi
  });
}
// ========== KHỞI TẠO ==========
showHome();
updateCartUI();
listenToQuantities();

// Log để debug
console.log('✅ PrivateBox User App loaded');
