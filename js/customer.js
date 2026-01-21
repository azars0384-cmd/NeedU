// State
let cart = [];
let currentRestaurant = null;

// DOM Elements
const restaurantListView = document.getElementById('restaurant-list-view');
const menuView = document.getElementById('menu-view');
const ordersView = document.getElementById('orders-view');
const restaurantsContainer = document.getElementById('restaurants-container');
const menuContainer = document.getElementById('menu-container');
const selectedRestaurantInfo = document.getElementById('selected-restaurant-info');
const cartBadge = document.getElementById('cart-badge');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const activeOrdersContainer = document.getElementById('active-orders-container');
const successModal = document.getElementById('success-modal');

// Init
function init() {
    renderRestaurants();
    updateCartUI();

    // Auto refresh orders every 5 seconds
    setInterval(() => {
        if (!ordersView.classList.contains('hidden')) {
            renderActiveOrders();
        }
    }, 5000);
}

// Navigation
function showRestaurantList() {
    restaurantListView.classList.remove('hidden');
    menuView.classList.add('hidden');
    ordersView.classList.add('hidden');
}

function showOrders() {
    renderActiveOrders();
    restaurantListView.classList.add('hidden');
    menuView.classList.add('hidden');
    ordersView.classList.remove('hidden');
}

// Render Restaurants
function renderRestaurants() {
    const restaurants = appStore.getRestaurants();
    restaurantsContainer.innerHTML = restaurants.map(r => `
        <div onclick="selectRestaurant(${r.id})" class="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transform transition hover:scale-[1.02]">
            <div class="h-40 bg-gray-200 relative">
                <img src="${r.image}" alt="${r.name}" class="w-full h-full object-cover">
                <div class="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-lg text-sm font-bold shadow-sm">
                    ${r.deliveryTime}
                </div>
            </div>
            <div class="p-4">
                <div class="flex justify-between items-start mb-1">
                    <h3 class="text-lg font-bold text-gray-900">${r.name}</h3>
                    <div class="flex items-center bg-green-50 px-2 py-0.5 rounded text-green-700 text-sm font-bold">
                        <i class="fas fa-star text-xs mr-1"></i> ${r.rating}
                    </div>
                </div>
                <p class="text-sm text-gray-500">${r.category}</p>
            </div>
        </div>
    `).join('');
}

// Select Restaurant
function selectRestaurant(id) {
    const restaurant = appStore.getRestaurant(id);
    if (!restaurant) return;

    currentRestaurant = restaurant;

    // If cart has items from another restaurant, confirm clearing
    if (cart.length > 0 && cart[0].restaurantId !== restaurant.id) {
        if (!confirm('ตะกร้ามีสินค้าจากร้านอื่น ต้องการเคลียร์ตะกร้าเพื่อสั่งร้านนี้หรือไม่?')) {
            return;
        }
        cart = [];
        updateCartUI();
    }

    renderMenu(restaurant);

    restaurantListView.classList.add('hidden');
    menuView.classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Render Menu
function renderMenu(restaurant) {
    selectedRestaurantInfo.innerHTML = `
        <div class="flex items-center space-x-4 mb-4">
            <img src="${restaurant.image}" class="w-16 h-16 rounded-lg object-cover">
            <div>
                <h2 class="text-2xl font-bold">${restaurant.name}</h2>
                <p class="text-gray-500 text-sm">${restaurant.category} • ${restaurant.deliveryTime}</p>
            </div>
        </div>
    `;

    menuContainer.innerHTML = restaurant.menu.map(item => `
        <div class="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
            <div class="flex-1 pr-4">
                <h4 class="font-bold text-gray-900 mb-1">${item.name}</h4>
                <p class="text-green-600 font-bold mb-3">฿${item.price}</p>
                <button onclick="addToCart(${item.id})" class="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-200 transition">
                    <i class="fas fa-plus mr-1"></i> เพิ่ม
                </button>
            </div>
            <img src="${item.image}" class="w-24 h-24 rounded-lg object-cover bg-gray-100">
        </div>
    `).join('');
}

// Cart Logic
function addToCart(itemId) {
    const item = currentRestaurant.menu.find(m => m.id === itemId);
    const existingItem = cart.find(i => i.id === itemId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...item,
            quantity: 1,
            restaurantId: currentRestaurant.id,
            restaurantName: currentRestaurant.name
        });
    }

    updateCartUI();

    // Feedback
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> เพิ่มแล้ว';
    btn.classList.add('bg-green-500', 'text-white');
    btn.classList.remove('bg-green-100', 'text-green-700');

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-green-500', 'text-white');
        btn.classList.add('bg-green-100', 'text-green-700');
    }, 1000);
}

