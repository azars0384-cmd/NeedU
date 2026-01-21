import 'dart:async';
import 'package:flutter/material.dart';
import '../../services/mock_service.dart';

class AdminDashboardScreen extends StatefulWidget {
  @override
  _AdminDashboardScreenState createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final MockService _service = MockService();
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(Duration(seconds: 5), (timer) {
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
    final orders = _service.orders;
    final totalRevenue = orders.where((o) => o.status != OrderStatus.CANCELLED).fold(0.0, (sum, o) => sum + o.totalPrice);
    final completed = orders.where((o) => o.status == OrderStatus.DELIVERED).length;
    final active = orders.where((o) => o.status != OrderStatus.DELIVERED && o.status != OrderStatus.CANCELLED).length;

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text("Admin Dashboard"),
        backgroundColor: Colors.indigo,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GridView.count(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.5,
              children: [
                _buildStatCard("Total Orders", "${orders.length}", Colors.purple, Icons.shopping_bag),
                _buildStatCard("Revenue", "฿${totalRevenue.toStringAsFixed(0)}", Colors.green, Icons.attach_money),
                _buildStatCard("Completed", "$completed", Colors.blue, Icons.check_circle),
                _buildStatCard("Active", "$active", Colors.orange, Icons.access_time),
              ],
            ),
            SizedBox(height: 24),
            Text("Recent Orders", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)],
              ),
              child: ListView.separated(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                itemCount: orders.length > 10 ? 10 : orders.length,
                separatorBuilder: (ctx, i) => Divider(height: 1),
                itemBuilder: (context, index) {
                  // Show latest first
                  final order = orders[orders.length - 1 - index];
                  return ListTile(
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    title: Text("Order #${order.id}", style: TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text("${order.customerName} • ${order.restaurantName}"),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text("฿${order.totalPrice.toStringAsFixed(0)}", style: TextStyle(fontWeight: FontWeight.bold)),
                        SizedBox(height: 4),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: _service.getStatusColor(order.status),
                            borderRadius: BorderRadius.circular(4)
                          ),
                          child: Text(_service.getStatusLabel(order.status), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _service.getStatusTextColor(order.status))),
                        )
                      ],
                    ),
                  );
                },
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color, IconData icon) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border(left: BorderSide(color: color, width: 4)),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
              Icon(icon, color: color.withOpacity(0.5)),
            ],
          ),
          Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.black87)),
        ],
      ),
    );
  }
}
