import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TopSellingItem = ({ rank, name, sold, sales }) => {
  return (
    <View style={styles.container}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemSold}>{sold}</Text>
      </View>
      <Text style={styles.itemSales}>{sales}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  itemSold: {
    color: '#8A94A6',
    fontSize: 11,
  },
  itemSales: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TopSellingItem;