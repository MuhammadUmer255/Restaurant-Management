import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from '../components/Toast'; 

const INITIAL_TABLES = [
  { id: 'T-01', seats: 2, status: 'Available', zone: 'Indoor Main' },
  {
    id: 'T-02',
    seats: 4,
    status: 'Occupied',
    customer: 'Julien',
    amount: '$148.50',
    zone: 'Indoor Main',
    order: [{ name: 'Truffle Wagyu Ribeye', price: 68.00 }, { name: 'Yuzu Basil Smash', price: 28.00 }]
  },
  { id: 'T-03', seats: 6, status: 'Reserved', customer: 'Dr. Raymond', time: '19:30', zone: 'Terrace' },
  {
    id: 'T-04',
    seats: 2,
    status: 'Occupied',
    customer: 'Sarah',
    amount: '$95.00',
    zone: 'Indoor Main',
    order: [{ name: 'Hokkaido Scallops Crudo', price: 39.25 }]
  },
  { id: 'T-05', seats: 4, status: 'Available', zone: 'Terrace' },
  {
    id: 'VIP-1',
    seats: 8,
    status: 'Occupied',
    customer: 'VIP Guest',
    amount: '$390.00',
    zone: 'Terrace',
    order: [{ name: 'Chef Special Platter', price: 390.00 }]
  },
];

const ZONES = ['All', 'Indoor Main', 'Terrace'];

