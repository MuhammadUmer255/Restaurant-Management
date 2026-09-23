import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

const DashboardScreen = ({ route, navigation }) => {
  const { width } = useWindowDimensions();
  const authContext = useAuth ? useAuth() : {};
  const user = authContext?.user || {};

  // Case-Insensitive Role Resolution
  const rawRole = route?.params?.role || user?.role || 'admin';
  const currentRole = String(rawRole).trim().toUpperCase();
  const isAdmin = currentRole === 'ADMIN';

  const [refreshing, setRefreshing] = useState(false);

  // Responsive Grid Logic
  const isTablet = width > 600;
  const statCardWidth = isTablet ? '23%' : '48%';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleNavigate = (screenName, params = {}) => {
    if (navigation?.navigate) {
      navigation.navigate(screenName, { role: currentRole, ...params });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#070E20" translucent={false} />

      {/* Header with Working Profile Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Welcome Back </Text>
          <Text style={styles.userName}>{user?.name || user?.username || 'u7121200'}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.profileBadge}
            onPress={() => handleNavigate('ProfileScreen')}
            activeOpacity={0.7}
          >
            <Text style={styles.roleBadgeText}>{currentRole}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.profileIconBtn}
            onPress={() => handleNavigate('ProfileScreen')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={32} color="#FF7622" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7622" />
        }
      >
        {/* KPI Metrics */}
        <Text style={styles.sectionTitle}>Today's Metrics</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { width: statCardWidth }]}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 118, 34, 0.15)' }]}>
              <Ionicons name="cash-outline" size={20} color="#FF7622" />
            </View>
            <Text style={styles.statValue}>$1,280.50</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>

          <View style={[styles.statCard, { width: statCardWidth }]}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(53, 212, 155, 0.15)' }]}>
              <Ionicons name="receipt-outline" size={20} color="#35D49B" />
            </View>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Orders Placed</Text>
          </View>

          <View style={[styles.statCard, { width: statCardWidth }]}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(74, 144, 226, 0.15)' }]}>
              <Ionicons name="restaurant-outline" size={20} color="#4A90E2" />
            </View>
            <Text style={styles.statValue}>8 / 12</Text>
            <Text style={styles.statLabel}>Tables Occupied</Text>
          </View>

          <View style={[styles.statCard, { width: statCardWidth }]}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 183, 3, 0.15)' }]}>
              <Ionicons name="people-outline" size={20} color="#FFB703" />
            </View>
            <Text style={styles.statValue}>6 Staff</Text>
            <Text style={styles.statLabel}>On Shift</Text>
          </View>
        </View>

        {/* Management & Quick Actions */}
        <Text style={styles.sectionTitle}>Management & Actions</Text>
        <View style={styles.actionsGrid}>
          {/* Active Orders */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleNavigate('Orders')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="receipt" size={24} color="#FF7622" />
              <Ionicons name="chevron-forward" size={18} color="#7E879B" />
            </View>
            <Text style={styles.actionTitle}>Active Orders</Text>
            <Text style={styles.actionSub}>View & process live kitchen orders</Text>
          </TouchableOpacity>

          {/* Floor Plan */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleNavigate('Tables')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="grid" size={24} color="#35D49B" />
              <Ionicons name="chevron-forward" size={18} color="#7E879B" />
            </View>
            <Text style={styles.actionTitle}>Floor Plan</Text>
            <Text style={styles.actionSub}>Seating, status & table assignments</Text>
          </TouchableOpacity>

          {/* Menu Items */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleNavigate('Menu')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="restaurant" size={24} color="#4A90E2" />
              <Ionicons name="chevron-forward" size={18} color="#7E879B" />
            </View>
            <Text style={styles.actionTitle}>Menu Items</Text>
            <Text style={styles.actionSub}>Update dishes, pricing & availability</Text>
          </TouchableOpacity>

          {/* Manage Staff (Always Visible for Admin Role) */}
          {isAdmin && (
            <TouchableOpacity
              style={[styles.actionCard, styles.adminHighlightCard]}
              onPress={() => handleNavigate('EmployeeCrud')}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="people" size={24} color="#FF7622" />
                <Ionicons name="chevron-forward" size={18} color="#FF7622" />
              </View>
              <Text style={styles.actionTitle}>Manage Staff</Text>
              <Text style={styles.actionSub}>Add, update or modify employee roles</Text>
            </TouchableOpacity>
          )}

          {/* Billing */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleNavigate('Billing')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="card" size={24} color="#9B51E0" />
              <Ionicons name="chevron-forward" size={18} color="#7E879B" />
            </View>
            <Text style={styles.actionTitle}>Billing & Checkout</Text>
            <Text style={styles.actionSub}>Print bills & record payment methods</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Log */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>Table #4 completed payment of $84.20</Text>
              <Text style={styles.activityTime}>5 mins ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>New order #104 placed for Table #2</Text>
              <Text style={styles.activityTime}>12 mins ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: '#35D49B' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>Elena S. checked in for shift</Text>
              <Text style={styles.activityTime}>45 mins ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070E20',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#101A31',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greetingText: {
    color: '#8D96AA',
    fontSize: 12,
    fontWeight: '500',
  },
  userName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  profileBadge: {
    backgroundColor: 'rgba(255, 118, 34, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 118, 34, 0.3)',
  },
  roleBadgeText: {
    color: '#FF7622',
    fontSize: 11,
    fontWeight: '700',
  },
  profileIconBtn: {
    paddingLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    backgroundColor: '#0D162C',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#7E879B',
    fontSize: 11,
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 10,
  },
  actionCard: {
    backgroundColor: '#0D162C',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  adminHighlightCard: {
    borderColor: 'rgba(255, 118, 34, 0.4)',
    backgroundColor: '#101B35',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  actionSub: {
    color: '#7E879B',
    fontSize: 12,
    marginTop: 2,
  },
  activityList: {
    backgroundColor: '#0D162C',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#202D49',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF7622',
    marginTop: 5,
    marginRight: 10,
  },
  activityText: {
    color: '#E0E6ED',
    fontSize: 13,
    fontWeight: '500',
  },
  activityTime: {
    color: '#7E879B',
    fontSize: 11,
    marginTop: 2,
  },
});

export default DashboardScreen;