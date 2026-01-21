// Mock Data
const MOCK_RESTAURANTS = [
    {
        id: 1,
        name: "ร้านกะเพราเด็ด",
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        deliveryTime: "20-30 min",
        category: "Thai",
        menu: [
            { id: 101, name: "ข้าวกะเพราหมูสับไข่ดาว", price: 65, image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
            { id: 102, name: "ข้าวหมูกระเทียม", price: 60, image: "https://images.unsplash.com/photo-1605333177893-68d80dc3db0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
            { id: 103, name: "ต้มยำกุ้ง", price: 120, image: "https://images.unsplash.com/photo-1548943487-a2e4e43b485c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
        ]
    },
    {
        id: 2,
        name: "Burger Kingz",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.5,
        deliveryTime: "30-45 min",
        category: "Fast Food",
        menu: [
            { id: 201, name: "Cheese Burger Set", price: 189, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
            { id: 202, name: "Double Beef Burger", price: 220, image: "https://images.unsplash.com/photo-1586190848861-99c8a3bd7958?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
        ]
    },
    {
        id: 3,
        name: "Sushi House",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        deliveryTime: "40-50 min",
        category: "Japanese",
        menu: [
            { id: 301, name: "Salmon Sashimi", price: 250, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
            { id: 302, name: "California Roll", price: 180, image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
        ]
    }
];

class AppStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('restaurants')) {
            localStorage.setItem('restaurants', JSON.stringify(MOCK_RESTAURANTS));
        }
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }
    }

    getRestaurants() {
        return JSON.parse(localStorage.getItem('restaurants'));
    }

    getRestaurant(id) {
        const restaurants = this.getRestaurants();
        return restaurants.find(r => r.id === parseInt(id));
    }

    createOrder(order) {
        const orders = this.getOrders();
        const newOrder = {
            id: Date.now(),
            status: 'PENDING', // PENDING, CONFIRMED, PREPARING, READY, PICKED_UP, DELIVERED
            createdAt: new Date().toISOString(),
            ...order
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        return newOrder;
    }

    getOrders() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    getOrdersByRestaurant(restaurantId) {
        return this.getOrders().filter(o => o.restaurantId === parseInt(restaurantId));
    }

    getOrdersForDriver() {
        // Drivers see orders that are READY
        return this.getOrders().filter(o => ['READY', 'PICKED_UP'].includes(o.status));
    }

    // For admin
    getAllOrders() {
        return this.getOrders();
    }

    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === parseInt(orderId));
        if (index !== -1) {
            orders[index].status = status;
            orders[index].updatedAt = new Date().toISOString();
            localStorage.setItem('orders', JSON.stringify(orders));
            return orders[index];
        }
        return null;
    }

    assignDriver(orderId, driverName) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === parseInt(orderId));
        if (index !== -1) {
            orders[index].driverName = driverName;
            orders[index].status = 'PICKED_UP';
            localStorage.setItem('orders', JSON.stringify(orders));
            return orders[index];
        }
        return null;
    }

    // Format currency
    formatCurrency(amount) {
        return `฿${amount.toLocaleString()}`;
    }

    // Format date
    formatDate(isoString) {
        return new Date(isoString).toLocaleString('th-TH');
    }

    // Helper to get status color
    getStatusColor(status) {
        const colors = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'CONFIRMED': 'bg-blue-100 text-blue-800',
            'PREPARING': 'bg-purple-100 text-purple-800',
            'READY': 'bg-green-100 text-green-800',
            'PICKED_UP': 'bg-indigo-100 text-indigo-800',
            'DELIVERED': 'bg-gray-100 text-gray-800',
            'CANCELLED': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusLabel(status) {
         const labels = {
            'PENDING': 'รอร้านรับออเดอร์',
            'CONFIRMED': 'ร้านรับแล้ว',
            'PREPARING': 'กำลังเตรียม',
            'READY': 'พร้อมส่ง',
            'PICKED_UP': 'ไรเดอร์รับแล้ว',
            'DELIVERED': 'จัดส่งสำเร็จ',
            'CANCELLED': 'ยกเลิก'
        };
        return labels[status] || status;
    }
}

// Expose to window
window.appStore = new AppStore();
