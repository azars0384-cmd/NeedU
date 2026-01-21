import 'dart:async';
import 'package:flutter/material.dart';
import '../../services/mock_service.dart';

class MerchantDashboardScreen extends StatefulWidget {
  @override
  _MerchantDashboardScreenState createState() => _MerchantDashboardScreenState();
}

class _MerchantDashboardScreenState extends State<MerchantDashboardScreen> {
  final MockService _service = MockService();
  late Timer _timer;
  int _selectedRestaurantId = 1;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(Duration(seconds: 3), (timer) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _updateStatus(int orderId, OrderStatus status) {
    setState(() {
      _service.updateOrderStatus(orderId, status);
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Order status updated")));
  }

  @override
  Widget build(BuildContext context) {
    final orders = _service.getOrdersByRestaurant(_selectedRestaurantId);
    final newOrders = orders.where((o) => o.status == OrderStatus.PENDING).length;
    final preparing = orders.where((o) => o.status == OrderStatus.CONFIRMED || o.status == OrderStatus.PREPARING).length;
    final ready = orders.where((o) => o.status == OrderStatus.READY).length;

    // Sort active first
    orders.sort((a, b) {
      if (a.status == OrderStatus.DELIVERED && b.status != OrderStatus.DELIVERED) return 1;
      if (a.status != OrderStatus.DELIVERED && b.status == OrderStatus.DELIVERED) return -1;
      return b.createdAt.compareTo(a.createdAt);
    });

    return Scaffold(
      appBar: AppBar(
        title: Text("Merchant App"),
        backgroundColor: Colors.orange,
        actions: [
          DropdownButton<int>(
            value: _selectedRestaurantId,
            dropdownColor: Colors.white,
            icon: Icon(Icons.arrow_drop_down, color: Colors.white),
            underline: Container(),
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            items: _service.restaurants.map((r) => DropdownMenuItem(
              value: r.id,
              child: Text(r.name, style: TextStyle(color: Colors.black)),
            )).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _selectedRestaurantId = val);
            },
          ),
          SizedBox(width: 16),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.all(16),
            color: Colors.white,
            child: Row(
              children: [
                _buildStatCard("New", newOrders, Colors.orange),
                SizedBox(width: 12),
                _buildStatCard("Preparing", preparing, Colors.blue),
                SizedBox(width: 12),
                _buildStatCard("Ready", ready, Colors.green),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                return _buildOrderCard(orders[index]);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, int count, Color color) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
          boxShadow: [BoxShadow(color: color.withOpacity(0.1), blurRadius: 4, offset: Offset(0, 2))],
        ),
        child: Column(
          children: [
            Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 12, fontWeight: FontWeight.bold)),
            SizedBox(height: 4),
            Text("$count", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderCard(Order order) {
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("Order #${order.id.toString().substring(order.id.toString().length - 4)}",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Text("฿${order.totalPrice.toStringAsFixed(0)}", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.person, size: 16, color: Colors.grey),
                SizedBox(width: 4),
                Text(order.customerName, style: TextStyle(color: Colors.grey[700])),
                SizedBox(width: 16),
                Container(
                   padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                   decoration: BoxDecoration(
                     color: _service.getStatusColor(order.status),
                     borderRadius: BorderRadius.circular(4)
                   ),
                   child: Text(_service.getStatusLabel(order.status), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _service.getStatusTextColor(order.status))),
                )
              ],
            ),
            Divider(height: 24),
            ...order.items.map((item) => Padding(
              padding: EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  Text("${item.quantity}x", style: TextStyle(fontWeight: FontWeight.bold)),
                  SizedBox(width: 8),
                  Text(item.menuItem.name),
                ],
              ),
            )),
            SizedBox(height: 16),
            _buildActionButtons(order),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(Order order) {
    switch (order.status) {
      case OrderStatus.PENDING:
        return Row(
          children: [
            Expanded(
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                onPressed: () => _updateStatus(order.id, OrderStatus.CONFIRMED),
                child: Text("Accept"),
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                onPressed: () => _updateStatus(order.id, OrderStatus.CANCELLED),
                child: Text("Reject"),
              ),
            ),
          ],
        );
      case OrderStatus.CONFIRMED:
        return SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
            onPressed: () => _updateStatus(order.id, OrderStatus.PREPARING),
            child: Text("Start Cooking"),
          ),
        );
      case OrderStatus.PREPARING:
        return SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            onPressed: () => _updateStatus(order.id, OrderStatus.READY),
            child: Text("Mark Ready"),
          ),
        );
      default:
        return SizedBox.shrink();
    }
  }
}
