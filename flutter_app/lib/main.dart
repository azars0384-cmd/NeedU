import 'package:flutter/material.dart';
import 'screens/customer/home_screen.dart';
import 'screens/merchant/dashboard_screen.dart';
import 'screens/driver/driver_screen.dart';
import 'screens/admin/admin_screen.dart';

void main() {
  runApp(DeliveryApp());
}

class DeliveryApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Food Delivery Prototype',
      theme: ThemeData(
        primarySwatch: Colors.green,
        fontFamily: 'Inter',
        scaffoldBackgroundColor: Colors.grey[50],
      ),
      home: RoleSelectionScreen(),
    );
  }
}

class RoleSelectionScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Colors.green.shade400, Colors.blue.shade500],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.rocket_launch, size: 64, color: Colors.white),
                  SizedBox(height: 24),
                  Text(
                    "Food Delivery App",
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 8),
                  Text(
                    "Select a role to launch the app",
                    style: TextStyle(fontSize: 16, color: Colors.white70),
                  ),
                  SizedBox(height: 48),

                  _buildRoleButton(
                    context,
                    "Customer App",
                    Icons.restaurant_menu,
                    Colors.white,
                    Colors.green,
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => CustomerHomeScreen())),
                  ),
                  SizedBox(height: 16),

                  _buildRoleButton(
                    context,
                    "Merchant App",
                    Icons.store,
                    Colors.white,
                    Colors.orange,
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => MerchantDashboardScreen())),
                  ),
                  SizedBox(height: 16),

                  _buildRoleButton(
                    context,
                    "Driver App",
                    Icons.motorcycle,
                    Colors.white,
                    Colors.blue,
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => DriverScreen())),
                  ),
                  SizedBox(height: 16),

                  _buildRoleButton(
                    context,
                    "Admin Dashboard",
                    Icons.analytics,
                    Colors.white,
                    Colors.purple,
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => AdminDashboardScreen())),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoleButton(BuildContext context, String title, IconData icon, Color bg, Color textColor, VoidCallback onTap) {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: textColor,
          elevation: 4,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        onPressed: onTap,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon),
            SizedBox(width: 12),
            Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
