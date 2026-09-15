import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const WaiterPerformanceCard = ({ name, tablesServed, totalSales }) => {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtext}>{tablesServed} Tables Booked / Served</Text>
      </View>
      <Text style={styles.sales}>{totalSales}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161D2F',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  subtext: {
    color: '#8A94A6',
    fontSize: 11,
    marginTop: 2,
  },
  sales: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default WaiterPerformanceCard;