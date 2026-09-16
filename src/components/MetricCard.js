import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MetricCard = ({ label, value, subtext, width }) => {
  return (
    <View style={[styles.card, { width: width || '48%' }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161D2F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#232D42',
  },
  label: {
    color: '#8A94A6',
    fontSize: 12,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  subtext: {
    color: '#00E676',
    fontSize: 11,
  },
});

export default MetricCard;