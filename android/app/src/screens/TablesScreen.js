import React, { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const INITIAL_TABLES = [
  {
    id: 'T-01',
    seats: 2,
    status: 'Available',
  },
  {
    id: 'T-02',
    seats: 4,
    status: 'Occupied',
    customer: 'Julien',
    amount: '$148.50',
  },
  {
    id: 'T-03',
    seats: 6,
    status: 'Reserved',
    customer: 'Dr. Raymond',
    time: '19:30',
  },
  {
    id: 'T-04',
    seats: 2,
    status: 'Occupied',
    customer: 'Sarah',
    amount: '$95.00',
  },
  {
    id: 'T-05',
    seats: 4,
    status: 'Available',
  },
  {
    id: 'VIP-1',
    seats: 8,
    status: 'Occupied',
    customer: 'VIP Guest',
    amount: '$390.00',
  },
];

export default function TablesScreen() {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [selectedTable, setSelectedTable] = useState('T-01');

  const available = tables.filter(
    table => table.status === 'Available'
  ).length;

  const occupied = tables.filter(
    table => table.status === 'Occupied'
  ).length;

  const reserved = tables.filter(
    table => table.status === 'Reserved'
  ).length;

  const selected = tables.find(
    table => table.id === selectedTable
  );

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>🍴 GourmetOS</Text>
          <Text style={styles.location}>
            Restaurant Floor • T-01
          </Text>
        </View>

        <Text style={styles.notification}>♧</Text>
      </View>

      <View style={styles.floorTabs}>

        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.activeTabText}>
            All ({tables.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>
            Indoor Main
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>
            Terrace
          </Text>
        </TouchableOpacity>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <View style={styles.statsRow}>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              OCCUPANCY
            </Text>

            <Text style={styles.statValue}>
              72%
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              SEATS
            </Text>

            <Text style={styles.redValue}>
              {occupied}
            </Text>

            <Text style={styles.smallText}>
              Active
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              OPEN
            </Text>

            <Text style={styles.greenValue}>
              {available}
            </Text>

            <Text style={styles.smallText}>
              Free
            </Text>
          </View>

        </View>

        <View style={styles.legend}>

          <Text style={styles.legendText}>
            🟢 Available {available}
          </Text>

          <Text style={styles.legendText}>
            🔴 Occupied {occupied}
          </Text>

          <Text style={styles.legendText}>
            🟡 Reserved {reserved}
          </Text>

        </View>

        <Text style={styles.sectionTitle}>
          Restaurant Tables
        </Text>

        <View style={styles.grid}>

          {tables.map(table => (

            <TouchableOpacity
              key={table.id}
              style={[
                styles.tableCard,
                selectedTable === table.id &&
                  styles.selectedTable,
              ]}
              onPress={() =>
                setSelectedTable(table.id)
              }
            >

              <View style={styles.tableHeader}>

                <Text style={styles.tableNumber}>
                  {table.id}
                </Text>

                <StatusBadge status={table.status} />

              </View>

              <Text style={styles.seats}>
                ♟ {table.seats} Seats
              </Text>

              {table.customer && (
                <Text style={styles.customer}>
                  {table.customer}
                </Text>
              )}

              {table.amount && (
                <Text style={styles.amount}>
                  {table.amount}
                </Text>
              )}

              {table.time && (
                <Text style={styles.time}>
                  ⏱ {table.time}
                </Text>
              )}

            </TouchableOpacity>

          ))}

        </View>

        {selected && (

          <View style={styles.selectedPanel}>

            <Text style={styles.selectedTitle}>
              Table {selected.id}
            </Text>

            <Text style={styles.selectedSubtitle}>
              {selected.seats} Guests • {selected.status}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.orderTitle}>
              Current Order
            </Text>

            <OrderItem
              name="Truffle Wagyu Ribeye"
              price="$68.00"
            />

            <OrderItem
              name="Hokkaido Scallops Crudo"
              price="$39.25"
            />

            <OrderItem
              name="Yuzu Basil Smash"
              price="$28.00"
            />

            <View style={styles.actionRow}>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>
                  + Order
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.primaryButton,
                ]}
              >
                <Text style={styles.primaryText}>
                  View Bill
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>
                  Clear
                </Text>
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
    <View
      style={[
        styles.badge,
        { backgroundColor: background },
      ]}
    >
      <Text style={{ color, fontSize: 11 }}>
        ● {status}
      </Text>
    </View>
  );
}

function OrderItem({ name, price }) {
  return (
    <View style={styles.orderItem}>
      <Text style={styles.orderName}>
        {name}
      </Text>

      <Text style={styles.orderPrice}>
        {price}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070E20',
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  location: {
    color: '#7D879D',
    fontSize: 12,
    marginTop: 5,
  },

  notification: {
    color: '#FF7622',
    fontSize: 25,
  },

  floorTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  activeTab: {
    backgroundColor: '#FF7622',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 12,
    marginRight: 8,
  },

  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  tab: {
    backgroundColor: '#101A31',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 12,
    marginRight: 8,
  },

  tabText: {
    color: '#8D96AA',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#0D162C',
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: '#202D49',
  },

  statLabel: {
    color: '#7E879B',
    fontSize: 10,
    fontWeight: '700',
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 6,
  },

  redValue: {
    color: '#FF526A',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 6,
  },

  greenValue: {
    color: '#35D49B',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 6,
  },

  smallText: {
    color: '#778197',
    fontSize: 11,
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 18,
  },

  legendText: {
    color: '#9CA4B5',
    fontSize: 11,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  tableCard: {
    width: '48%',
    minHeight: 125,
    backgroundColor: '#0D162C',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#202D49',
  },

  selectedTable: {
    borderColor: '#FF7622',
    borderWidth: 2,
  },

  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tableNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  badge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
  },

  seats: {
    color: '#858FA5',
    marginTop: 12,
  },

  customer: {
    color: '#D9DDE7',
    marginTop: 10,
    fontWeight: '600',
  },

  amount: {
    color: '#35D49B',
    marginTop: 5,
    fontWeight: '700',
  },

  time: {
    color: '#F5AE22',
    marginTop: 5,
    fontSize: 12,
  },

  selectedPanel: {
    backgroundColor: '#0D162C',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#25334F',
    padding: 20,
    marginTop: 20,
  },

  selectedTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  selectedSubtitle: {
    color: '#7F899F',
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: '#202D49',
    marginVertical: 16,
  },

  orderTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 10,
  },

  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },

  orderName: {
    color: '#BFC5D3',
    flex: 1,
  },

  orderPrice: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },

  actionButton: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3753',
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButton: {
    backgroundColor: '#FF7622',
    borderColor: '#FF7622',
  },

  actionText: {
    color: '#C8CEDA',
    fontWeight: '700',
  },

  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});