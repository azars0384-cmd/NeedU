import 'dart:async';
import 'package:flutter/material.dart';
import '../../services/mock_service.dart';

class CustomerOrderScreen extends StatefulWidget {
  @override
  _CustomerOrderScreenState createState() => _CustomerOrderScreenState();
}

class _CustomerOrderScreenState extends State<CustomerOrderScreen> {
  final MockService _service = MockService();
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(Duration(seconds: 2), (timer) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Show all orders for demo (since we don't have user auth)
    final orders = List.from(_service.orders)..sort((a, b) => b.createdAt.compareTo(a.createdAt));

    return Scaffold(
      appBar: AppBar(
        title: Text("ออร์เดอร์ของฉัน"),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: orders.isEmpty
        ? Center(child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.receipt_long, size: 64, color: Colors.grey[300]),
              SizedBox(height: 16),
              Text("ยังไม่มีประวัติการสั่งซื้อ", style: TextStyle(color: Colors.grey)),
            ],
          ))
        : ListView.builder(
            padding: EdgeInsets.all(16),
            itemCount: orders.length,
            itemBuilder: (context, index) {
              final order = orders[index];
              return _buildOrderCard(order);
            },
          ),
    );
  }

  Widget _buildOrderCard(Order order) {
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(order.restaurantName, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Text("${order.createdAt.hour.toString().padLeft(2, '0')}:${order.createdAt.minute.toString().padLeft(2, '0')}", style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _service.getStatusColor(order.status),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _service.getStatusLabel(order.status),
                    style: TextStyle(
                      color: _service.getStatusTextColor(order.status),
                      fontWeight: FontWeight.bold,
                      fontSize: 12
                    ),
                  ),
                ),
              ],
            ),
            Divider(height: 24),
            ...order.items.map((item) => Padding(
              padding: EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  Text("${item.quantity}x", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey[600])),
                  SizedBox(width: 8),
                  Expanded(child: Text(item.menuItem.name)),
                  Text("฿${item.totalPrice.toStringAsFixed(0)}"),
                ],
              ),
            )).toList(),
            Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("ยอดรวม", style: TextStyle(fontWeight: FontWeight.bold)),
                Text("฿${order.totalPrice.toStringAsFixed(0)}", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.green)),
              ],
            ),
            if (order.status != OrderStatus.CANCELLED && order.status != OrderStatus.DELIVERED)
              Padding(
                padding: EdgeInsets.only(top: 16),
                child: LinearProgressIndicator(
                  value: _getProgress(order.status),
                  backgroundColor: Colors.grey[200],
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.green),
                ),
              ),
          ],
        ),
      ),
    );
  }

  double _getProgress(OrderStatus status) {
    switch (status) {
      case OrderStatus.PENDING: return 0.1;
      case OrderStatus.CONFIRMED: return 0.3;
      case OrderStatus.PREPARING: return 0.5;
      case OrderStatus.READY: return 0.7;
      case OrderStatus.PICKED_UP: return 0.9;
      case OrderStatus.DELIVERED: return 1.0;
      default: return 0.0;
    }
  }
}
