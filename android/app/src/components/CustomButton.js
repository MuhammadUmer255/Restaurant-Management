import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary', 
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
}) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  // Dynamic button styles based on variant
  const getButtonStyle = () => {
    if (isPrimary) return styles.primary;
    if (isDanger) return styles.danger;
    return styles.outline;
  };

  // Dynamic text styles based on variant
  const getTextStyle = () => {
    if (isPrimary || isDanger) return styles.textPrimary;
    return styles.textOutline;
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getButtonStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? '#FFFFFF' : '#FF7A1A'} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: {
    backgroundColor: '#ff7a1a',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#26314a',
  },
  danger: {
    backgroundColor: '#e74c3c',
  },
  disabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
    fontSize: 15,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: '#ff7a1a',
  },
});