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

import DashboardHeader from '../components/DashboardHeader';
import FilterBar from '../components/FilterBar';
import MetricCard from '../components/MetricCard';
import TopSellingList from '../components/TopSellingList';
import WaiterPerformanceCard from '../components/WaiterPerformanceCard';
import ExportModal from '../components/ExportModal';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [timeFilter, setTimeFilter] = useState('Day');
  const [exportModalVisible, setExportModalVisible] = useState(false);

  // Dummy Data State
  const salesData = {
    Day: { revenue: ' Rs 8,420.50', orders: '142', cash: ' Rs 3,120.00', card: ' Rs 5,300.50' },
    Week: { revenue: ' Rs 54,190.00', orders: '912', cash: ' Rs 19,400.00', card: ' Rs 34,790.00' },
    Month: { revenue: ' Rs 148,290.00', orders: '2,480', cash: ' Rs 52,100.00', card: ' Rs 96,190.00' },
  };

  const topDishes = [
    { id: '1', name: 'Truffle Wagyu Ribeye', sold: '384 sold', sales: ' Rs 18,432', rank: '#1' },
    { id: '2', name: 'Hokkaido Scallops Crudo', sold: '295 sold', sales: ' Rs 10,177', rank: '#2' },
    { id: '3', name: 'Yuzu Basil Smash', sold: '512 drinks', sales: ' Rs 8,192', rank: '#3' },
  ];

  const waiterPerformance = [
    { id: '1', name: 'Elena S. (Head Waiter)', tablesServed: 18, totalSales: ' Rs 2,450.00' },
    { id: '2', name: 'Julien M.', tablesServed: 14, totalSales: ' Rs 1,890.50' },
    { id: '3', name: 'Sarah K.', tablesServed: 11, totalSales: ' Rs 1,320.00' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B101D" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 1. Header Component */}
        <DashboardHeader navigation={navigation} />

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

        {/* 2. Filter Bar Component */}
        <FilterBar timeFilter={timeFilter} setTimeFilter={setTimeFilter} />

        {/* 3. Metric Cards Component */}
        <View style={styles.metricsRow}>
          <MetricCard 
            label="Total Revenue" 
            value={salesData[timeFilter].revenue} 
            subText="+14.2% vs prev" 
            cardWidth={width * 0.43} 
          />
          <MetricCard 
            label="Total Orders" 
            value={salesData[timeFilter].orders} 
            subText="Tickets completed" 
            cardWidth={width * 0.43} 
          />
        </View>

        {/* Payment Channel Breakdown */}
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

        {/* 4. Top Selling Dishes Component */}
        <Text style={styles.sectionHeader}>Top Menu Performers (Ranking)</Text>
        <TopSellingList data={topDishes} />

        {/* 5. Waiter Performance Component */}
        <Text style={styles.sectionHeader}>Staff & Waiter Sales Record</Text>
        <WaiterPerformanceCard data={waiterPerformance} />

        {/* Export Report Actions */}
        <View style={styles.exportSection}>
          <Text style={styles.sectionHeader}>Export Sales Reports</Text>
          <View style={styles.exportRow}>
            <TouchableOpacity 
              style={[styles.exportBtn, { backgroundColor: '#E65100' }]}
              onPress={() => setExportModalVisible(true)}
            >
              <Text style={styles.exportBtnText}>📄 PDF Report</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.exportBtn, { backgroundColor: '#1B5E20' }]}
              onPress={() => setExportModalVisible(true)}
            >
              <Text style={styles.exportBtnText}>📊 Excel (.XLSX)</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* 6. Export Modal Component */}
      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        timeFilter={timeFilter}
      />
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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