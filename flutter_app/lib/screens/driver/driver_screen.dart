import 'dart:async';
import 'package:flutter/material.dart';
import '../../services/mock_service.dart';

class DriverScreen extends StatefulWidget {
  @override
  _DriverScreenState createState() => _DriverScreenState();
}

class _DriverScreenState extends State<DriverScreen> {
  final MockService _service = MockService();
  final String _driverName = "Driver Somchai";
  late Timer _timer;

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

  void _acceptJob(int orderId) {
    setState(() {
      _service.assignDriver(orderId, _driverName);
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Job accepted!")));
  }

  void _completeJob(int orderId) {
    setState(() {
      _service.updateOrderStatus(orderId, OrderStatus.DELIVERED);
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Delivery completed!")));
  }

  @override
  Widget build(BuildContext context) {
    final activeJobs = _service.getMyActiveDriverJobs(_driverName);
    final availableJobs = _service.getOrdersForDriver();

    return Scaffold(
      appBar: AppBar(
        title: Text("Driver App"),
        backgroundColor: Colors.blue[700],
        actions: [
          Container(
            margin: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            padding: EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(color: Colors.blue[800], borderRadius: BorderRadius.circular(20)),
            child: Row(
              children: [
                Container(width: 8, height: 8, decoration: BoxDecoration(color: Colors.greenAccent, shape: BoxShape.circle)),
                SizedBox(width: 8),
                Text("Online", style: TextStyle(fontSize: 12)),
              ],
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (activeJobs.isNotEmpty) ...[
              Text("งานปัจจุบัน", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue[900])),
              SizedBox(height: 12),
              ...activeJobs.map((job) => _buildActiveJobCard(job)).toList(),
              SizedBox(height: 24),
            ],

            Text("งานใหม่ (${availableJobs.length})", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 12),
            if (availableJobs.isEmpty)
              Container(
                padding: EdgeInsets.all(32),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  children: [
                    Icon(Icons.search, size: 48, color: Colors.grey[300]),
                    SizedBox(height: 16),
                    Text("กำลังค้นหางาน...", style: TextStyle(color: Colors.grey)),
                  ],
                ),
              )
            else
              ...availableJobs.map((job) => _buildAvailableJobCard(job)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveJobCard(Order job) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(padding: EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle), child: Icon(Icons.navigation, color: Colors.blue)),
              SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("กำลังจัดส่ง", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue[900])),
                  Text("Order #${job.id}", style: TextStyle(fontSize: 12, color: Colors.blue[700])),
                ],
              )
            ],
          ),
          Divider(height: 24),
          _buildLocationRow(Colors.green, "รับที่: ${job.restaurantName}"),
          SizedBox(height: 12),
          _buildLocationRow(Colors.red, "ส่งที่: ${job.customerName}\n${job.address}"),
          SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              icon: Icon(Icons.check_circle),
              label: Text("ส่งมอบสำเร็จ"),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue[700],
                padding: EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () => _completeJob(job.id),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildAvailableJobCard(Order job) {
    return Card(
      margin: EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(padding: EdgeInsets.all(8), decoration: BoxDecoration(color: Colors.orange[50], borderRadius: BorderRadius.circular(8)), child: Icon(Icons.restaurant, color: Colors.orange, size: 20)),
                    SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(job.restaurantName, style: TextStyle(fontWeight: FontWeight.bold)),
                        Text("2.5 กม.", style: TextStyle(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                  ],
                ),
                Text("฿${(40 + job.totalPrice * 0.1).toStringAsFixed(0)}", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green)),
              ],
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.location_on, size: 16, color: Colors.red),
                SizedBox(width: 4),
                Expanded(child: Text("ส่ง: ${job.address}", maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[700]))),
                SizedBox(width: 8),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () => _acceptJob(job.id),
                  child: Text("รับงาน"),
                )
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildLocationRow(Color color, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(padding: EdgeInsets.only(top: 4), child: Icon(Icons.circle, size: 12, color: color)),
        SizedBox(width: 12),
        Expanded(child: Text(text, style: TextStyle(height: 1.4))),
      ],
    );
  }
}
