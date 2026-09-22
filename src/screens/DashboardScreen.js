import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  bg: '#070E20',
  card: '#131a2b',
  cardBorder: '#26314a',
  orange: '#ff7a1a',
  orangeSoft: 'rgba(255,122,26,0.12)',
  green: '#2ecc71',
  greenSoft: 'rgba(46,204,113,0.12)',
  blue: '#3498db',
  blueSoft: 'rgba(52,152,219,0.12)',
  red: '#e74c3c',
  textPrimary: '#ffffff',
  textSecondary: '#8b93a7',
  inputBg: '#0f1626',
};

// Dummy Data for Demonstration
const MOCK_ADMIN_METRICS = {
  totalRevenue: '$14,280.00',
  totalOrders: 142,
  activeTables: '18/22',
  kitchenQueue: 8,
};

const MOCK_USER_METRICS = {
  myTodayOrders: 24,
  myTodaySales: '$680.50',
  myActiveTickets: 3,
  shiftHours: '5.5 hrs',
};

const MOCK_MY_ORDERS = [
  { id: '#ORD-1092', table: 'Table 04', items: '2x Wagyu Burger, 1x Coke', total: '$48.50', status: 'Completed', time: '18:45' },
  { id: '#ORD-1088', table: 'Table 12', items: '1x Truffle Pasta, 2x Latte', total: '$36.00', status: 'In Kitchen', time: '18:30' },
  { id: '#ORD-1081', table: 'Table 02', items: '1x Caesar Salad, 1x Iced Tea', total: '$22.00', status: 'Completed', time: '17:55' },
  { id: '#ORD-1075', table: 'Takeaway', items: '3x Club Sandwich, 3x Mocha', total: '$54.00', status: 'Completed', time: '17:10' },
];

