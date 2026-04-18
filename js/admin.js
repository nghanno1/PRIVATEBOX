// PrivateBox - Admin Dashboard
import { database } from './firebase.js';
import { ref, onValue } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

// ========== STATE ==========
let orders = [];

// ========== DOM ELEMENTS ==========
const ordersContainer = document.getElementById('orders-container');
const totalRevenueElement = document.getElementById('total-revenue');
const orderCountElement = document.getElementById('order-count');
const autoRefreshToggle = document.getElementById('auto-refresh-toggle');

// ========== HIỂN THỊ TẤT CẢ ĐƠN HÀNG REAL-TIME ==========
function listenToOrders() {
  const ordersRef = ref(database, 'orders');
  
  onValue(ordersRef, (snapshot) => {
    orders = [];
    
    snapshot.forEach((childSnapshot) => {
      orders.push(childSnapshot.val());
    });
    
    // Sắp xếp đơn hàng mới nhất lên trên
    orders.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    
    renderOrders();
    updateStats();
  }, (error) => {
    console.error('Lỗi đọc đơn hàng:', error);
  });
}

// ========== HIỂN THỊ DANH SÁCH ĐƠN HÀNG ==========
function renderOrders() {
  if (orders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="empty-orders">
        <p>📭 Chưa có đơn hàng nào</p>
      </div>
    `;
    return;
  }
  
  ordersContainer.innerHTML = orders.map((order, index) => `
    <div class="order-card ${order.status === 'completed' ? 'completed' : ''}">
      <div class="order-header">
        <div class="order-id">
          <h3>${order.id}</h3>
          <span class="order-type ${order.type === 'secure' ? 'secure' : 'normal'}">
            ${order.type === 'secure' ? '🔒 Bảo Mật' : '🛍️ Thường'}
          </span>
        </div>
        <div>
          <label>
            <input type="checkbox" 
              ${order.status === 'completed' ? 'checked' : ''} 
              onchange="toggleComplete('${order.id}', this.checked)">
            ✓ Complete
          </label>
        </div>
      </div>
      
      <div class="order-content">
        <div class="order-items">
          <h4>Sản Phẩm:</h4>
          <ul>
            ${order.items.map(item => `
              <li>
                <span>${item.name}</span>
                <span>x${item.quantity}</span>
                <span>${(item.price * item.quantity).toLocaleString()}₫</span>
              </li>
            `).join('')}
          </ul>
        </div>
        
        ${order.address ? `
          <div class="order-address">
            <h4>📍 Địa Chỉ Giao Hàng:</h4>
            <p>${order.address}</p>
          </div>
        ` : ''}
        
        <div class="order-total">
          <h4>Tổng Tiền: <span>${order.total.toLocaleString()}₫</span></h4>
        </div>
      </div>
    </div>
  `).join('');
}

// ========== CẬP NHẬT THỐNG KÊ ==========
function updateStats() {
  // Tính tổng doanh thu
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  totalRevenueElement.textContent = totalRevenue.toLocaleString() + '₫';
  
  // Tính số lượng đơn hàng
  orderCountElement.textContent = orders.length;
}

// ========== CÁC CHỨC NĂNG QUẢN LÝ ==========

// 1. Export đơn hàng dưới dạng CSV
function exportOrders() {
  if (orders.length === 0) {
    alert('Không có đơn hàng để xuất!');
    return;
  }
  
  let csv = 'Mã Đơn,Loại,Tổng Tiền,Thời Gian,Địa Chỉ\n';
  
  orders.forEach(order => {
    const address = order.address ? `"${order.address}"` : 'N/A';
    csv += `${order.id},${order.type},${order.total},${order.timestamp},${address}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

// 2. Lọc đơn hàng
function filterOrders(type) {
  const allCards = document.querySelectorAll('.order-card');
  
  allCards.forEach(card => {
    const badge = card.querySelector('.order-type');
    
    if (type === 'all') {
      card.style.display = 'block';
    } else if (type === 'normal' && badge.classList.contains('normal')) {
      card.style.display = 'block';
    } else if (type === 'secure' && badge.classList.contains('secure')) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// ========== DASHBOARD STATS ==========
function showDashboardStats() {
  const normalOrders = orders.filter(o => o.type === 'normal').length;
  const secureOrders = orders.filter(o => o.type === 'secure').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrder = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  
  console.log(`
    📊 PrivateBox Admin Dashboard
    ===============================
    Tổng Đơn Hàng: ${orders.length}
    - Mua Ngay: ${normalOrders}
    - Mua Bảo Mật: ${secureOrders}
    Tổng Doanh Thu: ${totalRevenue.toLocaleString()}₫
    Đơn Trung Bình: ${avgOrder.toLocaleString()}₫
  `);
}

// ========== GLOBAL FUNCTIONS ==========
window.exportOrders = exportOrders;
window.filterOrders = filterOrders;
window.listenToOrders = listenToOrders;

// ========== KHỞI TẠO ==========
document.addEventListener('DOMContentLoaded', () => {
  listenToOrders();
  console.log('✅ PrivateBox Admin App loaded');
  
  // Hiển thị stats định kỳ
  setInterval(showDashboardStats, 30000);
});
