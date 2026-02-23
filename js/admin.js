// DOM Elements
const totalOrdersEl = document.getElementById('total-orders');
const totalRevenueEl = document.getElementById('total-revenue');
const completedOrdersEl = document.getElementById('completed-orders');
const activeOrdersEl = document.getElementById('active-orders');
const ordersTableBody = document.getElementById('orders-table-body');
const activityFeed = document.getElementById('activity-feed');

// Init
function init() {
    renderDashboard();
    setInterval(renderDashboard, 5000);
}

function renderDashboard() {
    const orders = appStore.getAllOrders();

    // Stats
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;
    const totalRevenue = orders
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.totalPrice, 0);

    totalOrdersEl.textContent = totalOrders;
    totalRevenueEl.textContent = appStore.formatCurrency(totalRevenue);
    completedOrdersEl.textContent = completedOrders;
    activeOrdersEl.textContent = activeOrders;

    // Table (Latest 10)
    const sortedOrders = [...orders].sort((a, b) => {
        if (b.createdAt > a.createdAt) return 1;
        if (b.createdAt < a.createdAt) return -1;
        return 0;
    });
    const recentOrders = sortedOrders.slice(0, 10);

    if (recentOrders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center">No orders found</td></tr>';
    } else {
        ordersTableBody.innerHTML = recentOrders.map(order => `
            <tr class="bg-white border-b hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">#${order.id.toString().slice(-4)}</td>
                <td class="px-6 py-4">${order.customerName}</td>
                <td class="px-6 py-4">${order.restaurantName}</td>
                <td class="px-6 py-4">${appStore.formatCurrency(order.totalPrice)}</td>
                <td class="px-6 py-4">
                    <span class="${appStore.getStatusColor(order.status)} px-2 py-1 rounded text-xs font-bold">
                        ${order.status}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    // Activity Feed (Simulated from orders)
    // In a real app we would have an Activity Log table.
    // Here we just show the latest 5 orders as "New Order" activities
    const latestActivity = sortedOrders.slice(0, 5);

    if (latestActivity.length === 0) {
        activityFeed.innerHTML = '<div class="text-center text-gray-400 text-sm">No recent activity</div>';
    } else {
        activityFeed.innerHTML = latestActivity.map(order => {
             let icon = 'fa-shopping-bag';
             let color = 'text-blue-500';
             let text = 'New order placed';

             if (order.status === 'DELIVERED') {
                 icon = 'fa-check-circle';
                 color = 'text-green-500';
                 text = 'Order delivered';
             } else if (order.status === 'CANCELLED') {
                 icon = 'fa-times-circle';
                 color = 'text-red-500';
                 text = 'Order cancelled';
             } else if (order.status !== 'PENDING') {
                 icon = 'fa-clock';
                 color = 'text-orange-500';
                 text = `Order status: ${order.status}`;
             }

             return `
                <div class="flex items-start space-x-3 pb-3 border-b last:border-0">
                    <div class="mt-1 ${color}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-800">${text}</p>
                        <p class="text-xs text-gray-500">Order #${order.id.toString().slice(-4)} • ${appStore.formatDate(order.updatedAt || order.createdAt)}</p>
                    </div>
                </div>
             `;
        }).join('');
    }
}

// Start
window.addEventListener('DOMContentLoaded', init);
window.renderDashboard = renderDashboard;