export default function DashboardScreen({ route, navigation }) {
  const authContext = useAuth ? useAuth() : {};
  const { userRole, logout } = authContext;

  // Route params take precedence with AuthContext fallback
  const currentRole = route?.params?.role || userRole || 'user';
  const isAdmin = currentRole === 'admin';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} translucent={false} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.welcomeTitle} numberOfLines={1}>
                {isAdmin ? 'Admin Dashboard' : 'My Shift Dashboard'}
              </Text>
              {isAdmin && (
                <Ionicons name="flash" size={18} color={COLORS.orange} style={{ marginLeft: 6 }} />
              )}
            </View>
            <Text style={styles.roleSubtext}>
              Logged in as: <Text style={styles.roleBadge}>{isAdmin ? 'System Admin' : 'Staff Member'}</Text>
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={() => logout?.()} 
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ----------------- ADMIN DASHBOARD VIEW ----------------- */}
        {isAdmin ? (
          <>
            {/* Admin Overview Cards */}
            <Text style={styles.sectionHeading}>Overall Restaurant Performance</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Revenue</Text>
                <Text style={styles.metricValue}>{MOCK_ADMIN_METRICS.totalRevenue}</Text>
                <Text style={styles.metricTrend}>+12.5% vs yesterday</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Orders</Text>
                <Text style={styles.metricValue}>{MOCK_ADMIN_METRICS.totalOrders}</Text>
                <Text style={styles.metricSub}>Across 22 Tables</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Active Tables</Text>
                <Text style={styles.metricValue}>{MOCK_ADMIN_METRICS.activeTables}</Text>
                <Text style={styles.metricSub}>81% Occupancy</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Kitchen Queue</Text>
                <Text style={[styles.metricValue, { color: COLORS.orange }]}>
                  {MOCK_ADMIN_METRICS.kitchenQueue} Tickets
                </Text>
                <Text style={styles.metricSub}>Avg Prep: 14 mins</Text>
              </View>
            </View>

            {/* Admin Quick Actions */}
            <Text style={styles.sectionHeading}>Admin Management & Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity 
                style={styles.adminActionBtn}
                onPress={() => navigation?.navigate('Orders')}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={24} color={COLORS.orange} style={{ marginBottom: 6 }} />
                <Text style={styles.actionBtnText}>Add New Order</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.adminActionBtn}
                onPress={() => navigation?.navigate('Tables')}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={24} color={COLORS.orange} style={{ marginBottom: 6 }} />
                <Text style={styles.actionBtnText}>Edit Floor Plan</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.adminActionBtn}
                onPress={() => navigation?.navigate('Menu')}
                activeOpacity={0.7}
              >
                <Ionicons name="restaurant-outline" size={24} color={COLORS.orange} style={{ marginBottom: 6 }} />
                <Text style={styles.actionBtnText}>Update Menu</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.adminActionBtn, { borderColor: COLORS.red }]}
                onPress={() => navigation?.navigate('Orders')}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={24} color={COLORS.red} style={{ marginBottom: 6 }} />
                <Text style={[styles.actionBtnText, { color: COLORS.red }]}>Void / Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* ----------------- USER / STAFF DASHBOARD VIEW ----------------- */
          <>
            {/* Personal Performance Metrics */}
            <Text style={styles.sectionHeading}>Today's Work Summary</Text>
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { borderColor: COLORS.orange }]}>
                <Text style={styles.metricLabel}>Orders Processed Today</Text>
                <Text style={[styles.metricValue, { color: COLORS.orange }]}>
                  {MOCK_USER_METRICS.myTodayOrders}
                </Text>
                <Text style={styles.metricSub}>Today's count</Text>
              </View>
              <View style={[styles.metricCard, { borderColor: COLORS.green }]}>
                <Text style={styles.metricLabel}>Total Sales Done</Text>
                <Text style={[styles.metricValue, { color: COLORS.green }]}>
                  {MOCK_USER_METRICS.myTodaySales}
                </Text>
                <Text style={styles.metricSub}>Collected Amount</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Active Kitchen Tickets</Text>
                <Text style={styles.metricValue}>{MOCK_USER_METRICS.myActiveTickets}</Text>
                <Text style={styles.metricSub}>In Process</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Logged Shift Time</Text>
                <Text style={styles.metricValue}>{MOCK_USER_METRICS.shiftHours}</Text>
                <Text style={styles.metricSub}>Active</Text>
              </View>
            </View>

            {/* User Orders Details */}
            <View style={styles.listHeaderRow}>
              <Text style={styles.sectionHeading}>My Served Orders Detail</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="lock-closed-outline" size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.readOnlyTag}>Read-Only View</Text>
              </View>
            </View>

            {MOCK_MY_ORDERS.map((item) => (
              <View key={item.id} style={styles.orderDetailCard}>
                <View style={styles.orderTopRow}>
                  <Text style={styles.orderIdText}>{item.id}</Text>
                  <Text style={styles.orderTimeText}>{item.time}</Text>
                </View>
                <View style={styles.orderMiddleRow}>
                  <Text style={styles.orderTableText}>{item.table}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: item.status === 'Completed' ? COLORS.greenSoft : COLORS.orangeSoft },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: item.status === 'Completed' ? COLORS.green : COLORS.orange },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderItemsText}>{item.items}</Text>
                <View style={styles.orderBottomRow}>
                  <Text style={styles.totalLabel}>Bill Amount:</Text>
                  <Text style={styles.totalValue}>{item.total}</Text>
                </View>
              </View>
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingBottom: 40 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'android' ? 8 : 4,
  },
  welcomeTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  roleSubtext: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  roleBadge: { color: COLORS.orange, fontWeight: '700' },
  logoutBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: { color: COLORS.red, fontWeight: '600', fontSize: 12 },

  sectionHeading: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 15,
    marginBottom: 12,
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  metricLabel: { color: COLORS.textSecondary, fontSize: 12 },
  metricValue: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700', marginTop: 6 },
  metricTrend: { color: COLORS.green, fontSize: 11, marginTop: 4 },
  metricSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  adminActionBtn: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },

  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  readOnlyTag: { color: COLORS.textSecondary, fontSize: 11 },

  orderDetailCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  orderIdText: { color: COLORS.orange, fontWeight: '700', fontSize: 13 },
  orderTimeText: { color: COLORS.textSecondary, fontSize: 12 },
  orderMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  orderTableText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderItemsText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 8 },
  
  orderBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  totalLabel: { color: COLORS.textSecondary, fontSize: 12 },
  totalValue: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
});