import 'dart:async';
import 'package:flutter/material.dart';

// --- Models ---

class MenuItem {
  final int id;
  final String name;
  final double price;
  final String imageUrl;

  MenuItem({
    required this.id,
    required this.name,
    required this.price,
    required this.imageUrl,
  });
}

class Restaurant {
  final int id;
  final String name;
  final String imageUrl;
  final double rating;
  final String deliveryTime;
  final String category;
  final List<MenuItem> menu;

  Restaurant({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.rating,
    required this.deliveryTime,
    required this.category,
    required this.menu,
  });
}

class CartItem {
  final MenuItem menuItem;
  int quantity;
  final int restaurantId;
  final String restaurantName;

  CartItem({
    required this.menuItem,
    required this.quantity,
    required this.restaurantId,
    required this.restaurantName,
  });

  double get totalPrice => menuItem.price * quantity;
}

enum OrderStatus {
  PENDING,
  CONFIRMED,
  PREPARING,
  READY,
  PICKED_UP,
  DELIVERED,
  CANCELLED
}

class Order {
  final int id;
  final int restaurantId;
  final String restaurantName;
  final List<CartItem> items;
  final double totalPrice;
  final String customerName;
  final String address;
  OrderStatus status;
  final DateTime createdAt;
  DateTime updatedAt;
  String? driverName;
  String? notes;

  Order({
    required this.id,
    required this.restaurantId,
    required this.restaurantName,
    required this.items,
    required this.totalPrice,
    required this.customerName,
    required this.address,
    this.status = OrderStatus.PENDING,
    required this.createdAt,
    required this.updatedAt,
    this.driverName,
    this.notes,
  });
}

// --- Mock Service (Singleton) ---

class MockService extends ChangeNotifier {
  static final MockService _instance = MockService._internal();

  factory MockService() {
    return _instance;
  }

  MockService._internal() {
    _initData();
  }

  List<Restaurant> _restaurants = [];
  List<Order> _orders = [];

  List<Restaurant> get restaurants => _restaurants;
  List<Order> get orders => _orders;

  void _initData() {
    _restaurants = [
      Restaurant(
        id: 1,
        name: "ร้านกะเพราเด็ด",
        imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        deliveryTime: "20-30 min",
        category: "Thai",
        menu: [
          MenuItem(id: 101, name: "ข้าวกะเพราหมูสับไข่ดาว", price: 65, imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"),
          MenuItem(id: 102, name: "ข้าวหมูกระเทียม", price: 60, imageUrl: "https://images.unsplash.com/photo-1605333177893-68d80dc3db0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"),
          MenuItem(id: 103, name: "ต้มยำกุ้ง", price: 120, imageUrl: "https://images.unsplash.com/photo-1548943487-a2e4e43b485c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"),
        ],
      ),
      Restaurant(
        id: 2,
        name: "Burger Kingz",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.5,
        deliveryTime: "30-45 min",
        category: "Fast Food",
        menu: [
          MenuItem(id: 201, name: "Cheese Burger Set", price: 189, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"),
          MenuItem(id: 202, name: "Double Beef Burger", price: 220, imageUrl: "https://images.unsplash.com/photo-1586190848861-99c8a3bd7958?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"),
        ],
      ),
      Restaurant(
        id: 3,
        name: "Sushi House",
        imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        deliveryTime: "40-50 min",
        category: "Japanese",
        menu: [
          MenuItem(id: 301, name: "Salmon Sashimi", price: 250, imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"),
          MenuItem(id: 302, name: "California Roll", price: 180, imageUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"),
        ],
      ),
    ];
  }

  // --- Actions ---

  Order createOrder(List<CartItem> items, String customerName, String address) {
    if (items.isEmpty) throw Exception("Cart is empty");

    final restaurantId = items.first.restaurantId;
    final restaurantName = items.first.restaurantName;
    final totalPrice = items.fold(0.0, (sum, item) => sum + item.totalPrice);

    final newOrder = Order(
      id: DateTime.now().millisecondsSinceEpoch,
      restaurantId: restaurantId,
      restaurantName: restaurantName,
      items: List.from(items), // Copy items
      totalPrice: totalPrice,
      customerName: customerName,
      address: address,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    _orders.add(newOrder);
    notifyListeners();
    return newOrder;
  }

  void updateOrderStatus(int orderId, OrderStatus status) {
    final index = _orders.indexWhere((o) => o.id == orderId);
    if (index != -1) {
      _orders[index].status = status;
      _orders[index].updatedAt = DateTime.now();
      notifyListeners();
    }
  }

  void assignDriver(int orderId, String driverName) {
    final index = _orders.indexWhere((o) => o.id == orderId);
    if (index != -1) {
      _orders[index].driverName = driverName;
      _orders[index].status = OrderStatus.PICKED_UP;
      _orders[index].updatedAt = DateTime.now();
      notifyListeners();
    }
  }

  // --- Queries ---

  Restaurant? getRestaurant(int id) {
    try {
      return _restaurants.firstWhere((r) => r.id == id);
    } catch (e) {
      return null;
    }
  }

  List<Order> getOrdersByRestaurant(int restaurantId) {
    return _orders.where((o) => o.restaurantId == restaurantId).toList();
  }

  List<Order> getOrdersForDriver() {
    return _orders.where((o) =>
      o.status == OrderStatus.READY ||
      (o.status == OrderStatus.PICKED_UP) // Drivers see READY to pick up, or PICKED_UP to deliver
    ).toList();
  }

  List<Order> getMyActiveDriverJobs(String driverName) {
      return _orders.where((o) => o.driverName == driverName && o.status != OrderStatus.DELIVERED).toList();
  }

  // --- Helpers ---

  Color getStatusColor(OrderStatus status) {
    switch (status) {
      case OrderStatus.PENDING: return Colors.orange.shade100;
      case OrderStatus.CONFIRMED: return Colors.blue.shade100;
      case OrderStatus.PREPARING: return Colors.purple.shade100;
      case OrderStatus.READY: return Colors.green.shade100;
      case OrderStatus.PICKED_UP: return Colors.indigo.shade100;
      case OrderStatus.DELIVERED: return Colors.grey.shade200;
      case OrderStatus.CANCELLED: return Colors.red.shade100;
    }
  }

  Color getStatusTextColor(OrderStatus status) {
    switch (status) {
      case OrderStatus.PENDING: return Colors.orange.shade900;
      case OrderStatus.CONFIRMED: return Colors.blue.shade900;
      case OrderStatus.PREPARING: return Colors.purple.shade900;
      case OrderStatus.READY: return Colors.green.shade900;
      case OrderStatus.PICKED_UP: return Colors.indigo.shade900;
      case OrderStatus.DELIVERED: return Colors.grey.shade800;
      case OrderStatus.CANCELLED: return Colors.red.shade900;
    }
  }

  String getStatusLabel(OrderStatus status) {
     switch (status) {
      case OrderStatus.PENDING: return 'รอร้านรับ';
      case OrderStatus.CONFIRMED: return 'รับแล้ว';
      case OrderStatus.PREPARING: return 'กำลังปรุง';
      case OrderStatus.READY: return 'พร้อมส่ง';
      case OrderStatus.PICKED_UP: return 'ไรเดอร์รับแล้ว';
      case OrderStatus.DELIVERED: return 'ส่งสำเร็จ';
      case OrderStatus.CANCELLED: return 'ยกเลิก';
    }
  }
}
