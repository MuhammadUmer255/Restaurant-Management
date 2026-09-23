import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const WaiterPerformanceCard = ({ name, tablesServed, totalSales }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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

const makeStyles = (c) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 10,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    name: {
      color: c.text,
      fontSize: 14,
      fontWeight: '600',
    },
    subtext: {
      color: c.muted,
      fontSize: 11,
      marginTop: 2,
    },
    sales: {
      color: c.success,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

export default WaiterPerformanceCard;