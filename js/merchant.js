// State
let currentRestaurantId = 1;

// DOM Elements
const restaurantSelector = document.getElementById('restaurant-selector');
const ordersContainer = document.getElementById('orders-container');
const statNew = document.getElementById('stat-new');
const statPreparing = document.getElementById('stat-preparing');
const statReady = document.getElementById('stat-ready');
const statRevenue = document.getElementById('stat-revenue');

// Init
function init() {
    loadRestaurants();
    renderOrders();

    // Auto refresh
    setInterval(renderOrders, 5000);
}

function loadRestaurants() {
    const restaurants = appStore.getRestaurants();
    restaurantSelector.innerHTML = restaurants.map(r =>
        `<option value="${r.id}">${r.name}</option>`
    ).join('');

    restaurantSelector.value = currentRestaurantId;
    restaurantSelector.addEventListener('change', (e) => {
        currentRestaurantId = e.target.value;
        renderOrders();
    });
}

function renderOrders() {
    const orders = appStore.getOrdersByRestaurant(currentRestaurantId);

    // Calculate stats
    const newOrders = orders.filter(o => o.status === 'PENDING').length;
    const preparingOrders = orders.filter(o => ['CONFIRMED', 'PREPARING'].includes(o.status)).length;
    const readyOrders = orders.filter(o => o.status === 'READY').length;
    const today = new Date().toDateString();
    const todayRevenue = orders
        .filter(o => o.status === 'DELIVERED' && new Date(o.createdAt).toDateString() === today)
        .reduce((sum, o) => sum + o.totalPrice, 0);

    statNew.textContent = newOrders;
    statPreparing.textContent = preparingOrders;
    statReady.textContent = readyOrders;
    statRevenue.textContent = appStore.formatCurrency(todayRevenue);

    // Sort: Pending first, then active, then completed
    const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED', 'PICKED_UP'].includes(o.status));
    const historyOrders = orders.filter(o => ['DELIVERED', 'CANCELLED', 'PICKED_UP'].includes(o.status));

    // Sort active by time (oldest first for pending)
    activeOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Combine for display (History at bottom)
    const displayOrders = [...activeOrders, ...historyOrders];

    if (displayOrders.length === 0) {
        ordersContainer.innerHTML = '<div class="p-8 text-center text-gray-500">ยังไม่มีออร์เดอร์</div>';
        return;
    }

    ordersContainer.innerHTML = displayOrders.map(order => {
        const statusColor = appStore.getStatusColor(order.status);
        const statusLabel = appStore.getStatusLabel(order.status);
        const isActionable = !['DELIVERED', 'CANCELLED', 'PICKED_UP', 'READY'].includes(order.status);

        let actionButtons = '';
        if (order.status === 'PENDING') {
            actionButtons = `
                <button onclick="updateStatus(${order.id}, 'CONFIRMED')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                    รับออร์เดอร์
                </button>
                <button onclick="updateStatus(${order.id}, 'CANCELLED')" class="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition ml-2">
                    ปฏิเสธ
                </button>
            `;
        } else if (order.status === 'CONFIRMED') {
            actionButtons = `
                <button onclick="updateStatus(${order.id}, 'PREPARING')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                    เริ่มทำอาหาร
                </button>
            `;
        } else if (order.status === 'PREPARING') {
            actionButtons = `
                <button onclick="updateStatus(${order.id}, 'READY')" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                    ทำเสร็จแล้ว (พร้อมส่ง)
                </button>
            `;
        }

        return `
            <div class="p-6 hover:bg-gray-50 transition">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <div class="flex items-center">
                            <h3 class="font-bold text-lg text-gray-900 mr-2">Order #${order.id.toString().slice(-4)}</h3>
                            <span class="${statusColor} px-2 py-0.5 rounded text-xs font-bold">${statusLabel}</span>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">
                            <i class="far fa-clock mr-1"></i> ${appStore.formatDate(order.createdAt)}
                            <span class="mx-2">•</span>
                            <i class="far fa-user mr-1"></i> ${order.customerName}
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="block font-bold text-xl text-gray-900">${appStore.formatCurrency(order.totalPrice)}</span>
                        <span class="text-xs text-gray-400">${order.items.length} รายการ</span>
                    </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                    ${order.items.map(item => `
                        <div class="flex justify-between py-1">
                            <span><span class="font-bold mr-2">${item.quantity}x</span> ${item.name}</span>
                            <span class="text-gray-500">${appStore.formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                    ${order.notes ? `<div class="mt-2 pt-2 border-t text-gray-600 italic">Note: ${order.notes}</div>` : ''}
                </div>

                <div class="flex justify-between items-center">
                     <div class="text-sm text-gray-500">
                        ${order.driverName ? `<i class="fas fa-motorcycle mr-1"></i> Driver: ${order.driverName}` : ''}
                     </div>
                    <div>
                        ${actionButtons}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateStatus(orderId, status) {
    if (confirm(`ยืนยันเปลี่ยนสถานะเป็น ${status}?`)) {
        appStore.updateOrderStatus(orderId, status);
        renderOrders();
    }
}

// Start
window.addEventListener('DOMContentLoaded', init);
window.updateStatus = updateStatus;
window.renderOrders = renderOrders;
