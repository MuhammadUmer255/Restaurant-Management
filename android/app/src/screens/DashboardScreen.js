import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [timeFilter, setTimeFilter] = useState('Day');

  // Dummy State Data based on selected filter
  const salesData = {
    Day: { revenue: '$8,420.50', orders: '142', cash: '$3,120.00', card: '$5,300.50' },
    Week: { revenue: '$54,190.00', orders: '912', cash: '$19,400.00', card: '$34,790.00' },
    Month: { revenue: '$148,290.00', orders: '2,480', cash: '$52,100.00', card: '$96,190.00' },
  };

  const topDishes = [
    { id: '1', name: 'Truffle Wagyu Ribeye', sold: '384 sold', sales: '$18,432', rank: '#1' },
    { id: '2', name: 'Hokkaido Scallops Crudo', sold: '295 sold', sales: '$10,177', rank: '#2' },
    { id: '3', name: 'Yuzu Basil Smash', sold: '512 drinks', sales: '$8,192', rank: '#3' },
  ];

  const waiterPerformance = [
    { id: '1', name: 'Elena S. (Head Waiter)', tablesServed: 18, totalSales: '$2,450.00' },
    { id: '2', name: 'Julien M.', tablesServed: 14, totalSales: '$1,890.50' },
    { id: '3', name: 'Sarah K.', tablesServed: 11, totalSales: '$1,320.00' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B101D" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>WELCOME BACK</Text>
            <Text style={styles.titleText}>Executive Dashboard</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>LIVE TEMPO</Text>
          </View>
        </View>

        {/* Navigation Shortcuts to CRUD screens */}
        <View style={styles.crudBar}>
          <TouchableOpacity style={styles.crudBtn} onPress={() => navigation?.navigate('EmployeeCrudScreen')}>
            <Text style={styles.crudBtnText}>+ Employees</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.crudBtn} onPress={() => navigation?.navigate('TableCrudScreen')}>
            <Text style={styles.crudBtnText}>+ Tables</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.crudBtn} onPress={() => navigation?.navigate('MenuCrudScreen')}>
            <Text style={styles.crudBtnText}>+ Menu</Text>
          </TouchableOpacity>
        </View>

        {/* Time Filter Segmented Controls */}
        <View style={styles.filterContainer}>
          {['Day', 'Week', 'Month'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, timeFilter === filter && styles.activeFilterTab]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text style={[styles.filterTabText, timeFilter === filter && styles.activeFilterTabText]}>
                {filter} Wise
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sales Overview Cards */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { width: width * 0.43 }]}>
            <Text style={styles.metricLabel}>Total Revenue</Text>
            <Text style={styles.metricValue}>{salesData[timeFilter].revenue}</Text>
            <Text style={styles.metricSub}>+14.2% vs prev</Text>
          </View>

          <View style={[styles.metricCard, { width: width * 0.43 }]}>
            <Text style={styles.metricLabel}>Total Orders</Text>
            <Text style={styles.metricValue}>{salesData[timeFilter].orders}</Text>
            <Text style={styles.metricSub}>Tickets completed</Text>
          </View>
        </View>

        {/* Cash vs Card Breakdown */}
        <Text style={styles.sectionHeader}>Payment Channel Breakdown</Text>
        <View style={styles.paymentContainer}>
          <View style={styles.paymentBox}>
            <Text style={styles.paymentLabel}>💵 Cash Sales</Text>
            <Text style={styles.paymentVal}>{salesData[timeFilter].cash}</Text>
          </View>
          <View style={styles.paymentBox}>
            <Text style={styles.paymentLabel}>💳 Bank / Card Sales</Text>
            <Text style={styles.paymentVal}>{salesData[timeFilter].card}</Text>
          </View>
        </View>

        {/* Top Selling Products */}
        <Text style={styles.sectionHeader}>Top Menu Performers (Ranking)</Text>
        {topDishes.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{item.rank}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemSub}>{item.sold}</Text>
            </View>
            <Text style={styles.itemSales}>{item.sales}</Text>
          </View>
        ))}

        {/* Waiter Performance & Table Booking Log */}
        <Text style={styles.sectionHeader}>Staff & Waiter Sales Record</Text>
        {waiterPerformance.map((waiter) => (
          <View key={waiter.id} style={styles.waiterCard}>
            <View>
              <Text style={styles.waiterName}>{waiter.name}</Text>
              <Text style={styles.waiterSub}>{waiter.tablesServed} Tables Booked / Served</Text>
            </View>
            <Text style={styles.waiterSales}>{waiter.totalSales}</Text>
          </View>
        ))}

        {/* Export Report Actions */}
        <View style={styles.exportSection}>
          <Text style={styles.sectionHeader}>Export Sales Reports</Text>
          <View style={styles.exportRow}>
            <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#E65100' }]}>
              <Text style={styles.exportBtnText}>📄 PDF Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#1B5E20' }]}>
              <Text style={styles.exportBtnText}>📊 Excel (.XLSX)</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B101D',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    color: '#8A94A6',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B00',
  },
  badgeText: {
    color: '#FF6B00',
    fontSize: 10,
    fontWeight: '700',
  },
  crudBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  crudBtn: {
    backgroundColor: '#1E2638',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A3447',
  },
  crudBtnText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#161D2F',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: '#FF6B00',
  },
  filterTabText: {
    color: '#8A94A6',
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#161D2F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#232D42',
  },
  metricLabel: {
    color: '#8A94A6',
    fontSize: 12,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  metricSub: {
    color: '#00E676',
    fontSize: 11,
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 12,
  },
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentBox: {
    flex: 0.48,
    backgroundColor: '#161D2F',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B00',
  },
  paymentLabel: {
    color: '#8A94A6',
    fontSize: 12,
  },
  paymentVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161D2F',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FF6B00',
    fontWeight: 'bold',
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  itemSub: {
    color: '#8A94A6',
    fontSize: 11,
  },
  itemSales: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  waiterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161D2F',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  waiterName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  waiterSub: {
    color: '#8A94A6',
    fontSize: 11,
    marginTop: 2,
  },
  waiterSales: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exportSection: {
    marginTop: 10,
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default DashboardScreen;