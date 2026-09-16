import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';

const CATEGORIES = ['All Items', 'Main Course', 'Drinks', 'Dessert'];

const MENU_ITEMS = [
  { id: '1', name: 'Truffle Wagyu Ribeye', category: 'Main Course', price: 68.00, tag: 'Chef Choice' },
  { id: '2', name: 'Hokkaido Scallops Crudo', category: 'Main Course', price: 39.25, tag: 'Popular' },
  { id: '3', name: 'Yuzu Basil Smash', category: 'Drinks', price: 28.00, tag: 'Cold' },
  { id: '4', name: 'Smoked Oak Old Fashioned', category: 'Drinks', price: 32.50, tag: 'Signature' },
  { id: '5', name: 'Matcha Lava Soufflé', category: 'Dessert', price: 22.00, tag: 'Sweet' },
];

export default function OrderScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [cart, setCart] = useState([
    { id: '1', name: 'Truffle Wagyu Ribeye', price: 68.00, quantity: 1 },
    { id: '3', name: 'Yuzu Basil Smash', price: 28.00, quantity: 2 },
  ]);

  const filteredMenu = MENU_ITEMS.filter(
    item => selectedCategory === 'All Items' || item.category === selectedCategory
  );

  // Dynamic Calculation
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.10; // 10% tax
  const grandTotal = subtotal + tax;

  const updateQuantity = (id, change) => {
    setCart(prevCart =>
      prevCart
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === item.id);
      if (existing) {
        return prevCart.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🛒 Active POS Order</Text>
          <Text style={styles.subtitle}>Table T-02 • Server: Alex</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>● Preparing</Text>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryTab, selectedCategory === cat && styles.activeCategoryTab]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.activeCategoryText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Menu Items Grid */}
        <Text style={styles.sectionTitle}>Select Items</Text>
        <View style={styles.menuGrid}>
          {filteredMenu.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => addToCart(item)}
            >
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
              <Text style={styles.menuName}>{item.name}</Text>
              <View style={styles.menuFooter}>
                <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
                <View style={styles.addBtn}>
                  <Text style={styles.addBtnText}>+</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Order Summary Panel */}
        <View style={styles.cartPanel}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Current Order ({cart.reduce((a, b) => a + b.quantity, 0)})</Text>
            <TouchableOpacity onPress={() => setCart([])}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {cart.length === 0 ? (
            <Text style={styles.emptyCart}>No items added to this ticket yet.</Text>
          ) : (
            cart.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>

                {/* Quantity Controller */}
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* Checkout Totals */}
          <View style={styles.divider} />
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tax (10%)</Text>
            <Text style={styles.billValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.billRow, { marginTop: 6 }]}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.kitchenBtn}>
              <Text style={styles.kitchenBtnText}>Send to Kitchen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.payBtn}>
              <Text style={styles.payBtnText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070E20' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#7D879D', fontSize: 12, marginTop: 4 },
  statusBadge: { backgroundColor: '#3B2D12', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { color: '#F5AE22', fontSize: 12, fontWeight: '700' },
  
  categoryContainer: { paddingHorizontal: 16, marginBottom: 12 },
  categoryTab: {
    backgroundColor: '#0D162C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  activeCategoryTab: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
  categoryText: { color: '#8D96AA', fontWeight: '600' },
  activeCategoryText: { color: '#FFFFFF', fontWeight: '800' },

  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 12 },

  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuCard: {
    width: '48%',
    backgroundColor: '#0D162C',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#202D49',
    marginBottom: 12,
  },
  tagBadge: { backgroundColor: '#1A2640', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: '#FF7622', fontSize: 10, fontWeight: '700' },
  menuName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 10, height: 40 },
  menuFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  menuPrice: { color: '#35D49B', fontSize: 16, fontWeight: '800' },
  addBtn: { backgroundColor: '#FF7622', width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },

  cartPanel: {
    backgroundColor: '#0D162C',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#25334F',
    padding: 18,
    marginTop: 10,
  },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  clearText: { color: '#FF526A', fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#202D49', marginVertical: 14 },
  emptyCart: { color: '#7D879D', fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },

  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cartItemInfo: { flex: 1, marginRight: 10 },
  cartItemName: { color: '#D9DDE7', fontSize: 14, fontWeight: '600' },
  cartItemPrice: { color: '#35D49B', fontSize: 13, fontWeight: '700', marginTop: 2 },
  
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16223B', borderRadius: 8, padding: 4 },
  qtyBtn: { width: 26, height: 26, backgroundColor: '#202D49', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  qtyText: { color: '#FFFFFF', paddingHorizontal: 10, fontWeight: '700' },

  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  billLabel: { color: '#7D879D', fontSize: 13 },
  billValue: { color: '#BFC5D3', fontSize: 13, fontWeight: '600' },
  totalLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  totalValue: { color: '#35D49B', fontSize: 18, fontWeight: '800' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  kitchenBtn: {
    width: '48%',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3753',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kitchenBtnText: { color: '#C8CEDA', fontWeight: '700' },
  payBtn: {
    width: '48%',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#35D49B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payBtnText: { color: '#070E20', fontWeight: '800', fontSize: 15 },
});