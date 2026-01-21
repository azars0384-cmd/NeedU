import 'package:flutter/material.dart';
import '../../services/mock_service.dart';
import 'order_screen.dart';

class CustomerCartScreen extends StatefulWidget {
  final List<CartItem> initialCart;

  const CustomerCartScreen({Key? key, required this.initialCart}) : super(key: key);

  @override
  _CustomerCartScreenState createState() => _CustomerCartScreenState();
}

class _CustomerCartScreenState extends State<CustomerCartScreen> {
  late List<CartItem> cart;

  @override
  void initState() {
    super.initState();
    cart = widget.initialCart;
  }

  void updateQuantity(int index, int delta) {
    setState(() {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.removeAt(index);
      }
    });
    if (cart.isEmpty) {
      Navigator.pop(context);
    }
  }

  void checkout() {
    final service = MockService();
    service.createOrder(cart, "คุณลูกค้า (Demo)", "123 ถ.สุขุมวิท กรุงเทพฯ");

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.green[100], shape: BoxShape.circle),
              child: Icon(Icons.check, color: Colors.green, size: 40),
            ),
            SizedBox(height: 16),
            Text("สั่งอาหารสำเร็จ!", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text("ร้านค้าได้รับออร์เดอร์ของคุณแล้ว", style: TextStyle(color: Colors.grey)),
            SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                child: Text("ดูสถานะออร์เดอร์", style: TextStyle(color: Colors.white)),
                onPressed: () {
                  Navigator.pop(ctx); // Close dialog
                  // Navigate to Order Screen, removing previous routes to reset home
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => CustomerOrderScreen()),
                    (route) => route.isFirst
                  );
                },
              ),
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final totalPrice = cart.fold(0.0, (sum, item) => sum + item.totalPrice);

    return Scaffold(
      appBar: AppBar(
        title: Text("ตะกร้าสินค้า"),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.separated(
              padding: EdgeInsets.all(16),
              itemCount: cart.length,
              separatorBuilder: (_, __) => Divider(),
              itemBuilder: (context, index) {
                final item = cart[index];
                return Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.menuItem.name, style: TextStyle(fontWeight: FontWeight.bold)),
                          Text("฿${item.menuItem.price.toStringAsFixed(0)}", style: TextStyle(color: Colors.green)),
                        ],
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            icon: Icon(Icons.remove, size: 16),
                            onPressed: () => updateQuantity(index, -1),
                            constraints: BoxConstraints(minWidth: 32, minHeight: 32),
                          ),
                          Text("${item.quantity}", style: TextStyle(fontWeight: FontWeight.bold)),
                          IconButton(
                            icon: Icon(Icons.add, size: 16),
                            onPressed: () => updateQuantity(index, 1),
                            constraints: BoxConstraints(minWidth: 32, minHeight: 32),
                          ),
                        ],
                      ),
                    )
                  ],
                );
              },
            ),
          ),
          Container(
            padding: EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -5))],
            ),
            child: SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("ยอดรวม", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text("฿${totalPrice.toStringAsFixed(0)}", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.green)),
                    ],
                  ),
                  SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        padding: EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: checkout,
                      child: Text("ยืนยันการสั่งซื้อ", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