export default function TablesScreen({ navigation }) {
  const [tables] = useState(INITIAL_TABLES);
  const [selectedTable, setSelectedTable] = useState('T-01');
  const [selectedZone, setSelectedZone] = useState('All');

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

  // Dynamic Filtering
  const filteredTables = tables.filter(
    table => selectedZone === 'All' || table.zone === selectedZone
  );

  const available = tables.filter(t => t.status === 'Available').length;
  const occupied = tables.filter(t => t.status === 'Occupied').length;
  const reserved = tables.filter(t => t.status === 'Reserved').length;

  // Dynamic Seat & Occupancy Calculation
  const activeOccupiedSeats = tables
    .filter(t => t.status === 'Occupied')
    .reduce((sum, t) => sum + t.seats, 0);

  const occupancyPercentage = tables.length > 0
    ? Math.round((occupied / tables.length) * 100)
    : 0;

  const selected = tables.find(table => table.id === selectedTable);

  const handleCheckout = () => {
    if (!selected) return;

    if (selected.status !== 'Occupied' || !selected.order?.length) {
      showToast('Selected table has no active order to check out.', 'error');
      return;
    }

    showToast(`Navigating to checkout for Table ${selected.id}...`, 'success');

    setTimeout(() => {
      navigation?.navigate('Billing', {
        orderData: {
          table: selected.id,
          customer: selected.customer || 'Guest',
          items: selected.order || [],
        }
      });
    }, 400);
  };

  const handleAddOrder = () => {
    if (!selected) return;
    showToast(`Adding items to Table ${selected.id}...`, 'success');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#070E20" translucent={false} />

      {/* Top Floating Toast Notification */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onDismiss={hideToast}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="restaurant-outline" size={18} color="#FF7622" style={{ marginRight: 6 }} />
            <Text style={styles.logo}>GourmetOS</Text>
          </View>
          <Text style={styles.location}>Restaurant Floor • Selected: {selectedTable}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => showToast('No new notifications.', 'info')}
        >
          <Ionicons name="notifications-outline" size={20} color="#FF7622" />
        </TouchableOpacity>
      </View>

      {/* Floor Zone Tabs */}
      <View style={styles.floorTabs}>
        {ZONES.map(zone => (
          <TouchableOpacity
            key={zone}
            style={[styles.tab, selectedZone === zone && styles.activeTab]}
            onPress={() => setSelectedZone(zone)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedZone === zone && styles.activeTabText]}>
              {zone === 'All' ? `All (${tables.length})` : zone}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>OCCUPANCY</Text>
            <Text style={styles.statValue}>{occupancyPercentage}%</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SEATS</Text>
            <Text style={styles.redValue}>{activeOccupiedSeats}</Text>
            <Text style={styles.smallText}>Active</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>OPEN</Text>
            <Text style={styles.greenValue}>{available}</Text>
            <Text style={styles.smallText}>Tables</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendText}>🟢 Available {available}</Text>
          <Text style={styles.legendText}>🔴 Occupied {occupied}</Text>
          <Text style={styles.legendText}>🟡 Reserved {reserved}</Text>
        </View>

        <Text style={styles.sectionTitle}>Restaurant Tables</Text>

        {/* Tables Grid */}
        <View style={styles.grid}>
          {filteredTables.map(table => (
            <TouchableOpacity
              key={table.id}
              style={[
                styles.tableCard,
                selectedTable === table.id && styles.selectedTable,
              ]}
              onPress={() => setSelectedTable(table.id)}
              activeOpacity={0.8}
            >
              <View style={styles.tableHeader}>
                <Text style={styles.tableNumber}>{table.id}</Text>
                <StatusBadge status={table.status} />
              </View>

              <Text style={styles.seats}>{table.seats} Seats</Text>

              {table.customer && (
                <Text style={styles.customer} numberOfLines={1}>{table.customer}</Text>
              )}
              {table.amount && (
                <Text style={styles.amount}>{table.amount}</Text>
              )}
              {table.time && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Ionicons name="time-outline" size={12} color="#F5AE22" style={{ marginRight: 3 }} />
                  <Text style={styles.time}>{table.time}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Selected Table Panel */}
        {selected && (
          <View style={styles.selectedPanel}>
            <Text style={styles.selectedTitle}>Table {selected.id}</Text>
            <Text style={styles.selectedSubtitle}>
              {selected.seats} Guests • {selected.status} {selected.zone ? `(${selected.zone})` : ''}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.orderTitle}>Current Status Details</Text>

            {selected.status === 'Occupied' && selected.order ? (
              selected.order.map((item, idx) => (
                <OrderItem key={idx} name={item.name} price={item.price} />
              ))
            ) : selected.status === 'Reserved' ? (
              <Text style={styles.emptyNotice}>Reserved for {selected.customer} at {selected.time}</Text>
            ) : (
              <Text style={styles.emptyNotice}>Table is currently available for new guests.</Text>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAddOrder}
                activeOpacity={0.7}
              >
                <Text style={styles.actionText}>+ Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.primaryButton,
                  selected.status !== 'Occupied' && styles.disabledButton
                ]}
                onPress={handleCheckout}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryText}>Checkout / Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusBadge({ status }) {
  let background = '#12382E';
  let color = '#35D49B';

  if (status === 'Occupied') {
    background = '#3A1822';
    color = '#FF526A';
  }
  if (status === 'Reserved') {
    background = '#3B2D12';
    color = '#F5AE22';
  }

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={{ color, fontSize: 11, fontWeight: '600' }}>● {status}</Text>
    </View>
  );
}

function OrderItem({ name, price }) {
  const formattedPrice = typeof price === 'number' ? `$${price.toFixed(2)}` : price;
  return (
    <View style={styles.orderItem}>
      <Text style={styles.orderName} numberOfLines={1}>{name}</Text>
      <Text style={styles.orderPrice}>{formattedPrice}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070E20' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 4 : 0,
  },
  logo: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  location: { color: '#7D879D', fontSize: 12, marginTop: 4 },
  floorTabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12 },
  tab: {
    backgroundColor: '#101A31',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  activeTab: { backgroundColor: '#FF7622' },
  tabText: { color: '#8D96AA', fontSize: 13 },
  activeTabText: { color: '#FFFFFF', fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    width: '31%',
    backgroundColor: '#0D162C',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  statLabel: { color: '#7E879B', fontSize: 10, fontWeight: '700' },
  statValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginTop: 6 },
  redValue: { color: '#FF526A', fontSize: 20, fontWeight: '800', marginTop: 6 },
  greenValue: { color: '#35D49B', fontSize: 20, fontWeight: '800', marginTop: 6 },
  smallText: { color: '#778197', fontSize: 11, marginTop: 2 },
  legend: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 18 },
  legendText: { color: '#9CA4B5', fontSize: 12 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tableCard: {
    width: '48%',
    minHeight: 125,
    backgroundColor: '#0D162C',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#202D49',
    marginBottom: 12,
  },
  selectedTable: { borderColor: '#FF7622', borderWidth: 2 },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tableNumber: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  badge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6 },
  seats: { color: '#858FA5', marginTop: 10, fontSize: 12 },
  customer: { color: '#D9DDE7', marginTop: 8, fontWeight: '600', fontSize: 13 },
  amount: { color: '#35D49B', marginTop: 4, fontWeight: '700', fontSize: 13 },
  time: { color: '#F5AE22', fontSize: 12 },
  selectedPanel: {
    backgroundColor: '#0D162C',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#25334F',
    padding: 18,
    marginTop: 10,
  },
  selectedTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  selectedSubtitle: { color: '#7F899F', marginTop: 4, fontSize: 13 },
  divider: { height: 1, backgroundColor: '#202D49', marginVertical: 14 },
  orderTitle: { color: '#FFFFFF', fontWeight: '700', marginBottom: 10, fontSize: 14 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  orderName: { color: '#BFC5D3', flex: 1, paddingRight: 8, fontSize: 13 },
  orderPrice: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  emptyNotice: { color: '#7D879D', fontStyle: 'italic', paddingVertical: 8, fontSize: 13 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  actionButton: {
    width: '48%',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3753',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
  disabledButton: { opacity: 0.5 },
  actionText: { color: '#C8CEDA', fontWeight: '700', fontSize: 13 },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});