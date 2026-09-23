import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // NEW

const MetricCard = ({ label, value, subtext, width }) => {
  const { colors } = useTheme(); // NEW
  const styles = useMemo(() => makeStyles(colors), [colors]); // NEW

  return (
    <View style={[styles.card, { width: width || '48%' }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
};

const makeStyles = (c) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    label: {
      color: c.muted,
      fontSize: 12,
    },
    value: {
      color: c.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 4,
    },
    subtext: {
      color: c.success,
      fontSize: 11,
    },
  });

export default MetricCard;