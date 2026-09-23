import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const TopSellingItem = ({ rank, name, sold, sales }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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

const makeStyles = (c) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.border,
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
      color: c.primary,
      fontWeight: 'bold',
    },
    infoContainer: {
      flex: 1,
      marginLeft: 12,
    },
    itemName: {
      color: c.text,
      fontSize: 14,
      fontWeight: '600',
    },
    itemSold: {
      color: c.muted,
      fontSize: 11,
    },
    itemSales: {
      color: c.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

export default TopSellingItem;