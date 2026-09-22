import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const INITIAL_ORDERS = [
  {
    id: 'ORD-101',
    table: 'T-02',
    waiter: 'Alex',
    time: '12 mins ago',
    status: 'In Kitchen',
    paymentStatus: 'Unpaid',
    total: '$96.00',
    items: [
      { qty: 1, name: 'Truffle Wagyu Ribeye', price: 68.00 },
      { qty: 1, name: 'Yuzu Basil Smash', price: 28.00 },
    ],
  },
  {
    id: 'ORD-102',
    table: 'T-04',
    waiter: 'Sarah',
    time: '25 mins ago',
    status: 'Served',
    paymentStatus: 'Unpaid',
    total: '$39.25',
    items: [
      { qty: 1, name: 'Hokkaido Scallops Crudo', price: 39.25 },
    ],
  },
  {
    id: 'ORD-103',
    table: 'VIP-1',
    waiter: 'John',
    time: '5 mins ago',
    status: 'Pending',
    paymentStatus: 'Unpaid',
    total: '$390.00',
    items: [
      { qty: 1, name: 'Chef Special Platter', price: 390.00 },
    ],
  },
];

const STATUS_FILTERS = ['All', 'Pending', 'In Kitchen', 'Served', 'Completed'];

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredOrders = orders.filter(
    (order) => selectedFilter === 'All' || order.status === selectedFilter
  );

  const handleNextStatus = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          let nextStatus = o.status;
          if (o.status === 'Pending') nextStatus = 'In Kitchen';
          else if (o.status === 'In Kitchen') nextStatus = 'Served';
          return { ...o, status: nextStatus };
        }
        return o;
      })
    );
  };

  const handleCheckout = (order) => {
    navigation?.navigate('Billing', { orderData: order });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#070E20" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Orders</Text>
          <Text style={styles.subtitle}>Active Kitchen & Service Orders</Text>
        </View>
        <TouchableOpacity style={styles.newOrderBtn} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="add-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.newOrderText}>New Order</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.activeFilterChip,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.tableText}>Table {item.table}</Text>
                <Text style={styles.orderIdText}>{item.id} • Waiter: {item.waiter}</Text>
              </View>
              <View style={styles.statusBadgeWrapper}>
                <StatusBadge status={item.status} />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="time-outline" size={11} color="#8A94A6" style={{ marginRight: 3 }} />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Order Items */}
            <View style={styles.itemsList}>
              {item.items.map((subItem, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemQty}>{subItem.qty}x</Text>
                  <Text style={styles.itemName} numberOfLines={1}>{subItem.name}</Text>
                  <Text style={styles.itemPrice}>
                    ${typeof subItem.price === 'number' ? subItem.price.toFixed(2) : subItem.price}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>{item.total}</Text>
              </View>

              {item.status === 'Served' ? (
                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={() => handleCheckout(item)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.checkoutBtnText}>Proceed to Pay</Text>
                    <Ionicons name="card-outline" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </View>
                </TouchableOpacity>
              ) : item.status !== 'Completed' ? (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleNextStatus(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnText}>
                    {item.status === 'Pending' && 'Send to Kitchen'}
                    {item.status === 'In Kitchen' && 'Mark Served'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.completedBadge}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle-outline" size={14} color="#35D49B" style={{ marginRight: 4 }} />
                    <Text style={styles.completedText}>Order Paid</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function StatusBadge({ status }) {
  let bg = '#12382E';
  let color = '#35D49B';

  if (status === 'Pending') {
    bg = '#3B2D12';
    color = '#F5AE22';
  } else if (status === 'In Kitchen') {
    bg = '#102A45';
    color = '#2196F3';
  } else if (status === 'Served') {
    bg = '#3A1822';
    color = '#FF526A';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>● {status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070E20' },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#7D879D', fontSize: 12, marginTop: 2 },
  newOrderBtn: { backgroundColor: '#FF7622', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  newOrderText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  filterWrapper: { marginBottom: 10 },
  filterRow: { paddingHorizontal: 16 },
  filterChip: {
    backgroundColor: '#101A31',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  activeFilterChip: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
  filterText: { color: '#8D96AA', fontSize: 12, fontWeight: '600' },
  activeFilterText: { color: '#FFF', fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 30 },
  orderCard: {
    backgroundColor: '#0D162C',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tableText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  orderIdText: { color: '#7E879B', fontSize: 12, marginTop: 2 },
  statusBadgeWrapper: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  timeText: { color: '#7E879B', fontSize: 10 },
  divider: { height: 1, backgroundColor: '#202D49', marginVertical: 12 },
  itemsList: { marginVertical: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  itemQty: { color: '#FF7622', fontWeight: 'bold', width: 28 },
  itemName: { color: '#D9DDE7', flex: 1, fontSize: 13, paddingRight: 8 },
  itemPrice: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalLabel: { color: '#7E879B', fontSize: 10 },
  totalValue: { color: '#35D49B', fontSize: 18, fontWeight: 'bold' },
  actionBtn: { backgroundColor: '#101A31', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#25334F' },
  actionBtnText: { color: '#FF7622', fontWeight: 'bold', fontSize: 12 },
  checkoutBtn: { backgroundColor: '#FF7622', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  checkoutBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  completedBadge: { backgroundColor: '#12382E', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  completedText: { color: '#35D49B', fontWeight: '600', fontSize: 12 },
});