function updateCartItem(itemId, delta) {
    const itemIndex = cart.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    cart[itemIndex].quantity += delta;

    if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
    }

    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Badge
    if (totalItems > 0) {
        cartBadge.textContent = totalItems;
        cartBadge.classList.remove('hidden');
    } else {
        cartBadge.classList.add('hidden');
    }

    // Cart Modal Content
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="text-center text-gray-500 mt-10 flex flex-col items-center"><i class="fas fa-shopping-basket text-4xl mb-4 text-gray-300"></i><p>ตะกร้าว่างเปล่า</p></div>';
        checkoutBtn.disabled = true;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center border-b pb-4 last:border-0">
                <div class="flex-1">
                    <h4 class="font-bold text-sm text-gray-900">${item.name}</h4>
                    <p class="text-xs text-gray-500">${item.restaurantName}</p>
                    <p class="text-green-600 font-bold mt-1">฿${item.price * item.quantity}</p>
                </div>
                <div class="flex items-center bg-gray-100 rounded-lg p-1">
                    <button onclick="updateCartItem(${item.id}, -1)" class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition">-</button>
                    <span class="w-8 text-center font-bold text-sm">${item.quantity}</span>
                    <button onclick="updateCartItem(${item.id}, 1)" class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-md transition">+</button>
                </div>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }

    cartTotalElement.textContent = `฿${totalPrice.toLocaleString()}`;
}

function toggleCart() {
    if (cartModal.classList.contains('hidden')) {
        cartModal.classList.remove('hidden');
    } else {
        cartModal.classList.add('hidden');
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) return;

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const restaurantId = cart[0].restaurantId;
    const restaurantName = cart[0].restaurantName;

    const order = {
        restaurantId: restaurantId,
        restaurantName: restaurantName,
        items: cart,
        totalPrice: totalPrice,
        customerName: "คุณลูกค้า (Demo)",
        address: "123 ถ.สุขุมวิท กรุงเทพฯ"
    };

    appStore.createOrder(order);

    // Reset cart
    cart = [];
    currentRestaurant = null;
    updateCartUI();
    toggleCart();

    // Show Success
    successModal.classList.remove('hidden');
}

function closeSuccessModal() {
    successModal.classList.add('hidden');
    showOrders();
}

// Orders Tracking
function renderActiveOrders() {
    // Assuming user ID is not implemented, we just show all orders for simplicity in this demo
    // In a real app we would filter by user ID.
    // For this prototype, let's just show all orders created in this session?
    // Or just all orders to make it easy to test.

    // Let's filter orders that are not DELIVERED or CANCELLED to be "Active"
    // And maybe show history separately, but for now just a list.

    const orders = appStore.getOrders(); // Show all orders
    const activeOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (activeOrders.length === 0) {
        activeOrdersContainer.innerHTML = '<div class="text-center text-gray-500 mt-10"><i class="fas fa-receipt text-4xl mb-4 text-gray-300"></i><p>ยังไม่มีประวัติการสั่งซื้อ</p></div>';
        return;
    }

    activeOrdersContainer.innerHTML = activeOrders.map(order => {
        const statusColor = appStore.getStatusColor(order.status);
        const statusLabel = appStore.getStatusLabel(order.status);

        return `
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-bold text-lg text-gray-900">${order.restaurantName}</h3>
                    <p class="text-xs text-gray-500">${appStore.formatDate(order.createdAt)}</p>
                </div>
                <span class="${statusColor} px-3 py-1 rounded-full text-xs font-bold">
                    ${statusLabel}
                </span>
            </div>

            <div class="border-t border-b py-3 my-3 space-y-2">
                ${order.items.map(item => `
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">${item.quantity}x ${item.name}</span>
                        <span class="text-gray-900 font-medium">${appStore.formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="flex justify-between items-center mb-4">
                <span class="font-bold text-gray-900">ยอดรวม</span>
                <span class="font-bold text-green-600 text-lg">${appStore.formatCurrency(order.totalPrice)}</span>
            </div>

            ${renderOrderProgress(order.status)}
        </div>
        `;
    }).join('');
}

function renderOrderProgress(status) {
    const steps = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'];
    const currentStepIndex = steps.indexOf(status);

    if (currentStepIndex === -1) return ''; // Cancelled or unknown

    const progressPercent = (currentStepIndex / (steps.length - 1)) * 100;

    return `
        <div class="mt-4">
            <div class="flex justify-between text-xs text-gray-400 mb-2">
                <span>รับออเดอร์</span>
                <span>เตรียม</span>
                <span>ส่ง</span>
                <span>ถึงแล้ว</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-green-500 transition-all duration-500" style="width: ${progressPercent}%"></div>
            </div>
            <p class="text-center text-sm font-medium text-green-600 mt-2">
                ${status === 'PICKED_UP' ? '<i class="fas fa-motorcycle mr-1"></i> ไรเดอร์กำลังมาส่ง' : ''}
                ${status === 'READY' ? '<i class="fas fa-box mr-1"></i> รอไรเดอร์รับอาหาร' : ''}
                ${status === 'PREPARING' ? '<i class="fas fa-fire mr-1"></i> ร้านกำลังทำอาหาร' : ''}
            </p>
        </div>
    `;
}

// Start
window.addEventListener('DOMContentLoaded', init);
window.selectRestaurant = selectRestaurant;
window.addToCart = addToCart;
window.updateCartItem = updateCartItem;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.showRestaurantList = showRestaurantList;
window.showOrders = showOrders;
window.closeSuccessModal = closeSuccessModal;
