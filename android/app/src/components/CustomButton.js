import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CustomButton({ title, onPress, variant = 'primary', style }) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[styles.base, isPrimary ? styles.primary : styles.outline, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textOutline]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: '#ff7a1a' },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#26314a',
  },
  text: { fontWeight: '700', fontSize: 15 },
  textPrimary: { color: '#fff' },
  textOutline: { color: '#ff7a1a' },
});