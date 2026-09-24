import React, { useState, useMemo } from 'react';
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
import Toast from '../components/Toast';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../context/ThemeContext';

const INITIAL_ORDERS = [
  {
    id: 'ORD-101',
    table: 'T-02',
    waiter: 'Alex',
    time: '12 mins ago',
    status: 'In Kitchen',
    paymentStatus: 'Unpaid',
    total: 9600,
    items: [
      { qty: 1, name: 'Truffle Wagyu Ribeye', price: 6800 },
      { qty: 1, name: 'Yuzu Basil Smash', price: 2800 },
    ],
  },
  {
    id: 'ORD-102',
    table: 'T-04',
    waiter: 'Sarah',
    time: '25 mins ago',
    status: 'Served',
    paymentStatus: 'Unpaid',
    total: 3925,
    items: [
      { qty: 1, name: 'Hokkaido Scallops Crudo', price: 3925 },
    ],
  },
  {
    id: 'ORD-103',
    table: 'VIP-1',
    waiter: 'John',
    time: '5 mins ago',
    status: 'Pending',
    paymentStatus: 'Unpaid',
    total: 39000,
    items: [
      { qty: 1, name: 'Chef Special Platter', price: 39000 },
    ],
  },
];

const STATUS_FILTERS = ['All', 'Pending', 'In Kitchen', 'Served', 'Completed'];

export default function OrdersScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Toast State
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message, type = 'success') => {
    setToastConfig({ visible: true, message, type });
  };

  const hideToast = () => {
    setToastConfig((prev) => ({ ...prev, visible: false }));
  };

  const filteredOrders = orders.filter(
    (order) => selectedFilter === 'All' || order.status === selectedFilter
  );

  const handleNextStatus = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          let nextStatus = o.status;
          let toastMsg = '';

          if (o.status === 'Pending') {
            nextStatus = 'In Kitchen';
            toastMsg = `Order ${o.id} sent to kitchen!`;
          } else if (o.status === 'In Kitchen') {
            nextStatus = 'Served';
            toastMsg = `Order ${o.id} marked as served!`;
          }

          if (toastMsg) showToast(toastMsg, 'success');
          return { ...o, status: nextStatus };
        }
        return o;
      })
    );
  };

  const handleCheckout = (order) => {
    showToast(`Navigating to checkout for ${order.id}...`, 'info');
    setTimeout(() => {
      navigation?.navigate('Billing', {
        orderData: {
          id: order.id,
          table: order.table,
          customer: order.waiter ? `Served by ${order.waiter}` : 'Walk-in Guest',
          items: order.items,
        },
      });
    }, 300);
  };

  const handleNewOrder = () => {
    showToast('Select a table from Tables tab to start new order', 'info');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
        translucent={false}
      />

      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onDismiss={hideToast}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Orders</Text>
          <Text style={styles.subtitle}>Active Kitchen & Service Orders</Text>
        </View>
        <TouchableOpacity style={styles.newOrderBtn} activeOpacity={0.8} onPress={handleNewOrder}>
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
        ListEmptyComponent={
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 40, fontStyle: 'italic' }}>
            No orders found under "{selectedFilter}".
          </Text>
        }
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
                  <Ionicons name="time-outline" size={11} color={colors.muted} style={{ marginRight: 3 }} />
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
                    {formatCurrency(subItem.price)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
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
                    <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} style={{ marginRight: 4 }} />
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
  const { colors } = useTheme();

  let bg = 'rgba(53, 212, 155, 0.15)';
  let color = colors.success;

  if (status === 'Pending') {
    bg = 'rgba(245, 174, 34, 0.15)';
    color = colors.warning;
  } else if (status === 'In Kitchen') {
    bg = 'rgba(33, 150, 243, 0.15)';
    color = '#2196F3';
  } else if (status === 'Served') {
    bg = 'rgba(255, 82, 106, 0.15)';
    color = colors.danger;
  }

  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>● {status}</Text>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: {
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'android' ? 8 : 12,
      paddingBottom: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: { color: c.text, fontSize: 22, fontWeight: 'bold' },
    subtitle: { color: c.muted, fontSize: 12, marginTop: 2 },
    newOrderBtn: { backgroundColor: c.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    newOrderText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
    filterWrapper: { marginBottom: 10 },
    filterRow: { paddingHorizontal: 16 },
    filterChip: {
      backgroundColor: c.chip,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    activeFilterChip: { backgroundColor: c.primary, borderColor: c.primary },
    filterText: { color: c.icon, fontSize: 12, fontWeight: '600' },
    activeFilterText: { color: '#FFF', fontWeight: 'bold' },
    listContainer: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 30 },
    orderCard: {
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    tableText: { color: c.text, fontSize: 18, fontWeight: 'bold' },
    orderIdText: { color: c.muted, fontSize: 12, marginTop: 2 },
    statusBadgeWrapper: { alignItems: 'flex-end' },
    timeText: { color: c.muted, fontSize: 10 },
    divider: { height: 1, backgroundColor: c.border, marginVertical: 12 },
    itemsList: { marginVertical: 2 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    itemQty: { color: c.primary, fontWeight: 'bold', width: 28 },
    itemName: { color: c.label, flex: 1, fontSize: 13, paddingRight: 8 },
    itemPrice: { color: c.text, fontWeight: '600', fontSize: 13 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    totalLabel: { color: c.muted, fontSize: 10 },
    totalValue: { color: c.success, fontSize: 18, fontWeight: 'bold' },
    actionBtn: { backgroundColor: c.chip, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: c.border },
    actionBtnText: { color: c.primary, fontWeight: 'bold', fontSize: 12 },
    checkoutBtn: { backgroundColor: c.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    checkoutBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
    completedBadge: { backgroundColor: 'rgba(53, 212, 155, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    completedText: { color: c.success, fontWeight: '600', fontSize: 12 },
  });