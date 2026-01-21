import 'package:flutter/material.dart';
import '../../services/mock_service.dart';
import 'cart_screen.dart';

class CustomerMenuScreen extends StatefulWidget {
  final Restaurant restaurant;

  const CustomerMenuScreen({Key? key, required this.restaurant}) : super(key: key);

  @override
  _CustomerMenuScreenState createState() => _CustomerMenuScreenState();
}

class _CustomerMenuScreenState extends State<CustomerMenuScreen> {
  List<CartItem> cart = [];

  void addToCart(MenuItem item) {
    setState(() {
      final existingIndex = cart.indexWhere((i) => i.menuItem.id == item.id);
      if (existingIndex != -1) {
        cart[existingIndex].quantity++;
      } else {
        cart.add(CartItem(
          menuItem: item,
          quantity: 1,
          restaurantId: widget.restaurant.id,
          restaurantName: widget.restaurant.name
        ));
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Added ${item.name} to cart"), duration: Duration(milliseconds: 500)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(widget.restaurant.name),
              background: Image.network(
                widget.restaurant.imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(color: Colors.grey),
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final item = widget.restaurant.menu[index];
                return ListTile(
                  contentPadding: EdgeInsets.all(16),
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      item.imageUrl,
                      width: 60,
                      height: 60,
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, err, stack) => Container(width: 60, height: 60, color: Colors.grey[200]),
                    ),
                  ),
                  title: Text(item.name, style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text("฿${item.price.toStringAsFixed(0)}"),
                  trailing: IconButton(
                    icon: Icon(Icons.add_circle, color: Colors.green),
                    onPressed: () => addToCart(item),
                  ),
                );
              },
              childCount: widget.restaurant.menu.length,
            ),
          ),
        ],
      ),
      bottomNavigationBar: cart.isNotEmpty ? Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -5))],
        ),
        child: SafeArea(
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              padding: EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
               Navigator.push(context, MaterialPageRoute(builder: (_) => CustomerCartScreen(initialCart: cart)));
            },
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: EdgeInsets.all(6),
                  decoration: BoxDecoration(color: Colors.green[800], shape: BoxShape.circle),
                  child: Text("${cart.fold(0, (sum, item) => sum + item.quantity)}", style: TextStyle(color: Colors.white)),
                ),
                Text("View Cart", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                Text("฿${cart.fold(0.0, (sum, item) => sum + item.totalPrice).toStringAsFixed(0)}", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              ],
            ),
          ),
        ),
      ) : null,
    );
  }
}
